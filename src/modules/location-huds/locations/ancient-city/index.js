import { addHudStyles, makeElement } from '@utils';

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

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  addBossName();
};
