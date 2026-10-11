import { addStyles, createPopup, doRequest, getData, getSetting, makeElement, saveSetting } from '@utils';
import { getItemDroppers } from '@utils/shared/loot';

import ways from './ways';

import styles from './styles.css';

let state = null;

/**
 * Make an element with plain text content.
 *
 * @param {string}           tag      The tag.
 * @param {string|Array}     classes  The classes.
 * @param {string}           text     The text.
 * @param {HTMLElement|null} appendTo The element to append to.
 *
 * @return {HTMLElement} The element.
 */
const makeText = (tag, classes, text, appendTo = null) => {
  const element = makeElement(tag, classes);
  element.textContent = text;
  appendTo?.append(element);
  return element;
};

/**
 * Make a link that runs a callback.
 *
 * @param {string}           classes  The classes.
 * @param {string}           text     The text.
 * @param {Function}         onClick  The click callback.
 * @param {HTMLElement|null} appendTo The element to append to.
 *
 * @return {HTMLElement} The link.
 */
const makeLink = (classes, text, onClick, appendTo = null) => {
  const link = makeText('a', classes, text, appendTo);
  link.href = '#';
  link.addEventListener('click', (e) => {
    e.preventDefault();
    onClick(e);
  });
  return link;
};

/**
 * Check whether an egg counts as found. UEM mode only counts an egg while it's in your inventory.
 *
 * @param {Object} egg The egg.
 *
 * @return {boolean} Whether it's found.
 */
const isFound = (egg) => (state.inventoryMode ? egg.quantity > 0 : egg.is_found);

/**
 * Get the image for an egg, preferring the transparent ones from our item data.
 *
 * @param {Object}  egg   The egg.
 * @param {boolean} large Whether to get the large image.
 *
 * @return {string} The image URL.
 */
const getEggImage = (egg, large = false) => {
  const images = state.itemImages.get(egg.type) || {};
  return (large && images.best) || images.transparent || egg.thumb;
};

/**
 * Show or hide the eggs in the list, for the search and the collected filter.
 */
const filterList = () => {
  const search = state.search.trim().toLowerCase();

  let hasMatch = false;
  state.els.list.querySelectorAll('.mh-egg-helper-egg').forEach((row) => {
    const egg = state.eggsByType.get(row.dataset.type);
    const locations = (state.environmentsByEgg.get(egg.type) || []).map((environment) => environment.name);
    const matches = !search || [egg.name, ...locations].some((text) => text.toLowerCase().includes(search));
    const visible = matches && !(state.hideFound && isFound(egg));

    row.classList.toggle('hidden', !visible);
    hasMatch = hasMatch || visible;
  });

  if (search) {
    state.els.noEggs.textContent = state.hideFound ? 'No uncollected eggs match your search' : 'No eggs found';
  } else {
    state.els.noEggs.textContent = 'You have collected every egg!';
  }

  state.els.noEggs.classList.toggle('hidden', hasMatch);
};

/**
 * Show the travel map zoomed in on a location.
 *
 * @param {string} environment The environment type.
 */
const showOnTravelMap = (environment) => {
  state.popup.hide();
  hg.utils.PageUtil.setPage('Travel');

  setTimeout(() => {
    // Switch tabs in case Better Travel is on another one.
    document.querySelector('.mousehuntHud-page-tabHeader.map')?.click();

    app.pages.TravelPage.zoomIn();
    app.pages.TravelPage.zoomIn();
    app.pages.TravelPage.showEnvironment(environment);
  }, 500);
};

/**
 * Make one section of the box that says how to get an egg.
 *
 * @param {string}      title    The title.
 * @param {HTMLElement} appendTo The element to append to.
 *
 * @return {HTMLElement} The list to add items to.
 */
const makeAcquireSection = (title, appendTo) => {
  const section = makeElement('div', 'mh-egg-helper-acquire-section');
  if (title) {
    makeText('div', 'mh-egg-helper-acquire-header', title, section);
  }

  const text = makeElement('div', 'mh-egg-helper-acquire-text');
  const list = makeElement('ul', 'mh-egg-helper-acquire-list');
  text.append(list);
  section.append(text);
  appendTo.append(section);

  return list;
};

