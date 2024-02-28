import humanizeDuration from 'humanize-duration';

import {
  addHudStyles,
  getCurrentPage,
  getFlag,
  getUserItems,
  makeElement,
  onDialogShow,
  onEvent,
  onRequest,
  onTravel,
  showHornMessage
} from '@utils';

import styles from './styles.css';

const humanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    },
  },
});

const toggleFuelClass = (fuelCount, isActive) => {
  if (isActive) {
    fuelCount.classList.remove('active');
  } else {
    fuelCount.classList.add('active');
  }
};

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

let isAdding = false;
const addBossCountdown = async () => {
  if (isAdding) {
    return;
  }

  isAdding = true;

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

  const goalContainer = document.querySelector('.floatingIslandsHUD-goalContainer');
  if (! goalContainer) {
    return;
  }

  goalContainer.append(bossCountdown);

  isAdding = false;
};

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
      action: () => {
        setTimeout(() => {
          const button = document.querySelector('.floatingIslandsHUD-fuel-button');
          if (button) {
            button.click();
          }
        }, 750);
      },
      dismiss: 4000,
      image: 'https://www.mousehuntgame.com/images/ui/hud/floating_islands/items/bottled_wind_stat_item.png?asset_cache_version=2',
    });
  }
};

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

const updateJetstreamTime = async () => {
  const container = document.querySelector('.floatingIslandsHUD-jetstream-time');
  if (! container) {
    return;
  }

  container.innerHTML = '';

  if (! user?.quests?.QuestFloatingIslands?.jet_stream_active) {
    return;
  }

  const expiry = document.querySelector('.floatingIslandsHUD-jetstream .trapImageView-tooltip-trapAura-expiry span');
  if (! expiry) {
    return;
  }

  const dateParts = expiry.innerText.split(' ');
  if (! dateParts.length || dateParts.length < 5) {
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

  const duration = humanizer(timeRemaining, {
    round: true,
    units: ['d', 'h', 'm'],
    spacer: '',
    delimiter: ' ',
  });

  container.innerText = duration;
};

let jsClone;
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

const makeAirshipDraggable = () => {
  const airship = document.querySelector('.floatingIslandsHUD.island .floatingIslandsHUD-airshipContainer');
  if (! airship) {
    return;
  }

  let isDragging = false;
  let startX, startY, startTop, startLeft;

  // Function to update the position of the airship
  const moveAirship = (e) => {
    if (! isDragging) {
      return;
    }
    // Calculate the new position
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    // Update the position of the airship
    airship.style.top = `${startTop + dy}px`;
    airship.style.left = `${startLeft + dx}px`;
  };

  // Mouse down event to start dragging
  airship.addEventListener('mousedown', (e) => {
    e.preventDefault();

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startTop = airship.offsetTop;
    startLeft = airship.offsetLeft;

    // When dragging starts, listen for mouse movement and release
    document.addEventListener('mousemove', moveAirship);
    document.addEventListener('mouseup', () => {
      isDragging = false;
      // Remove the event listeners when dragging is finished
      document.removeEventListener('mousemove', moveAirship);
    }, { once: true });
  });
};

const run = async () => {
  await showJetstream();
  await addEnemyClass();
  await addBossCountdown();
  await maybeChangeWarning();
};

const hud = () => {
  toggleFuel();
  showGloreProgress();

  run();

  showBWReminder();
  onTravel(() => {
    setTimeout(showBWReminder, 1500);
  });

  onEvent('ajax_response', run);

  onEvent('horn-countdown-tick', updateJetstreamTime);
  onDialogShow('floatingIslandsAdventureBoard.floatingIslandsDialog.skyPalace', onSkyMapShow);

  onRequest('environment/floating_islands.php', () => {
    run();
    toggleFuel(true);
    setTimeout(run, 3500);
    setTimeout(run, 10000);
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);
  hud();

  if (getFlag('fi-draggable-airship')) {
    makeAirshipDraggable();
  }
};
