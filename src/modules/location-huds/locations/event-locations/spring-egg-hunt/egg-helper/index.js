import { addStyles, createPopup, doRequest, getData, getSetting, makeElement, saveSetting, travelTo } from '@utils';
import { getItemDroppers } from '@utils/shared/loot';

import ways from './ways';

import styles from './styles.css';

const maxDroppers = 8;

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
 * Check whether an egg counts as found. Inventory mode is for Ultimate Egg Master, where an egg only
 * counts while you still have one.
 *
 * @param {Object} egg The egg.
 *
 * @return {boolean} Whether it's found.
 */
const isFound = (egg) => (state.inventoryMode ? egg.quantity > 0 : egg.is_found);

/**
 * Get the images for an egg, preferring the transparent ones from our item data.
 *
 * @param {Object} egg The egg.
 *
 * @return {Object} The `thumb` and `large` image URLs.
 */
const getEggImages = (egg) => {
  const images = state.itemImages.get(egg.type) || {};
  return {
    thumb: images.transparent || egg.thumb,
    large: images.best || images.transparent || egg.thumb,
  };
};

/**
 * Get the eggs that pass the current search and filters.
 *
 * @return {Array} The eggs.
 */
const getVisibleEggs = () => {
  const search = state.search.trim().toLowerCase();

  return state.eggs.filter((egg) => {
    if (state.category && egg.category !== state.category) {
      return false;
    }

    if (state.hideFound && isFound(egg)) {
      return false;
    }

    if (!search) {
      return true;
    }

    const locations = (state.environmentsByEgg.get(egg.type) || []).map((environment) => environment.name);
    return [egg.name, ...locations].some((text) => text.toLowerCase().includes(search));
  });
};

/**
 * Update the found count in the header.
 */
const renderProgress = () => {
  const found = state.eggs.filter((egg) => isFound(egg)).length;
  state.els.progress.textContent = `${found} of ${state.eggs.length} found`;
};

/**
 * Render the egg list.
 */
const renderList = () => {
  const { list } = state.els;
  list.replaceChildren();

  const eggs = getVisibleEggs();
  if (!eggs.length) {
    makeText('div', 'mh-egg-helper-empty', state.hideFound && !state.search ? 'You have found every egg here.' : 'No eggs match.', list);
    return;
  }

  eggs.forEach((egg) => {
    const button = makeElement('button', ['mh-egg-helper-egg', isFound(egg) ? 'found' : 'missing']);
    button.type = 'button';
    button.title = egg.name;
    button.dataset.type = egg.type;
    button.setAttribute('aria-pressed', state.selected === egg.type ? 'true' : 'false');

    const image = makeElement('img', 'mh-egg-helper-egg-image');
    image.src = getEggImages(egg).thumb;
    image.alt = '';
    image.loading = 'lazy';
    button.append(image);

    makeText('span', 'mh-egg-helper-egg-name', egg.name, button);

    button.addEventListener('click', () => selectEgg(egg.type));
    list.append(button);
  });
};

/**
 * Make a titled section for the details pane.
 *
 * @param {string}      title    The title.
 * @param {HTMLElement} appendTo The element to append to.
 *
 * @return {HTMLElement} The section.
 */
const makeSection = (title, appendTo) => {
  const section = makeElement('div', 'mh-egg-helper-section');
  makeText('h4', 'mh-egg-helper-section-title', title, section);
  appendTo.append(section);
  return section;
};

/**
 * Add the locations an egg can be found in, as buttons that travel there.
 *
 * @param {Object}      egg      The egg.
 * @param {HTMLElement} appendTo The element to append to.
 */
const addLocations = (egg, appendTo) => {
  const environments = state.environmentsByEgg.get(egg.type);
  if (!environments?.length) {
    return;
  }

  const section = makeSection('Found in', appendTo);
  const wrapper = makeElement('div', 'mh-egg-helper-locations');

  environments.forEach((environment) => {
    const button = makeText('button', 'mh-egg-helper-location', environment.name, wrapper);
    button.type = 'button';

    if (user.environment_type === environment.type) {
      button.classList.add('current');
      button.disabled = true;
      button.title = 'You are here';
    } else if (environment.can_travel) {
      button.title = `Travel to ${environment.name}`;
      button.addEventListener('click', () => {
        state.popup?.hide();
        travelTo(environment.type);
      });
    } else {
      button.disabled = true;
      button.title = environment.travel_error || 'You can’t travel here yet';
    }
  });

  section.append(wrapper);
};

/**
 * Add the mice that drop an egg, from MHCT loot data.
 *
 * @param {Object}      egg      The egg.
 * @param {HTMLElement} appendTo The element to append to.
 */
