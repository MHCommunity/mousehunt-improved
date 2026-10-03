import { createPopup, make, makeElement, makeMhButton } from '@utils';

import { applyLayout, defaultHidden, getContainers, getDefaultOrder, getGroupItems, getItemName, getLayout, lockedItems, saveLayout } from './layout';

const groups = [
  { id: 'left', name: 'Left side' },
  { id: 'right', name: 'Right side' },
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
      .map(({ el, id }) => ({
        id,
        group: group.id,
        name: getItemName(el, id),
        copy: getItemCopy(el),
        iconStyles: getIconStyles(el),
      }));
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

  if (item.iconStyles) {
    Object.assign(chip.style, item.iconStyles);
  }

  if (lockedItems.has(item.id)) {
    chip.classList.add('locked');
  } else {
    chip.tabIndex = 0;
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
  if ('hidden' === zone.dataset.zone) {
    return !chip.classList.contains('locked');
  }

  return zone.dataset.zone === chip.dataset.group;
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
  const chips = [...zone.querySelectorAll('.mhui-menu-editor-item')].filter((el) => el !== chip);

  // Locked items stay put at the end, so nothing goes after them.
  const before =
    chips.find((el) => {
      const rect = el.getBoundingClientRect();
      return y < rect.top || (y <= rect.bottom && x < rect.left + rect.width / 2);
    }) || zone.querySelector('.mhui-menu-editor-item.locked');

  if (before) {
    if (before !== chip.nextElementSibling) {
      zone.insertBefore(chip, before);
    }
  } else if (chip.parentElement !== zone || chip.nextElementSibling) {
    zone.append(chip);
  }
};

/**
 * Let the chips be dragged between the zones.
 *
 * @param {HTMLElement} editor The editor.
 */
const enableDragging = (editor) => {
  let drag = null;

  /**
   * End the drag.
   *
   * @param {boolean} cancel Whether to put the chip back where it started.
   */
  const endDrag = (cancel = false) => {
    if (!drag) {
      return;
    }

    if (drag.started) {
      if (cancel) {
        drag.origin.parent.insertBefore(drag.chip, drag.origin.next);
      }

      drag.ghost.remove();
      drag.chip.classList.remove('dragging');
      editor.classList.remove('is-dragging');
      editor.querySelectorAll('.mhui-menu-editor-zone').forEach((zone) => zone.classList.remove('can-drop', 'cant-drop'));
    }

    drag = null;
  };

  editor.addEventListener('pointerdown', (event) => {
    const chip = event.target.closest('.mhui-menu-editor-item');
    if (!chip || chip.classList.contains('locked') || 0 !== event.button) {
      return;
    }

    const rect = chip.getBoundingClientRect();
    drag = {
      chip,
      started: false,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      origin: { parent: chip.parentElement, next: chip.nextElementSibling },
    };

    // Capture on the editor, since moving the chip would release a capture on it.
    editor.setPointerCapture(event.pointerId);
  });

  editor.addEventListener('pointermove', (event) => {
    if (!drag) {
      return;
    }

    if (!drag.started) {
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 4) {
        return;
      }

      drag.started = true;
      // The ghost stays inside the editor so the header styles still apply to it.
      drag.ghost = drag.chip.cloneNode(true);
      drag.ghost.classList.remove('mhui-menu-editor-item', 'dragging');
      drag.ghost.classList.add('mhui-menu-editor-ghost');
      drag.ghost.removeAttribute('tabindex');
      drag.ghost.style.width = `${drag.chip.offsetWidth}px`;
      editor.append(drag.ghost);

      drag.chip.classList.add('dragging');
      editor.classList.add('is-dragging');
      editor.querySelectorAll('.mhui-menu-editor-zone').forEach((zone) => {
        zone.classList.add(canDrop(drag.chip, zone) ? 'can-drop' : 'cant-drop');
      });
    }

    drag.ghost.style.left = `${event.clientX - drag.offsetX}px`;
    drag.ghost.style.top = `${event.clientY - drag.offsetY}px`;

    const zone = document.elementFromPoint(event.clientX, event.clientY)?.closest('.mhui-menu-editor-zone');
    if (zone && editor.contains(zone) && canDrop(drag.chip, zone)) {
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

    const chip = event.target.closest('.mhui-menu-editor-item');
    if (!chip || chip.classList.contains('locked')) {
      return;
    }

    const zone = chip.parentElement;
    const prev = chip.previousElementSibling;
    const next = chip.nextElementSibling;
    let moved = false;

    if ('ArrowLeft' === event.key && prev && !prev.classList.contains('locked')) {
      zone.insertBefore(chip, prev);
      moved = true;
    } else if ('ArrowRight' === event.key && next && !next.classList.contains('locked')) {
      zone.insertBefore(chip, chip.nextElementSibling.nextElementSibling);
      moved = true;
    } else if (['Enter', ' ', 'Delete', 'Backspace'].includes(event.key)) {
      const target =
        'hidden' === zone.dataset.zone
          ? editor.querySelector(`.mhui-menu-editor-zone[data-zone="${chip.dataset.group}"]`)
          : editor.querySelector('.mhui-menu-editor-zone[data-zone="hidden"]');

      if (target && canDrop(chip, target)) {
        target.insertBefore(chip, target.querySelector('.mhui-menu-editor-item.locked'));
        moved = true;
      }
    }

    if (moved) {
      event.preventDefault();
      chip.focus();
    }
  });
};

/**
 * Fill the zones with the chips for a layout.
 *
 * @param {HTMLElement} editor The editor.
 * @param {Object}      items  The items for each group.
 * @param {Object}      order  The order for each group.
 * @param {Array}       hidden The hidden ids.
 */
const fillZones = (editor, items, order, hidden) => {
  const hiddenZone = editor.querySelector('.mhui-menu-editor-zone[data-zone="hidden"]');
  hiddenZone.replaceChildren();

  for (const group of groups) {
    const zone = editor.querySelector(`.mhui-menu-editor-zone[data-zone="${group.id}"]`);
    zone.replaceChildren();

    // Locked items always go last.
    const rank = (item) => (lockedItems.has(item.id) ? Infinity : order[group.id].indexOf(item.id));
    const sorted = [...items[group.id]].sort((a, b) => rank(a) - rank(b));
    for (const item of sorted) {
      const isHidden = hidden.includes(item.id) && !lockedItems.has(item.id);
      (isHidden ? hiddenZone : zone).append(makeChip(item));
    }
  }
};

/**
 * Open the menu editor.
 */
const openMenuEditor = () => {
  const layout = getLayout();
  const items = getEditorItems(layout);

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
  makeElement(
    'p',
    'mhui-menu-editor-help',
    'Drag items to reorder them, or drag them to Hidden to remove them from the menu. Items stay on their side of the menu, and the MouseHunt Improved icon stays at the end.',
    editor
  );

  for (const group of groups) {
    const section = make('div', 'mhui-menu-editor-section', '', editor);
    makeElement('div', 'mhui-menu-editor-label', group.name, section);
    const zone = make('div', ['mhui-menu-editor-zone', 'mhui-menu-editor-bar'], '', section);
    zone.dataset.zone = group.id;
  }

  const hiddenSection = make('div', 'mhui-menu-editor-section', '', editor);
  makeElement('div', 'mhui-menu-editor-label', 'Hidden', hiddenSection);
  const hiddenZone = make('div', ['mhui-menu-editor-zone', 'mhui-menu-editor-hidden'], '', hiddenSection);
  hiddenZone.dataset.zone = 'hidden';

  // The current order is the saved one applied to the page.
  const currentOrder = {};
  for (const group of groups) {
    currentOrder[group.id] = items[group.id].map((item) => item.id);
  }

  fillZones(editor, items, currentOrder, layout.hidden);

  const buttons = make('div', 'mhui-menu-editor-buttons', '', editor);

  makeMhButton({
    text: 'Reset to default',
    size: 'small',
    className: ['lightBlue', 'mhui-menu-editor-reset'],
    appendTo: buttons,
    callback: () => {
      const defaultOrder = {};
      for (const group of groups) {
        defaultOrder[group.id] = getDefaultOrder(items[group.id]);
      }

      fillZones(editor, items, defaultOrder, defaultHidden);
    },
  });

  makeMhButton({
    text: 'Cancel',
    size: 'small',
    className: 'mhui-menu-editor-cancel',
    appendTo: buttons,
    callback: () => popup.hide(),
  });

  makeMhButton({
    text: 'Save',
    size: 'small',
    className: 'mhui-menu-editor-save',
    appendTo: buttons,
    callback: () => {
      const editorIds = new Set(Object.values(items).flatMap((groupItems) => groupItems.map((item) => item.id)));
      const containers = getContainers();

      const newLayout = { hidden: [] };
      for (const group of groups) {
        // Hidden items keep the spot they had, ready for when they're shown again.
        const chips = [...editor.querySelectorAll(`.mhui-menu-editor-item[data-group="${group.id}"]`)];
        const shown = chips.filter((chip) => 'hidden' !== chip.parentElement.dataset.zone).map((chip) => chip.dataset.id);
        const pageOrder = mergeOrder(
          getGroupItems(containers[group.id]).map((item) => item.id),
          layout[group.id]
        );

        newLayout[group.id] = mergeOrder(shown, pageOrder);
      }

      const hiddenIds = [...hiddenZone.querySelectorAll('.mhui-menu-editor-item')].map((chip) => chip.dataset.id);
      newLayout.hidden = [...hiddenIds, ...layout.hidden.filter((id) => !editorIds.has(id))];

      saveLayout(newLayout);
      applyLayout(newLayout);
      popup.hide();
    },
  });

  root.append(editor);
  enableDragging(editor);
};

export default openMenuEditor;
