import { createPopup, defaultHiddenMenuItems, getSetting, groupItemOptions, make, makeElement, makeMhButton, saveSetting } from '@utils';
import { makeItemPicker } from '../../utils/settings-item-picker';

import { applyLayout, getContainers, getDefaultOrder, getDefaultSide, getGroupItems, getItemName, getLayout, getStyleInfo, isNativeItem, lockedItems, saveLayout } from './layout';
import { getItemOptions, getOptionValue, setOptionValue } from './item-options';
import { enableModuleItem, getPendingModuleItems, getUnavailableModuleItems, plainLinkIds } from './module-items';
import { getAvailableLinks, getMenus } from './menu-links';
import { getPinnableItems, getPins, makePinId, savePins } from '@/quick-items-menu/pins';

const groups = [
  { id: 'left', name: 'Left side' },
  { id: 'right', name: 'Right side' },
];

const styleOptions = [
  { id: 'icon', name: 'Icon' },
  { id: 'icon-text', name: 'Icon and text' },
  { id: 'text', name: 'Text' },
];

/**
 * Merge the items missing from a new order back in, after whatever came before them in the old one.
 *
 * Keeps the place of items that aren't on the page right now, like tabs from disabled modules.
 *
 * @param {Array} newOrder The new order.
 * @param {Array} oldOrder The old order.
 *
 * @return {Array} The merged order.
 */
const mergeOrder = (newOrder, oldOrder) => {
  const result = [...newOrder];

  oldOrder.forEach((id, index) => {
    if (result.includes(id)) {
      return;
    }

    const before = oldOrder
      .slice(0, index)
      .toReversed()
      .find((prev) => result.includes(prev));

    result.splice(before ? result.indexOf(before) + 1 : 0, 0, id);
  });

  return result;
};

/**
 * Get an inert copy of a menu item, keeping its tag and classes so the header styles still apply.
 *
 * @param {HTMLElement} el The menu item.
 *
 * @return {HTMLElement} The copy.
 */
const getItemCopy = (el) => {
  const copy = el.cloneNode(true);
  copy.querySelectorAll('.dropdownContent, .mousehuntHeaderView-menu-notification').forEach((child) => child.remove());
  copy.classList.remove('expanded', 'first', 'last');

  for (const node of [copy, ...copy.querySelectorAll('*')]) {
    for (const name of node.getAttributeNames()) {
      if ('id' === name || 'href' === name || 'title' === name || name.startsWith('on') || name.startsWith('data-mh-')) {
        node.removeAttribute(name);
      }
    }
  }

  return copy;
};

/**
 * Get the icon styles for an icon-only item whose icon comes from styles the copy won't match,
 * like the MH Improved icon's.
 *
 * @param {HTMLElement} el The menu item.
 *
 * @return {Object|null} The styles to set on the copy, or null if it doesn't need any.
 */
const getIconStyles = (el) => {
  if (el.textContent.trim()) {
    return null;
  }

  const style = getComputedStyle(el);
  if ('none' === style.backgroundImage || style.backgroundImage.includes('menuItem.png')) {
    return null;
  }

  return {
    backgroundImage: style.backgroundImage,
    backgroundPosition: style.backgroundPosition,
    backgroundRepeat: style.backgroundRepeat,
    backgroundSize: style.backgroundSize,
    width: style.width,
    paddingLeft: style.paddingLeft,
    paddingRight: style.paddingRight,
  };
};

/**
 * Make an editor item for an item from a module that's off.
 *
 * @param {Object} moduleItem The module item.
 *
 * @return {Object} The editor item.
 */
const toItem = (moduleItem) => ({ id: moduleItem.id, name: moduleItem.name, moduleItem, hasOptions: true });

/**
 * Get the menu items that can be customized right now, grouped by side.
 *
 * Items hidden by something else, like an empty Quick Items tab, are left out.
 *
 * @param {Object} layout The current layout.
 *
 * @return {Object} The items for each group.
 */
const getEditorItems = (layout) => {
  const containers = getContainers();

  // Items from modules that are off are listed on their own, even if the module left its item on the page.
  const unavailable = getUnavailableModuleItems();
  const unavailableIds = new Set(unavailable.map((item) => item.id));
  const pending = getPendingModuleItems();
  const pins = getPins();

  const items = {};
  for (const group of groups) {
    items[group.id] = getGroupItems(containers[group.id])
      .filter(({ id }) => !unavailableIds.has(id))
      .filter(({ el, id }) => layout.hidden.includes(id) || 'none' !== getComputedStyle(el).display)
      .map(({ el, id }) => {
        // A link from a module that was just turned on is in the menu, but doesn't work until the page is refreshed.
        const pendingItem = pending.find((moduleItem) => moduleItem.id === id);
        if (pendingItem) {
          return { id, group: group.id, name: pendingItem.name, moduleItem: pendingItem, style: layout.styles[id], isPending: true, hasOptions: true };
        }

        const styleInfo = getStyleInfo(el, id);
        const style = styleInfo ? layout.styles[id] || styleInfo.defaultStyle : null;
        const options = getItemOptions(id);
        const pin = pins.find((p) => p.id === id);

        return {
          el,
          id,
          group: group.id,
          name: getItemName(el, id),
          copy: getItemCopy(el),
          iconStyles: getIconStyles(el),
          isLink: el.classList.contains('mhui-custom-menu-link'),
          pin,
          style,
          options,
          hasOptions: Boolean(style || pin) || options.length > 0,
        };
      })
      .sort((a, b) => Number(lockedItems.has(a.id)) - Number(lockedItems.has(b.id)));
  }

  // Items from modules that were just turned on take their spot, even though they won't be on the page until it's refreshed.
  const pageIds = new Set([...items.left, ...items.right].map((item) => item.id));
  for (const moduleItem of pending.filter((item) => !pageIds.has(item.id) && !item.link)) {
    const group = layout.left.includes(moduleItem.id) ? 'left' : 'right';
    const order = layout[group];
    const after = order.slice(order.indexOf(moduleItem.id) + 1);
    const before = order.includes(moduleItem.id) ? items[group].find((item) => after.includes(item.id)) : null;
    const index = before ? items[group].indexOf(before) : items[group].filter((item) => !lockedItems.has(item.id)).length;

    items[group].splice(index, 0, { id: moduleItem.id, group, name: moduleItem.name, moduleItem, style: layout.styles[moduleItem.id], isPending: true, hasOptions: true });
  }

  // Links are offered with the other main menu links, and the rest with MH Improved's hidden items.
  items.unavailable = unavailable.filter((moduleItem) => !moduleItem.link).map((moduleItem) => toItem(moduleItem));
  items.unavailableLinks = unavailable.filter((moduleItem) => moduleItem.link).map((moduleItem) => toItem(moduleItem));

  return items;
};

