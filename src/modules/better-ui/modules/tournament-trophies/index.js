import { addStyles, onNavigation } from '@utils';

import styles from './styles.css';

const tournamentItems = new Map([
  ['6d1c8f4454bed17ffbb6715553d8cdb0', 'tournament_trophy_gold_collectible'],
  ['bfd35c3fbf21b9dbdb39e9c42ba0dff1', 'tournament_trophy_silver_collectible'],
  ['aec8ef247426f3560899d7ebafbb2ac5', 'tournament_trophy_bronze_collectible'],
  ['ae4ad0511280558471d441bba366feed', 'tournament_badge_challenger_collectible'],
  ['eef1baf8f611341524de5af052e06a05', 'tournament_badge_competitor_collectible'],
  ['b45427f87d198fade78866bfa7d5010e', 'tournament_badge_participant_collectible'],
]);

/**
 * Get the item type represented by a tournament trophy image.
 *
 * @param {HTMLElement} trophy The trophy element.
 *
 * @return {string} The item type, or an empty string if it is unknown.
 */
const getItemType = (trophy) => {
  const backgroundImage = trophy.style.backgroundImage;

  for (const [imageId, itemType] of tournamentItems) {
    if (backgroundImage.includes(imageId)) {
      return itemType;
    }
  }

  return '';
};

/**
 * Open a tournament trophy in the item view.
 *
 * @param {KeyboardEvent|MouseEvent} event    The interaction event.
 * @param {string}                   itemType The item type to open.
 */
const openItem = (event, itemType) => {
  if ('keydown' === event.type && ! ['Enter', ' '].includes(event.key)) {
    return;
  }

  event.preventDefault();
  hg.views.ItemView.show(itemType);
};

/**
 * Make the tournament trophies on a hunter profile interactive.
 */
const addTrophyLinks = () => {
  const trophies = document.querySelectorAll('.hunterInfoView-achievementsBlock .mousehuntTabContent[data-tab="team"] .hunterInfoView-teamTab-content-wrapper .itemImage');

  trophies.forEach((trophy) => {
    if (trophy.hasAttribute('data-mh-improved-tournament-item')) {
      return;
    }

    const itemType = getItemType(trophy);
    if (! itemType) {
      return;
    }

    trophy.setAttribute('data-mh-improved-tournament-item', itemType);
    trophy.setAttribute('role', 'button');
    trophy.setAttribute('tabindex', '0');

    trophy.addEventListener('click', (event) => openItem(event, itemType));
    trophy.addEventListener('keydown', (event) => openItem(event, itemType));
  });
};

/**
 * Initialize the module.
 */
export default () => {
  addStyles(styles, 'better-ui-tournament-trophies');

  onNavigation(addTrophyLinks, {
    page: 'hunterprofile',
  });
};
