import { addStyles, getData, sleep } from '@utils';

/**
 * Update a map listing.
 *
 * @param {number} mapId The map ID.
 */
const updateListing = async (mapId) => {
  const mapEl = document.querySelector(`.treasureMapListingsTableView-row[data-map-id="${mapId}"]`);
  if (!mapEl) {
    return;
  }

  mapEl.classList.add('mh-improved-map-listing-highlight');

  await sleep(500);
  const mapsData = await getData('community-map-data');
  let oldIds = new Set();

  if (mapsData && mapsData.old) {
    oldIds = new Set(mapsData.old);
  }

  if (oldIds.has(mapId)) {
    mapEl.remove();
  }
};

/**
 * Debug the community maps.
 *
 * @param {Object} response The response.
 * @param {Object} data     The data.
 */
const updateCommunityListings = async (response, data) => {
  if ('get_listings' !== data.action) {
    return;
  }

  if (!response.treasure_map_listings) {
    return;
  }

  const listingMapIds = response.treasure_map_listings.map((listing) => listing?.map_id);

  // hide the mhct thank you.
  const hideMhct = addStyles('#mhhh_flash_message_div { display: none !important; }', 'better-maps-temporary-hide-mhct');

  for (const mapId of listingMapIds) {
    await updateListing(mapId);
  }

  hideMhct.remove();
};

export { updateCommunityListings };
