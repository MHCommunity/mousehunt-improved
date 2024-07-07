import {
  addStyles,
  dbGet,
  dbSet,
  getData,
  makeElement,
  onRequest,
  sleep
} from '@utils';

/**
 * Get the map data.
 *
 * @param {number}  mapId       The map ID.
 * @param {boolean} forceUpdate Whether to force an update.
 *
 * @return {Promise} The map data.
 */
const getMapData = async (mapId, forceUpdate = false) => {
  return new Promise((resolve) => {
    hg.utils.TreasureMapUtil.getMapInfo(mapId, (resp) => {
      resolve(resp);
    }, () => {
      resolve([]);
    }, forceUpdate);
  });
};

/**
 * Update a map listing.
 *
 * @param {number} mapId The map ID.
 */
const updateListing = async (mapId) => {
  let mapData;

  const mapEl = document.querySelector(`.treasureMapListingsTableView-row[data-map-id="${mapId}"]`);
  if (! mapEl) {
    return;
  }

  mapEl.classList.add('mh-improved-map-listing-highlight');

  const mapsData = await getData('community-map-data');
  let oldIds = new Set();

  if (mapsData && mapsData.old) {
    oldIds = new Set(mapsData.old);
  }

  if (oldIds.has(mapId)) {
    mapEl.remove();
    return;
  }

  if (mapEl.innerText.includes('Loading')) {
    // add an observer to wait for the map data to load
    const observer = new MutationObserver(async () => {
      if (mapEl.innerText.includes('Loading')) {
        await sleep(500);
        return;
      }

      observer.disconnect();

      await updateListing(mapId);
    });

    observer.observe(mapEl, {
      childList: true,
      subtree: true,
    });

    return;
  }

  const cachedData = await dbGet('cache', `map-listing-cache-${mapId}`);
  if (cachedData) {
    mapData = cachedData.data.mapData;
  } else {
    mapData = await getMapData(mapId);

    await sleep(500);

    if (! mapData || ! mapData.treasure_map || ! mapData.treasure_map.hunters) {
      return;
    }

    mapData = mapData.treasure_map;

    dbSet('cache', {
      id: `map-listing-cache-${mapId}`,
      mapData,
    });
  }

  // find the user that owns this map, which is mapData.treasure_map.hunters[0].captain === true
  const captain = mapData.hunters.find((hunter) => hunter.captain === true);
  if (! captain) {
    return;
  }

  const lastActive = captain?.last_active_formatted;

  const captainEl = mapEl.querySelector('.treasureMapListingsTableView-owner');
  if (captainEl) {
    const lastActiveWrapper = makeElement('div', ['mh-improved-map-listing-last-active-wrapper', 'treasureMapView-ally-lastActive']);
    if (captain.is_online) {
      lastActiveWrapper.classList.add('online');
    }

    makeElement('div', 'mh-improved-map-listing-last-active', captain.last_active_formatted, lastActiveWrapper);

    captainEl.append(lastActiveWrapper);
  }

  if (lastActive.includes('week') || lastActive.includes('month') || lastActive.includes('year')) {
    mapEl.remove();
    return;
  }

  if (
    (mapData.max_hunters - 1 === mapData.hunters.length) ||
    mapData.invite_requests.length > 15
  ) {
    mapEl.classList.add('mh-improved-map-listing-full');
  }

  mapEl.classList.remove('mh-improved-map-listing-highlight');
};

/**
 * Debug the community maps.
 *
 * @param {Object} response The response.
 * @param {Object} data     The data.
 */
const debug = async (response, data) => {
  if ('get_listings' !== data.action) {
    return;
  }

  if (! response.treasure_map_listings) {
    return;
  }

  const listingMapIds = response.treasure_map_listings.map((listing) => listing?.map_id);

  // hide the mhct thank you.
  const hideMhct = addStyles('#mhhh_flash_message_div { display: none !important; }', 'hide-mhct');

  for (const mapId of listingMapIds) {
    await updateListing(mapId);
  }

  hideMhct.remove();
};

/**
 * Initialize the module.
 */
export default () => {
  onRequest('users/treasuremap.php', debug);
};
