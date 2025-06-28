import {
  addHudStyles,
  makeElement,
  onRequest,
  onTurn,
  showHornMessage
} from '@utils';

import styles from './styles.css';

const addBossName = () => {
  const types = {
    y: 'Paladin Weapon Master', // Fealty
    h: 'Manaforge Smith', // Tech
    s: 'Soul Binder', // Scholar
    t: 'Molten Midas', // Treasury
    f: '', // Farming
  };

  const type = user?.quests?.QuestAncientCity?.district_type;
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

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  addBossName();

  addDefeatedLabel();
  updateLeaderBeaten();
  onTurn(() => {
    addDefeatedLabel();
    updateLeaderBeaten();
  }, 500);

  warnForOilCharms();
  onRequest('users/changetrap.php', warnForOilCharms);
};
