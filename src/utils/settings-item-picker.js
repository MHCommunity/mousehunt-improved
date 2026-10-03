import { makeElement } from './elements';

let pickerCount = 0;

/**
 * Flatten setting options into a plain list, dropping separators and unwrapping groups.
 *
 * @param {Array} options The setting options.
 *
 * @return {Array} The selectable options.
 */
const flattenOptions = (options) => {
  return options.flatMap((option) => {
    if (option.seperator) {
      return [];
    }

    if ('group' === option.value) {
      return flattenOptions(option.options || []);
    }

    return [option];
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
 * Make the icon for an option.
 *
 * @param {Object} option The option.
 *
 * @return {HTMLElement} The icon.
 */
const makeIcon = (option) => {
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
 * @param {Object}   args          The arguments.
 * @param {Array}    args.options  The setting options ({ name, value, image }).
 * @param {string}   args.value    The selected value.
 * @param {Function} args.onChange Called with the new value when an option is picked.
 *
 * @return {HTMLElement} The picker.
 */
const makeItemPicker = ({ options, value, onChange }) => {
  pickerCount++;
  const listId = `mhui-item-picker-list-${pickerCount}`;

  const items = flattenOptions(options).map((option) => ({ ...option, search: normalize(option.name) }));

  let selectedValue = value;
  let activeIndex = -1;
  let visibleItems = [];
  let listBuilt = false;

  const picker = makeElement('div', 'mhui-item-picker');

  const trigger = makeElement('button', ['mhui-item-picker-trigger', 'inputBox', 'multiSelect']);
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const popover = makeElement('div', 'mhui-item-picker-popover');
  popover.hidden = true;

  const search = makeElement('input', 'mhui-item-picker-search');
  search.type = 'search';
  search.placeholder = 'Search items…';
  search.autocomplete = 'off';
  search.setAttribute('role', 'combobox');
  search.setAttribute('aria-controls', listId);
  search.setAttribute('aria-autocomplete', 'list');

  const list = makeElement('ul', 'mhui-item-picker-list');
  list.id = listId;
  list.setAttribute('role', 'listbox');

  const empty = makeElement('div', 'mhui-item-picker-empty', 'No matching items');
  empty.hidden = true;

  popover.append(search, list, empty);
  picker.append(trigger, popover);

  /**
   * Render the trigger for the selected value.
   */
  const renderTrigger = () => {
    const selected = items.find((item) => item.value === selectedValue);
    const name = selected?.name ?? selectedValue ?? '';

    trigger.replaceChildren(makeIcon(selected), makeName(name), makeElement('span', 'mhui-item-picker-caret'));
    trigger.title = name;
  };

  /**
   * Build the option rows the first time the picker opens.
   */
  const buildList = () => {
    if (listBuilt) {
      return;
    }

    items.forEach((item, index) => {
      const row = makeElement('li', 'mhui-item-picker-option');
      row.id = `${listId}-${index}`;
      row.setAttribute('role', 'option');
      row.append(makeIcon(item), makeName(item.name));

      // Keep focus in the search box while clicking.
      row.addEventListener('mousedown', (event) => event.preventDefault());
      row.addEventListener('click', () => choose(item));

      item.row = row;
      list.append(row);
    });

    listBuilt = true;
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
    if (!active) {
      search.removeAttribute('aria-activedescendant');
      return;
    }

    active.row.classList.add('active');
    search.setAttribute('aria-activedescendant', active.row.id);

    if (scroll) {
      active.row.scrollIntoView({ block: 'nearest' });
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
    list.append(...visibleItems.map((item) => item.row));

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
    search.focus();

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
