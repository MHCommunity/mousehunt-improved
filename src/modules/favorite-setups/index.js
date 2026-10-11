import {
  addHeaderMenuTab,
  addOnboardingTip,
  addStyles,
  cacheGet,
  cacheSet,
  debuglog,
  doRequest,
  getCurrentLocation,
  getCurrentLocationName,
  getCurrentPage,
  getData,
  getHeaders,
  getSetting,
  getUserData,
  groupItemOptions,
  makeElement,
  makeMhButton,
  onEvent,
  onNavigation,
  onRequest,
  onTravel,
  saveSetting,
  sessionDelete,
  sessionGet,
  sessionSet,
  toggleBlueprint,
  travelTo,
} from '@utils';

import { makeItemPicker } from '../../utils/settings-item-picker';

import styles from './styles.css';

import settings from './settings';

/**
 * @typedef {Object} FavoriteSetup
 * @property {string}              id         The setup ID.
 * @property {string | null}       name       The name of the setup.
 * @property {string | null}       bait_id    The bait item ID.
 * @property {string | null}       base_id    The base item ID.
 * @property {string | null}       weapon_id  The weapon item ID.
 * @property {string | null}       trinket_id The trinket item ID.
 * @property {string | null}       power_type The power type of the setup.
 * @property {string | undefined}  location   The location the setup is for.
 * @property {string | undefined}  region     The region the setup is for, when it's for a whole region.
 * @property {boolean | undefined} is_mobile  Whether the setup is a mobile setup.
 */

/**
 * Get the favorite setups.
 *
 * @param {boolean} makeRequest Whether to make a request to get the favorite setups.
 *
 * @return {Promise<FavoriteSetup[]>} The favorite setups.
 */
const getFavoriteSetups = async (makeRequest = true) => {
  /** @type {FavoriteSetup[]} */
  let faves = getSetting('favorite-setups.setups', []);

  if (getSetting('favorite-setups.show-mobile-favorites', false)) {
    let mobileFavorites = await cacheGet('mobile-trap-favorites');
    if (!mobileFavorites && makeRequest) {
      const userData = await getUserData(['trap_favourite']);
      mobileFavorites = userData?.trap_favourite?.favourite_traps || [];

      await cacheSet('mobile-trap-favorites', mobileFavorites, 24 * 60 * 60 * 1000); // Cache for 1 day.
    }

    if (mobileFavorites?.length) {
      /** @type {FavoriteSetup[]} */
      const newFaves = [];
      for (const [slot, favorite] of mobileFavorites.entries()) {
        /** @type {FavoriteSetup} */
        const newFavorite = {
          id: `mobile-${slot}`,
          name: favorite?.name,
          bait_id: favorite?.bait_id,
          base_id: favorite?.base_id,
          weapon_id: favorite?.weapon_id,
          trinket_id: favorite?.trinket_id,
          power_type: null, // TODO: add this.
          is_mobile: true,
        };

        // Remove any existing mobile setups.
        faves = faves.filter((s) => !s?.is_mobile || (s?.is_mobile && !s.id.startsWith('mobile-')));

        // Check if the setup already exists.
        const existingSetup = faves.find((s) => {
          return s?.id === newFavorite.id;
        });

        if (!existingSetup) {
          newFaves.push(newFavorite);
        }
      }

      faves = [...faves, ...newFaves];
    }
  }

  if (!faves || !Array.isArray(faves) || !faves.length) {
    return [];
  }

  // remove any that are just null.
  return faves.filter(Boolean);
};

/**
 * Generate a name for the setup.
 *
 * @param {Object} setup The setup to generate a name for.
 *
 * @return {Promise<string>} The generated name.
 */
