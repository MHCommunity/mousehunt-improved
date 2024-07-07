import {
  addHudStyles,
  getCurrentPage,
  getSetting,
  getUserItems,
  makeElement,
  onDialogShow,
  onEvent,
  onRequest,
  onTravel,
  plainHumanizer,
  saveSetting,
  setMultipleTimeout,
  showHornMessage
} from '@utils';

import styles from './styles.css';

/**
 * Toggle the fuel button class.
 *
 * @param {Element} fuelCount The fuel count element.
 * @param {boolean} isActive  Whether the fuel is active.
 */
const toggleFuelClass = (fuelCount, isActive) => {
  if (isActive) {
    fuelCount.classList.remove('active');
  } else {
    fuelCount.classList.add('active');
  }
};

/**
 * Toggle the fuel button.
 *
 * @param {boolean} skip Whether to skip the toggle.
 */
const toggleFuel = (skip = false) => {
  const fuel = document.querySelector('.floatingIslandsHUD-fuel-button');
  if (! fuel) {
    return;
  }

  const fuelCount = document.querySelector('.floatingIslandsHUD-fuel-quantity');
  if (! fuelCount) {
    return;
  }

  const enabled = user?.quests?.QuestFloatingIslands?.hunting_site_atts?.is_fuel_enabled || false;
  if (enabled) {
    fuelCount.classList.add('active');
  } else {
    fuelCount.classList.remove('active');
  }

  if (skip) {
    return;
  }

  fuel.addEventListener('click', (e) => {
    toggleFuelClass(fuelCount, e.target.classList.contains('active'));
    hg.views.HeadsUpDisplayFloatingIslandsView.toggleFuel(fuel);
  });
};

/**
 * Add the boss countdown.
 */
const addBossCountdown = async () => {
  const existing = document.querySelector('.mh-ui-fi-enemy-countdown');
  if (existing) {
    existing.remove();
  }

  const atts = user?.quests?.QuestFloatingIslands?.hunting_site_atts || {};
  if (! atts.has_enemy) {
    return;
  }

  let name = atts.enemy?.abbreviated_name || 'Enemy';
  // split the name and get the first word
  name = name.split(' ')[0];

  const huntsRemaining = atts.enemy_encounter_hunts_remaining || 0;

  const bossCountdown = document.createElement('div');
  bossCountdown.classList.add('mh-ui-fi-enemy-countdown');
  makeElement('span', 'mh-ui-fi-enemy-countdown-name', name, bossCountdown);
  makeElement('span', 'mh-ui-fi-enemy-countdown-in', ' in ', bossCountdown);
  makeElement('span', 'mh-ui-fi-enemy-countdown-hunts', huntsRemaining, bossCountdown);

  const isEnemyActiveOrDefeated = atts.has_encountered_enemy || atts.has_defeated_enemy;
  if (isEnemyActiveOrDefeated) {
    return;
  }

  let goalContainer = document.querySelector('.floatingIslandsHUD-goalContainer');
  if (goalContainer) {
    goalContainer.append(bossCountdown);
    return;
  }

  // if we can't find the goal container, try again in 1 second up to 10 times until we find it
  let tries = 0;
  const maxTries = 10;

  const interval = setInterval(() => {
    goalContainer = document.querySelector('.floatingIslandsHUD-goalContainer');
    if (goalContainer) {
      goalContainer.append(bossCountdown);
      clearInterval(interval);
    }

    tries += 1;
    if (tries >= maxTries) {
      clearInterval(interval);
    }
  }, 1000 * tries);
};

/**
 * Add the enemy class to the HUD.
 */
const addEnemyClass = async () => {
  const name = user?.quests?.QuestFloatingIslands?.hunting_site_atts?.enemy?.name || false;
  const type = user?.quests?.QuestFloatingIslands?.hunting_site_atts?.enemy?.type || false;
  if (! name || ! type) {
    return;
  }

  const exists = document.querySelector('.mh-ui-fi-enemy-name');
  if (exists) {
    exists.innerText = name;
  } else {
    const enemyContainer = document.querySelector('.floatingIslandsHUD-islandTitle');
    if (! enemyContainer) {
      return;
    }

    makeElement('div', 'mh-ui-fi-enemy-name', name, enemyContainer);
  }
};

/**
 * Get the next Oculus upgrade cost.
 *
 * @param {number} ocLevel The current Oculus level.
 *
 * @return {string|boolean} The next Oculus upgrade cost or false.
 */
const getNextOcUpgradeCost = (ocLevel) => {
  switch (Number.parseInt(ocLevel, 10)) {
  case 1:
    return '35';
  case 2:
    return '150';
  case 3:
    return '500';
  case 4:
    return '1.2k';
  case 5:
    return '2k';
  case 6:
    return '3.5k';
  case 7:
    return '8k';
  case 8:
    return '10k';
  default:
    return false;
  }
};

/**
 * Make the elements for the glore progress.
 */