/**
 * Add the mice that drop an egg, from MHCT loot data.
 *
 * @param {Object}      egg      The egg.
 * @param {HTMLElement} appendTo The element to append to.
 */
const addDroppers = async (egg, appendTo) => {
  const rows = await getItemDroppers(egg.type);
  if (!rows.length || state?.selected !== egg.type) {
    return;
  }

  const section = makeElement('div');
  const list = makeAcquireSection('Can be dropped from:', section);

  rows.forEach((row) => {
    const item = makeElement('li');
    const name = row.mouse_name.replace(/ Mouse$/, '');
    if (row.mouse_type) {
      makeLink('', name, () => hg.views.MouseView.show(row.mouse_type), item);
    } else {
      makeText('span', '', name, item);
    }

    makeText('span', 'mh-egg-helper-drop-rate', `${row.drop_likelihood}%`, item);
    list.append(item);
  });

  // Keep the dropped from list above the locations.
  const locations = appendTo.querySelector('.mh-egg-helper-locations-section');
  if (locations) {
    locations.before(section);
  } else {
    appendTo.append(section);
  }
};

/**
 * Show the details for an egg on the right page.
 *
 * @param {string} type The egg type.
 */
const showEggDetails = (type) => {
  const egg = state.eggsByType.get(type);
  if (!egg) {
    return;
  }

  state.selected = type;
  state.els.welcome.classList.add('hidden');
  state.els.back.classList.remove('hidden');

  const details = state.els.details;
  details.replaceChildren();
  details.classList.remove('hidden');

  const header = makeElement('div', 'mh-egg-helper-right-header');
  const headerText = makeElement('div', 'mh-egg-helper-right-header-text');
  makeText('h2', '', egg.name, headerText);
  header.append(headerText);
  makeText('div', 'mh-egg-helper-right-subheader', state.categories[egg.category]?.name || egg.category, header);
  details.append(header);

  const content = makeElement('div', 'mh-egg-helper-right-content');

  const description = makeElement('div', 'mh-egg-helper-right-description');
  const image = makeElement('img', 'mh-egg-helper-right-thumb');
  image.src = getEggImage(egg, true);
  image.alt = egg.name;
  description.append(image);

  const descriptionText = makeElement('div', 'mh-egg-helper-right-short-text');
  makeText('p', '', egg.description, descriptionText);
  if (egg.hint && egg.hint !== egg.description) {
    makeText('p', '', egg.hint, descriptionText);
  }

  description.append(descriptionText);
  content.append(description);

  const text = makeElement('div', 'mh-egg-helper-right-text');
  const acquire = makeElement('div', 'mh-egg-helper-acquire');

  const how = ways[egg.type] || ('basic' === egg.category ? state.categories.basic?.description : null);
  if (how) {
    makeElement('li', '', how, makeAcquireSection('', acquire));
  }

  const environments = state.environmentsByEgg.get(egg.type);
  if (environments?.length) {
    const list = makeAcquireSection('Can be found in:', acquire);
    list.parentElement.parentElement.classList.add('mh-egg-helper-locations-section');
    environments.forEach((environment) => {
      const item = makeElement('li');
      makeLink('', environment.name, () => showOnTravelMap(environment.type), item);
      list.append(item);
    });
  }

  addDroppers(egg, acquire);
  text.append(acquire);

  const collected = makeElement('div', 'mh-egg-helper-collected');
  if (egg.quantity > 0) {
    collected.append('You have ');
    makeLink('', `${egg.quantity.toLocaleString()} in your inventory`, () => hg.views.ItemView.show(egg.type), collected);
    collected.append('.');
  } else if (isFound(egg)) {
    collected.textContent = 'You have collected this egg, but have none in your inventory.';
  } else {
    collected.textContent = 'You have not collected this egg.';
  }

  text.append(collected);
  content.append(text);
  details.append(content);
};

/**
 * Go back from an egg's details to the welcome page.
 */