const pinTemplateIcon = 'https://www.mousehuntgame.com/images/ui/hud/menu/inventory.png';

const styleClasses = ['mhui-menu-style-icon', 'mhui-menu-style-icon-text', 'mhui-menu-style-text'];

/**
 * Set how a chip is shown.
 *
 * @param {HTMLElement} chip  The chip.
 * @param {string}      style The style, 'icon', 'icon-text', or 'text'.
 */
const setChipStyle = (chip, style) => {
  chip.classList.remove(...styleClasses);
  chip.classList.add(`mhui-menu-style-${style}`);
};

/**
 * Get how an item is shown in the list below the menu: as text if that's how it's shown in the menu,
 * and with its name next to its icon otherwise, so it's clear what it is.
 *
 * @param {string} style The item's style in the menu.
 *
 * @return {string} The style in the list.
 */
const getListStyle = (style) => ('text' === style ? 'text' : 'icon-text');

/**
 * Make the chip for a menu item.
 *
 * @param {Object}  item     The item.
 * @param {boolean} isHidden Whether it's in the list of hidden items.
 *
 * @return {HTMLElement} The chip.
 */
const makeChip = (item, isHidden = false) => {
  const chip = item.copy.cloneNode(true);
  if (isHidden && item.style) {
    setChipStyle(chip, getListStyle(item.style));
  }

  chip.classList.add('mhui-menu-editor-item');
  chip.dataset.id = item.id;
  chip.dataset.group = item.group;
  chip.title = item.name;
  chip.setAttribute('aria-label', item.name);

  if (item.isLink) {
    chip.dataset.link = 'true';
  }

  // Taking a pin out of the menu removes it, like a link.
  if (item.pin) {
    chip.dataset.pin = 'true';
  }

  // Icon-only items get their name over them, so it's clear what they are.
  if ('icon' === item.style && !isHidden) {
    make('span', 'mhui-menu-editor-caption', '', chip).textContent = item.name;
  }

  if (item.iconStyles) {
    Object.assign(chip.style, item.iconStyles);
  }

  if (lockedItems.has(item.id)) {
    chip.classList.add('locked');
  }

  if (item.hasOptions) {
    chip.classList.add('has-options');
  }

  chip.tabIndex = 0;

  return chip;
};

/**
 * Make a chip built like a menu tab, for an item that isn't on the page.
 *
 * @param {Object} opts       The chip options.
 * @param {string} opts.id    The item id.
 * @param {string} opts.label The name to show.
 * @param {string} opts.icon  The icon url.
 * @param {Array}  opts.extra Extra classes.
 *
 * @return {HTMLElement} The chip.
 */
const makeTabChip = ({ id, label, icon = null, extra = [] }) => {
  // Built like the menu tab it would become, so it looks the same.
  const chip = makeElement('div', ['menuItem', 'mhui-custom-menu-link', 'mhui-menu-style', 'mhui-menu-style-icon-text', 'mhui-menu-editor-item', ...extra]);
  chip.dataset.id = id;
  chip.title = label;
  chip.tabIndex = 0;

  const iconEl = make('span', 'mhui-menu-icon', '', chip);
  if (icon) {
    iconEl.style.backgroundImage = `url("${icon}")`;
  }

  make('span', 'mhui-menu-label', '', chip).textContent = label;

  return chip;
};

/**
 * Make the chip for a link that can be added to the menu.
 *
 * @param {Object} link The link.
 *
 * @return {HTMLElement} The chip.
 */
const makeAvailableChip = (link) => {
  const chip = makeTabChip({ id: link.id, label: link.label, icon: link.icon, extra: ['mhui-menu-editor-available-item'] });
  chip.dataset.link = 'true';
  chip.dataset.linkData = JSON.stringify(link);

  return chip;
};

/**
 * Make the chip for an item from a module that's off, or one that shows after a refresh.
 *
 * @param {Object} item The item.
 *
 * @return {HTMLElement} The chip.
 */
const makeModuleChip = (item) => {
  const { moduleItem } = item;
  const chip = makeTabChip({
    id: item.id,
    label: moduleItem.name,
    icon: moduleItem.icon,
    extra: ['has-options', item.isPending ? 'mhui-menu-editor-pending-item' : 'mhui-menu-editor-unavailable-item'],
  });

  // One waiting for a refresh is shown the way it will be in the menu.
  const style = item.style || moduleItem.defaultStyle;
  setChipStyle(chip, item.isPending ? style : getListStyle(style));

  // Links carry their details, like the other links, so they're saved when they're added.
  if (moduleItem.link) {
    chip.dataset.link = 'true';
    chip.dataset.linkData = JSON.stringify(moduleItem.link);
  }

  if (item.isPending) {
    chip.dataset.group = item.group;
    chip.title = `${moduleItem.name}: shows after you refresh the page`;
  } else {
    chip.dataset.needsModule = 'true';
    chip.title = `${moduleItem.name}: ${moduleItem.needs}`;
  }

  return chip;
};

