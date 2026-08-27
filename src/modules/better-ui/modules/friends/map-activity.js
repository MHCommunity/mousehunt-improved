import { makeElement, onNavigation, onRequest, waitForElement } from '@utils';

const friendSnuids = new Set();
const recentActivityWindow = 7 * 24 * 60 * 60 * 1000;
const mapActivityRouteTab = 'friends';
const mapActivitySubtab = 'on_maps';
const mapDataFields = [
  'last_active_date',
  'is_online',
  'map_id',
  'map_name',
  'map_image',
  'map_thumb',
  'treasure_map_id',
  'event_map_id',
  'event_map_name',
  'event_map_image',
  'event_map_thumb',
  'wanted_poster_id',
  'wanted_poster_name',
  'wanted_poster_image',
  'wanted_poster_thumb',
  'map_id_list',
  'map_name_list',
  'map_image_list',
];
let friendData = null;
let loadVersion = 0;
let activateAfterNavigation = false;
let hasFriendActivityData = false;

/**
 * Check whether the current Friends route targets map activity.
 *
 * @return {boolean} Whether the map activity route is active.
 */
const isMapActivityRoute = () => {
  const searchParams = new URL(location.href).searchParams;
  const isUrlRoute = mapActivityRouteTab === searchParams.get('tab') && mapActivitySubtab === searchParams.get('sub_tab');
  const isPageRoute = mapActivityRouteTab === hg?.utils?.PageUtil?.getCurrentPageTab?.() && mapActivitySubtab === hg?.utils?.PageUtil?.getCurrentPageSubTab?.();
  return isUrlRoute || isPageRoute;
};

/**
 * Get the directly linkable URL for map activity.
 *
 * @return {string} The map activity URL.
 */
const getMapActivityUrl = () => {
  const url = new URL(location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('tab', mapActivityRouteTab);
  url.searchParams.set('sub_tab', mapActivitySubtab);
  return url.toString();
};

/**
 * Convert a value from a friend payload to plain text.
 *
 * @param {*} value The value to convert.
 *
 * @return {string} The plain-text value.
 */
const toText = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => toText(item))
      .filter(Boolean)
      .join(', ');
  }

  if (!value || 'object' === typeof value) {
    return '';
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = String(value);
  return textarea.value.trim();
};

/**
 * Create an element whose content is treated only as text.
 *
 * @param {string}      tag      The element tag.
 * @param {string|Array} classes The element classes.
 * @param {string}      text     The text content.
 * @param {HTMLElement} [parent] The parent element.
 *
 * @return {HTMLElement} The created element.
 */
const makeTextElement = (tag, classes, text, parent = null) => {
  const element = makeElement(tag, classes);
  element.textContent = text;
  parent?.append(element);
  return element;
};

/**
 * Create and append an element, returning the created child.
 *
 * Unlike makeElement's append argument, this helper returns the new element rather
 * than its parent. Map activity needs the child to apply images and attributes.
 *
 * @param {string}       tag      The element tag.
 * @param {string|Array} classes  The element classes.
 * @param {HTMLElement}  parent   The parent element.
 *
 * @return {HTMLElement} The created element.
 */
const appendElement = (tag, classes, parent) => {
  const element = makeElement(tag, classes);
  parent.append(element);
  return element;
};

/**
 * Normalize scalar, array, and keyed-list response fields.
 *
 * @param {*} value The response value.
 *
 * @return {Array} The normalized values.
 */
const toList = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && 'object' === typeof value) {
    return Object.values(value);
  }

  return null === value || undefined === value || '' === value ? [] : [value];
};

/**
 * Normalize every map exposed by the combined friend and user data payloads.
 *
 * @param {Object} friend The friend payload.
 *
 * @return {Array} The friend's maps.
 */
