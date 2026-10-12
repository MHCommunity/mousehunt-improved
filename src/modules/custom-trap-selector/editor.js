import { createPopup, getSetting, make, makeMhButton } from '@utils';

import { getOverallTrapEffectiveness, setOverallTrapEffectiveness, updateTrapEffectivenessText } from '@/catch-rate-estimate/trap-effectiveness';
import { getAuraIconsOnly, getAuraLayout, layoutOptions as auraLayoutOptions, setAuraIconsOnly, setAuraLayout } from '@/show-auras/layout';

import { getLayout, resetLayout, saveLayout } from './blocks';
import { getSnapshot, makeBlockPreview, saveSnapshot } from './preview';

// How long moves take, in milliseconds.
const moveDuration = 160;

/**
 * Make an up or down button.
 *
 * @param {string}   direction 'up' or 'down'.
 * @param {boolean}  disabled  Whether the button can be used.
 * @param {Function} onClick   Called when it's clicked.
 *
 * @return {HTMLElement} The button.
 */
const makeMoveButton = (direction, disabled, onClick) => {
  const button = make('button', ['mhui-trap-editor-move', `mhui-trap-editor-move-${direction}`], 'up' === direction ? '↑' : '↓');
  button.type = 'button';
  button.title = 'up' === direction ? 'Move up' : 'Move down';
  button.disabled = disabled;
  button.addEventListener('click', onClick);

  return button;
};

/**
 * Let the blocks in a container be dragged into a new order.
 *
 * @param {HTMLElement} container The container, with a child for each block.
 * @param {Function}    onDrop    Called with the new order of block ids.
 */
const makeSortable = (container, onDrop) => {
  const getItems = () => [...container.querySelectorAll(':scope > [data-block]')];

  /**
   * Move an item, sliding the others into their new spots rather than jumping.
   *
   * @param {Function} change Makes the move.
   */
  const animateMove = (change) => {
    const before = new Map(getItems().map((el) => [el, el.getBoundingClientRect()]));

    change();

    for (const [el, rect] of before) {
      el.getAnimations().forEach((animation) => animation.cancel());

      const dy = rect.top - el.getBoundingClientRect().top;
      if (dy) {
        el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: moveDuration, easing: 'ease-out' });
      }
    }
  };

  container.addEventListener('pointerdown', (event) => {
    const item = event.target.closest('[data-block]');
    if (!item || item.parentElement !== container || 0 !== event.button) {
      return;
    }

    // The buttons and toggles in a row work as normal. Some blocks are buttons themselves, so those still drag.
    const control = event.target.closest('button, label');
    if (control && control !== item && item.contains(control)) {
      return;
    }

    event.preventDefault();

    const startOrder = getItems()
      .map((el) => el.dataset.block)
      .join();

    const startRect = item.getBoundingClientRect();
    const offsetX = event.clientX - startRect.left;
    const offsetY = event.clientY - startRect.top;
    let ghost = null;

    const move = (moveEvent) => {
      if (!ghost) {
        if (Math.hypot(moveEvent.clientX - event.clientX, moveEvent.clientY - event.clientY) < 4) {
          return;
        }

        // A copy follows the pointer, and the item stays behind to show where it'll go. The copy
        // stays in the container so the same styles apply to it.
        ghost = item.cloneNode(true);
        delete ghost.dataset.block;
        ghost.classList.remove('mhui-trap-editor-highlight');
        ghost.classList.add('mhui-trap-editor-ghost');
        ghost.style.width = `${startRect.width}px`;
        ghost.style.height = `${startRect.height}px`;
        container.append(ghost);

        // Lift it once it's in place, so it animates up.
        ghost.getBoundingClientRect();
        ghost.classList.add('lifted');

        item.classList.add('mhui-trap-editor-dragging');
        document.body.classList.add('mhui-trap-editor-is-dragging');
      }

      ghost.style.left = `${moveEvent.clientX - offsetX}px`;
      ghost.style.top = `${moveEvent.clientY - offsetY}px`;

      // Compare against where the items sit, not where they are mid-slide, so they don't flip back and forth.
      const y = moveEvent.clientY - container.getBoundingClientRect().top - container.clientTop;
      const items = getItems();
      const before = items.find((el) => el !== item && y < el.offsetTop + el.offsetHeight / 2);
      const isInPlace = before ? before.previousElementSibling === item : items.at(-1) === item;

      if (!isInPlace) {
        animateMove(() => (before ? before.before(item) : items.at(-1).after(item)));
      }
    };

    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('keydown', onKeydown, true);
      document.body.classList.remove('mhui-trap-editor-is-dragging');
    };

    const end = () => {
      stop();

      if (!ghost) {
        return;
      }

      // Glide the copy into its spot, then drop it.
      const rect = item.getBoundingClientRect();
      ghost.classList.add('settling');
      ghost.classList.remove('lifted');
      ghost.style.left = `${rect.left}px`;
      ghost.style.top = `${rect.top}px`;

      setTimeout(() => {
        ghost.remove();
        item.classList.remove('mhui-trap-editor-dragging');

        const order = getItems().map((el) => el.dataset.block);
        if (order.join() !== startOrder) {
          onDrop(order);
        }
      }, moveDuration);
    };

    const cancel = () => {
      stop();
      ghost?.remove();
      item.classList.remove('mhui-trap-editor-dragging');

      const startIds = startOrder.split(',');
      animateMove(() => container.prepend(...getItems().sort((a, b) => startIds.indexOf(a.dataset.block) - startIds.indexOf(b.dataset.block))));
    };

    const onKeydown = (keyEvent) => {
      if ('Escape' === keyEvent.key) {
        keyEvent.preventDefault();
        keyEvent.stopPropagation();
        cancel();
      }
    };

    // On the window rather than captured by the item, since moving the item loses the capture.
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('keydown', onKeydown, true);
  });
};