const addDroppers = async (egg, appendTo) => {
  const section = makeSection('Dropped by', appendTo);
  const loading = makeText('div', 'mh-egg-helper-muted', 'Loading…', section);

  const rows = await getItemDroppers(egg.type);
  if (state?.selected !== egg.type) {
    return;
  }

  if (!rows.length) {
    section.remove();
    return;
  }

  loading.remove();

  const list = makeElement('div', 'mh-egg-helper-droppers');
  rows.forEach((row, index) => {
    const rowEl = makeElement('div', 'mh-egg-helper-dropper');
    if (index >= maxDroppers) {
      rowEl.hidden = true;
    }

    const name = row.mouse_name.replace(/ Mouse$/, '');
    if (row.mouse_type) {
      const link = makeText('a', 'mh-egg-helper-dropper-name', name, rowEl);
      link.href = '#';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        hg.views.MouseView.show(row.mouse_type);
      });
    } else {
      makeText('span', 'mh-egg-helper-dropper-name', name, rowEl);
    }

    makeText('span', 'mh-egg-helper-dropper-location', row.location, rowEl);
    makeText('span', 'mh-egg-helper-dropper-rate', `${row.drop_likelihood}%`, rowEl);
    list.append(rowEl);
  });

  section.append(list);

  if (rows.length > maxDroppers) {
    const more = makeText('button', 'mh-egg-helper-more', `Show all ${rows.length}`, section);
    more.type = 'button';
    more.addEventListener('click', () => {
      list.querySelectorAll('[hidden]').forEach((row) => {
        row.hidden = false;
      });
      more.remove();
    });
  }

  makeText('div', 'mh-egg-helper-muted', 'Chance per catch, from MHCT data.', section);
};

/**
 * Render the details for an egg.
 *
 * @param {Object} egg The egg.
 */
const renderEggDetails = (egg) => {
  const { details } = state.els;
  details.replaceChildren();

  const back = makeText('button', 'mh-egg-helper-back', '← Overview', details);
  back.type = 'button';
  back.addEventListener('click', () => selectEgg(null));

  const header = makeElement('div', 'mh-egg-helper-detail-header');
  const image = makeElement('img', 'mh-egg-helper-detail-image');
  image.src = getEggImages(egg).large;
  image.alt = '';
  header.append(image);

  const headerText = makeElement('div', 'mh-egg-helper-detail-title');
  makeText('h3', '', egg.name, headerText);
  makeText('div', 'mh-egg-helper-muted', state.categories[egg.category]?.name || egg.category, headerText);

  const status = makeElement('div', ['mh-egg-helper-status', isFound(egg) ? 'found' : 'missing']);
  if (egg.quantity > 0) {
    const link = makeText('a', '', `You have ${egg.quantity.toLocaleString()}`, status);
    link.href = '#';
    link.addEventListener('click', (e) => {
      e.preventDefault();
      hg.views.ItemView.show(egg.type);
    });
  } else {
    status.textContent = egg.is_found ? 'Found, none in your inventory' : 'Not found yet';
  }

  headerText.append(status);
  header.append(headerText);
  details.append(header);

  makeText('p', 'mh-egg-helper-description', egg.description, details);
  if (egg.hint && egg.hint !== egg.description) {
    makeText('p', 'mh-egg-helper-hint', egg.hint, details);
  }

  const how = ways[egg.type] || ('basic' === egg.category ? state.categories.basic?.description : null);
  if (how) {
    const section = makeSection('How to find it', details);
    makeElement('p', 'mh-egg-helper-how', how, section);
  }

  addLocations(egg, details);
  addDroppers(egg, details);
};

/**
 * Render the overview: progress for each category.
 */
const renderOverview = () => {
  const { details } = state.els;
  details.replaceChildren();

  makeText('h3', 'mh-egg-helper-overview-title', `${state.year} Spring Egg Hunt`, details);
  makeText('p', 'mh-egg-helper-muted', 'Pick an egg to see where to find it.', details);

  const categories = makeElement('div', 'mh-egg-helper-categories');
  Object.entries(state.categories).forEach(([key, category]) => {
    const eggs = state.eggs.filter((egg) => egg.category === key);
    if (!eggs.length) {
      return;
    }

    const found = eggs.filter((egg) => isFound(egg)).length;

    const button = makeElement('button', ['mh-egg-helper-category', found === eggs.length ? 'complete' : '']);
    button.type = 'button';
    button.setAttribute('aria-pressed', state.category === key ? 'true' : 'false');

    const top = makeElement('div', 'mh-egg-helper-category-top');
    makeText('span', 'mh-egg-helper-category-name', category.name, top);
    makeText('span', 'mh-egg-helper-category-count', `${found} / ${eggs.length}`, top);
    button.append(top);

    const bar = makeElement('div', 'mh-egg-helper-bar');
    const fill = makeElement('div', 'mh-egg-helper-bar-fill');
    fill.style.width = `${(found / eggs.length) * 100}%`;
    bar.append(fill);
    button.append(bar);

    button.title = category.description;
    button.addEventListener('click', () => {
      state.category = state.category === key ? '' : key;
      state.els.category.value = state.category;
      renderList();
      renderOverview();
    });

    categories.append(button);
  });

  details.append(categories);
};

/**
 * Select an egg, or go back to the overview.
 *
 * @param {string|null} type The egg type.
 */