const getGeneratedName = async (setup) => {
  if (!getSetting('favorite-setups.use-generated-names', true)) {
    return {
      name: user.environment_name || 'Unnamed Setup',
    };
  }

  try {
    const response = await fetch('https://api.mouse.rip/setup-namer', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        location: setup.location || getCurrentLocation(),
        power_type: getPowerTypeId(setup.power_type || user.trap_power_type_name.toLowerCase()),
        id: setup.id,
        bait: setup.bait_id,
        base: setup.base_id,
        weapon: setup.weapon_id,
        trinket: setup.trinket_id,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Setup namer returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    debuglog('favorite-setups', 'Unable to generate a setup name', error);

    return {
      name: user.environment_name || 'Unnamed Setup',
    };
  }
};

/**
 * Save a favorite setup.
 *
 * @param {FavoriteSetup} setup            The setup to save.
 * @param {boolean}       useGeneratedName Whether to use a generated name for the setup.
 *
 * @return {Promise<FavoriteSetup>} The saved setup.
 */
const saveFavoriteSetup = async (setup, useGeneratedName = true) => {
  let setups = await getFavoriteSetups();

  if (!setups.length) {
    setups = [];
  }

  const normalizedSetup = normalizeSetup(setup);

  // Set a temporary name first
  if (getSetting('favorite-setups.use-generated-names', true) && useGeneratedName) {
    normalizedSetup.name = useGeneratedName ? 'Generating name...' : user.environment_name;
  } else {
    normalizedSetup.name = user.environment_name;
  }

  if (setup.id) {
    normalizedSetup.id = setup.id;
    // replace the setup in the list.
    const index = setups.findIndex((s) => s?.id && s.id === setup.id);
    if (-1 === index) {
      setups.push(normalizedSetup);
    } else {
      setups[index] = normalizedSetup;
    }
  } else {
    try {
      setups.push(normalizedSetup);
    } catch {
      setups = [normalizedSetup];
    }
  }

  setups = removeMobileSetups(setups);

  saveSetting('favorite-setups.setups', setups);

  // Generate name asynchronously if requested
  if (useGeneratedName) {
    getGeneratedName(normalizedSetup)
      .then((setupNameData) => {
        if (setupNameData && setupNameData.name) {
          // Update the setup with the generated name
          normalizedSetup.name = setupNameData.name;

          // Update the saved setups
          const updatedSetups = getSetting('favorite-setups.setups', []);
          const setupIndex = updatedSetups.findIndex((s) => s?.id === normalizedSetup.id);
          if (setupIndex !== -1) {
            updatedSetups[setupIndex] = normalizedSetup;
            saveSetting('favorite-setups.setups', updatedSetups);

            updateSetupRowName(normalizedSetup);

            updateFavoriteSetupName();
          }
        }
      })
      .catch(() => {
        // Fallback to location name if generation fails
        normalizedSetup.name = setup.location || getCurrentLocation() || 'Unnamed Setup';

        const updatedSetups = getSetting('favorite-setups.setups', []);
        const setupIndex = updatedSetups.findIndex((s) => s?.id === normalizedSetup.id);
        if (setupIndex !== -1) {
          updatedSetups[setupIndex] = normalizedSetup;
          saveSetting('favorite-setups.setups', updatedSetups);

          updateSetupRowName(normalizedSetup);
        }
      });
  }

  return normalizedSetup;
};

/**
 * Show a setup's new name in the list, unless it's being edited.
 *
 * @param {FavoriteSetup} setup The setup.
 */
const updateSetupRowName = (setup) => {
  const name = document.querySelector(`.mh-improved-favorite-setups-blueprint-container .row.setup[data-setup-id="${setup.id}"] .name`);
  if (name) {
    name.textContent = setup.name;
    name.title = setup.name;
  }
};

/**
 * Filters out mobile setups from the array.
 * @param {FavoriteSetup[]} setups The setups to filter.
 * @return {FavoriteSetup[]} The setups without mobile setups.
 */
const removeMobileSetups = (setups) => {
  return setups.filter((s) => !s || !s?.is_mobile || (s?.is_mobile && !s.id.startsWith('mobile-')));
};

/**
 * Normalize the setup by forcing everything to be a string.
 *
 * @param {Object} setup The setup to normalize.
 *
 * @return {Object} The normalized setup.
 */
const normalizeSetup = (setup) => {
  return Object.keys(setup).reduce((acc, key) => {
    acc[key] = setup[key] ? setup[key].toString() : '';
    return acc;
  }, {});
};

/**
 * Get the current setup.
 *
 * @return {FavoriteSetup} The current setup.
 */
const getCurrentSetup = () => {
  return normalizeSetup({
    id: 'current',
    name: 'Current Setup',
    bait_id: user.bait_item_id,
    base_id: user.base_item_id,
    weapon_id: user.weapon_item_id,
    trinket_id: user.trinket_item_id,
    power_type: user?.trap_power_type_name.toLowerCase(),
    location: getCurrentLocation(),
  });
};

let itemThumbs;

/**
 * Add an image to the favorite setups list.
 *
 * @param {string}  type     The type of item.
 * @param {string}  id       The item ID.
 * @param {Element} appendTo The element to append the image to.
 */
const addImage = async (type, id, appendTo) => {
  const wrapper = makeElement('div', 'campPage-trap-itemBrowser-favorite-item');
  wrapper.setAttribute('data-item-id', id || '');
  wrapper.setAttribute('data-item-type', type);

  const item = makeElement('div', ['campPage-trap-itemBrowser-favorite-item-image']);

  if (!itemThumbs) {
    itemThumbs = await getData('item-thumbnails');
  }

  if (itemThumbs) {
    item.style.backgroundImage = `url(${itemThumbs.find((thumb) => thumb.id == id)?.thumb || ''})`; // eslint-disable-line eqeqeq
  }

  makeElement('div', 'campPage-trap-itemBrowser-favorite-item-frame', '', item);

  wrapper.append(item);
  appendTo.append(wrapper);
};

/**
 * Get the power type ID.
 *
 * @param {string} powerType The power type.
 *
 * @return {string} The power type ID.
 */
const getPowerTypeId = (powerType) => {
  const data = {
    arcane: 'arcn',
    draconic: 'drcnc',
    forgotten: 'frgttn',
    hydro: 'hdr',
    law: 'law',
    parental: 'prntl',
    physical: 'phscl',
    rift: 'rift',
    shadow: 'shdw',
    tactical: 'tctcl',
  };

  return data[powerType] || powerType;
};

const componentsCacheKey = 'mh-improved-favorite-setups-components';

let componentsRequest;

/**
 * Get the trap components that the user currently has, cached for the session.
 *
 * @return {Promise<Array>} The trap components.
 */
const getTrapComponents = async () => {
  const cached = sessionGet(componentsCacheKey);
  if (cached) {
    return cached;
  }

  if (!componentsRequest) {
    componentsRequest = doRequest('managers/ajax/users/gettrapcomponents.php')
      .then((response) => {
        const components = response?.components || [];

        // re-sort the items by item name.
        components.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }

          if (a.name > b.name) {
            return 1;
          }

          return 0;
        });

        sessionSet(componentsCacheKey, components);
        componentsRequest = null;

        return components;
      })
      .catch(() => {
        componentsRequest = null;

        return [];
      });
  }

  return componentsRequest;
};

/**
 * Clear the cached trap components so they're fetched again when next needed.
 */
const clearTrapComponents = () => {
  sessionDelete(componentsCacheKey);
  componentsRequest = null;
};

/**
 * Get the IDs of every item that can currently be armed.
 *
 * @return {Promise<Set<string>>} The armable item IDs.
 */
const getArmableItemIds = async () => {
  const components = await getTrapComponents();

  const ids = new Set();
  for (const item of components) {
    if (!item?.item_id) {
      continue;
    }

    // Bait and trinkets are consumed, so having none of them left is the same as not having them.
    const isConsumable = 'bait' === item.classification || 'trinket' === item.classification;
    if (isConsumable && undefined !== item.quantity && Number.parseInt(item.quantity, 10) <= 0) {
      continue;
    }

    ids.add(item.item_id.toString());
  }

  return ids;
};

/**
 * Item types that can be left empty, so a setup missing them is still armed without them.
 */
const optionalItemTypes = ['bait', 'trinket'];

/**
 * Get the item types in a setup that can't currently be armed.
 *
 * @param {FavoriteSetup}  setup   The setup to check.
 * @param {Set<string>}    armable The armable item IDs.
 *
 * @return {string[]} The item types that are missing.
 */
const getMissingItemTypes = (setup, armable) => {
  return ['bait', 'base', 'weapon', 'trinket'].filter((type) => {
    const itemId = setup?.[`${type}_id`];

    return itemId && !armable.has(itemId.toString());
  });
};

/**
 * Highlight any items in the given setup rows that the user no longer has.
 *
 * @param {Element[]|NodeList} rows The setup rows to check.
 */
