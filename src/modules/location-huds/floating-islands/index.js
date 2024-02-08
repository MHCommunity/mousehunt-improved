import {
  addHudStyles,
  getUserItems,
  makeElement,
  onDialogShow,
  onRequest,
  showHornMessage
} from '@utils';

import styles from './styles.css';

const toggleFuelClass = (fuelCount, isActive) => {
  if (isActive) {
    fuelCount.classList.remove('active');
  } else {
    fuelCount.classList.add('active');
  }

  setTimeout(addBossCountdown, 200);
};

const toggleFuel = () => {
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
  }

  fuel.addEventListener('click', (e) => {
    toggleFuelClass(fuelCount, e.target.classList.contains('active'));
    hg.views.HeadsUpDisplayFloatingIslandsView.toggleFuel(fuel);
  });
};

const addBossCountdown = () => {
  // .floatingIslandsHUD-enemy-state.enemyApproaching:not(.enemyActive) maybe?
  const enemyContainer = document.querySelector('.floatingIslandsHUD-goalContainer');
  if (! enemyContainer) {
    return;
  }

  const atts = user?.quests?.QuestFloatingIslands?.hunting_site_atts || {};
  if (! atts.has_enemy) {
    return;
  }

  const isEnemyActiveOrDefeated = atts.has_encountered_enemy || atts.has_defeated_enemy;
  if (isEnemyActiveOrDefeated) {
    return;
  }

  // let prefix = 'Enemy';
  // if (atts.is_low_tier_island) {
  //   prefix = 'Warden';

  // const allRemainingHunts = user?.quests?.QuestFloatingIslands?.hunting_site_atts?.enemy_encounter_hunts_remaining || 0;

  // let warGons = 'Paragon: ';
  // if (user.quests.QuestFloatingIslands.hunting_site_atts.has_enemy == null) {
  //     warGons = 'Enemy: ';
  // } else if (user.quests.QuestFloatingIslands.hunting_site_atts.is_high_altitude == null) {
  //     warGons = 'Warden: ';
  // } else if (user.quests.QuestFloatingIslands.hunting_site_atts.is_vault_island != null) {
  //     warGons = 'Empress: ';
  // }

  let name = atts.enemy?.abbreviated_name || 'Enemy';
  // split the name and get the first word
  name = name.split(' ')[0];

  const huntsRemaining = atts.enemy_encounter_hunts_remaining || 0;

  const existing = document.querySelector('.mh-ui-fi-enemy-countdown');
  if (existing) {
    existing.remove();
  }

  const bossCountdown = document.createElement('div');
  bossCountdown.classList.add('mh-ui-fi-enemy-countdown');
  makeElement('span', 'mh-ui-fi-enemy-countdown-name', name, bossCountdown);
  makeElement('span', 'mh-ui-fi-enemy-countdown-in', ' in ', bossCountdown);
  makeElement('span', 'mh-ui-fi-enemy-countdown-hunts', huntsRemaining, bossCountdown);

  enemyContainer.append(bossCountdown);
};

const addEnemyClass = () => {
  const container = document.querySelector('.floatingIslandsHUD');
  if (! container) {
    return;
  }

  const enemyContainer = document.querySelector('.floatingIslandsHUD-islandTitle');
  if (! enemyContainer) {
    return;
  }

  const name = user?.quests?.QuestFloatingIslands?.hunting_site_atts?.enemy?.name || false;
  const type = user?.quests?.QuestFloatingIslands?.hunting_site_atts?.enemy?.type || false;

  if (! name || ! type) {
    return;
  }

  const exists = document.querySelector('.mh-ui-fi-enemy-name');
  if (exists) {
    exists.remove();
  }

  makeElement('div', 'mh-ui-fi-enemy-name', name, enemyContainer);
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

const hud = () => {
  toggleFuel();

  addBossCountdown();
  setTimeout(addBossCountdown, 300);
  setTimeout(addBossCountdown, 500);
  setTimeout(addEnemyClass, 1000);

  addEnemyClass();
  setTimeout(addEnemyClass, 500);

  onRequest(() => {
    addBossCountdown();
    addEnemyClass();
  }, 'managers/ajax/environment/floating_islands.php');

  showGloreProgress();

  onDialogShow(onSkyMapShow, 'floatingIslandsAdventureBoard.floatingIslandsDialog.skyPalace');

  showBWReminder();
  onRequest(showBWReminder);
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);
  hud();
};