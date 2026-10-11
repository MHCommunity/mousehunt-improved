import { addHudStyles } from '@utils';

import styles from './styles.css';
import addHudListener from '../../shared/hud-listener';

/**
 * Add click event to charms to equip them.
 */
const clickCharmsToEquip = () => {
  const charms = document.querySelectorAll('.livingGardenHud .minigameContainer .curseContainer .curse.active');
  const charmMap = {
    fear: 1011,
    darkness: 1019,
    mist: 1012,
  };

  charms.forEach((charm) => {
    const charmClass = [...charm.classList].find((c) => c !== 'curse' && c !== 'active');
    addHudListener(charm, 'click', () => {
      if (charmClass in charmMap) {
        hg.utils.TrapControl.armItem(charmMap[charmClass], 'trinket');
        hg.utils.TrapControl.go();
      }
    });

    charm.title = 'Click to equip charm';
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  clickCharmsToEquip();
};