const getMaps = (friend) => {
  const maps = new Map();
  const idToKey = new Map();
  const addMap = (rawMap, opts = {}) => {
    const map = rawMap?.map || rawMap;
    if (!map || 'object' !== typeof map) {
      return;
    }

    const id = map.map_id || map.treasure_map_id || map.event_map_id || map.wanted_poster_id || map.mapId || map.id || opts.id || null;
    const name = toText(map.name || map.map_name || opts.name);
    if (!id && !name) {
      return;
    }

    // The same map can arrive under different fields with different IDs (e.g. event map
    // vs. treasure map), so merge by name first and remember every ID seen for it.
    const nameKey = name ? `name:${name.toLowerCase()}` : null;
    const key = (id && idToKey.get(`${id}`)) || nameKey || `id:${id}`;
    if (id) {
      idToKey.set(`${id}`, key);
    }

    const existing = maps.get(key) || {};
    maps.set(key, {
      id: existing.id || id,
      name: existing.name || name,
      thumb: map.thumb || map.thumbnail || map.image || map.map_image || opts.thumb || existing.thumb || '',
      captain: Boolean(opts.captain || map.captain || map.is_captain || existing.captain),
    });
  };

  const requestMaps = friend?.user_interactions?.actions?.request_map_invite?.maps;
  if (Array.isArray(requestMaps)) {
    requestMaps.forEach((map) => addMap(map, { captain: true }));
  }

  [friend.maps, friend.map_list, friend.map_data, friend.treasure_maps].forEach((collection) => {
    if (Array.isArray(collection)) {
      collection.forEach((map) => addMap(map));
    }
  });

  addMap({}, { id: friend.map_id || friend.treasure_map_id, name: friend.map_name, thumb: friend.map_image || friend.map_thumb });
  addMap({}, { id: friend.event_map_id, name: friend.event_map_name, thumb: friend.event_map_image || friend.event_map_thumb });
  addMap({}, { id: friend.wanted_poster_id, name: friend.wanted_poster_name, thumb: friend.wanted_poster_image || friend.wanted_poster_thumb });

  const mapIds = toList(friend.map_id_list);
  const mapNames = toList(friend.map_name_list);
  const mapImages = toList(friend.map_image_list);
  mapIds.forEach((id, index) => addMap({}, { id, name: mapNames[index], thumb: mapImages[index] }));

  if (!maps.size) {
    const names = toText(friend.map_name_list || friend.map_name);
    if (names) {
      addMap({}, { name: names });
    }
  }

  return [...maps.values()];
};

/**
 * Parse a last-active value from MouseHunt.
 *
 * @param {number|string} value The last-active value.
 *
 * @return {number|null} The timestamp in milliseconds.
 */
const parseLastActive = (value) => {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
  }

  const parsed = Date.parse(String(value || '').replace(' ', 'T'));
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Check whether a friend has been active during the query window.
 *
 * @param {Object} friend The friend activity payload.
 *
 * @return {boolean} Whether the friend was recently active.
 */
const isRecentlyActive = (friend) => {
  if (friend?.is_online) {
    return true;
  }

  const lastActive = parseLastActive(friend?.last_active_date);
  return null !== lastActive && lastActive >= Date.now() - recentActivityWindow;
};

/**
 * Cache recently active snuids from the game's sortable friends response.
 *
 * @param {Object} response The friends response.
 * @param {Object} request  The submitted request data.
 */
const cacheFriendSnuids = (response, request) => {
  if ('get_sortable_friend_data' !== request?.action || !response?.sortable_data) {
    return;
  }

  friendSnuids.clear();
  Object.entries(response.sortable_data).forEach(([snuid, friend]) => {
    if (isRecentlyActive(friend)) {
      friendSnuids.add(snuid);
    }
  });
  hasFriendActivityData = true;
};

/**
 * Load recently active friend snuids when the sortable response was not observed.
 *
 * @return {Promise<Array<string>>} Recently active friend snuids.
 */
const getFriendSnuids = async () => {
  if (hasFriendActivityData) {
    return [...friendSnuids];
  }

  const friends = await new Promise((resolve) => {
    let isSettled = false;
    const finish = (data = []) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(timeout);
      resolve(Array.isArray(data) ? data : []);
    };
    const timeout = setTimeout(finish, 15_000);

    if (!hg?.utils?.User?.getFriends) {
      finish();
      return;
    }

    try {
      hg.utils.User.getFriends(['last_active_date', 'is_online'], finish, finish);
    } catch {
      finish();
    }
  });

  friendSnuids.clear();
  friends.forEach((friend) => {
    if (friend?.sn_user_id && isRecentlyActive(friend)) {
      friendSnuids.add(`${friend.sn_user_id}`);
    }
  });
  hasFriendActivityData = true;

  return [...friendSnuids];
};

/**
 * Ask the game's friends page for a batch of friend details.
 *
 * @param {Array<string>} snuids The friend snuids to load.
 *
 * @return {Promise<Array>} The friend payloads.
 */
