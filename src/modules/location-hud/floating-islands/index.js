const toggleFuelClass = (fuel, fuelCount) => {
  if (fuel.classList.contains('active')) {
    fuelCount.classList.add('active');
  } else {
    fuelCount.classList.remove('active');
  }
};

const toggleFuel = () => {
  const fuel = document.querySelector('.floatingIslandsHUD-fuel-button');
  if (! fuel) {
    return;
  }

  const fuelCount = document.querySelector('.floatingIslandsHUD-fuel-quantity.quantity');
  if (! fuelCount) {
    return;
  }

  const enabled = user?.quests?.QuestFloatingIslands?.hunting_site_atts?.is_fuel_enabled || false;
  if (enabled && ! fuel.classList.contains('active')) {
    toggleFuelClass(fuel, fuelCount);
  }

  fuelCount.addEventListener('click', () => {
    hg.views.HeadsUpDisplayFloatingIslandsView.toggleFuel(fuel);
    setTimeout(() => {
      toggleFuelClass(fuel, fuelCount);
    }, 250);
  });

  fuel.addEventListener('click', () => {
    setTimeout(() => {
      toggleFuelClass(fuel, fuelCount);
    }, 250);
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

  enemyContainer.appendChild(bossCountdown);
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

  const name = user?.quests?.QuestFloatingIslands?.hunting_site_atts?.enemy.name || false;
  const type = user?.quests?.QuestFloatingIslands?.hunting_site_atts?.enemy.type || false;

  if (! name || ! type) {
    return;
  }

  const exists = document.querySelector('.mh-ui-fi-enemy-name');
  if (exists) {
    exists.remove();
  }

  makeElement('div', 'mh-ui-fi-enemy-name', name, enemyContainer);
};

const main = () => {
  toggleFuel();
  addBossCountdown();
  setTimeout(addBossCountdown, 300);
  setTimeout(addBossCountdown, 500);
  setTimeout(addEnemyClass, 1000);

  addEnemyClass();
  setTimeout(addEnemyClass, 500);
};

export default main;
