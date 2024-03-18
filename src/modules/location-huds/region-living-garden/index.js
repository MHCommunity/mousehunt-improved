import { addHudStyles, makeElement } from '@utils';

import styles from './styles.css';

const clickCharmsToEquip = () => {
  const charms = document.querySelectorAll('.livingGardenHud .minigameContainer .curseContainer .curse.active');
  const charmMap = {
    fear: 1011,
    darkness: 1019,
    mist: 1012,
  };

  charms.forEach((charm) => {
    const charmClass = [...charm.classList].find((c) => c !== 'curse' && c !== 'active');
    charm.addEventListener('click', () => {
      if (charmClass in charmMap) {
        hg.utils.TrapControl.armItem(charmMap[charmClass], 'trinket');
        hg.utils.TrapControl.go();
      }
    });

    charm.title = 'Click to equip charm';
  });
};

const isTwisted = () => {
  let isNormal = true;
  if (user.quests.QuestLivingGarden && undefined !== user.quests.QuestLivingGarden?.is_normal) {
    isNormal = user.quests.QuestLivingGarden.is_normal;
  } else if (user.quests.QuestLostCity && undefined !== user.quests.QuestLostCity?.is_normal) {
    isNormal = user.quests.QuestLostCity.is_normal;
  } else if (user.quests.QuestSandDunes && undefined !== user.quests.QuestSandDunes?.is_normal) {
    isNormal = user.quests.QuestSandDunes.is_normal;
  }

  return ! isNormal;
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  clickCharmsToEquip();
};