const loadFriendBatch = (snuids) =>
  new Promise((resolve) => {
    let isSettled = false;
    const finish = (friends = []) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(timeout);
      resolve(friends);
    };
    const timeout = setTimeout(finish, 15_000);

    if (!app?.pages?.FriendsPage?.getFriendDataBySnuids) {
      finish();
      return;
    }

    try {
      app.pages.FriendsPage.getFriendDataBySnuids(snuids, (friends) => finish(friends || []));
    } catch {
      finish();
    }
  });

/**
 * Ask the game's user data endpoint for map IDs omitted from friend rows.
 *
 * @param {Array<string>} snuids The friend snuids to load.
 *
 * @return {Promise<Array>} The user map payloads.
 */
const loadMapDataBatch = (snuids) =>
  new Promise((resolve) => {
    let isSettled = false;
    const finish = (users = []) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(timeout);
      resolve(Array.isArray(users) ? users : []);
    };
    const timeout = setTimeout(finish, 15_000);

    if (!hg?.utils?.User?.getUserData) {
      finish();
      return;
    }

    try {
      hg.utils.User.getUserData(snuids, mapDataFields, (users) => finish(users || []), finish);
    } catch {
      finish();
    }
  });

/**
 * Load and merge one batch of friend display and map data.
 *
 * @param {Array<string>} snuids The friend snuids to load.
 *
 * @return {Promise<Array>} The merged friend payloads.
 */
const loadBatch = async (snuids) => {
  const [friends, users] = await Promise.all([loadFriendBatch(snuids), loadMapDataBatch(snuids)]);
  const usersBySnuid = new Map(users.filter(Boolean).map((entry) => [`${entry.sn_user_id}`, entry]));

  return friends.filter(Boolean).map((friend) => ({
    ...friend,
    ...usersBySnuid.get(`${friend.sn_user_id}`),
    user_interactions: friend.user_interactions,
  }));
};

/**
 * Open a treasure map without leaving the friends page underneath it.
 *
 * @param {string|number} mapId The map ID to open.
 */
const openMap = (mapId) => {
  hg.controllers.TreasureMapController.show(mapId);
};

/**
 * Open a friend's profile.
 *
 * @param {string} snuid The friend's snuid.
 */
const openProfile = (snuid) => {
  hg?.utils?.PageUtil?.showHunterProfile?.(snuid);
};

/**
 * Make a profile button for a map activity row.
 *
 * @param {Object} friend The friend payload.
 *
 * @return {HTMLButtonElement} The profile button.
 */
const makeProfileButton = (friend) => {
  const profile = makeElement('button', 'mh-friends-on-maps-profile');
  profile.type = 'button';
  profile.addEventListener('click', () => openProfile(friend.sn_user_id));

  const image = appendElement('span', 'mh-friends-on-maps-avatar', profile);
  if (friend.profile_pic) {
    image.style.backgroundImage = `url(${friend.profile_pic})`;
  }

  const profileDetails = appendElement('span', 'mh-friends-on-maps-profile-details', profile);
  makeTextElement('span', 'mh-friends-on-maps-name', toText(friend.name), profileDetails);

  const activityClasses = ['mh-friends-on-maps-activity'];
  if (friend.is_online) {
    activityClasses.push('online');
  }

  const activity = appendElement('span', activityClasses, profileDetails);
  appendElement('span', 'mh-friends-on-maps-activity-dot', activity);
  makeTextElement('span', '', `Last active: ${toText(friend.last_active_formatted) || 'Unknown'}`, activity);
  return profile;
};

/**
 * Make a row for a friend and their maps.
 *
 * @param {Object}  friend  The friend payload.
 * @param {Array}   maps    The friend's maps.
 * @param {boolean} captain Whether the friend is captain of these maps.
 *
 * @return {HTMLDivElement} The map activity row.
 */