/**
 * Check whether a chip can be dropped in a zone.
 *
 * @param {HTMLElement} chip The chip.
 * @param {HTMLElement} zone The zone.
 *
 * @return {boolean} Whether it can be dropped there.
 */
const canDrop = (chip, zone) => {
  // Anything but the locked MH Improved icon can come out of the menu: links go back in the list, the rest are hidden.
  if ('available' === zone.dataset.zone) {
    return !chip.classList.contains('locked');
  }

  return true;
};

const moveDuration = 160;

// Refreshes the open editor, if there is one.
let refreshEditor = null;

/**
 * Refresh the open editor after the menu changes, like when a module that was just turned on adds its item.
 */
const refreshMenuEditor = () => {
  refreshEditor?.();
};

/**
 * Get where an element sits in the layout, ignoring any transform it's animating with.
 *
 * @param {HTMLElement} el The element.
 *
 * @return {Object} The `left`, `top`, `right`, `bottom`, and `width` of the element.
 */
const getLayoutRect = (el) => {
  const rect = el.getBoundingClientRect();
  const transform = getComputedStyle(el).transform;
  const matrix = transform && 'none' !== transform ? new DOMMatrixReadOnly(transform) : null;
  const dx = matrix ? matrix.e : 0;
  const dy = matrix ? matrix.f : 0;

  return { left: rect.left - dx, top: rect.top - dy, right: rect.right - dx, bottom: rect.bottom - dy, width: rect.width };
};

/**
 * Make a change that moves chips around, and slide them from where they were to where they end up.
 *
 * @param {Array}    containers The containers whose chips might move.
 * @param {Function} change     The change to make.
 */
const animateMoves = (containers, change) => {
  const chips = [...new Set(containers)].filter(Boolean).flatMap((container) => [...container.querySelectorAll('.mhui-menu-editor-item')]);
  const before = new Map(chips.map((el) => [el, el.getBoundingClientRect()]));

  change();

  for (const [el, rect] of before) {
    if (!el.isConnected) {
      continue;
    }

    el.getAnimations().forEach((animation) => animation.cancel());

    const after = el.getBoundingClientRect();
    const dx = rect.left - after.left;
    const dy = rect.top - after.top;
    if (dx || dy) {
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: moveDuration, easing: 'ease-out' });
    }
  }
};

/**
 * Move a chip to where the pointer is in a zone.
 *
 * @param {HTMLElement} chip The chip.
 * @param {HTMLElement} zone The zone.
 * @param {number}      x    The pointer x position.
 * @param {number}      y    The pointer y position.
 */
const placeChip = (chip, zone, x, y) => {
  const chips = [...zone.querySelectorAll(':scope > .mhui-menu-editor-item')].filter((el) => el !== chip);

  // Locked items stay put at the end, so nothing goes after them. Positions ignore the slide
  // animations, so a chip that's moving out of the way doesn't make the spot flicker back and forth.
  const before =
    chips.find((el) => {
      const rect = getLayoutRect(el);
      return y < rect.top || (y <= rect.bottom && x < rect.left + rect.width / 2);
    }) || zone.querySelector(':scope > .mhui-menu-editor-item.locked');

  const isInPlace = before ? before === chip.nextElementSibling : chip.parentElement === zone && !chip.nextElementSibling;
  if (isInPlace) {
    return;
  }

  animateMoves([zone, chip.parentElement], () => zone.insertBefore(chip, before || null));
};

/**
 * Open the menu editor.
 *
 * Every change is saved and applied to the menu straight away.
 */