const showGloreProgress = async () => {
  const items = await getUserItems(['floating_islands_cloud_gem_stat_item', 'floating_islands_sky_ore_stat_item']);
  if (! (items && items.length)) {
    return;
  }

  const glass = document.querySelector('.floatingIslandsHUD-craftingItem.floating_islands_cloud_gem_stat_item');
  const ore = document.querySelector('.floatingIslandsHUD-craftingItem.floating_islands_sky_ore_stat_item');

  if (! glass || ! ore) {
    return;
  }

  const existing = document.querySelectorAll('.mh-ui-fi-glore-progress');
  if (existing && existing.length) {
    existing.forEach((el) => {
      el.remove();
    });
  }

  const nextUpgrade = getNextOcUpgradeCost(user?.quests?.QuestFloatingIslands?.airship?.oculus_level || 0);

  if (! nextUpgrade) {
    return;
  }

  makeElement('div', 'mh-ui-fi-glore-progress', ` / ${nextUpgrade}`, glass);
  glass.classList.add('show-progress');
  makeElement('div', 'mh-ui-fi-glore-progress', ` / ${nextUpgrade}`, ore);
  ore.classList.add('show-progress');
};

/**
 * Fire actions when the Sky Map is shown.
 */
const onSkyMapShow = () => {
  const roll = document.querySelector('.floatingIslandsAdventureBoardSkyMap-rerollButton');
  if (! roll) {
    return;
  }

  roll.addEventListener('click', () => {
    // set as disabled for half a second to prevent double clicking
    roll.classList.add('disabled');
    roll.classList.add('no-click');
    setTimeout(() => {
      roll.classList.remove('disabled');
      roll.classList.remove('no-click');
    }, 300);
  });
};

/**
 * Show a reminder to activate Bottled Wind.
 */
const showBWReminder = () => {
  const isStart = user.enviroment_atts?.hunting_site_atts?.hunts_remaining === 75 && user.enviroment_atts?.on_island;
  const bwOff = ! user.enviroment_atts?.hunting_site_atts?.is_fuel_enabled;
  const bw = user.enviroment_atts?.items?.bottled_wind_stat_item?.quantity || '0';
  const hasBw = Number.parseInt(bw.toString().replaceAll(',', ''), 10) >= 50;

  if (isStart && bwOff && hasBw) {
    showHornMessage({
      title: 'Bottled Wind Reminder',
      text: 'Don\'t forget to activate your Bottled Wind!',
      button: 'Activate',
      /**
       * Action to click the Bottled Wind button.
       */
      action: () => {
        setTimeout(() => {
          const button = document.querySelector('.floatingIslandsHUD-fuel-button');
          if (button) {
            button.click();
          }
        }, 750);
      },
      dismiss: 4000,
      image: 'https://www.mousehuntgame.com/images/ui/hud/floating_islands/items/bottled_wind_stat_item.png',
    });
  }
};

/**
 * Update the power type warning.
 */
const maybeChangeWarning = async () => {
  const isLAI = user?.quests?.QuestFloatingIslands?.hunting_site_atts?.is_low_tier_island;
  const isAtBoss = user?.quests?.QuestFloatingIslands?.hunting_site_atts?.has_encountered_enemy && ! user?.quests?.QuestFloatingIslands?.hunting_site_atts?.has_defeated_enemy;

  if (! isLAI || ! isAtBoss) {
    return;
  }

  const bossWarning = document.querySelector('.floatingIslandsHUD-warning.floatingIslandsHUD-powerTypeWarning.active');

  // Replace the text to be a "use your most powerful setup" warning
  if (bossWarning) {
    bossWarning.innerHTML = 'Use your most powerful setup!';
  }
};

/**
 * Update the Jetstream time element.
 */
const updateJetstreamTime = async () => {
  const container = document.querySelector('.floatingIslandsHUD-jetstream-time');
  if (! container) {
    return;
  }

  if (! user?.quests?.QuestFloatingIslands?.jet_stream_active) {
    container.innerHTML = '';
    return;
  }

  const expiry = document.querySelector('.floatingIslandsHUD-jetstream .trapImageView-tooltip-trapAura-expiry span');
  if (! expiry || ! expiry.innerText) {
    container.innerHTML = '';
    return;
  }

  const dateParts = expiry.innerText.split(' ');
  if (! dateParts.length || dateParts.length < 5) {
    container.innerHTML = '';
    return;
  }

  const month = dateParts[0];
  const day = dateParts[1].replace(',', '');
  const year = dateParts[2];
  const timeParts = dateParts[4].split(':');
  let hours = Number.parseInt(timeParts[0]);
  const minutes = timeParts[1].slice(0, 2); // remove 'am' or 'pm'

  if (dateParts[4].includes('pm') && hours !== 12) {
    hours += 12;
  } else if (dateParts[4].includes('am') && hours === 12) {
    hours = 0;
  }

  const expiryDate = Date.parse(`${month} ${day}, ${year} ${hours}:${minutes}`);
  if (Number.isNaN(expiryDate)) {
    return;
  }

  const now = new Date();
  const timeRemaining = expiryDate - now;

  const duration = plainHumanizer(timeRemaining, {
    round: true,
    units: ['d', 'h', 'm'],
    spacer: ' ',
    delimiter: ' ',
  });

  if (container.innerText === duration) {
    return;
  }

  container.innerText = duration;
  container.title = `Jetstream aura will expire on ${expiry.innerText}`;
};