const makeFriendRow = (friend, maps, captain) => {
  const rowClasses = ['mh-friends-on-maps-row'];
  if (captain) {
    rowClasses.push('captain');
  }

  const row = makeElement('div', rowClasses);
  row.append(makeProfileButton(friend));

  const details = appendElement('div', 'mh-friends-on-maps-details', row);
  maps.forEach((map) => {
    const line = appendElement('div', 'mh-friends-on-maps-map', details);
    const mapName = appendElement('div', 'mh-friends-on-maps-map-name', line);
    if (map.thumb) {
      const image = appendElement('span', 'mh-friends-on-maps-map-image', mapName);
      image.style.backgroundImage = `url(${map.thumb})`;
    }
    makeTextElement('span', '', map.name || 'Unknown map', mapName);

    if (map.id) {
      const open = makeElement('button', ['mousehuntActionButton', 'tiny', 'mh-friends-on-maps-open']);
      open.type = 'button';
      open.dataset.mapId = map.id;
      makeTextElement('span', '', 'Open map', open);
      open.addEventListener('click', () => openMap(map.id));
      line.append(open);
    }
  });
  return row;
};

/**
 * Collect the rows shown in the map activity view.
 *
 * Each row is one friend with their maps grouped together, split into separate rows
 * only when they captain some maps and not others so captained maps stay on top.
 *
 * @param {Array} data The friend payloads.
 *
 * @return {Array} The display rows.
 */
const getRows = (data) => {
  const groups = new Map();
  data.forEach((friend) => {
    getMaps(friend).forEach((map) => {
      const key = `${friend.sn_user_id}:${map.captain ? 'captain' : 'member'}`;
      const group = groups.get(key) || { friend, captain: Boolean(map.captain), maps: [] };
      group.maps.push(map);
      groups.set(key, group);
    });
  });

  const rows = [...groups.values()];
  rows.forEach((row) => row.maps.sort((a, b) => a.name.localeCompare(b.name)));

  /**
   * Get a friend's most recent activity time for sorting.
   *
   * @param {Object} friend The friend payload.
   *
   * @return {number} The activity timestamp in milliseconds.
   */
  const getActivityTime = (friend) => {
    if (friend?.is_online) {
      return Number.MAX_SAFE_INTEGER;
    }

    return parseLastActive(friend?.last_active_date) ?? 0;
  };

  return rows.sort((a, b) => {
    if (a.captain !== b.captain) {
      return a.captain ? -1 : 1;
    }

    const activityCompare = getActivityTime(b.friend) - getActivityTime(a.friend);
    return activityCompare || toText(a.friend.name).localeCompare(toText(b.friend.name));
  });
};

/**
 * Render loaded friend map activity.
 *
 * @param {HTMLElement} view             The map activity view.
 * @param {Array}       data             The friend payloads.
 * @param {Object}      [progress]       Loading progress.
 * @param {number}      [progress.checked] The number of friends checked.
 * @param {number}      [progress.total]   The total number of friends.
 * @param {boolean}     [progress.loading] Whether more batches are loading.
 */
const renderFriendData = (view, data, progress = {}) => {
  const rows = getRows(data);
  const friendCount = new Set(rows.map((row) => row.friend.sn_user_id)).size;
  const { checked = data.length, total = data.length, loading = false } = progress;

  view.replaceChildren();
  if (!rows.length) {
    makeTextElement(
      'div',
      loading ? 'mh-friends-on-maps-loading' : 'friendsPage-empty',
      loading ? 'Map results will appear here as they load.' : 'None of your friends are currently on a map.',
      view
    );
  } else {
    const list = appendElement('div', 'mh-friends-on-maps-list', view);
    rows.forEach((row) => list.append(makeFriendRow(row.friend, row.maps, row.captain)));
  }

  const footer = appendElement('div', 'mh-friends-on-maps-footer', view);
  const summary = `${friendCount} ${1 === friendCount ? 'friend' : 'friends'} on maps`;
  makeTextElement('strong', '', summary, footer);
  if (loading) {
    makeTextElement('span', 'mh-friends-on-maps-progress', `Checking maps… ${checked} of ${total}`, footer);
  }

  const refresh = makeTextElement('button', 'mh-friends-on-maps-refresh', 'Refresh', footer);
  refresh.type = 'button';
  refresh.addEventListener('click', () => {
    friendData = null;
    friendSnuids.clear();
    hasFriendActivityData = false;
    loadAndRender(view);
  });
};

/**
 * Load all friend detail payloads and render their map activity.
 *
 * @param {HTMLElement} view The map activity view.
 */