const highlightMissingItems = async (rows) => {
  if (!rows.length) {
    return;
  }

  const armable = await getArmableItemIds();
  if (!armable.size) {
    // The request failed, so don't flag everything as missing.
    return;
  }

  rows.forEach((row) => {
    const missing = [];

    const images = row.querySelectorAll('.campPage-trap-itemBrowser-favorite-item');
    images.forEach((image) => {
      const itemId = image.getAttribute('data-item-id');
      const itemType = image.getAttribute('data-item-type');

      if (itemId && !armable.has(itemId.toString())) {
        missing.push(itemType);
        image.classList.add('missing-item');
        image.setAttribute('title', `You don't have this ${'trinket' === itemType ? 'charm' : itemType} anymore`);
      } else {
        image.classList.remove('missing-item');
        image.removeAttribute('title');
      }
    });

    row.classList.toggle('has-missing-items', missing.length > 0);

    if (row.classList.contains('setup')) {
      const blocking = missing.filter((type) => !optionalItemTypes.includes(type));
      const names = missing.map((type) => ('trinket' === type ? 'charm' : type));
      let title = 'Arm this setup';
      if (blocking.length) {
        title = `You don't have the ${names.join(', ')} for this setup anymore.`;
      } else if (missing.length) {
        title = `You don't have the ${names.join(' or ')} for this setup anymore, so it will be armed without it.`;
      }

      row.setAttribute('title', title);
    }
  });
};

/**
 * Equip items.
 *
 * @param {Array} items The items to arm.
 *
 * @return {Promise} Resolves when the items are armed.
 */
const armItem = async (items) => {
  return new Promise((resolve, reject) => {
    items.forEach(({ id, type }) => {
      if (!id) {
        if ('bait' === type) {
          hg.utils.TrapControl.disarmBait();
        } else if ('trinket' === type) {
          hg.utils.TrapControl.disarmTrinket();
        }

        return;
      }

      hg.utils.TrapControl.armItem(id, type);
    });

    hg.utils.TrapControl.go(resolve, reject);
  });
};

/**
 * Arm a favorite setup. A charm or bait that's run out is left out rather than blocking the rest.
 *
 * @param {FavoriteSetup} setup The setup to arm.
 *
 * @return {Promise<boolean>} Whether it was armed.
 */
const armSetup = async (setup) => {
  // Don't try to arm items that we don't have, since the game will just throw an error.
  let armable = await getArmableItemIds();
  if (armable.size && getMissingItemTypes(setup, armable).length) {
    // The cached list may be stale (e.g. bait crafted from a location HUD), so check again.
    clearTrapComponents();
    armable = await getArmableItemIds();
  }

  let trinketId = setup.trinket_id;
  let baitId = setup.bait_id;
  if (armable.size) {
    const missing = getMissingItemTypes(setup, armable);
    if (missing.includes('trinket')) {
      trinketId = null;
    }

    if (missing.includes('bait')) {
      baitId = null;
    }

    if (missing.some((type) => !optionalItemTypes.includes(type))) {
      return false;
    }
  }

  const toArm = [];

  // eslint-disable-next-line eqeqeq
  if (setup.base_id && setup.base_id != user.base_item_id) {
    toArm.push({ id: setup.base_id, type: 'base' });
  }

  // eslint-disable-next-line eqeqeq
  if (setup.weapon_id && setup.weapon_id != user.weapon_item_id) {
    toArm.push({ id: setup.weapon_id, type: 'weapon' });
  }

  // A setup without a charm or bait means those slots should be empty, so disarm them.
  if (trinketId) {
    // eslint-disable-next-line eqeqeq
    if (trinketId != user.trinket_item_id) {
      toArm.push({ id: trinketId, type: 'trinket' });
    }
  } else if (user.trinket_item_id) {
    toArm.push({ id: null, type: 'trinket' });
  }

  if (baitId) {
    // eslint-disable-next-line eqeqeq
    if (baitId != user.bait_item_id) {
      toArm.push({ id: baitId, type: 'bait' });
    }
  } else if (user.bait_item_id) {
    toArm.push({ id: null, type: 'bait' });
  }

  if (!toArm.length) {
    return true;
  }

  try {
    await armItem(toArm);
    return true;
  } catch {
    // The arm failed, so refresh what we have for next time.
    clearTrapComponents();
    return false;
  }
};

/**
 * Regions in the order the travel page lists them.
 */
const regions = [
  { id: 'gnawnia', name: 'Gnawnia' },
  { id: 'valour', name: 'Valour' },
  { id: 'whisker_woods', name: 'Whisker Woods' },
  { id: 'burroughs', name: 'Burroughs' },
  { id: 'furoma', name: 'Furoma' },
  { id: 'bristle_woods', name: 'Bristle Woods' },
  { id: 'tribal_isles', name: 'Tribal Isles' },
  { id: 'varmint_valley', name: 'Varmint Valley' },
  { id: 'desert', name: 'Sandtail Desert' },
  { id: 'rodentia', name: 'Rodentia' },
  { id: 'queso_canyon', name: 'Queso Canyon' },
  { id: 'zokor_zone', name: 'Hollow Heights' },
  { id: 'folklore_forest', name: 'Folklore Forest' },
  { id: 'riftopia', name: 'Rift Plane' },
];

let environmentsCache;

/**
 * Get every location, including event ones.
 *
 * @return {Promise<Array>} The locations.
 */
const getEnvironments = async () => {
  if (!environmentsCache) {
    const [regular, events] = await Promise.all([getData('environments'), getData('environments-events')]);
    environmentsCache = [...(regular || []), ...(events || []).map((environment) => ({ ...environment, isEvent: true }))];
  }

  return environmentsCache;
};

/**
 * Get the region that a location is in.
 *
 * @param {string} location     The location ID.
 * @param {Array}  environments The locations.
 *
 * @return {string} The region ID, or an empty string.
 */
const getRegionForLocation = (location, environments) => {
  return environments.find((environment) => environment.id === location)?.region || '';
};

/**
 * Check whether a setup is for a location. Setups for a whole region count for every location in
 * it, and setups without a location count everywhere.
 *
 * @param {FavoriteSetup} setup    The setup.
 * @param {string}        location The location ID.
 * @param {string}        region   The region ID of the location.
 *
 * @return {boolean} Whether the setup is for the location.
 */
const isSetupForLocation = (setup, location, region) => {
  if (setup.location) {
    return setup.location === location;
  }

  if (setup.region) {
    return setup.region === region;
  }

  return true;
};

/**
 * Get the label for where a setup is used.
 *
 * @param {FavoriteSetup} setup        The setup.
 * @param {Array}         environments The locations.
 *
 * @return {string} The label.
 */
const getSetupLocationLabel = (setup, environments) => {
  if (setup.location) {
    return environments.find((environment) => environment.id === setup.location)?.name || setup.location;
  }

  if (setup.region) {
    return `All of ${regions.find((region) => region.id === setup.region)?.name || setup.region}`;
  }

  return 'All locations';
};

