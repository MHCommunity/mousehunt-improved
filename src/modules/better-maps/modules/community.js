import {
  addStyles,
  dbGet,
  dbSet,
  makeElement,
  onRequest,
  sleep
} from '@utils';

const getMapData = async (mapId, forceUpdate = false) => {
  return new Promise((resolve) => {
    hg.utils.TreasureMapUtil.getMapInfo(mapId, (resp) => {
      resolve(resp);
    }, () => {
      resolve([]);
    }, forceUpdate);
  });
};

const oldIds = new Set([
  6124452,
  6116356,
  6112572,
  6063829,
  6041361,
  6001101,
  5982797,
  5980839,
  5975294,
  5974787,
  5962498,
  5923595,
  5846849,
  5816550,
  5786343,
  5777911,
  5762791,
  5707992,
  5642430,
  5635162,
  5629841,
  5617390,
  5617130,
  5613596,
  5601746,
  5594573,
  5586111,
  5580675,
  5570940,
  5564304,
  5559943,
  5519757,
  5504581,
  5492386,
  5475950,
  5470552,
  5466555,
  5463382,
  5450350,
  5372374,
  5367257,
  5326509,
  5303846,
  5277604,
  5269785,
  5259977,
  5251286,
  5182548,
  5094152,
  5093755,
  4976280,
  4973249,
  4973128,
  4938259,
  4934275,
  4792221,
  4772313,
  4770377,
  4760688,
  4749373,
  4723507,
  4711829,
]);

const updateListing = async (mapId) => {
  let mapData;

  const mapEl = document.querySelector(`.treasureMapListingsTableView-row[data-map-id="${mapId}"]`);
  if (! mapEl) {
    return;
  }

  mapEl.classList.add('mh-improved-map-listing-highlight');

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

export default () => {
  onRequest('users/treasuremap.php', debug);
};