const showWelcome = () => {
  state.selected = null;
  state.els.details.replaceChildren();
  state.els.details.classList.add('hidden');
  state.els.welcome.classList.remove('hidden');
  state.els.back.classList.add('hidden');
};

/**
 * Make the left page header: search, the collected filter, and the Eggscavator link.
 *
 * @return {HTMLElement} The header.
 */
const makeLeftHeader = () => {
  const header = makeElement('div', 'mh-egg-helper-left-header');

  const search = makeElement('input', 'mh-egg-helper-search');
  search.type = 'search';
  search.placeholder = 'Search eggs...';
  search.value = state.search;
  search.addEventListener('input', () => {
    state.search = search.value;
    filterList();
  });
  header.append(search);

  const filter = makeLink('mh-egg-helper-filter', state.hideFound ? 'Show Collected' : 'Hide Collected', () => {
    state.hideFound = !state.hideFound;
    saveSetting('location-huds.egg-helper-hide-found', state.hideFound);
    filter.textContent = state.hideFound ? 'Show Collected' : 'Hide Collected';
    filterList();
  });
  header.append(filter);

  if (hg.views?.CampHudSpringEggHunt) {
    const tool = makeLink('mh-egg-helper-tool', '', () => hg.views.CampHudSpringEggHunt.showPopup(), header);
    tool.title = 'Eggscavator';

    const image = makeElement('img');
    image.src = 'https://i.mouse.rip/eggtool.png';
    image.alt = 'Eggscavator';
    tool.append(image);
  }

  return header;
};

/**
 * Make the egg list on the left page.
 *
 * @return {HTMLElement} The list.
 */
const makeEggList = () => {
  const list = makeElement('div', 'mh-egg-helper-eggs');

  state.eggs.forEach((egg) => {
    const row = makeElement('div', ['mh-egg-helper-egg', isFound(egg) ? 'found' : 'unfound']);
    row.dataset.type = egg.type;
    row.tabIndex = 0;

    const image = makeElement('img');
    image.src = getEggImage(egg);
    image.alt = egg.name;
    image.loading = 'lazy';
    row.append(image);

    makeText('span', 'mh-egg-helper-egg-name', egg.name, row);
    makeText('span', 'mh-egg-helper-find-egg', 'View Details →', row);

    row.addEventListener('click', () => showEggDetails(egg.type));
    row.addEventListener('keydown', (e) => {
      if ('Enter' === e.key) {
        showEggDetails(egg.type);
      }
    });

    list.append(row);
  });

  state.els.noEggs = makeText('div', ['mh-egg-helper-no-eggs', 'hidden'], 'No eggs found', list);

  return list;
};

/**
 * Make the welcome page: progress, and every egg grouped by category.
 *
 * @return {HTMLElement} The welcome page.
 */
const makeWelcome = () => {
  const welcome = makeElement('div', 'mh-egg-helper-welcome');

  const header = makeElement('div', 'mh-egg-helper-right-header');
  const headerText = makeElement('div', 'mh-egg-helper-right-header-text');
  makeText('h2', '', `${state.year} Spring Egg Hunt`, headerText);
  header.append(headerText);

  const subheader = makeElement('div', 'mh-egg-helper-right-subheader');
  const found = state.eggs.filter((egg) => isFound(egg)).length;
  makeText('span', '', `${found} / ${state.eggs.length} eggs found${state.inventoryMode ? ' (UEM mode)' : ''}`, subheader);

  header.append(subheader);
  welcome.append(header);

  const categories = makeElement('div', 'mh-egg-helper-categories');
  Object.entries(state.categories).forEach(([key, category]) => {
    if ('charge' === key) {
      return;
    }

    const eggs = (category.egg_types || []).map((type) => state.eggsByType.get(type)).filter(Boolean);
    if (!eggs.length) {
      return;
    }

    const wrapper = makeElement('div', 'mh-egg-helper-category');
    makeText('h4', 'mh-egg-helper-category-title', category.name, wrapper);
    makeText('h5', 'mh-egg-helper-category-subtitle', category.description, wrapper);

    const categoryEggs = makeElement('div', 'mh-egg-helper-category-eggs');
    eggs.forEach((egg) => {
      const link = makeLink(['mh-egg-helper-category-egg', isFound(egg) ? 'found' : 'unfound'], '', () => showEggDetails(egg.type), categoryEggs);
      link.title = egg.name;

      const image = makeElement('img');
      image.src = getEggImage(egg);
      image.alt = egg.name;
      image.loading = 'lazy';
      link.append(image);
    });

    wrapper.append(categoryEggs);
    categories.append(wrapper);
  });

  const mode = makeElement('div', 'mh-egg-helper-mode');
  makeText('p', '', 'Going for Ultimate Egg Master? UEM mode only counts an egg as found while it’s in your inventory.', mode);
  makeLink(
    '',
    `Turn ${state.inventoryMode ? 'off' : 'on'} UEM mode`,
    () => {
      state.inventoryMode = !state.inventoryMode;
      saveSetting('location-huds.egg-helper-inventory-mode', state.inventoryMode);
      render();
    },
    mode
  );
  categories.append(mode);

  welcome.append(categories);
  return welcome;
};

