import { addStyles } from '@utils';
import { onSkyportRaidDialogShow } from '@utils/shared/skyport-raid-dialog';

import styles from './current-raid.css';

/**
 * Mark the raid the hunter is currently on in the raid choice dialog.
 *
 * The dialog only shows the indicator while the game reports an active raid
 * via its data-in-raid attribute, so a stale current_raid is harmless.
 */
const markCurrentRaid = () => {
  const currentType = user?.quests?.QuestCeruleanSkyport?.current_raid?.type;
  if (!currentType) {
    return;
  }

  const block = document.querySelector(`.ceruleanSkyportRaidChoiceDialogView__raidBlock[data-type="${currentType}"]`);
  if (block) {
    block.classList.add('mh-improved-skyport-raid-current');
  }
};

/**
 * Subtly indicate the current raid in the raid choice dialog.
 */
const initCurrentRaidIndicator = () => {
  addStyles(styles, 'cerulean-skyport-current-raid');

  onSkyportRaidDialogShow(markCurrentRaid);
};

export { initCurrentRaidIndicator };