/**
 * Add an option to a select or option group.
 *
 * @param {Element} parent The group or select to add to.
 * @param {string}  value  The option value.
 * @param {string}  label  The option label.
 */
const addOption = (parent, value, label) => {
  const option = makeElement('option', '', label);
  option.value = value;
  parent.append(option);
};

/**
 * Make the location picker for the setup editor.
 *
 * @param {FavoriteSetup} setup        The setup being edited.
 * @param {Array}         environments The locations.
 *
 * @return {HTMLSelectElement} The picker.
 */
const makeLocationSelect = (setup, environments) => {
  const select = makeElement('select', 'setup-location-input');

  addOption(select, '', 'All locations');

  for (const region of regions) {
    const group = makeElement('optgroup');
    group.label = region.name;
    addOption(group, `region:${region.id}`, `All of ${region.name}`);

    environments
      .filter((environment) => environment.region === region.id && !environment.isEvent)
      .toSorted((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((environment) => addOption(group, `location:${environment.id}`, environment.name));

    select.append(group);
  }

  const events = environments.filter((environment) => environment.isEvent);
  if (events.length) {
    const group = makeElement('optgroup');
    group.label = 'Event locations';
    events.forEach((environment) => addOption(group, `location:${environment.id}`, environment.name));
    select.append(group);
  }

  if (setup.location) {
    select.value = `location:${setup.location}`;
  } else if (setup.region) {
    select.value = `region:${setup.region}`;
  }

  // An unknown location would otherwise silently become "All locations".
  if (setup.location && select.value !== `location:${setup.location}`) {
    addOption(select, `location:${setup.location}`, setup.location);
    select.value = `location:${setup.location}`;
  }

  return select;
};

/**
 * The setup being edited in the list, if any. Edits go into the draft until they're saved.
 */
const editState = {
  id: null,
  draft: null,
};

/**
 * Make the setups sortable with drag and drop.
 *
 * @param {Element} wrapper The element with the setup rows.
 */
const makeSortable = (wrapper) => {
  let draggedElement = null;
  const placeholder = makeElement('div', 'placeholder');

  wrapper.querySelectorAll('.row.draggable').forEach((row) => {
    row.draggable = true;

    row.addEventListener('dragstart', (event) => {
      draggedElement = row;
      row.classList.add('dragging');
      placeholder.style.height = `${row.offsetHeight}px`;
      event.dataTransfer.effectAllowed = 'move';
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      placeholder.remove();
      draggedElement = null;
    });

    row.addEventListener('dragover', (event) => {
      if (!draggedElement || row === draggedElement) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      const rect = row.getBoundingClientRect();
      if (event.clientY < rect.top + rect.height / 2) {
        row.before(placeholder);
      } else {
        row.after(placeholder);
      }
    });
  });

  wrapper.addEventListener('dragover', (event) => {
    if (draggedElement) {
      event.preventDefault();
    }
  });

  wrapper.addEventListener('drop', async (event) => {
    if (!draggedElement || !placeholder.parentNode) {
      return;
    }

    event.preventDefault();
    placeholder.replaceWith(draggedElement);
    await updateSetupOrder(wrapper);
  });

  const firstDraggable = wrapper.querySelector('.row.draggable');
  if (firstDraggable) {
    addOnboardingTip({
      step: 'favorite-setups-reorder',
      anchor: firstDraggable,
      title: 'Reorder your setups',
      content: 'Drag a setup up or down to change its order.',
      dismissOnAnchorClick: false,
    });
  }
};

/**
 * Save the order of the setups in the list. When only some setups are shown, they're reordered
 * among the places they already had so the hidden ones don't move.
 *
 * @param {Element} wrapper The element with the setup rows.
 */
const updateSetupOrder = async (wrapper) => {
  const setups = removeMobileSetups(await getFavoriteSetups(false));
  if (!setups.length) {
    return;
  }

  const orderedIds = [...wrapper.querySelectorAll('.row[data-setup-id]')].map((row) => row.getAttribute('data-setup-id')).filter((id) => setups.some((setup) => setup?.id === id));

  const shownIds = new Set(orderedIds);
  const byId = new Map(setups.map((setup) => [setup?.id, setup]));
  let next = 0;
  const reordered = setups.map((setup) => {
    if (!shownIds.has(setup?.id)) {
      return setup;
    }

    const id = orderedIds[next];
    next += 1;
    return byId.get(id);
  });

  // Never save a list that lost setups along the way.
  if (reordered.some((setup) => !setup) || reordered.length !== setups.length) {
    return;
  }

  saveSetting('favorite-setups.setups', reordered);
};

/**
 * Get the favorite setups list, if it's open.
 *
 * @return {HTMLElement|null} The list container.
 */
const getListContainer = () => document.querySelector('.mh-improved-favorite-setups-blueprint-container');

/**
 * Scroll the list so a row is visible, without scrolling the page.
 *
 * @param {HTMLElement} row The row.
 */
const scrollRowIntoList = (row) => {
  const list = row.closest('.content');
  if (!list) {
    return;
  }

  const rowRect = row.getBoundingClientRect();
  const listRect = list.getBoundingClientRect();
  if (rowRect.top < listRect.top) {
    list.scrollTop -= listRect.top - rowRect.top;
  } else if (rowRect.bottom > listRect.bottom) {
    list.scrollTop += Math.min(rowRect.bottom - listRect.bottom, rowRect.top - listRect.top);
  }
};

/**
 * Briefly highlight a setup row.
 *
 * @param {string} setupId   The setup ID.
 * @param {string} className The highlight class.
 */
const flashRow = (setupId, className = 'flash') => {
  const row = getListContainer()?.querySelector(`.row[data-setup-id="${setupId}"]`);
  if (!row) {
    return;
  }

  row.classList.add(className);
  scrollRowIntoList(row);
  setTimeout(() => row.classList.remove(className), 1000);
};

/**
 * Make the line under a setup's name with its power type and location.
 *
 * @param {FavoriteSetup} setup        The setup.
 * @param {Array}         environments The locations.
 * @param {boolean}       canTravel    Whether the location should link to traveling there.
 *
 * @return {HTMLElement} The meta line.
 */
const makeSetupMeta = (setup, environments, canTravel = true) => {
  const meta = makeElement('div', 'meta');

  if (setup.power_type) {
    const powerTypeName = setup.power_type.charAt(0).toUpperCase() + setup.power_type.slice(1);
    const icon = makeElement('img', 'power-type-icon');
    icon.src = `https://www.mousehuntgame.com/images/powertypes/${setup.power_type}.png`;
    icon.alt = powerTypeName;
    icon.title = powerTypeName;
    meta.append(icon);
  }

  if (setup.is_mobile) {
    makeElement('span', 'location', 'Mobile', meta);
    return meta;
  }

  const label = getSetupLocationLabel(setup, environments);
  const environment = environments.find((e) => e.id === setup.location);
  if (canTravel && environment && setup.location !== getCurrentLocation()) {
    const link = makeElement('a', ['location', 'location-link'], label);
    link.href = '#';
    link.title = `${label}: click to travel there`;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      travelTo(setup.location);
    });
    meta.append(link);
  } else {
    makeElement('span', 'location', label, meta).title = label;
  }

  return meta;
};

