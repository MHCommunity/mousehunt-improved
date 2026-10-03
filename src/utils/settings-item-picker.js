import { makeElement } from './elements';

let pickerCount = 0;

/**
 * Flatten setting options into a plain list, dropping separators and unwrapping groups.
 *
 * @param {Array}  options The setting options.
 * @param {string} group   The name of the group the options are in.
 *
 * @return {Array} The selectable options.
 */
const flattenOptions = (options, group = null) => {
  return options.flatMap((option) => {
    if (option.seperator) {
      return [];
    }

    if ('group' === option.value) {
      return flattenOptions(option.options || [], option.name);
    }

    return [{ ...option, group }];
  });
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

  const items = flattenOptions(options).map((option) => ({ ...option, search: normalize(option.name) }));
  const hasPreviews = !!preview || items.some((item) => item.css);
  const iconPreview = hasPreviews ? preview || (() => null) : null;

  // Group headers are only shown while the list isn't filtered.
  const listNodes = [];
  const headers = [];

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

    items.forEach((item, index) => {
      if (item.group && item.group !== items[index - 1]?.group) {
        const header = makeElement('li', 'mhui-item-picker-group', item.group);
        header.setAttribute('role', 'presentation');
        headers.push(header);
        listNodes.push(header);
      }

      const row = makeElement('li', 'mhui-item-picker-option');
      row.id = `${listId}-${index}`;
      row.setAttribute('role', 'option');
      row.append(makeIcon(item, iconPreview), makeName(item.name));

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
      listNodes.push(row);
    });

    list.append(...listNodes);

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
   * Show only the options matching the search text, best matches first.
   */
  const filter = () => {
    const query = normalize(search.value);

    visibleItems = items.filter((item) => !query || item.search.includes(query));

    if (query) {
      // Names starting with the query float to the top; otherwise keep alphabetical order.
      visibleItems.sort((a, b) => Number(!a.search.startsWith(query)) - Number(!b.search.startsWith(query)));
    }

    const visible = new Set(visibleItems);
    items.forEach((item) => {
      item.row.hidden = !visible.has(item);
    });
    headers.forEach((header) => {
      header.hidden = !!query;
    });
    list.append(...(query ? visibleItems.map((item) => item.row) : listNodes));

    empty.hidden = visibleItems.length > 0;

    visibleItems[activeIndex]?.row.classList.remove('active');
    activeIndex = -1;

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
   * Open below the field, or beside it when there isn't room below, since the field can be at the
   * bottom of a page that can't scroll any further.
   */
  const position = () => {
    const gap = 8;

    popover.classList.remove('is-beside');
    popover.style.removeProperty('top');

    if (popover.getBoundingClientRect().bottom <= window.innerHeight - gap) {
      return;
    }

    popover.classList.add('is-beside');

    const pickerTop = picker.getBoundingClientRect().top;
    const top = Math.max(gap - pickerTop, Math.min(0, window.innerHeight - gap - pickerTop - popover.offsetHeight));
    popover.style.top = `${top}px`;
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