async function loadAndRender(view) {
  const version = ++loadVersion;
  view.replaceChildren();
  const loading = makeTextElement('div', 'mh-friends-on-maps-loading', 'Loading friends…', view);

  if (friendData) {
    renderFriendData(view, friendData);
    return;
  }

  const snuids = await getFriendSnuids();
  if (version !== loadVersion) {
    return;
  }

  if (!snuids.length) {
    loading.textContent = 'None of your friends have been active in the last week.';
    return;
  }

  const loaded = [];
  const batchSize = 20;
  renderFriendData(view, loaded, { checked: 0, total: snuids.length, loading: true });
  for (let i = 0; i < snuids.length; i += batchSize) {
    const batch = await loadBatch(snuids.slice(i, i + batchSize));
    if (version !== loadVersion) {
      return;
    }

    loaded.push(...batch.filter(Boolean));
    renderFriendData(view, loaded, {
      checked: Math.min(i + batchSize, snuids.length),
      total: snuids.length,
      loading: true,
    });
  }

  friendData = loaded;
  renderFriendData(view, friendData);
}

/**
 * Deactivate the map activity tab.
 *
 * @param {HTMLElement}     container The native friend list container.
 * @param {HTMLAnchorElement} tab     The map activity tab.
 */
const deactivateMapActivity = (container, tab) => {
  container.classList.remove('mh-friends-on-maps-active');
  tab.classList.remove('active');
  loadVersion += 1;
};

/**
 * Activate the map activity tab.
 *
 * @param {HTMLElement}      container    The native friend list container.
 * @param {HTMLElement}      view         The map activity view.
 * @param {HTMLAnchorElement} tab          The map activity tab.
 * @param {HTMLElement}      tabsContainer The page's top tab container.
 */
const activateMapActivity = (container, view, tab, tabsContainer) => {
  container.closest('.mousehuntHud-page-tabContent.friends')?.classList.add('active');
  container.closest('.mousehuntHud-page-subTabContent.view_friends')?.classList.add('active');
  tabsContainer.querySelectorAll('.mousehuntHud-page-tabHeader').forEach((pageTab) => pageTab.classList.remove('active'));
  tab.classList.add('active');
  container.classList.add('mh-friends-on-maps-active');
  loadAndRender(view);
};

/**
 * Add the map activity view to the Friends page.
 */
const addMapActivity = async () => {
  const tabsContainer = await waitForElement('.mousehuntHud-page-tabHeader-container');
  const container = await waitForElement('.friendsPage-friendListContainer.view_friends');
  if (!tabsContainer || !container) {
    return;
  }

  let tab = tabsContainer.querySelector('.mh-friends-on-maps-tab');
  let view = container.querySelector('.mh-friends-on-maps-view');
  if (!view) {
    view = makeElement('div', 'mh-friends-on-maps-view');
    container.querySelector('.friendsPage-list-header')?.after(view);
  }

  if (!tab) {
    tab = makeElement('a', ['mousehuntHud-page-tabHeader', 'mh-friends-on-maps-tab']);
    tab.href = getMapActivityUrl();
    tab.dataset.tab = mapActivitySubtab;
    makeTextElement('span', '', 'On Maps', tab);

    const requestsTab = tabsContainer.querySelector('.mousehuntHud-page-tabHeader.requests');
    if (requestsTab) {
      requestsTab.before(tab);
    } else {
      tabsContainer.append(tab);
    }

    tab.addEventListener('click', (event) => {
      event.preventDefault();
      activateAfterNavigation = true;
      hg.utils.PageUtil.setPageTab(mapActivityRouteTab, mapActivitySubtab);
    });

    tabsContainer.addEventListener('click', (event) => {
      const pageTab = event.target.closest('.mousehuntHud-page-tabHeader');
      if (pageTab && pageTab !== tab) {
        activateAfterNavigation = false;
        const currentContainer = document.querySelector('.friendsPage-friendListContainer.view_friends');
        if (currentContainer) {
          deactivateMapActivity(currentContainer, tab);
        }
      }
    });
  }

  if (activateAfterNavigation || isMapActivityRoute()) {
    activateAfterNavigation = false;
    activateMapActivity(container, view, tab, tabsContainer);
  } else {
    deactivateMapActivity(container, tab);
  }
};

/**
 * Initialize the Friends on Maps view.
 */
export default () => {
  onRequest('pages/friends.php', cacheFriendSnuids);
  onNavigation(addMapActivity, {
    page: 'friends',
    anyTab: true,
    anySubtab: true,
  });
};
