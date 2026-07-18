import { addStyles, getSetting, makeFavoriteButton, onRequest, saveSetting } from '@utils';
import { onSkyportRaidDialogShow } from '@utils/shared/skyport-raid-dialog';

import styles from './raid-favorites.css';

const settingKey = 'location-huds.cerulean-skyport-favorite-raids';

/**
 * Get the raid types the hunter has favorited.
 *
 * @return {Array} The favorited raid types.
 */
const getFavoriteRaids = () => {
  return getSetting(settingKey, []);
};

/**
 * Get the types of the quest's current shipments that trade with a favorited raid's location.
 *
 * @return {Array} The shipment types.
 */
const getFavoriteShipmentTypes = () => {
  const favorites = getFavoriteRaids();
  const shipments = user?.quests?.QuestCeruleanSkyport?.shipments || [];

  return shipments.filter((shipment) => favorites.includes(shipment?.location?.type?.replace(/_shipment$/, '_raid'))).map((shipment) => shipment.type);
};

/**
 * Highlight the favorited raids' ships on the 'choose a ship' view.
 *
 * The game re-renders the view whenever the shipment state changes, so the ships are
 * matched with generated CSS keyed off the favorites rather than by classing them,
 * which would need re-applying on every render.
 */
const updateShipHighlights = () => {
  let style = document.querySelector('#mh-improved-skyport-raid-favorite-ships');
  if (!style) {
    style = document.createElement('style');
    style.id = 'mh-improved-skyport-raid-favorite-ships';
    document.head.append(style);
  }

  const selectors = getFavoriteShipmentTypes().map((type) => {
    return `.ceruleanSkyportPrepView__shipment[data-type="${type}"] .ceruleanSkyportPrepView__shipmentDirigible`;
  });

  style.textContent = selectors.length ? `${selectors.join(', ')} { filter: brightness(1.1) drop-shadow(0 0 6px #f7c22b); }` : '';
};

/**
 * Add or remove a raid type from the favorites.
 *
 * @param {string}  type       The raid type.
 * @param {boolean} isFavorite Whether the raid should be a favorite.
 */
const toggleFavoriteRaid = (type, isFavorite) => {
  const favorites = new Set(getFavoriteRaids());

  if (isFavorite) {
    favorites.add(type);
  } else {
    favorites.delete(type);
  }

  saveSetting(settingKey, [...favorites]);
  updateShipHighlights();
};

/**
 * Add a favorite star to each raid option in the raid choice dialog and
 * highlight the favorited ones.
 */
const addFavoriteButtons = () => {
  const favorites = getFavoriteRaids();

  const blocks = document.querySelectorAll('.ceruleanSkyportRaidChoiceDialogView__raidBlock[data-type]');
  blocks.forEach(async (block) => {
    const type = block.getAttribute('data-type');
    const isFavorite = favorites.includes(type);

    block.classList.toggle('mh-improved-skyport-raid-favorite', isFavorite);

    const star = await makeFavoriteButton({
      id: `mh-improved-skyport-raid-favorite-${type}`,
      target: block,
      size: 'small',
      state: isFavorite,
      isSetting: false,
      /**
       * Save the raid as a favorite and light up its balloon.
       */
      onActivate: () => {
        toggleFavoriteRaid(type, true);
        block.classList.add('mh-improved-skyport-raid-favorite');
      },
      /**
       * Remove the raid from the favorites.
       */
      onDeactivate: () => {
        toggleFavoriteRaid(type, false);
        block.classList.remove('mh-improved-skyport-raid-favorite');
      },
    });

    star.classList.add('mh-improved-skyport-raid-favorite-star');
    star.title = 'Favorite this raid';
  });
};

/**
 * Highlight favorited raids in the raid choice dialog and on the 'choose a ship' view.
 */
const initRaidFavorites = () => {
  addStyles(styles, 'cerulean-skyport-raid-favorites');

  onSkyportRaidDialogShow(addFavoriteButtons);

  // The shipments' raid locations rotate, so re-resolve them whenever the quest
  // data may have been refreshed.
  updateShipHighlights();
  onRequest('*', updateShipHighlights);
};

export { initRaidFavorites };
