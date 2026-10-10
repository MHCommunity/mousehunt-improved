import { createPopup, make, makeMhButton } from '@utils';

import { getAuraIconsOnly, getAuraLayout, layoutOptions as auraLayoutOptions, setAuraIconsOnly, setAuraLayout } from '@/show-auras/layout';

import { getLayout, resetLayout, saveLayout } from './blocks';
import { getSnapshot, makeBlockPreview } from './preview';

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

  container.addEventListener('pointerdown', (event) => {
    const item = event.target.closest('[data-block]');
    if (!item || item.parentElement !== container || 0 !== event.button || event.target.closest('button, label')) {
      return;
    }

    event.preventDefault();
    item.classList.add('mhui-trap-editor-dragging');

    const startOrder = getItems()
      .map((el) => el.dataset.block)
      .join();

    const move = (moveEvent) => {
      const before = getItems().find((el) => {
        if (el === item) {
          return false;
        }

        const rect = el.getBoundingClientRect();
        return moveEvent.clientY < rect.top + rect.height / 2;
      });

      if (before) {
        before.before(item);
      } else {
        getItems().at(-1).after(item);
      }
    };

    const end = (endEvent) => {
      move(endEvent);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      item.classList.remove('mhui-trap-editor-dragging');

      const order = getItems().map((el) => el.dataset.block);
      if (order.join() !== startOrder) {
        onDrop(order);
      }
    };

    // On the window rather than captured by the item, since moving the item loses the capture.
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
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

  const snapshot = getSnapshot();

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

      row.append(makeMoveButton('up', 0 === index, () => swap(index - 1)));
      row.append(makeMoveButton('down', layout.length - 1 === index, () => swap(index + 1)));

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
  makeMhButton({
    text: 'Reset',
    size: 'small',
    className: 'mhui-trap-editor-reset',
    appendTo: buttons,
    callback: () => {
      resetLayout();
      setAuraLayout('grid');
      setAuraIconsOnly(false);
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