/**
 * Add the bait, base, weapon, and charm images for a setup.
 *
 * @param {FavoriteSetup} setup    The setup.
 * @param {Element}       appendTo The element to add them to.
 */
const addSetupImages = async (setup, appendTo) => {
  for (const type of ['bait', 'base', 'weapon', 'trinket']) {
    await addImage(type, setup[`${type}_id`], appendTo);
  }
};

/**
 * Make the row for the current setup, with a button to save it.
 *
 * @param {Array} environments The locations.
 *
 * @return {Promise<HTMLElement>} The row.
 */
const makeCurrentSetupRow = async (environments) => {
  const setup = getCurrentSetup();
  const row = makeElement('div', ['row', 'current-setup']);
  row.setAttribute('data-setup-id', 'current');

  const info = makeElement('div', 'info');
  makeElement('div', 'name', 'Current setup', info);
  const meta = makeSetupMeta(setup, environments, false);
  info.append(meta);
  row.append(info);

  const items = makeElement('div', 'items');
  await addSetupImages(setup, items);
  row.append(items);

  let hasHighlighted = false;
  meta.prepend(
    makeMhButton({
      text: 'Save',
      size: 'small',
      className: ['action', 'save', 'lightBlue'],
      title: 'Save the current setup',
      /**
       * Save the current setup, or point out the saved one if it's already saved.
       */
      callback: async () => {
        const current = getCurrentSetup();
        const setups = await getFavoriteSetups();

        const existing = setups.find((s) => {
          return (
            s?.bait_id === current.bait_id &&
            s?.base_id === current.base_id &&
            s?.weapon_id === current.weapon_id &&
            s?.trinket_id === current.trinket_id &&
            s?.location === current.location
          );
        });

        // Clicking again within a couple of seconds saves it anyway.
        if (existing && !hasHighlighted) {
          flashRow(existing.id);
          hasHighlighted = true;
          setTimeout(() => {
            hasHighlighted = false;
          }, 2000);

          return;
        }

        current.id = Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 15);
        await saveFavoriteSetup(current, true);

        await renderSetupList();
        flashRow(current.id);
        updateFavoriteSetupName();
      },
    })
  );

  return row;
};

/**
 * Make the row for a saved setup.
 *
 * @param {FavoriteSetup} setup        The setup.
 * @param {Array}         environments The locations.
 *
 * @return {Promise<HTMLElement>} The row.
 */
const makeSetupRow = async (setup, environments) => {
  const row = makeElement('div', ['row', 'setup']);
  row.setAttribute('data-setup-id', setup.id);

  const isArmed = isArmedSetup(setup);
  row.classList.toggle('armed', isArmed);
  if (setup.is_mobile) {
    row.classList.add('mobile-setup');
  } else {
    row.classList.add('draggable');
    const handle = makeElement('div', 'drag-handle', '⋮⋮');
    handle.title = 'Drag to reorder';
    row.append(handle);
  }

  const info = makeElement('div', 'info');
  const name = makeElement('div', 'name', setup.name || 'Unnamed setup', info);
  name.title = setup.name || '';
  const meta = makeSetupMeta(setup, environments);
  info.append(meta);
  row.append(info);

  const items = makeElement('div', 'items');
  await addSetupImages(setup, items);
  row.append(items);

  const actions = makeElement('span', 'actions');
  const armButton = makeMhButton({
    text: isArmed ? 'Armed' : 'Arm',
    className: isArmed ? ['action', 'arm', 'selected'] : ['action', 'arm'],
    /**
     * Arm the setup.
     */
    callback: async () => {
      if (isArmed || armButton.classList.contains('busy')) {
        return;
      }

      debuglog('favorite-setups', `Arming setup ${setup.id}`);
      armButton.classList.add('busy');
      const armed = await armSetup(setup);
      armButton.classList.remove('busy');

      if (!armed) {
        await highlightMissingItems([row]);
        flashRow(setup.id, 'flash-error');
        return;
      }

      updateFavoriteSetupName();
      await renderSetupList();
    },
  });
  actions.append(armButton);

  // Mobile favorites are managed in the app.
  if (!setup.is_mobile) {
    const edit = makeElement('button', 'edit-button');
    edit.type = 'button';
    edit.title = 'Edit setup';
    edit.setAttribute('aria-label', `Edit ${setup.name || 'setup'}`);
    edit.addEventListener('click', () => {
      editState.id = setup.id;
      editState.draft = { ...setup };
      renderSetupList();
    });
    actions.append(edit);
  }

  meta.prepend(actions);

  return row;
};

/**
 * Stop editing without saving.
 */
const cancelEditing = () => {
  editState.id = null;
  editState.draft = null;
  renderSetupList();
};

/**
 * Save the setup being edited.
 */
const saveEditing = async () => {
  const draft = editState.draft;
  if (!draft) {
    return;
  }

  draft.name = draft.name?.trim() || 'Unnamed setup';
  debuglog('favorite-setups', `Saving setup ${draft.id}`);

  const setups = removeMobileSetups(await getFavoriteSetups(false));
  const index = setups.findIndex((s) => s?.id === draft.id);

  // Add it back if it was deleted from another tab while it was being edited.
  if (-1 === index) {
    setups.push(draft);
  } else {
    setups[index] = draft;
  }

  saveSetting('favorite-setups.setups', setups);

  editState.id = null;
  editState.draft = null;

  updateFavoriteSetupName();
  await renderSetupList();
  flashRow(draft.id);
};

/**
 * Get the IDs of the reorderable setups in the list, in order.
 *
 * @return {string[]} The setup IDs.
 */
const getListedSetupIds = () => {
  return [...(getListContainer()?.querySelectorAll('.row-wrapper .row[data-setup-id]:not(.mobile-setup)') || [])].map((row) => row.getAttribute('data-setup-id'));
};

