import { addHudStyles } from '@utils';

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
  const bossText = ` - ${types[type]}`;
  hudText.textContent = `${hudText.textContent}${bossText}`;
  hudText.textContent = hudText.textContent.replaceAll(`${bossText}${bossText}`, bossText); // Prevent duplicate text.
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  addBossName();
};
