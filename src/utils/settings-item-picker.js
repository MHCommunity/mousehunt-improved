import { makeElement } from './elements';

let pickerCount = 0;

/**
 * Flatten setting options into a list of group headers and options, dropping separators.
 *
 * Groups can be nested, and start collapsed when they have `collapsed: true`. Each node links to
 * its `parent` group, and groups without any options are left out.
 *
 * @param {Array}  options The setting options.
 * @param {Object} parent  The group the options are in.
 * @param {Array}  nodes   The list being built.
 *
 * @return {Array} The group headers and options, in order.
 */
const flattenOptions = (options, parent = null, nodes = []) => {
  const depth = parent ? parent.depth + 1 : 0;

  for (const option of options) {
    if (option.seperator) {
      continue;
    }

    if ('group' !== option.value) {
      nodes.push({ ...option, depth, parent });
      continue;
    }

    const group = {
      isGroup: true,
      name: option.name,
      depth,
      parent,
      collapsed: Boolean(option.collapsed),
      path: [...(parent?.path || []), option.name],
    };

    const start = nodes.length;
    nodes.push(group);
    flattenOptions(option.options || [], group, nodes);

    group.count = nodes.slice(start + 1).filter((node) => !node.isGroup).length;
    if (!group.count) {
      nodes.length = start;
    }
  }

  return nodes;
};

/**
 * Check whether every group a node is in is expanded.
 *
 * @param {Object} node The group header or option.
 *
 * @return {boolean} Whether the node is shown.
 */
const isExpanded = (node) => {
  for (let group = node.parent; group; group = group.parent) {
    if (group.collapsed) {
      return false;
    }
  }

  return true;
};

/**
 * Normalize text for matching so "superbrie" finds "SUPER|brie+".
 *
 * @param {string} text The text to normalize.
 *
 * @return {string} The normalized text.
 */
const normalize = (text) => `${text}`.toLowerCase().replaceAll(/[^\da-z]/g, '');

/**
 * Make the name label for an option.
 *
 * @param {string} name The name.
 *
 * @return {HTMLElement} The label.
 */
const makeName = (name) => {
  const label = makeElement('span', 'mhui-item-picker-name');
  label.textContent = name;

  return label;
};

/**
 * Make the preview for an option, either from the setting's preview callback or the option's css.
 *
 * @param {Object}   option  The option.
 * @param {string}   size    Either 'icon' or 'large'.
 * @param {Function} preview The setting's preview callback.
 *
 * @return {HTMLElement|null} The preview.
 */
const makePreview = (option, size, preview) => {
  if (!option) {
    return null;
  }

  const custom = preview?.(option, size);
  if (custom) {
    return custom;
  }

  if (!option.css) {
    return null;
  }

  const swatch = makeElement('span', 'mhui-item-picker-css-preview');
  swatch.style.background = option.css;
  // Shrink images to the swatch height so event art shows whole rather than as a cropped corner.
  swatch.style.backgroundSize = 'auto 100%';

  return swatch;
};

/**
 * Make the icon for an option.
 *
 * @param {Object}   option  The option.
 * @param {Function} preview The setting's preview callback, if it has previews.
 *
 * @return {HTMLElement} The icon.
 */
const makeIcon = (option, preview) => {
  if (preview) {
    const swatch = makeElement('span', ['mhui-item-picker-icon', 'mhui-item-picker-swatch']);
    const content = makePreview(option, 'icon', preview);
    if (content) {
      swatch.append(content);
    } else {
      swatch.classList.add('mhui-item-picker-icon-empty');
    }

    return swatch;
  }

  if (!option?.image) {
    return makeElement('span', ['mhui-item-picker-icon', 'mhui-item-picker-icon-empty']);
  }

  const icon = makeElement('img', 'mhui-item-picker-icon');
  icon.src = option.image;
  icon.alt = '';
  icon.loading = 'lazy';

  return icon;
};

/**
 * Make a searchable item picker that replaces a native select for long item lists.
 *
 * Options can have an `image` for an icon, or a `css` background to show as a swatch. A `preview`
 * callback, called with the option and either 'icon' or 'large', can return an element instead.
 * With swatches or a preview callback, the picker also shows a larger preview of the highlighted option.
 *
 * @param {Object}   args             The arguments.
 * @param {Array}    args.options     The setting options ({ name, value, image, css, disabled }).
 * @param {string}   args.value       The selected value.
 * @param {Function} args.onChange    Called with the new value when an option is picked.
 * @param {string}   args.placeholder The search placeholder.
 * @param {Function} args.preview     Makes the preview element for an option.
 *
 * @return {HTMLElement} The picker.
 */