/**
 * Make a group of buttons, like the menu editor's, where the pressed ones are highlighted.
 *
 * @param {HTMLElement} appendTo Where to add the group.
 * @param {Array}       buttons  The buttons, each with a name, whether it's pressed, and a click handler.
 *
 * @return {HTMLElement} The group.
 */
const makeOptionGroup = (appendTo, buttons) => {
  const group = make('div', 'mhui-trap-editor-option-group', '', appendTo);
  group.setAttribute('role', 'group');

  for (const { name, pressed, disabled = false, onClick } of buttons) {
    const button = make('button', 'mhui-trap-editor-option', name, group);
    button.type = 'button';
    button.disabled = disabled;
    button.setAttribute('aria-pressed', String(pressed));
    button.addEventListener('click', onClick);
  }

  return group;
};

/**
 * Open the editor.
 *
 * @param {Function} applyLayout Applies the saved layout to the page.
 */
const openTrapSelectorEditor = (applyLayout) => {
  const popup = createPopup({
    title: 'Custom Trap Selector',
    content: '<div class="mhui-trap-editor-root"></div>',
    className: 'mh-improved-custom-trap-selector-popup',
  });

  const root = document.querySelector('.mh-improved-custom-trap-selector-popup .mhui-trap-editor-root');
  if (!popup || !root) {
    return;
  }

  let snapshot = getSnapshot();

  make('p', 'mhui-trap-editor-help', '', root).textContent =
    'Drag the blocks in the list or the preview to rearrange them, and turn off any you want to hide. Changes are saved as you go.';

  const editor = make('div', 'mhui-trap-editor', '', root);
  const previewWrapper = make('div', 'mhui-trap-editor-preview', '', editor);
  const list = make('div', 'mhui-trap-editor-list', '', editor);

  // Wrapped like the real trap so the game's styles apply to the copies.
  const previewTrap = make('div', ['trapSelectorView__trap', 'campPage-trap'], '', previewWrapper);
  const preview = make('div', 'trapSelectorView__trapStatSummaryContainer', '', previewTrap);

  // The copies have links and buttons in them, which shouldn't do anything here.
  preview.addEventListener('click', (event) => event.preventDefault(), true);

  let layout = getLayout();

  const save = () => {
    saveLayout(layout);
    applyLayout();
    render();
  };

  /**
   * Highlight a block in the preview.
   *
   * @param {string|null} id The block id, or null for none.
   */
  const highlight = (id) => {
    for (const el of preview.children) {
      el.classList.toggle('mhui-trap-editor-highlight', el.dataset.block === id);
    }
  };

  const renderPreview = () => {
    preview.replaceChildren();

    for (const block of layout.filter((b) => !b.hidden)) {
      const el = makeBlockPreview(block, snapshot) || make('div', 'mhui-trap-editor-placeholder', block.name);
      el.dataset.block = block.id;
      // The layout's styles also match the copies, so keep them in the order they're added.
      el.style.order = 'initial';
      el.addEventListener('mouseenter', () => highlight(block.id));
      el.addEventListener('mouseleave', () => highlight(null));
      preview.append(el);
    }

    // Saved copies can have the other rating, so show the one that's set.
    updateTrapEffectivenessText();
  };

  const renderList = () => {
    list.replaceChildren();

    layout.forEach((block, index) => {
      const row = make('div', ['mhui-trap-editor-row', block.hidden ? 'hidden-block' : ''], '', list);
      row.dataset.block = block.id;

      make('span', 'mhui-trap-editor-handle', '⠿', row);
      make('span', 'mhui-trap-editor-name', block.name, row);

      const swap = (to) => {
        [layout[index], layout[to]] = [layout[to], layout[index]];
        save();
      };

      const moves = make('span', 'mhui-trap-editor-moves', '', row);
      moves.append(makeMoveButton('up', 0 === index, () => swap(index - 1)));
      moves.append(makeMoveButton('down', layout.length - 1 === index, () => swap(index + 1)));

      const toggle = make('label', 'mhui-trap-editor-toggle', '', row);
      const checkbox = make('input', '', '', toggle);
      checkbox.type = 'checkbox';
      checkbox.checked = !block.hidden;
      checkbox.title = block.hidden ? 'Show' : 'Hide';
      checkbox.addEventListener('change', () => {
        block.hidden = !checkbox.checked;
        save();
      });

      if ('auras' === block.id && !block.hidden) {
        const options = make('div', 'mhui-trap-editor-options', '', row);
        const iconsOnly = getAuraIconsOnly();

        make('span', 'mhui-trap-editor-options-label', 'Show:', options);
        makeOptionGroup(
          options,
          auraLayoutOptions.map((option) => ({
            name: option.name,
            pressed: option.value === getAuraLayout(),
            // Icons only has its own layout.
            disabled: iconsOnly,
            onClick: () => {
              setAuraLayout(option.value);
              render();
            },
          }))
        );

        makeOptionGroup(options, [
          {
            name: 'Icons only',
            pressed: iconsOnly,
            onClick: () => {
              setAuraIconsOnly(!iconsOnly);
              render();
            },
          },
        ]);
      }

      if ('effectiveness' === block.id && !block.hidden && getSetting('catch-rate-estimate', true)) {
        const options = make('div', 'mhui-trap-editor-options', '', row);
        const useOverall = getOverallTrapEffectiveness();

        make('span', 'mhui-trap-editor-options-label', 'Rating:', options);
        makeOptionGroup(
          options,
          [
            { name: 'Game', value: false },
            { name: 'Overall catch rate', value: true },
          ].map((option) => ({
            name: option.name,
            pressed: option.value === useOverall,
            onClick: () => {
              setOverallTrapEffectiveness(option.value);
              // The preview is a copy of the page, so copy it again with the new rating.
              saveSnapshot();
              snapshot = getSnapshot();
              render();
            },
          }))
        );
      }

      row.addEventListener('mouseenter', () => highlight(block.id));
      row.addEventListener('mouseleave', () => highlight(null));
    });
  };

  const render = () => {
    renderList();
    renderPreview();
  };

  makeSortable(list, (order) => {
    layout = order.map((id) => layout.find((block) => block.id === id));
    save();
  });

  // The preview only has the shown blocks, so they move between the slots the shown blocks had.
  makeSortable(preview, (order) => {
    const moved = order.map((id) => layout.find((block) => block.id === id));
    layout = layout.map((block) => (block.hidden ? block : moved.shift()));
    save();
  });

  const buttons = make('div', 'mhui-trap-editor-buttons', '', root);
  let resetTimeout = null;
  const resetButton = makeMhButton({
    text: 'Reset to default',
    size: 'small',
    className: ['lightBlue', 'mhui-trap-editor-reset'],
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

      resetLayout();
      setAuraLayout('grid');
      setAuraIconsOnly(false);
      setOverallTrapEffectiveness(true);
      applyLayout();
      layout = getLayout();
      render();
    },
  });
  makeMhButton({
    text: 'Done',
    size: 'small',
    appendTo: buttons,
    callback: () => popup.hide(),
  });

  render();
};

export default openTrapSelectorEditor;