const openMenuEditor = () => {
  const popup = createPopup({
    title: 'Custom Menu',
    content: '<div class="mhui-menu-editor-root"></div>',
    className: 'mh-improved-custom-menu-popup wide',
  });

  const root = document.querySelector('.mh-improved-custom-menu-popup .mhui-menu-editor-root');
  if (!popup || !root) {
    return;
  }

  const editor = makeElement('div', ['mhui-menu-editor', 'mousehuntHeaderView']);

  // Shown until it's dismissed.
  if (!getSetting('custom-menu.seen-tip', false)) {
    const help = make('div', 'mhui-menu-editor-help', '', editor);
    make('p', 'mhui-menu-editor-help-text', '', help).textContent =
      'Drag items to move them, or drop them below to take them out of the menu. Click an item to change its options. Changes are automatically saved.';
    makeMhButton({
      text: 'Got it',
      size: 'small',
      className: 'mhui-menu-editor-help-dismiss',
      appendTo: help,
      callback: () => {
        saveSetting('custom-menu.seen-tip', true);
        help.remove();
      },
    });
  }

  const zones = {};
  // One bar like the real menu, with the left side's items on the left and the right side's on the right.
  const menubar = make('div', ['mhui-menu-editor-section', 'mhui-menu-editor-menubar'], '', editor);
  for (const group of groups) {
    zones[group.id] = make('div', ['mhui-menu-editor-zone', 'mhui-menu-editor-bar'], '', menubar);
    zones[group.id].dataset.zone = group.id;
    zones[group.id].setAttribute('aria-label', group.name);
  }

  // Opens under the selected item.
  const optionsPanel = make('div', 'mhui-menu-editor-options', '', editor);
  optionsPanel.hidden = true;

  // The hidden items and the links that can be added share one list, with the hidden items first.
  const availableSection = make('div', 'mhui-menu-editor-section', '', editor);
  zones.available = make('div', ['mhui-menu-editor-zone', 'mhui-menu-editor-available'], '', availableSection);
  zones.available.dataset.zone = 'available';

  // The hidden items: the game's go under Default, and MH Improved's under Other, along with the items
  // from modules that are off, which can be turned on from here.
  const hiddenLists = {
    game: make('div', 'mhui-menu-editor-available-list'),
    mhui: make('div', 'mhui-menu-editor-available-list'),
  };

  /**
   * Check whether a chip is in one of the lists of hidden items.
   *
   * @param {HTMLElement} chip The chip.
   *
   * @return {boolean} Whether it is.
   */
  const isInHiddenList = (chip) => Object.values(hiddenLists).some((list) => list.contains(chip));

  /**
   * Get the list a hidden item goes in.
   *
   * @param {string} id The item id.
   *
   * @return {HTMLElement} The list.
   */
  const getHiddenList = (id) => (isNativeItem(id) ? hiddenLists.game : hiddenLists.mhui);

  let items = {};

  // The pins that were in the editor, so taking one out of the menu removes it.
  let renderedPinIds = new Set();
  let selectedId = null;

  /**
   * Check whether a chip is the selected one.
   *
   * @param {HTMLElement} el The chip.
   *
   * @return {boolean} Whether it's selected.
   */
  const isSelectedChip = (el) => el.dataset.id === selectedId;

  /**
   * Save a change to the layout and show it.
   *
   * @param {Object} layout The changed layout.
   */
  const saveAndRender = (layout) => {
    saveLayout(layout);
    applyLayout(layout);
    render();
  };

  /**
   * Show the options for the selected item in a popover under it.
   */
  const renderOptions = () => {
    optionsPanel.replaceChildren();

    const item = Object.values(items)
      .flat()
      .find((i) => i.id === selectedId && i.hasOptions);
    const chip = item ? [...editor.querySelectorAll('.mhui-menu-editor-item.has-options:not(.mhui-menu-editor-available-item)')].find(isSelectedChip) : null;

    optionsPanel.hidden = !chip;
    if (!chip) {
      return;
    }

    if (item.moduleItem) {
      renderModuleOptions(item, chip);
    } else if (item.pin) {
      renderPinOptions(item);
    } else {
      renderItemOptions(item);
    }

    // Center it under the item, keeping it inside the editor.
    const editorRect = editor.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const center = chipRect.left - editorRect.left + chipRect.width / 2;
    const left = Math.min(center - optionsPanel.offsetWidth / 2, editorRect.width - optionsPanel.offsetWidth);

    optionsPanel.style.left = `${Math.max(0, left)}px`;
    optionsPanel.style.top = `${chipRect.bottom - editorRect.top + 6}px`;
  };

  /**
   * Add a row to the options.
   *
   * @param {string} label The row label.
   *
   * @return {HTMLElement} The row.
   */
  const makeRow = (label) => {
    const row = make('div', 'mhui-menu-editor-options-row', '', optionsPanel);
    make('span', 'mhui-menu-editor-options-label', '', row).textContent = label;
    return row;
  };

  /**
   * Show what an item from a module needs, with a button to turn it on and add the item, or to
   * refresh the page once it's been turned on.
   *
   * @param {Object}      item The item.
   * @param {HTMLElement} chip The item's chip.
   */
  const renderModuleOptions = (item, chip) => {
    const { moduleItem } = item;

    if (item.isPending) {
      const row = makeRow('Shows after you refresh the page.');
      makeMhButton({ text: 'Refresh', size: 'small', appendTo: row, callback: () => window.location.reload() });
      return;
    }

    const row = makeRow(moduleItem.needs);
    makeMhButton({
      text: 'Turn on and add',
      size: 'small',
      appendTo: row,
      callback: () => {
        // Clicked in the list rather than dragged into the menu, so it goes where it would by default.
        if (zones.available.contains(chip)) {
          const zone = zones[getDefaultSide(item.id)];
          zone.insertBefore(chip, zone.querySelector(':scope > .locked'));
        }

        const needsRefresh = enableModuleItem(moduleItem);
        selectedId = needsRefresh ? item.id : null;
        commit(null, needsRefresh ? null : chip.dataset.id);
      },
    });
  };

  /**
   * Save a change to a pin and show it.
   *
   * @param {string}   id     The pin id.
   * @param {Function} change Changes the pin in place.
   */
  const changePin = (id, change) => {
    savePins(
      getPins().map((pin) => {
        if (pin.id !== id) {
          return pin;
        }

        const changed = { ...pin, items: [...pin.items] };
        change(changed);
        return changed;
      })
    );

    applyLayout();
    render();
  };

  /**
   * Show a pin's items, each in a picker that changes it, with a button that adds another picker
   * for a new item. Then the choices every item has.
   *
   * @param {Object} item The pin's menu item.
   */
  const renderPinOptions = (item) => {
    const pin = getPins().find((p) => p.id === item.id);
    if (!pin) {
      return;
    }

    const itemsRow = make('div', ['mhui-menu-editor-options-row', 'mhui-menu-editor-pin-row'], '', optionsPanel);
    make('span', 'mhui-menu-editor-options-label', '', itemsRow).textContent = 'Items';
    const itemsBox = make('div', 'mhui-menu-editor-pin-items', '', itemsRow);

    getPinnableItems().then(async (pinnable) => {
      if (!optionsPanel.contains(itemsBox)) {
        return;
      }

      /**
       * Get the grouped options for one of the pickers, leaving out what the others have.
       *
       * @param {string} current The item this picker has.
       *
       * @return {Promise<Array>} The options.
       */
      const getOptions = (current) => {
        const choices = pinnable.filter((i) => i.type === current || !pin.items.includes(i.type));
        return groupItemOptions(choices.map((i) => ({ name: i.name, value: i.type, image: i.thumbnail })));
      };

      /**
       * Add a row with a picker for an item, and a button to remove it.
       *
       * @param {number|null} index The item's index, or null for a new one.
       *
       * @return {Promise<HTMLElement>} The picker.
       */
      const addRow = async (index) => {
        const current = null === index ? '' : pin.items[index];
        const options = await getOptions(current);

        const row = make('div', 'mhui-menu-editor-pin-item', '', itemsBox);
        itemsBox.insertBefore(row, addButton);

        const picker = makeItemPicker({
          options,
          value: current,
          placeholder: 'Filter items…',
          onChange: (type) =>
            changePin(pin.id, (p) => {
              if (null === index) {
                p.items.push(type);
              } else {
                p.items[index] = type;
              }
            }),
        });
        row.append(picker);

        const remove = make('button', 'mhui-menu-editor-pin-remove', '×', row);
        remove.type = 'button';
        remove.title = 'Remove';
        remove.setAttribute('aria-label', 'Remove');
        remove.addEventListener('click', () => {
          if (null === index) {
            row.remove();
            addButton.hidden = false;
            return;
          }

          changePin(pin.id, (p) => p.items.splice(index, 1));
        });

        return picker;
      };

      // Like the settings page, adding an item adds an empty picker for it, opened and ready.
      const addButton = make('button', 'mhui-menu-editor-pin-add', '', itemsBox);
      addButton.type = 'button';
      make('span', 'mhui-menu-editor-pin-add-icon', '', addButton);
      make('span', 'mhui-menu-editor-pin-add-label', 'Add item', addButton);
      addButton.addEventListener('click', async () => {
        addButton.hidden = true;
        const picker = await addRow(null);
        picker.querySelector('.mhui-item-picker-trigger')?.click();
      });

      for (const [index] of pin.items.entries()) {
        await addRow(index);
      }

      // A new pin starts with its picker open.
      if (!pin.items.length) {
        addButton.click();
      }
    });

    renderItemOptions(item);
  };

  /**
   * Show the display style and options for an item in the menu.
   *
   * @param {Object} item The item.
   */
  const renderItemOptions = (item) => {
    const layout = getLayout();

    if (item.style) {
      const choices = make('div', 'mhui-menu-editor-style-choices', '', makeRow('Show:'));
      choices.setAttribute('role', 'group');

      for (const option of styleOptions) {
        const button = make('button', 'mhui-menu-editor-style-option', option.name, choices);
        button.type = 'button';
        button.setAttribute('aria-pressed', String(option.id === item.style));
        button.addEventListener('click', () => {
          layout.styles = { ...layout.styles, [item.id]: option.id };
          saveAndRender(layout);
        });
      }
    }

    for (const option of item.options) {
      const isOn = getOptionValue(layout, item.id, option);

      // The same switch the settings page uses.
      const toggle = make('div', 'mousehuntSettingSlider', '', makeRow(option.label));
      toggle.classList.toggle('active', isOn);
      toggle.tabIndex = 0;
      toggle.setAttribute('role', 'switch');
      toggle.setAttribute('aria-checked', String(isOn));
      toggle.setAttribute('aria-label', option.label);

      /**
       * Flip the option.
       */
      const flip = () => {
        setOptionValue(layout, item.id, option, !isOn);
        saveAndRender(layout);
      };

      toggle.addEventListener('click', flip);
      toggle.addEventListener('keydown', (event) => {
        if (['Enter', ' '].includes(event.key)) {
          event.preventDefault();
          flip();
        }
      });
    }
  };

  /**
   * Select an item to show its options, or stop editing it if it's already selected.
   *
   * @param {HTMLElement} chip The item's chip.
   */
  const select = (chip) => {
    if (!chip.classList.contains('has-options')) {
      return;
    }

    if (isSelectedChip(chip)) {
      deselect();
      return;
    }

    selectedId = chip.dataset.id;
    editor.querySelectorAll('.mhui-menu-editor-item').forEach((el) => el.classList.toggle('selected', isSelectedChip(el)));
    renderOptions();
  };

  /**
   * Add a group of links from the main menu, a row for each of its menus.
   *
   * @param {string}      name  The group name.
   * @param {Map}         chips The chips for each menu, keyed by the menu id.
   * @param {HTMLElement} other A list for a last row of other items, if the group has one.
   */
  const addLinkGroup = (name, chips, other = null) => {
    const groupEl = make('div', 'mhui-menu-editor-available-group', '', zones.available);
    make('div', 'mhui-menu-editor-available-label', '', groupEl).textContent = name;
    const rowsEl = make('div', 'mhui-menu-editor-link-rows', '', groupEl);

    for (const menu of getMenus().filter((m) => chips.get(m.id)?.length)) {
      make('div', 'mhui-menu-editor-link-row-label', '', rowsEl).textContent = menu.name;
      make('div', 'mhui-menu-editor-available-list', '', rowsEl).append(...chips.get(menu.id));
    }

    // It's always there, even when it's empty, so hidden items can be dropped into it.
    if (other) {
      make('div', 'mhui-menu-editor-link-row-label', '', rowsEl).textContent = 'Other';
      rowsEl.append(other);
    }
  };

  /**
   * Fill the editor from the menu as it is now.
   *
   * @param {string} focusId The id of the chip to focus afterwards.
   */
  const render = (focusId = null) => {
    const layout = getLayout();
    items = getEditorItems(layout);

    Object.values(hiddenLists).forEach((list) => list.replaceChildren());
    for (const group of groups) {
      zones[group.id].replaceChildren();

      for (const item of items[group.id]) {
        const isHidden = layout.hidden.includes(item.id) && !lockedItems.has(item.id);
        const chip = item.moduleItem ? makeModuleChip(item) : makeChip(item, isHidden);

        // Hidden items have nothing to change until they're back in the menu.
        if (isHidden && !item.moduleItem) {
          chip.classList.remove('has-options');
        }

        (isHidden ? getHiddenList(item.id) : zones[group.id]).append(chip);
      }
    }

    hiddenLists.mhui.append(...items.unavailable.map((item) => makeModuleChip(item)));

    // Pinned items can be added as many times as you like, so it's always in the list. Each one
    // added becomes a new pin.
    const pinTemplate = makeTabChip({ id: 'pinned-items', label: 'Pinned items', icon: pinTemplateIcon });
    pinTemplate.dataset.template = 'pin';
    pinTemplate.title = 'Drag into the menu, then pick what to pin';
    hiddenLists.mhui.append(pinTemplate);

    renderedPinIds = new Set([...items.left, ...items.right].filter((item) => item.pin).map((item) => item.id));

    // The game's own hidden items, and the empty list that's ready for them when there aren't any.
    zones.available.replaceChildren();
    const defaultGroup = make('div', 'mhui-menu-editor-available-group', '', zones.available);
    make('div', 'mhui-menu-editor-available-label', '', defaultGroup).textContent = 'Default';
    defaultGroup.append(hiddenLists.game);

    // Links from the game's main menu, with the ones MH Improved adds to it before the game's own.
    const addedIds = new Set(layout.links.map((link) => link.id));
    const chips = { mhui: new Map(), game: new Map() };

    /**
     * Add a link's chip to the row for its menu.
     *
     * @param {string}      source Whose link it is, 'mhui' or 'game'.
     * @param {string}      menu   The menu it's in.
     * @param {HTMLElement} chip   The chip.
     */
    const addChip = (source, menu, chip) => {
      chips[source].set(menu, [...(chips[source].get(menu) || []), chip]);
    };

    for (const linkGroup of getAvailableLinks()) {
      for (const link of linkGroup.links.filter((l) => !addedIds.has(l.id))) {
        addChip(link.custom && !plainLinkIds.has(link.id) ? 'mhui' : 'game', linkGroup.id, makeAvailableChip(link));
      }
    }

    for (const item of items.unavailableLinks) {
      addChip(item.moduleItem.isPlain ? 'game' : 'mhui', item.moduleItem.link.menu, makeModuleChip(item));
    }

    addLinkGroup('MH Improved', chips.mhui, hiddenLists.mhui);
    addLinkGroup('MouseHunt', chips.game);

    editor.querySelectorAll('.mhui-menu-editor-item').forEach((chip) => chip.classList.toggle('selected', isSelectedChip(chip) && chip.classList.contains('has-options')));
    renderOptions();

    if (focusId) {
      editor.querySelector(`.mhui-menu-editor-item[data-id="${CSS.escape(focusId)}"]`)?.focus();
    }
  };

  /**
   * Get the ids of the chips in a zone.
   *
   * @param {string} zoneId The zone id.
   *
   * @return {Array} The ids.
   */
  const getZoneIds = (zoneId) => {
    // The hidden items are split into lists, and share them with items from modules that are off.
    if ('hidden' === zoneId) {
      return Object.values(hiddenLists).flatMap((list) =>
        [...list.querySelectorAll('.mhui-menu-editor-item:not([data-needs-module], [data-template])')].map((chip) => chip.dataset.id)
      );
    }

    return [...zones[zoneId].querySelectorAll(':scope > .mhui-menu-editor-item')].map((chip) => chip.dataset.id);
  };

  /**
   * Check whether the selected item is from a module that's off and has been dragged into the menu,
   * waiting to be turned on.
   *
   * @return {boolean} Whether it is.
   */
  const isPlacedUnavailable = () => {
    const chip = [...editor.querySelectorAll('.mhui-menu-editor-unavailable-item')].find(isSelectedChip);

    return Boolean(chip) && !zones.available.contains(chip);
  };

  /**
   * Save the layout shown in the editor and apply it to the menu.
   *
   * @param {string} focusId  The id of the chip to focus afterwards.
   * @param {string} selectId The id of an item that was just added from the list, to show its options.
   */
  const commit = (focusId = null, selectId = null) => {
    const layout = getLayout();
    const containers = getContainers();

    // Pinned items added from the list become new pins.
    const newPinIds = new Map();
    for (const group of groups) {
      zones[group.id].querySelectorAll(':scope > [data-template]').forEach((chip) => {
        const id = makePinId();
        newPinIds.set(chip.dataset.id, id);
        chip.dataset.id = id;
      });
    }

    const shown = { left: getZoneIds('left'), right: getZoneIds('right') };
    const hiddenIds = getZoneIds('hidden');

    // Links dragged in from below carry their details with them.
    const links = new Map(layout.links.map((link) => [link.id, link]));
    const styles = { ...layout.styles };
    for (const group of groups) {
      zones[group.id].querySelectorAll(':scope > [data-link-data]').forEach((chip) => {
        const link = JSON.parse(chip.dataset.linkData);

        // New links start out with their icon and name, the way they look in the list.
        if (!links.has(link.id)) {
          styles[link.id] = 'icon-text';
        }

        links.set(link.id, link);
      });
    }

    const barIds = new Set([...shown.left, ...shown.right]);
    const removedLinks = new Set([...links.keys()].filter((id) => !barIds.has(id)));

    // Pins taken out of the menu are removed, and new ones start out empty, ready to pick what to pin.
    const removedPins = new Set([...renderedPinIds].filter((id) => !barIds.has(id) && !hiddenIds.includes(id)));
    if (removedPins.size || newPinIds.size) {
      savePins([...getPins().filter((pin) => !removedPins.has(pin.id)), ...[...newPinIds.values()].map((id) => ({ id, items: [] }))]);
    }

    const editorIds = new Set([...barIds, ...hiddenIds]);

    const newLayout = {
      hidden: [...hiddenIds, ...layout.hidden.filter((id) => !editorIds.has(id))],
      links: [...links.values()].filter((link) => !removedLinks.has(link.id)),
      styles,
      options: layout.options,
    };

    for (const group of groups) {
      const other = 'left' === group.id ? shown.right : shown.left;

      // Hidden items, and items that aren't on the page right now, keep the spot they had.
      const pageOrder = mergeOrder(
        getGroupItems(containers[group.id]).map((item) => item.id),
        layout[group.id]
      );

      newLayout[group.id] = mergeOrder(shown[group.id], pageOrder).filter((id) => !removedLinks.has(id) && !removedPins.has(id) && !other.includes(id));
    }

    saveLayout(newLayout);
    applyLayout(newLayout);

    // Show how something that was just added is shown, so it's easy to change.
    if (selectId) {
      selectedId = newPinIds.get(selectId) || selectId;
    }

    render(focusId);
  };

  /**
   * Put everything back the way it started.
   */
  const reset = () => {
    const containers = getContainers();
    const layout = { hidden: defaultHiddenMenuItems, links: [], styles: {}, options: {} };

    // Put everything back on the side it started on, in its starting order.
    const allItems = [...getGroupItems(containers.left), ...getGroupItems(containers.right)].filter((item) => !item.el.classList.contains('mhui-custom-menu-link'));
    for (const group of groups) {
      layout[group.id] = getDefaultOrder(allItems.filter((item) => getDefaultSide(item.id) === group.id));
    }

    saveLayout(layout);
    applyLayout(layout);
    render();
  };

  // Dragging.
  let drag = null;
  let isSettling = false;

  /**
   * Clear the drag styles.
   *
   * @param {HTMLElement} chip The dragged chip.
   */
  const clearDragStyles = (chip) => {
    chip.classList.remove('dragging');
    editor.classList.remove('is-dragging');
    Object.values(zones).forEach((zone) => zone.classList.remove('can-drop', 'cant-drop'));
  };

  /**
   * Put the dragged copy down, gliding it into its spot (or fading it out if it's being removed),
   * then save.
   *
   * @param {HTMLElement} ghost     The dragged copy.
   * @param {HTMLElement} chip      The chip it lands on.
   * @param {boolean}     isRemoved Whether it's being dropped back in the list of links.
   * @param {Function}    done      Called once it's down.
   */
  const settle = (ghost, chip, isRemoved, done) => {
    isSettling = true;

    if (isRemoved) {
      ghost.classList.add('removing');
    } else {
      const rect = chip.getBoundingClientRect();
      ghost.classList.add('settling');
      ghost.style.left = `${rect.left}px`;
      ghost.style.top = `${rect.top}px`;
    }

    ghost.classList.remove('lifted');

    setTimeout(() => {
      ghost.remove();
      isSettling = false;
      done();
    }, moveDuration);
  };

  /**
   * End the drag.
   *
   * @param {boolean} cancel Whether to put the chip back where it started.
   */
  const endDrag = (cancel = false) => {
    if (!drag) {
      return;
    }

    const { chip, started, target, ghost, isFromList } = drag;
    drag = null;

    if (!started) {
      // A click, so select it.
      select(chip);
      return;
    }

    if (cancel) {
      ghost.remove();
      clearDragStyles(chip);
      render();
      return;
    }

    // Dropping a link from the menu back in the list below takes it out of the menu. One that was
    // never added just goes back where it was.
    const isRemoved = 'available' === target?.dataset.zone && !zones.available.contains(chip);

    // An item from a module that's off isn't added until the module is turned on, so ask first.
    const isUnavailable = 'true' === chip.dataset.needsModule;

    settle(ghost, chip, isRemoved, () => {
      clearDragStyles(chip);
      if (isRemoved) {
        chip.remove();
      }

      if (isUnavailable) {
        selectedId = null;
        if (zones.available.contains(chip) || isRemoved) {
          render();
        } else {
          select(chip);
        }

        return;
      }

      commit(null, isFromList && !zones.available.contains(chip) ? chip.dataset.id : null);
    });
  };

  /**
   * Stop editing the selected item.
   */
  const deselect = () => {
    const wasPlaced = isPlacedUnavailable();

    selectedId = null;
    editor.querySelectorAll('.mhui-menu-editor-item.selected').forEach((el) => el.classList.remove('selected'));

    // An item from a module that's off goes back in the list if it isn't turned on.
    if (wasPlaced) {
      render();
    } else {
      renderOptions();
    }
  };

  editor.addEventListener('pointerdown', (event) => {
    const chip = event.target.closest('.mhui-menu-editor-item');

    // Put back an item from a module that's off before doing anything else.
    if (isPlacedUnavailable() && !optionsPanel.contains(event.target) && !(chip && isSelectedChip(chip))) {
      deselect();
      return;
    }

    if (!chip && selectedId && !optionsPanel.contains(event.target)) {
      deselect();
    }

    if (!chip || 0 !== event.button || isSettling) {
      return;
    }

    const rect = chip.getBoundingClientRect();
    drag = {
      chip,
      isFromList: zones.available.contains(chip),
      started: false,
      target: null,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };

    // Capture on the editor, since moving the chip would release a capture on it.
    editor.setPointerCapture(event.pointerId);
  });

  editor.addEventListener('pointermove', (event) => {
    if (!drag || drag.chip.classList.contains('locked')) {
      return;
    }

    if (!drag.started) {
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 4) {
        return;
      }

      drag.started = true;

      // The ghost stays inside the editor so the header styles still apply to it. It starts right
      // on top of the chip, then lifts up.
      const rect = drag.chip.getBoundingClientRect();
      drag.ghost = drag.chip.cloneNode(true);
      drag.ghost.classList.remove('mhui-menu-editor-item', 'selected');
      drag.ghost.classList.add('mhui-menu-editor-ghost');
      drag.ghost.removeAttribute('tabindex');
      drag.ghost.style.width = `${rect.width}px`;
      drag.ghost.style.left = `${rect.left}px`;
      drag.ghost.style.top = `${rect.top}px`;
      editor.append(drag.ghost);

      // Lift it on the next style change, so it animates up from the item.
      drag.ghost.getBoundingClientRect();
      drag.ghost.classList.add('lifted');

      drag.chip.classList.add('dragging');
      editor.classList.add('is-dragging');
      Object.values(zones).forEach((zone) => zone.classList.add(canDrop(drag.chip, zone) ? 'can-drop' : 'cant-drop'));
    }

    drag.ghost.style.left = `${event.clientX - drag.offsetX}px`;
    drag.ghost.style.top = `${event.clientY - drag.offsetY}px`;

    const zone = document.elementFromPoint(event.clientX, event.clientY)?.closest('.mhui-menu-editor-zone');
    if (!zone || !editor.contains(zone) || !canDrop(drag.chip, zone)) {
      return;
    }

    // Anywhere in the list below the menu works: links and items from modules that are off go back
    // where they came from, the rest are hidden.
    const { link, needsModule, pin, template } = drag.chip.dataset;
    const isLink = Boolean(link || needsModule || pin || template);

    drag.target = zone;
    if (zone === zones.available && !isLink) {
      // Hidden items aren't in any order, so it goes at the end of its list.
      const list = getHiddenList(drag.chip.dataset.id);
      if (drag.chip.parentElement !== list) {
        animateMoves([list, drag.chip.parentElement], () => list.append(drag.chip));
      }
    } else if ('available' !== zone.dataset.zone) {
      placeChip(drag.chip, zone, event.clientX, event.clientY);
    }
  });

  editor.addEventListener('pointerup', () => endDrag());
  editor.addEventListener('pointercancel', () => endDrag(true));
  editor.addEventListener('lostpointercapture', () => endDrag());

  editor.addEventListener('keydown', (event) => {
    if ('Escape' === event.key && drag) {
      event.stopPropagation();
      endDrag(true);
      return;
    }

    if ('Escape' === event.key && selectedId) {
      event.stopPropagation();
      deselect();
      return;
    }

    const chip = event.target.closest('.mhui-menu-editor-item');
    if (!chip || chip.classList.contains('locked')) {
      return;
    }

    const zone = chip.parentElement;
    const prev = chip.previousElementSibling;
    const next = chip.nextElementSibling;
    const isAvailable = Boolean(chip.dataset.linkData || chip.dataset.template) && zones.available.contains(chip);
    let changed = false;
    let isAdded = false;

    if ('true' === chip.dataset.needsModule) {
      if (['Enter', ' '].includes(event.key)) {
        select(chip);
        event.preventDefault();
      }
    } else if (isAvailable) {
      // Add it to the end of the right side.
      if (['Enter', ' '].includes(event.key)) {
        zones.right.insertBefore(chip, zones.right.querySelector(':scope > .locked'));
        changed = true;
        isAdded = true;
      }
    } else if ('ArrowLeft' === event.key && prev && !prev.classList.contains('locked')) {
      zone.insertBefore(chip, prev);
      changed = true;
    } else if ('ArrowRight' === event.key && next && !next.classList.contains('locked')) {
      zone.insertBefore(chip, next.nextElementSibling);
      changed = true;
    } else if (['Delete', 'Backspace'].includes(event.key)) {
      if (chip.dataset.link || chip.dataset.pin) {
        chip.remove();
      } else {
        isAdded = isInHiddenList(chip);
        const target = isAdded ? zones[chip.dataset.group] : getHiddenList(chip.dataset.id);
        target.insertBefore(chip, target.querySelector(':scope > .locked'));
      }

      changed = true;
    } else if (['Enter', ' '].includes(event.key)) {
      select(chip);
      event.preventDefault();
    }

    if (changed) {
      event.preventDefault();
      commit(chip.isConnected ? chip.dataset.id : null, isAdded ? chip.dataset.id : null);
    }
  });

  const buttons = make('div', 'mhui-menu-editor-buttons', '', editor);

  let resetTimeout = null;
  const resetButton = makeMhButton({
    text: 'Reset to default',
    size: 'small',
    className: ['lightBlue', 'mhui-menu-editor-reset'],
    appendTo: buttons,
    callback: () => {
      // Changes save straight away, so make sure a reset is meant.
      if (!resetButton.classList.contains('confirming')) {
        resetButton.classList.add('confirming');
        resetButton.querySelector('span').textContent = 'Click again to reset';
        resetTimeout = setTimeout(() => {
          resetButton.classList.remove('confirming');
          resetButton.querySelector('span').textContent = 'Reset to default';
        }, 3000);
        return;
      }

      clearTimeout(resetTimeout);
      resetButton.classList.remove('confirming');
      resetButton.querySelector('span').textContent = 'Reset to default';
      reset();
    },
  });

  makeMhButton({
    text: 'Done',
    size: 'small',
    className: 'mhui-menu-editor-done',
    appendTo: buttons,
    callback: () => popup.hide(),
  });

  root.append(editor);
  render();

  refreshEditor = () => {
    if (!editor.isConnected) {
      refreshEditor = null;
      return;
    }

    // Wait for anything in progress, so it isn't lost.
    if (!drag && !isSettling && !isPlacedUnavailable()) {
      render();
    }
  };
};

export { openMenuEditor as default, refreshMenuEditor };