const makeItemPicker = ({ options, value, onChange, placeholder = 'Search items…', preview = null }) => {
  pickerCount++;
  const listId = `mhui-item-picker-list-${pickerCount}`;

  const nodes = flattenOptions(options);
  const groups = nodes.filter((node) => node.isGroup);
  const items = nodes.filter((node) => !node.isGroup);
  items.forEach((item) => {
    item.search = normalize(item.name);
  });

  const hasPreviews = !!preview || items.some((item) => item.css);
  const iconPreview = hasPreviews ? preview || (() => null) : null;

  let selectedValue = value;
  let activeIndex = -1;
  let visibleItems = [];
  let listBuilt = false;

  const picker = makeElement('div', ['mhui-item-picker', hasPreviews ? 'has-previews' : null].filter(Boolean));

  const trigger = makeElement('button', ['mhui-item-picker-trigger', 'inputBox', 'multiSelect']);
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const popover = makeElement('div', 'mhui-item-picker-popover');
  popover.hidden = true;

  const search = makeElement('input', 'mhui-item-picker-search');
  search.type = 'search';
  search.placeholder = placeholder;
  search.autocomplete = 'off';
  search.setAttribute('role', 'combobox');
  search.setAttribute('aria-controls', listId);
  search.setAttribute('aria-autocomplete', 'list');

  const list = makeElement('ul', 'mhui-item-picker-list');
  list.id = listId;
  list.setAttribute('role', 'listbox');

  const empty = makeElement('div', 'mhui-item-picker-empty', 'No matching items');
  empty.hidden = true;

  const previewPane = makeElement('div', 'mhui-item-picker-preview');
  previewPane.setAttribute('aria-hidden', 'true');

  popover.append(search, ...(hasPreviews ? [previewPane] : []), list, empty);
  picker.append(trigger, popover);

  /**
   * Render the trigger for the selected value.
   */
  const renderTrigger = () => {
    const selected = items.find((item) => item.value === selectedValue);
    const name = selected?.name ?? selectedValue ?? '';

    trigger.replaceChildren(makeIcon(selected, iconPreview), makeName(name), makeElement('span', 'mhui-item-picker-caret'));
    trigger.title = name;
    picker.classList.toggle('is-empty', !selectedValue || 'none' === selectedValue);
  };

  /**
   * Build the option rows the first time the picker opens.
   */
  const buildList = () => {
    if (listBuilt) {
      return;
    }

    for (const group of groups) {
      const header = makeElement('li', 'mhui-item-picker-group');
      header.setAttribute('role', 'presentation');
      header.style.setProperty('--mhui-item-picker-depth', group.depth);
      makeElement('span', 'mhui-item-picker-group-toggle', '', header);
      makeElement('span', 'mhui-item-picker-group-name', group.name, header);
      makeElement('span', 'mhui-item-picker-group-count', `${group.count}`, header);

      header.addEventListener('mousedown', (event) => event.preventDefault());
      header.addEventListener('click', () => toggleGroup(group));

      group.row = header;
    }

    items.forEach((item, index) => {
      const row = makeElement('li', 'mhui-item-picker-option');
      row.id = `${listId}-${index}`;
      row.setAttribute('role', 'option');
      row.style.setProperty('--mhui-item-picker-depth', item.depth);
      row.append(makeIcon(item, iconPreview), makeName(item.name));

      // Shown while searching, when the group headers are hidden.
      if (item.parent) {
        makeElement('span', 'mhui-item-picker-path', item.parent.path.join(' › '), row);
      }

      if (item.disabled) {
        row.classList.add('disabled');
        row.setAttribute('aria-disabled', 'true');
      }

      // Keep focus in the search box while clicking.
      row.addEventListener('mousedown', (event) => event.preventDefault());
      row.addEventListener('click', () => choose(item));

      if (hasPreviews) {
        row.addEventListener('mouseenter', () => setActive(visibleItems.indexOf(item), false));
      }

      item.row = row;
    });

    list.append(...nodes.map((node) => node.row));

    listBuilt = true;
  };

  /**
   * Show the larger preview for an option.
   *
   * @param {Object} item The option.
   */
  const showPreview = (item) => {
    if (!hasPreviews || previewPane.dataset.value === item?.value) {
      return;
    }

    const content = makePreview(item, 'large', preview);
    previewPane.dataset.value = item?.value ?? '';
    previewPane.replaceChildren(...(content ? [content] : []));
    previewPane.classList.toggle('is-empty', !content);
  };

  /**
   * Highlight an option by its index in the visible list.
   *
   * @param {number}  index  The index.
   * @param {boolean} scroll Whether to scroll it into view.
   */
  const setActive = (index, scroll = true) => {
    visibleItems[activeIndex]?.row.classList.remove('active');

    activeIndex = Math.max(-1, Math.min(index, visibleItems.length - 1));

    const active = visibleItems[activeIndex];
    showPreview(active ?? items.find((item) => item.value === selectedValue));

    if (!active) {
      search.removeAttribute('aria-activedescendant');
      return;
    }

    active.row.classList.add('active');
    search.setAttribute('aria-activedescendant', active.row.id);

    if (scroll) {
      // Scroll just the list, as scrolling the row into view would also move the page.
      const rowTop = active.row.offsetTop - list.offsetTop;
      const rowBottom = rowTop + active.row.offsetHeight;
      if (rowTop < list.scrollTop) {
        list.scrollTop = rowTop;
      } else if (rowBottom > list.scrollTop + list.clientHeight) {
        list.scrollTop = rowBottom - list.clientHeight;
      }
    }
  };

  /**
   * Show the options matching the search text, best matches first, or the expanded groups when
   * there's no search.
   */
  const render = () => {
    const query = normalize(search.value);

    if (query) {
      // Names starting with the query float to the top; otherwise keep alphabetical order.
      visibleItems = items.filter((item) => item.search.includes(query));
      visibleItems.sort((a, b) => Number(!a.search.startsWith(query)) - Number(!b.search.startsWith(query)));
    } else {
      visibleItems = items.filter((item) => isExpanded(item));
    }

    const visible = new Set(visibleItems);
    items.forEach((item) => {
      item.row.hidden = !visible.has(item);
    });
    groups.forEach((group) => {
      group.row.hidden = !!query || !isExpanded(group);
      group.row.classList.toggle('collapsed', group.collapsed);
    });
    list.classList.toggle('is-filtered', !!query);
    list.append(...(query ? visibleItems : nodes).map((node) => node.row));

    // Collapsed groups aren't an empty search.
    empty.hidden = visibleItems.length > 0 || (!query && groups.length > 0);
  };

  /**
   * Expand or collapse a group, keeping the highlighted option if it's still shown.
   *
   * @param {Object} group The group.
   */
  const toggleGroup = (group) => {
    const active = visibleItems[activeIndex];
    active?.row.classList.remove('active');
    activeIndex = -1;

    group.collapsed = !group.collapsed;
    render();

    setActive(visibleItems.indexOf(active), false);
  };

  /**
   * Filter the list for the search text and highlight the best option.
   */
  const filter = () => {
    const query = normalize(search.value);

    visibleItems[activeIndex]?.row.classList.remove('active');
    activeIndex = -1;

    render();

    const selectedIndex = query ? 0 : visibleItems.findIndex((item) => item.value === selectedValue);
    setActive(selectedIndex, true);
  };

  /**
   * Close the picker if a click lands outside it.
   *
   * @param {Event} event The event.
   */
  const onOutsideClick = (event) => {
    if (!picker.contains(event.target)) {
      close();
    }
  };

  /**
   * Open below the field, or above it when there's more room there, since the field can be at the
   * bottom of a page that can't scroll any further. The list grows to fill the room it has.
   */
  const position = () => {
    const gap = 8;
    const maxListHeight = hasPreviews ? 480 : 420;
    const minListHeight = 120;

    popover.classList.remove('is-above');
    list.style.removeProperty('max-height');

    const rect = trigger.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - gap;
    const above = rect.top - gap;
    const chrome = popover.offsetHeight - list.offsetHeight;

    const fitsBelow = below >= chrome + maxListHeight;
    const isAbove = !fitsBelow && above > below;
    const room = (isAbove ? above : below) - chrome;

    popover.classList.toggle('is-above', isAbove);
    list.style.maxHeight = `${Math.max(minListHeight, Math.min(maxListHeight, room))}px`;
  };

  /**
   * Open the picker.
   */
  const open = () => {
    buildList();

    items.forEach((item) => {
      const isSelected = item.value === selectedValue;
      item.row.classList.toggle('selected', isSelected);
      item.row.setAttribute('aria-selected', isSelected ? 'true' : 'false');

      // Open the groups the selected option is in.
      if (isSelected) {
        for (let group = item.parent; group; group = group.parent) {
          group.collapsed = false;
        }
      }
    });

    popover.hidden = false;
    picker.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');

    search.value = '';
    filter();
    position();
    search.focus({ preventScroll: true });

    document.addEventListener('mousedown', onOutsideClick);
  };

  /**
   * Close the picker.
   *
   * @param {boolean} refocus Whether to return focus to the trigger.
   */
  const close = (refocus = false) => {
    popover.hidden = true;
    picker.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');

    document.removeEventListener('mousedown', onOutsideClick);

    if (refocus) {
      trigger.focus();
    }
  };

  /**
   * Pick an option.
   *
   * @param {Object} item The option.
   */
  const choose = (item) => {
    if (item.disabled) {
      return;
    }

    close(true);

    if (item.value === selectedValue) {
      return;
    }

    selectedValue = item.value;
    renderTrigger();
    onChange(item.value);
  };

  trigger.addEventListener('click', () => (popover.hidden ? open() : close()));
  trigger.addEventListener('keydown', (event) => {
    if ('ArrowDown' === event.key || 'ArrowUp' === event.key) {
      event.preventDefault();
      open();
    }
  });

  search.addEventListener('input', filter);
  search.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActive(activeIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActive(Math.max(0, activeIndex - 1));
        break;
      case 'PageDown':
        event.preventDefault();
        setActive(activeIndex + 10);
        break;
      case 'PageUp':
        event.preventDefault();
        setActive(Math.max(0, activeIndex - 10));
        break;
      case 'Enter':
        event.preventDefault();
        if (visibleItems[activeIndex]) {
          choose(visibleItems[activeIndex]);
        }
        break;
      case 'Escape':
        // Don't let the escape close any surrounding popup.
        event.preventDefault();
        event.stopPropagation();
        close(true);
        break;
      case 'Tab':
        close();
        break;
    }
  });

  renderTrigger();

  return picker;
};

export { makeItemPicker };