const selectEgg = (type) => {
  state.selected = type;

  state.els.list.querySelectorAll('.mh-egg-helper-egg').forEach((button) => {
    button.setAttribute('aria-pressed', button.dataset.type === type ? 'true' : 'false');
  });

  const egg = state.eggs.find((item) => item.type === type);
  if (egg) {
    renderEggDetails(egg);
  } else {
    renderOverview();
  }

  state.els.details.scrollTop = 0;
};

/**
 * Copy the egg list as tab-separated name and found columns, for spreadsheets.
 *
 * @param {HTMLElement} button The copy button.
 */
const copyList = async (button) => {
  const text = state.eggs.map((egg) => `${egg.name}\t${isFound(egg) ? 1 : 0}`).join('\n');

  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied';
  } catch {
    button.textContent = 'Copy failed';
  }

  setTimeout(() => {
    button.textContent = 'Copy list';
  }, 2000);
};

/**
 * Make a checkbox control.
 *
 * @param {string}   label    The label.
 * @param {boolean}  checked  Whether it's checked.
 * @param {Function} onChange Called with the new value.
 *
 * @return {HTMLElement} The label holding the checkbox.
 */
const makeCheckbox = (label, checked, onChange) => {
  const wrapper = makeElement('label', 'mh-egg-helper-checkbox');
  const input = makeElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  wrapper.append(input);
  makeText('span', '', label, wrapper);
  return wrapper;
};

/**
 * Build the helper's controls and panes.
 *
 * @param {HTMLElement} wrapper The popup content wrapper.
 */
const render = (wrapper) => {
  wrapper.replaceChildren();

  const header = makeElement('div', 'mh-egg-helper-header');
  const title = makeElement('div', 'mh-egg-helper-title');
  makeText('h2', '', 'Egg Hunt Helper', title);
  state.els.progress = makeText('span', 'mh-egg-helper-progress', '', title);
  header.append(title);

  const actions = makeElement('div', 'mh-egg-helper-actions');
  if (user?.quests?.QuestSpringHunt && hg.views?.CampHudSpringEggHunt) {
    const eggscavator = makeText('button', 'mh-egg-helper-action', 'Eggscavator', actions);
    eggscavator.type = 'button';
    eggscavator.addEventListener('click', () => hg.views.CampHudSpringEggHunt.showPopup());
  }

  const copy = makeText('button', 'mh-egg-helper-action', 'Copy list', actions);
  copy.type = 'button';
  copy.title = 'Copy every egg and whether you’ve found it, for a spreadsheet';
  copy.addEventListener('click', () => copyList(copy));
  header.append(actions);
  wrapper.append(header);

  const controls = makeElement('div', 'mh-egg-helper-controls');

  const search = makeElement('input', 'mh-egg-helper-search');
  search.type = 'search';
  search.placeholder = 'Search eggs or locations';
  search.addEventListener('input', () => {
    state.search = search.value;
    renderList();
  });
  controls.append(search);

  const category = makeElement('select', 'mh-egg-helper-category-select');
  makeText('option', '', 'All categories', category).value = '';
  Object.entries(state.categories).forEach(([key, { name }]) => {
    makeText('option', '', name, category).value = key;
  });
  category.addEventListener('change', () => {
    state.category = category.value;
    renderList();
    if (!state.selected) {
      renderOverview();
    }
  });
  state.els.category = category;
  controls.append(category);

  controls.append(
    makeCheckbox('Hide found', state.hideFound, (checked) => {
      state.hideFound = checked;
      saveSetting('location-huds.egg-helper-hide-found', checked);
      renderList();
    })
  );

  const inventoryMode = makeCheckbox('Only count eggs I have', state.inventoryMode, (checked) => {
    state.inventoryMode = checked;
    saveSetting('location-huds.egg-helper-inventory-mode', checked);
    renderProgress();
    renderList();
    selectEgg(state.selected);
  });
  inventoryMode.title = 'For Ultimate Egg Master, an egg only counts while you still have one.';
  controls.append(inventoryMode);

  wrapper.append(controls);

  const body = makeElement('div', 'mh-egg-helper-body');
  state.els.list = makeElement('div', 'mh-egg-helper-list');
  state.els.details = makeElement('div', 'mh-egg-helper-details');
  body.append(state.els.list, state.els.details);
  wrapper.append(body);

  renderProgress();
  renderList();
  renderOverview();
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

  const wrapper = document.querySelector('#overlayPopup.mh-egg-helper-popup .mh-egg-helper');
  if (!wrapper) {
    return;
  }

  const info = response?.spring_hunt_egg_info;
  if (!info?.eggs?.length) {
    wrapper.querySelector('.mh-egg-helper-loading').textContent = 'Couldn’t load your eggs. Please try again.';
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

  state = {
    popup,
    year: info.year,
    eggs: [...info.eggs].sort((a, b) => a.name.localeCompare(b.name)),
    categories: info.categories || {},
    environmentsByEgg,
    itemImages,
    search: '',
    category: '',
    hideFound: getSetting('location-huds.egg-helper-hide-found', false),
    inventoryMode: getSetting('location-huds.egg-helper-inventory-mode', false),
    selected: null,
    els: {},
  };

  render(wrapper);
};

export { openEggHelper };