/**
 * Move the setup being edited past its neighbor in the list. In a filtered list, the neighbor is
 * the next setup that's shown, and the two swap places.
 *
 * @param {number} direction -1 to move up, 1 to move down.
 */
const moveEditing = async (direction) => {
  const draft = editState.draft;
  if (!draft) {
    return;
  }

  const listed = getListedSetupIds();
  const neighborId = listed[listed.indexOf(draft.id) + direction];
  if (!neighborId) {
    return;
  }

  const setups = removeMobileSetups(await getFavoriteSetups(false));
  const index = setups.findIndex((s) => s?.id === draft.id);
  const neighborIndex = setups.findIndex((s) => s?.id === neighborId);
  if (-1 === index || -1 === neighborIndex) {
    return;
  }

  [setups[index], setups[neighborIndex]] = [setups[neighborIndex], setups[index]];
  saveSetting('favorite-setups.setups', setups);

  await renderSetupList();
};

/**
 * Delete the setup being edited.
 */
const deleteEditing = async () => {
  const draft = editState.draft;
  if (!draft) {
    return;
  }

  const confirmed = confirm(`Delete ${draft.name || 'this setup'}?`); // eslint-disable-line no-alert
  if (!confirmed) {
    return;
  }

  debuglog('favorite-setups', `Deleting setup ${draft.id}`);

  const setups = removeMobileSetups(await getFavoriteSetups(false));
  saveSetting(
    'favorite-setups.setups',
    setups.filter((s) => s?.id !== draft.id)
  );

  editState.id = null;
  editState.draft = null;

  updateFavoriteSetupName();
  await renderSetupList();
};

let allItems;

/**
 * Get an item's name, from the trap components or, for items that aren't owned anymore, the
 * item data.
 *
 * @param {string} itemId The item ID.
 *
 * @return {Promise<string>} The item name, or an empty string.
 */
const getItemName = async (itemId) => {
  const components = await getTrapComponents();
  const component = components.find((item) => String(item.item_id) === String(itemId));
  if (component?.name) {
    return component.name;
  }

  if (!allItems) {
    allItems = (await getData('items')) || [];
  }

  return allItems.find((item) => String(item.id) === String(itemId))?.name || '';
};

/**
 * Weapon power types, by item ID, for the weapons in the item pickers.
 */
const powerTypes = new Map();

/**
 * Get the item picker options for a type of item: the ones the user has, plus the setup's current
 * item if they don't have it anymore. Bait and charms can be left empty.
 *
 * @param {string} type      The type of item.
 * @param {string} currentId The setup's item ID.
 *
 * @return {Promise<Array>} The options.
 */
const getItemOptions = async (type, currentId) => {
  const components = await getTrapComponents();

  const options = components
    .filter((item) => item.classification === type)
    .map((item) => {
      if (item.power_type_image_name) {
        powerTypes.set(String(item.item_id), item.power_type_image_name);
      }

      const quantity = optionalItemTypes.includes(type) ? Number.parseInt(item.quantity, 10) : Number.NaN;

      return {
        name: item.name,
        value: String(item.item_id),
        type: item.type,
        image: item.thumbnail,
        classification: type,
        note: Number.isNaN(quantity) ? '' : quantity.toLocaleString(),
      };
    });

  if (currentId && !options.some((option) => option.value === String(currentId))) {
    if (!itemThumbs) {
      itemThumbs = await getData('item-thumbnails');
    }

    options.unshift({
      name: (await getItemName(currentId)) || 'Unknown item',
      value: String(currentId),
      image: itemThumbs?.find((thumb) => thumb.id == currentId)?.thumb, // eslint-disable-line eqeqeq
      disabled: true,
    });
  }

  const grouped = await groupItemOptions(options);

  return optionalItemTypes.includes(type) ? [{ name: 'None', value: 'none' }, ...grouped] : grouped;
};

/**
 * Make the editor for the setup being edited.
 *
 * @param {Array} environments The locations.
 *
 * @return {Promise<HTMLElement>} The editor row.
 */
const makeEditorRow = async (environments) => {
  const draft = editState.draft;
  const row = makeElement('div', ['row', 'editing']);
  row.setAttribute('data-setup-id', draft.id);

  const nameField = makeElement('div', 'editor-name');
  const nameInput = makeElement('input', 'setup-title-input');
  nameInput.type = 'text';
  nameInput.value = draft.name || '';
  nameInput.placeholder = 'Setup name';
  nameInput.maxLength = 60;
  nameInput.setAttribute('aria-label', 'Setup name');
  nameInput.addEventListener('input', () => {
    draft.name = nameInput.value;
  });
  nameInput.addEventListener('keydown', (event) => {
    if ('Enter' === event.key) {
      event.preventDefault();
      saveEditing();
    } else if ('Escape' === event.key) {
      event.preventDefault();
      cancelEditing();
    }
  });
  nameField.append(nameInput);

  if (getSetting('favorite-setups.use-generated-names', true)) {
    const randomTitleButton = makeElement('a', 'random-title');
    randomTitleButton.href = '#';
    randomTitleButton.title = 'Generate a name';
    randomTitleButton.addEventListener('click', async (event) => {
      event.preventDefault();
      randomTitleButton.classList.add('loading');
      const generated = await getGeneratedName(draft);
      randomTitleButton.classList.remove('loading');

      if (generated?.name) {
        nameInput.value = generated.name.slice(0, nameInput.maxLength);
        draft.name = nameInput.value;
      }
    });
    nameField.append(randomTitleButton);
  }

  row.append(nameField);

  const locationField = makeElement('label', 'editor-field');
  makeElement('span', 'editor-label', 'Location', locationField);
  const select = makeLocationSelect(draft, environments);
  select.addEventListener('change', () => {
    const [kind, id] = select.value.split(':');
    draft.location = 'location' === kind ? id : '';
    draft.region = 'region' === kind ? id : '';
  });
  locationField.append(select);
  row.append(locationField);

  const items = makeElement('div', 'editor-items');
  const labels = { weapon: 'Weapon', base: 'Base', bait: 'Bait', trinket: 'Charm' };
  for (const [type, label] of Object.entries(labels)) {
    const field = makeElement('div', ['editor-field', 'editor-item']);
    makeElement('span', 'editor-label', label, field);

    const picker = makeItemPicker({
      options: await getItemOptions(type, draft[`${type}_id`]),
      value: draft[`${type}_id`] || 'none',
      placeholder: `Search ${label.toLowerCase()}s…`,
      onChange: (value) => {
        draft[`${type}_id`] = 'none' === value ? '' : value;
        if ('weapon' === type) {
          draft.power_type = powerTypes.get(value) || draft.power_type;
        }
      },
    });
    field.append(picker);

    items.append(field);
  }

  row.append(items);

  const actions = makeElement('div', 'editor-actions');
  const move = makeElement('div', 'editor-move');
  for (const [className, title, direction] of [
    ['move-up', 'Move up', -1],
    ['move-down', 'Move down', 1],
  ]) {
    const button = makeMhButton({ text: '', className: ['action', className], title, callback: () => moveEditing(direction) });
    button.setAttribute('aria-label', title);
    move.append(button);
  }

  actions.append(
    makeMhButton({ text: 'Delete', className: ['action', 'delete', 'danger'], callback: deleteEditing }),
    move,
    makeMhButton({ text: 'Cancel', className: ['action', 'cancel-setup'], callback: cancelEditing }),
    makeMhButton({ text: 'Save', className: ['action', 'save-setup', 'lightBlue'], callback: saveEditing })
  );
  row.append(actions);

  return row;
};

