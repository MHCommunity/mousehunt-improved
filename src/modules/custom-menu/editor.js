import { createPopup, defaultHiddenMenuItems, getSetting, make, makeElement, makeMhButton, saveSetting } from '@utils';

import { applyLayout, getContainers, getDefaultOrder, getDefaultSide, getGroupItems, getItemName, getLayout, getStyleInfo, lockedItems, saveLayout } from './layout';
import { getItemOptions, getOptionValue, setOptionValue } from './item-options';
import { getAvailableLinks } from './menu-links';

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

  const items = {};
  for (const group of groups) {
    items[group.id] = getGroupItems(containers[group.id])
      .filter(({ el, id }) => layout.hidden.includes(id) || 'none' !== getComputedStyle(el).display)
      .map(({ el, id }) => {
        const styleInfo = getStyleInfo(el, id);
        const style = styleInfo ? layout.styles[id] || styleInfo.defaultStyle : null;
        const options = getItemOptions(id);

        return {
          el,
          id,
          group: group.id,
          name: getItemName(el, id),
          copy: getItemCopy(el),
          iconStyles: getIconStyles(el),
          isLink: el.classList.contains('mhui-custom-menu-link'),
          style,
          options,
          hasOptions: Boolean(style) || options.length > 0,
        };
      })
      .sort((a, b) => Number(lockedItems.has(a.id)) - Number(lockedItems.has(b.id)));
  }

  return items;
};

/**
 * Make the chip for a menu item.
 *
 * @param {Object} item The item.
 *
 * @return {HTMLElement} The chip.
 */
