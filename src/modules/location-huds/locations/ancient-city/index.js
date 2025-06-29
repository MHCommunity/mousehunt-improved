import {
  addHudStyles,
  makeElement,
  onNavigation,
  onRequest,
  onTurn,
  showHornMessage,
  startMemoryGame
} from '@utils';

import styles from './styles.css';

const types = {
  y: 'Paladin Weapon Master', // Fealty
  h: 'Manaforge Smith', // Tech
  s: 'Soul Binder', // Scholar
  t: 'Molten Midas', // Treasury
  f: '', // Farming
};

const getBossType = () => {
  return user?.quests?.QuestAncientCity?.district_type || '';
};

const addBossClass = () => {
  const type = getBossType();
  if (! type || ! types[type]) {
    return;
  }

  const hud = document.querySelector('.ancientCityHUD');
  if (! hud) {
    return;
  }

  if (hud.classList.contains(`ancientCityHUD-${type}`)) {
    return;
  }

  hud.classList.add(`ancientCityHUD-${type}`);
};

const addBossName = () => {
  const type = getBossType();
  if (! type || ! types[type]) {
    return;
  }

  const hudText = document.querySelector('.ancientCityHUD-districtName');
  if (! hudText) {
    return;
  }

  if (hudText.getAttribute('data-boss-name')) {
    return;
  }

  hudText.setAttribute('data-boss-name', true);
  hudText.classList.add(`ancientCityHUD-districtName-${type}`);

  const existing = document.querySelector('.ancientCityHUD-bossName');
  if (existing) {
    existing.remove();
  }

  makeElement('div', 'ancientCityHUD-bossName', types[type], hudText);
};

const addDefeatedLabel = () => {
  const hudText = document.querySelector('.ancientCityHUD-bossName');
  if (! hudText) {
    return;
  }

  if ('defeated' !== user?.quests?.QuestAncientCity?.boss) {
    return;
  }

  const existing = document.querySelector('.ancientCityHUD-bossNameDefeated');
  if (existing) {
    return;
  }

  makeElement('span', 'ancientCityHUD-bossNameDefeated', '(defeated)', hudText);
};

const updateLeaderBeaten = () => {
  const leaderBeaten = document.querySelector('.ancientCityHUD-bossLabel.defeated');
  if (! leaderBeaten) {
    return;
  }

  const stealth = user?.quests?.QuestAncientCity?.remaining;
  if (! stealth) {
    return;
  }

  if (! leaderBeaten.classList.contains('stealth-view')) {
    leaderBeaten.classList.add('stealth-view');
    leaderBeaten.innerHTML = '';
  }

  const existing = document.querySelector('.stealth-remaining');
  if (existing) {
    existing.innerText = stealth;
    if ('undefined' !== typeof blinkText) {
      blinkText(existing, '#59f659', '#fff', 0.7);
    }
    return;
  }

  makeElement('div', 'stealth-remaining', stealth, leaderBeaten);
  makeElement('div', 'stealth-text', ' Stealth', leaderBeaten);
};

const warnForOilCharms = () => {
  // Lantern Oil Charm and Super Lantern Oil Charm.
  if (2142 != user.trinket_item_id && 2652 != user.trinket_item_id) { // eslint-disable-line eqeqeq
    return;
  }

  const isSuper = 2652 == user.trinket_item_id; // eslint-disable-line eqeqeq

  showHornMessage({
    title: 'Don\'t waste your charm!',
    text: `You have a ${isSuper ? 'Super ' : ' '}Lantern Oil Charm equipped.`,
    image: `https://www.mousehuntgame.com/images/items/trinkets/large/${isSuper ? 'e4411478eb95a955daa3a71b3de078fd' : 'e90252a8e76d6e5e75209db95acee4d4'}.png`,
    dismiss: 40000,
    button: 'Disarm',
    type: 'unknown_error',
    classname: 'oil-charm-warning',
    action: () => {
      if (hg?.utils?.TrapControl?.disarmTrinket && hg?.utils?.TrapControl?.go) {
        hg.utils.TrapControl.disarmTrinket();
        hg.utils.TrapControl.go();
      }
    },
  });
};

const addMinigame = () => {
  const baitWarning = document.querySelector('.ancientCityHUD-baitWarning');
  if (! baitWarning) {
    return;
  }

  const startGame = makeElement('div', 'ancientCityHUD-startGame');
  startGame.title = 'Play Zokor Memory Challenge';
  baitWarning.parentNode.insertBefore(startGame, baitWarning);

  startGame.addEventListener('click', () => {
    startMemoryGame({ title: 'Zokor Memory Challenge', items: [
      { id: 'plate_of_fealty_crafting_item', name: 'Plate of Fealty', image: 'https://www.mousehuntgame.com/images/items/crafting_items/large/c431568f0a90e77fcabc4de14009555f.png' },
      { id: 'tech_power_core_crafting_item', name: 'Tech Power Core', image: 'https://www.mousehuntgame.com/images/items/crafting_items/large/b52aff1549b63c0b00983f0a78aa8363.png' },
      { id: 'ancient_scholar_scroll_crafting_item', name: 'Scholar Scroll', image: 'https://www.mousehuntgame.com/images/items/crafting_items/large/600254a937f618200c8e8fb9b3aeaefe.png' },
      { id: 'infused_plate_crafting_item', name: 'Infused Plate', image: 'https://www.mousehuntgame.com/images/items/crafting_items/large/c73481596bdd805a1cdfcabc2526ba02.png' },
      { id: 'powercore_hammer_crafting_item', name: 'Powercore Hammer', image: 'https://www.mousehuntgame.com/images/items/crafting_items/large/3380b02f1c2bd1a6e2d963b1cee4b41a.png' },
      { id: 'sacred_scroll_crafting_item', name: 'Sacred Script', image: 'https://www.mousehuntgame.com/images/items/crafting_items/large/ce2feadbf81fca6f98e9931099d69d7a.png' },
      { id: 'labyrinth_hidden_chamber_key_stat_item', name: 'Minotaur Key', image: 'https://www.mousehuntgame.com/images/items/stats/large/6422e444c028ca5f6ea5230e568dc4b1.png' },
      { id: 'cave_nightshade_crafting_item', name: 'Nightshade', image: 'https://www.mousehuntgame.com/images/items/crafting_items/large/075a2bbef9d263b41822be1c318e9ee0.png' }
    ] });
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  addBossName();
  addBossClass();
  addMinigame();

  addDefeatedLabel();
  updateLeaderBeaten();
  onTurn(() => {
    addBossClass();
    addDefeatedLabel();
    updateLeaderBeaten();
  }, 500);

  onNavigation(() => {
    addBossName();
    addBossClass();
    addDefeatedLabel();
    updateLeaderBeaten();
  });

  warnForOilCharms();
  onRequest('users/changetrap.php', warnForOilCharms);
};