/**
 * Fill the favorite setups list, keeping its scroll position.
 */
const renderSetupList = async () => {
  const container = getListContainer();
  if (!container) {
    return;
  }

  const allEnvironments = await getEnvironments();
  const location = getCurrentLocation();
  const region = getRegionForLocation(location, allEnvironments);
  const showAll = getSetting('favorite-setups.show-all-locations', false);
  const locationName = allEnvironments.find((environment) => environment.id === location)?.name || getCurrentLocationName();

  const hereButton = container.querySelector('.view-toggle .here');
  hereButton.textContent = locationName;
  hereButton.title = `Setups for ${locationName}`;
  hereButton.classList.toggle('active', !showAll);
  hereButton.setAttribute('aria-pressed', String(!showAll));
  const allButton = container.querySelector('.view-toggle .all');
  allButton.classList.toggle('active', showAll);
  allButton.setAttribute('aria-pressed', String(showAll));

  const setups = (await getFavoriteSetups()).filter((setup) => setup?.id && (!setup.is_mobile || setup.weapon_id || setup.base_id));

  // Mobile favorites don't have a location, so they're only in the full list. The setup being
  // edited stays on screen even if its location was changed.
  const shown = showAll ? setups : setups.filter((setup) => setup.id === editState.id || (!setup.is_mobile && isSetupForLocation(setup, location, region)));

  const children = [await makeCurrentSetupRow(allEnvironments)];
  const wrapper = makeElement('div', 'row-wrapper');

  for (const setup of shown) {
    if (setup.id === editState.id) {
      wrapper.append(await makeEditorRow(allEnvironments));
      continue;
    }

    const row = await makeSetupRow(setup, allEnvironments);

    // In the full list, tint the setups for where the hunter is.
    row.classList.toggle('here', showAll && !setup.is_mobile && isSetupForLocation(setup, location, region));
    wrapper.append(row);
  }

  if (!shown.length) {
    makeElement('div', 'empty', showAll ? 'No setups saved yet' : `No setups for ${locationName} yet`, wrapper);
  }

  children.push(wrapper);

  const body = container.querySelector('.content');
  const scrollTop = body.scrollTop;
  body.replaceChildren(...children);
  body.scrollTop = scrollTop;

  makeSortable(wrapper);

  const editor = wrapper.querySelector('.row.editing');
  if (editor) {
    const listed = getListedSetupIds();
    const position = listed.indexOf(editState.id);
    editor.querySelector('.move-up')?.classList.toggle('disabled', position <= 0);
    editor.querySelector('.move-down')?.classList.toggle('disabled', -1 === position || position >= listed.length - 1);

    scrollRowIntoList(editor);
    const input = editor.querySelector('.setup-title-input');
    if (input && !document.querySelector('#overlayPopup.mh-improved-favorite-setups-component-picker:not(.hidden)')) {
      input.focus({ preventScroll: true });
    }
  }

  highlightMissingItems(wrapper.querySelectorAll('.row.setup'));
};

/**
 * Create the favorite setups container.
 *
 * @return {Promise<HTMLElement>} The favorite setups container.
 */
const makeBlueprintContainer = async () => {
  getListContainer()?.remove();

  editState.id = null;
  editState.draft = null;

  const container = makeElement('div', 'mh-improved-favorite-setups-blueprint-container');

  const header = makeElement('div', 'header');
  makeElement('b', 'title', 'Favorite Setups', header);

  const toggle = makeElement('div', 'view-toggle');
  toggle.setAttribute('role', 'group');
  toggle.setAttribute('aria-label', 'Show setups for');
  for (const [className, label, showAll] of [
    ['here', getCurrentLocationName(), false],
    ['all', 'All', true],
  ]) {
    const button = makeElement('button', className, label);
    button.type = 'button';
    button.addEventListener('click', () => {
      saveSetting('favorite-setups.show-all-locations', showAll);
      renderSetupList();
    });
    toggle.append(button);
  }

  header.append(toggle);
  container.append(header);
  container.append(makeElement('div', 'content'));

  // Items can be gained in ways we don't watch for (crafting from a HUD, buying, etc.), so always
  // start with a fresh list for flagging missing items.
  clearTrapComponents();

  return container;
};

/**
 * Get the name of the current setup.
 *
 * @return {Promise<string>} The name of the current setup.
 */
const getNameOfCurrentSetup = async () => {
  const setups = await getFavoriteSetups(false);

  if (!setups.length) {
    return '';
  }

  // if we have a setup with the same IDs, then return the name of that setup.
  const currentSetup = getCurrentSetup();

  const setup = setups.find((s) => {
    return s?.bait_id === currentSetup?.bait_id && s?.base_id === currentSetup?.base_id && s?.weapon_id === currentSetup?.weapon_id && s?.trinket_id === currentSetup?.trinket_id;
  });

  if (setup && setup.name) {
    return setup.name;
  }

  return '';
};

/**
 * Update the name of the current setup in the trap UI.
 */
const updateFavoriteSetupName = async () => {
  const label = document.querySelector('.mh-improved-favorite-setups-button-label');
  if (label) {
    label.innerHTML = (await getNameOfCurrentSetup()) || '';
  }
};

/**
 * Add a button to the camp page to toggle the favorite setups.
 */