let jsClone;

/**
 * Show the Jetstream aura indicator.
 */
const showJetstream = async () => {
  const exists = document.querySelector('.floatingIslandsHUD-jetstream');
  if (exists) {
    exists.remove();
  }

  if (! user?.quests?.QuestFloatingIslands?.jet_stream_active) {
    return;
  }

  const existing = document.querySelector('.floatingIslandsHUD-jetstream');
  if (existing) {
    return;
  }

  const container = document.querySelector('.floatingIslandsHUD');
  if (! container) {
    return;
  }

  let hudAura;
  if ('camp' === getCurrentPage()) {
    const aura = document.querySelector('.trapImageView-trapAura.mousehuntTooltipParent.QuestJetStreamAura.active');
    if (! aura) {
      return;
    }

    hudAura = aura.cloneNode(true);

    jsClone = hudAura;
  } else {
    hudAura = jsClone;
  }

  if (! hudAura) {
    return;
  }

  const tooltip = hudAura.querySelector('.mousehuntTooltip');
  if (tooltip) {
    tooltip.classList.remove('right');
    tooltip.classList.add('left');
  }

  const auraContainer = makeElement('div', 'floatingIslandsHUD-jetstream');
  auraContainer.append(hudAura);

  container.append(auraContainer);

  const timeRemainingEl = makeElement('div', 'floatingIslandsHUD-jetstream-time');
  auraContainer.append(timeRemainingEl);

  updateJetstreamTime();
};

/**
 * Make the airship draggable.
 */
const makeAirshipDraggable = () => {
  const airship = document.querySelector('.floatingIslandsHUD.island .floatingIslandsHUD-airshipContainer');
  if (! airship) {
    return;
  }

  const airshipBox = airship.querySelector('.floatingIslandsHUD-airship-boundingBox');
  if (! airshipBox) {
    return;
  }

  airshipBox.removeAttribute('onclick');

  const startingPosition = getSetting('location-huds.fi-draggable-airship-position', {});
  if (startingPosition.top) {
    airship.style.top = `${startingPosition.top}px`;
  }

  if (startingPosition.left) {
    airship.style.left = `${startingPosition.left}px`;
  }

  let isDragging = false;
  let startX, startY, startTop, startLeft;
  let hasMoved = false; // Flag to check if the airship has been dragged more than 5 pixels

  // Define the event handlers as named functions to reference them later for removal
  const mousemove = (e) => {
    if (! isDragging) {
      return;
    }
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMoved = true;
    }
    airship.style.top = `${startTop + dy}px`;
    airship.style.left = `${startLeft + dx}px`;
  };

  const mouseup = () => {
    isDragging = false;
    document.removeEventListener('mouseup', mouseup);
    document.removeEventListener('mousemove', mousemove);
    if (hasMoved) {
      saveSetting('location-huds.fi-draggable-airship-position', { top: airship.offsetTop, left: airship.offsetLeft });
    } else {
      hg.views.FloatingIslandsWorkshopView.show('customize');
    }
  };

  const mousedown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    startTop = airship.offsetTop;
    startLeft = airship.offsetLeft;

    document.removeEventListener('mouseup', mouseup);
    document.removeEventListener('mousemove', mousemove);

    document.addEventListener('mouseup', mouseup);
    document.addEventListener('mousemove', mousemove);
  };

  airship.removeEventListener('mousedown', mousedown);
  airship.addEventListener('mousedown', mousedown);

  const islandContainer = document.querySelector('.floatingIslandPaperDoll');
  if (islandContainer) {
    islandContainer.addEventListener('click', () => {
      // Reset the airship position when clicking on the island.
      saveSetting('location-huds.fi-draggable-airship-position', {});

      airship.style.transition = 'top 0.5s, left 0.5s';
      airship.style.top = '';
      airship.style.left = '';
      setTimeout(() => {
        airship.style.transition = '';
      }, 500);
    });
  }
};

/**
 * Helper to do all the things.
 */
const run = async () => {
  showJetstream();
  await addEnemyClass();
  await addBossCountdown();
  await maybeChangeWarning();

  if (getSetting('location-huds.fi-draggable-airship')) {
    makeAirshipDraggable();
  }
};

/**
 * Initialize the HUD changes.
 */
const hud = () => {
  toggleFuel();
  showGloreProgress();

  run();

  showBWReminder();
  onTravel(() => setTimeout(showBWReminder, 1500));

  onEvent('ajax_response', run);

  document.addEventListener('horn-countdown-tick-minute', updateJetstreamTime);
  onDialogShow('floatingIslandsAdventureBoard.floatingIslandsDialog.skyPalace', onSkyMapShow);

  onRequest('environment/floating_islands.php', (request, data) => {
    run();
    toggleFuel(true);

    if (data?.action === 'launch') {
      setMultipleTimeout(() => {
        run();
        showBWReminder();
      }, [1000, 2000, 3000, 4000, 5000]);
    }

    setTimeout(() => run(), 2000);
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);
  hud();
};