const makeChip = (item) => {
  const chip = item.copy.cloneNode(true);
  chip.classList.add('mhui-menu-editor-item');
  chip.dataset.id = item.id;
  chip.dataset.group = item.group;
  chip.title = item.name;
  chip.setAttribute('aria-label', item.name);

  if (item.isLink) {
    chip.dataset.link = 'true';
  }

  // Icon-only items get their name over them, so it's clear what they are.
  if ('icon' === item.style) {
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
 * Make the chip for a link that can be added to the menu.
 *
 * @param {Object} link The link.
 *
 * @return {HTMLElement} The chip.
 */
const makeAvailableChip = (link) => {
  // Built like the menu tab it would become, so it looks the same.
  const chip = makeElement('div', [
    'menuItem',
    'mhui-custom-menu-link',
    'mhui-menu-style',
    'mhui-menu-style-icon-text',
    'mhui-menu-editor-item',
    'mhui-menu-editor-available-item',
  ]);
  chip.dataset.id = link.id;
  chip.dataset.link = 'true';
  chip.dataset.linkData = JSON.stringify(link);
  chip.title = link.label;
  chip.tabIndex = 0;

  const icon = make('span', 'mhui-menu-icon', '', chip);
  if (link.icon) {
    icon.style.backgroundImage = `url(${link.icon})`;
  }

  make('span', 'mhui-menu-label', '', chip).textContent = link.label;

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
  const isLink = 'true' === chip.dataset.link;

  if ('available' === zone.dataset.zone) {
    return isLink;
  }

  if ('hidden' === zone.dataset.zone) {
    return !isLink && !chip.classList.contains('locked');
  }

  return true;
};

const moveDuration = 160;

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
      'Drag items to move them, or drop them in Hidden. Click an item to change its options. Changes are automatically saved.';
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
  for (const group of groups) {
    const section = make('div', 'mhui-menu-editor-section', '', editor);
    makeElement('div', 'mhui-menu-editor-label', group.name, section);
    zones[group.id] = make('div', ['mhui-menu-editor-zone', 'mhui-menu-editor-bar'], '', section);
    zones[group.id].dataset.zone = group.id;
  }

  // Opens under the selected item.
  const optionsPanel = make('div', 'mhui-menu-editor-options', '', editor);
  optionsPanel.hidden = true;

  const hiddenSection = make('div', 'mhui-menu-editor-section', '', editor);
  makeElement('div', 'mhui-menu-editor-label', 'Hidden', hiddenSection);
  zones.hidden = make('div', ['mhui-menu-editor-zone', 'mhui-menu-editor-hidden'], '', hiddenSection);
  zones.hidden.dataset.zone = 'hidden';

  const availableSection = make('div', 'mhui-menu-editor-section', '', editor);
  makeElement('div', 'mhui-menu-editor-label', 'Add to menu', availableSection);
  zones.available = make('div', ['mhui-menu-editor-zone', 'mhui-menu-editor-available'], '', availableSection);
  zones.available.dataset.zone = 'available';

  let items = {};
  let selectedId = null;

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
    const chip = item ? editor.querySelector(`.mhui-menu-editor-item[data-id="${CSS.escape(item.id)}"]:not(.mhui-menu-editor-available-item)`) : null;

    optionsPanel.hidden = !chip;
    if (!chip) {
      return;
    }

    const layout = getLayout();

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

    // Center it under the item, keeping it inside the editor.
    const editorRect = editor.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const center = chipRect.left - editorRect.left + chipRect.width / 2;
    const left = Math.min(center - optionsPanel.offsetWidth / 2, editorRect.width - optionsPanel.offsetWidth);

    optionsPanel.style.left = `${Math.max(0, left)}px`;
    optionsPanel.style.top = `${chipRect.bottom - editorRect.top + 6}px`;
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

    selectedId = selectedId === chip.dataset.id ? null : chip.dataset.id;
    editor.querySelectorAll('.mhui-menu-editor-item').forEach((el) => el.classList.toggle('selected', el.dataset.id === selectedId));
    renderOptions();
  };

  /**
   * Fill the editor from the menu as it is now.
   *
   * @param {string} focusId The id of the chip to focus afterwards.
   */
  const render = (focusId = null) => {
    const layout = getLayout();
    items = getEditorItems(layout);

    zones.hidden.replaceChildren();
    for (const group of groups) {
      zones[group.id].replaceChildren();

      for (const item of items[group.id]) {
        const isHidden = layout.hidden.includes(item.id) && !lockedItems.has(item.id);
        (isHidden ? zones.hidden : zones[group.id]).append(makeChip(item));
      }
    }

    const addedIds = new Set(layout.links.map((link) => link.id));
    zones.available.replaceChildren();
    for (const availableGroup of getAvailableLinks()) {
      const links = availableGroup.links.filter((link) => !addedIds.has(link.id));
      if (!links.length) {
        continue;
      }

      const groupEl = make('div', 'mhui-menu-editor-available-group', '', zones.available);
      make('div', 'mhui-menu-editor-available-label', '', groupEl).textContent = availableGroup.name;
      const list = make('div', 'mhui-menu-editor-available-list', '', groupEl);
      links.forEach((link) => list.append(makeAvailableChip(link)));
    }

    editor.querySelectorAll('.mhui-menu-editor-item').forEach((chip) => chip.classList.toggle('selected', chip.dataset.id === selectedId));
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
  const getZoneIds = (zoneId) => [...zones[zoneId].querySelectorAll(':scope > .mhui-menu-editor-item')].map((chip) => chip.dataset.id);

  /**
   * Save the layout shown in the editor and apply it to the menu.
   *
   * @param {string} focusId The id of the chip to focus afterwards.
   */
  const commit = (focusId = null) => {
    const layout = getLayout();
    const containers = getContainers();

    const shown = { left: getZoneIds('left'), right: getZoneIds('right') };
    const hiddenIds = getZoneIds('hidden');

    // Links dragged in from below carry their details with them.
    const links = new Map(layout.links.map((link) => [link.id, link]));
    for (const group of groups) {
      zones[group.id].querySelectorAll(':scope > [data-link-data]').forEach((chip) => {
        const link = JSON.parse(chip.dataset.linkData);
        links.set(link.id, link);
      });
    }

    const barIds = new Set([...shown.left, ...shown.right]);
    const removedLinks = new Set([...links.keys()].filter((id) => !barIds.has(id)));
    const editorIds = new Set([...barIds, ...hiddenIds]);

    const newLayout = {
      hidden: [...hiddenIds, ...layout.hidden.filter((id) => !editorIds.has(id))],
      links: [...links.values()].filter((link) => !removedLinks.has(link.id)),
      styles: layout.styles,
      options: layout.options,
    };

    for (const group of groups) {
      const other = 'left' === group.id ? shown.right : shown.left;

      // Hidden items, and items that aren't on the page right now, keep the spot they had.
      const pageOrder = mergeOrder(
        getGroupItems(containers[group.id]).map((item) => item.id),
        layout[group.id]
      );

      newLayout[group.id] = mergeOrder(shown[group.id], pageOrder).filter((id) => !removedLinks.has(id) && !other.includes(id));
    }

    saveLayout(newLayout);
    applyLayout(newLayout);
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

    const { chip, started, target, ghost } = drag;
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

    settle(ghost, chip, isRemoved, () => {
      clearDragStyles(chip);
      if (isRemoved) {
        chip.remove();
      }

      commit();
    });
  };

  /**
   * Stop editing the selected item.
   */
  const deselect = () => {
    selectedId = null;
    editor.querySelectorAll('.mhui-menu-editor-item.selected').forEach((el) => el.classList.remove('selected'));
    renderOptions();
  };

  editor.addEventListener('pointerdown', (event) => {
    const chip = event.target.closest('.mhui-menu-editor-item');
    if (!chip && selectedId && !optionsPanel.contains(event.target)) {
      deselect();
    }

    if (!chip || 0 !== event.button || isSettling) {
      return;
    }

    const rect = chip.getBoundingClientRect();
    drag = {
      chip,
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

    drag.target = zone;
    if ('available' !== zone.dataset.zone) {
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
    const isAvailable = Boolean(chip.dataset.linkData);
    let changed = false;

    if (isAvailable) {
      // Add it to the end of the right side.
      if (['Enter', ' '].includes(event.key)) {
        zones.right.insertBefore(chip, zones.right.querySelector(':scope > .locked'));
        changed = true;
      }
    } else if ('ArrowLeft' === event.key && prev && !prev.classList.contains('locked')) {
      zone.insertBefore(chip, prev);
      changed = true;
    } else if ('ArrowRight' === event.key && next && !next.classList.contains('locked')) {
      zone.insertBefore(chip, next.nextElementSibling);
      changed = true;
    } else if (['Delete', 'Backspace'].includes(event.key)) {
      if ('true' === chip.dataset.link) {
        chip.remove();
      } else {
        const target = 'hidden' === zone.dataset.zone ? zones[chip.dataset.group] : zones.hidden;
        target.insertBefore(chip, target.querySelector(':scope > .locked'));
      }

      changed = true;
    } else if (['Enter', ' '].includes(event.key)) {
      select(chip);
      event.preventDefault();
    }

    if (changed) {
      event.preventDefault();
      commit(chip.isConnected ? chip.dataset.id : null);
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
};

export default openMenuEditor;