const addFavoriteSetupsButton = async () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const existingButton = document.querySelector('.mh-improved-favorite-setups-button');
  if (existingButton) {
    return;
  }

  const appendTo = document.querySelector('.trapSelectorView__trapStatSummaryContainer');
  if (!appendTo) {
    return;
  }

  const button = makeElement('a', ['mh-improved-favorite-setups-button']);
  makeElement('div', ['mh-improved-favorite-setups-button-text'], 'Favorite Setups', button);
  const label = makeElement('div', ['mh-improved-favorite-setups-button-label']);

  label.innerHTML = await getNameOfCurrentSetup();
  button.append(label);

  button.addEventListener('click', toggleFavoriteSetups);

  const auraTable = document.querySelector('.mh-improved-aura-view.campPage-trap-auraEffectiveness');
  if (auraTable) {
    // Insert after the aura table.
    auraTable.after(button);
  } else {
    const minLuckTable = document.querySelector('.mh-cre-table.campPage-trap-trapEffectiveness');
    if (minLuckTable) {
      minLuckTable.before(button);
      return;
    }

    // Append as a sibling to the existing button.
    appendTo.append(button);
  }
};

/**
 * Show or hide the favorite setups.
 */
const toggleFavoriteSetups = async () => {
  const content = await makeBlueprintContainer();
  toggleBlueprint('favorite-setups', content);
  await renderSetupList();

  const blueprint = document.querySelector('.trapSelectorView__blueprint.mh-improved-blueprint--active');
  if (blueprint && getListContainer()) {
    const reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: blueprint.getBoundingClientRect().top + window.scrollY - 10,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }
};

const starIcon = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#e8b23a"><path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clip-rule="evenodd" /></svg>'
)}`;

/**
 * Get the setups to list in the top menu dropdown: the current location's first, or only those if
 * the dropdown is set to only show them.
 *
 * @return {Promise<FavoriteSetup[]>} The setups.
 */
const getMenuSetups = async () => {
  const setups = (await getFavoriteSetups(false)).filter((setup) => setup?.id);
  const location = getCurrentLocation();
  const region = getRegionForLocation(location, await getEnvironments());
  const here = setups.filter((setup) => !setup.is_mobile && isSetupForLocation(setup, location, region));

  if (getSetting('favorite-setups.menu-location-only', false)) {
    return here;
  }

  return [...here, ...setups.filter((setup) => !here.includes(setup))];
};

/**
 * Check whether a setup is the one that's armed.
 *
 * @param {FavoriteSetup} setup The setup.
 *
 * @return {boolean} Whether it's armed.
 */
const isArmedSetup = (setup) => {
  const current = getCurrentSetup();
  return ['bait_id', 'base_id', 'weapon_id', 'trinket_id'].every((key) => (setup[key] || '') === (current[key] || ''));
};

/**
 * Fill the top menu dropdown with the favorite setups.
 *
 * @param {HTMLElement} tab     The dropdown tab.
 * @param {HTMLElement} content The dropdown content.
 */
const renderMenuDropdown = async (tab, content) => {
  const setups = await getMenuSetups();
  content.replaceChildren();

  if (!setups.length) {
    const empty = makeElement('div', 'mh-improved-favorite-setups-menu-empty');
    empty.textContent = getSetting('favorite-setups.menu-location-only', false) ? `No setups saved for ${getCurrentLocationName()}` : 'No setups saved yet';
    content.append(empty);
  }

  for (const setup of setups) {
    const row = makeElement('a', 'mh-improved-favorite-setups-menu-setup');
    row.href = '#';
    row.textContent = setup.name || 'Unnamed setup';
    row.classList.toggle('armed', isArmedSetup(setup));

    row.addEventListener('click', async (event) => {
      event.preventDefault();
      if (row.classList.contains('loading')) {
        return;
      }

      row.classList.add('loading');
      const armed = await armSetup(setup);
      row.classList.remove('loading');

      if (!armed) {
        row.classList.add('failed');
        row.title = 'You’re missing an item from this setup';
        setTimeout(() => row.classList.remove('failed'), 1500);
        return;
      }

      tab.classList.remove('expanded');
      updateFavoriteSetupName();
    });

    content.append(row);
  }

  const manage = makeElement('a', 'mh-improved-favorite-setups-menu-manage');
  manage.href = '#';
  manage.textContent = 'Manage setups';
  manage.addEventListener('click', (event) => {
    event.preventDefault();
    tab.classList.remove('expanded');
    toggleFavoriteSetups();
  });
  content.append(manage);
};

/**
 * Add a Favorite Setups dropdown to the top menu, to arm a setup from any page. It's hidden until
 * it's shown with Custom Menu.
 */
const addMenuDropdown = () => {
  if (document.querySelector('.menuItem.mh-improved-favorite-setups-menu')) {
    return;
  }

  const tab = makeElement('div', ['menuItem', 'dropdown', 'mh-improved-favorite-setups-menu']);
  tab.title = 'Favorite Setups';
  const label = makeElement('span', 'mhui-menu-label');
  label.textContent = 'Favorite Setups';
  const content = makeElement('div', 'dropdownContent');
  tab.append(label, makeElement('div', 'arrow'), content);

  tab.addEventListener('click', (event) => {
    if (content.contains(event.target)) {
      return;
    }

    const isOpening = !tab.classList.contains('expanded');
    tab.classList.toggle('expanded', isOpening);
    if (isOpening) {
      renderMenuDropdown(tab, content);
    }
  });

  document.addEventListener('click', (event) => {
    if (!tab.contains(event.target)) {
      tab.classList.remove('expanded');
    }
  });

  addHeaderMenuTab(tab, { id: 'favorite-setups', name: 'Favorite Setups', icon: starIcon, order: 10 });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'favorite-setups');

  onNavigation(addFavoriteSetupsButton, {
    page: 'camp',
  });

  let timeoutId;
  onEvent('camp_page_arm_item', () => {
    // Clear the previous timeout if it exists
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout to call the function after 500ms
    timeoutId = setTimeout(updateFavoriteSetupName, 500);
  });

  // The game only requests a single classification at a time, so rather than merging it into our
  // cache, just drop the cache and grab the full list again the next time we need it.
  onRequest('users/gettrapcomponents.php', clearTrapComponents);
  onRequest('users/changetrap.php', clearTrapComponents);

  addMenuDropdown();

  // Location-only views and travel links depend on where the hunter is.
  onTravel(null, { callback: renderSetupList });

  onEvent('mh-improved-toggle-favorite-setups', toggleFavoriteSetups);
};

/**
 * Initialize the module.
 */
export default {
  id: 'favorite-setups',
  name: 'Favorite Setups',
  type: 'hunting-traps',
  default: true,
  description: 'Save your favorite setups and arm them with a single click.',
  load: init,
  settings,
};