/**
 * Build the book.
 */
const render = () => {
  const book = state.els.book;
  book.replaceChildren();

  const left = makeElement('div', 'mh-egg-helper-left');
  left.append(makeLeftHeader());
  state.els.list = makeEggList();
  left.append(state.els.list);
  book.append(left);

  state.els.back = makeLink(['mh-egg-helper-button', 'mh-egg-helper-back', 'hidden'], '← Back', showWelcome, book);
  state.els.welcome = makeWelcome();
  state.els.details = makeElement('div', ['mh-egg-helper-details', 'hidden']);
  book.append(state.els.welcome, state.els.details);

  makeLink('mh-egg-helper-button mh-egg-helper-close', 'Close', () => state.popup.hide(), book);

  filterList();

  if (state.selected) {
    showEggDetails(state.selected);
  }
};

/**
 * Open the Egg Hunt Helper.
 */
const openEggHelper = async () => {
  addStyles(styles, 'location-hud-events-spring-egg-hunt-helper');

  const popup = createPopup({
    template: 'ajax',
    className: 'mh-egg-helper-popup',
    content: '<div class="mh-egg-helper"><div class="mh-egg-helper-loading">Loading eggs…</div></div>',
    show: false,
  });

  if (!popup) {
    return;
  }

  popup.addToken('{*prefix*}', '');
  popup.addToken('{*suffix*}', '');
  popup.show();

  const [response, items] = await Promise.all([doRequest('managers/ajax/events/spring_hunt.php', { action: 'get_eggs' }), getData('items')]);

  const book = document.querySelector('#overlayPopup.mh-egg-helper-popup .mh-egg-helper');
  if (!book) {
    return;
  }

  const info = response?.spring_hunt_egg_info;
  if (!info?.eggs?.length) {
    book.querySelector('.mh-egg-helper-loading').textContent = 'Couldn’t load your eggs. Please try again.';
    return;
  }

  const environmentsByEgg = new Map();
  [...info.environments]
    .sort((a, b) => a.display_order - b.display_order)
    .forEach((environment) => {
      environment.egg_types.forEach((type) => {
        environmentsByEgg.set(type, [...(environmentsByEgg.get(type) || []), environment]);
      });
    });

  const eggTypes = new Set(info.eggs.map((egg) => egg.type));
  const itemImages = new Map((Array.isArray(items) ? items : []).filter((item) => eggTypes.has(item.type)).map((item) => [item.type, item.images || {}]));
  const eggs = [...info.eggs].sort((a, b) => a.name.localeCompare(b.name));

  state = {
    popup,
    year: info.year,
    eggs,
    eggsByType: new Map(eggs.map((egg) => [egg.type, egg])),
    categories: info.categories || {},
    environmentsByEgg,
    itemImages,
    search: '',
    hideFound: getSetting('location-huds.egg-helper-hide-found', false),
    inventoryMode: getSetting('location-huds.egg-helper-inventory-mode', false),
    selected: null,
    els: { book },
  };

  render();
};

export { openEggHelper };
