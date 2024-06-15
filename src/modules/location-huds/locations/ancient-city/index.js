import { addHudStyles, makeElement, onRequest, showHornMessage } from '@utils';

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

  warnForOilCharms();
  onRequest('users/changetrap.php', warnForOilCharms);
};
