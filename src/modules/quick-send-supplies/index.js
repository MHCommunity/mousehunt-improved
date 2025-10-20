import {
  addStyles,
  getSetting,
  getTradableItems,
  makeElement,
  makeMhButton,
  onDialogHide,
  onDialogShow,
  onEvent,
  onNavigation,
  onRequest,
  showErrorMessage,
  showSuccessMessage
} from '@utils';

import settings from './settings';
import styles from './styles.css';

const STATE = new WeakMap(); // btn => { wrapper, aborter }
const HOVER_DELAY = 400;

const buildItems = async () => {
  const opts = [
    getSetting('quick-send-supplies.items-0', 'super_brie_cheese'),
    getSetting('quick-send-supplies.items-1', 'rare_map_dust_stat_item'),
    getSetting('quick-send-supplies.items-2', 'floating_trap_upgrade_stat_item'),
    getSetting('quick-send-supplies.items-3', 'rift_torn_roots_crafting_item'),
  ];

  const tradables = await getTradableItems('all');
  return opts
    .map((type) => tradables.find((t) => t.type === type))
    .filter(Boolean);
};

const clamp = (val, min, max) => {
  return Math.max(min, Math.min(max, val));
};

const positionPanel = (panel, anchor) => {
  const rect = anchor.getBoundingClientRect();
  const top = rect.top + window.scrollY + rect.height - 10;
  let left = rect.left + window.scrollX + (rect.width / 2) - (panel.offsetWidth / 2);

  const minLeft = window.scrollX + 8;
  const maxLeft = window.scrollX + document.documentElement.clientWidth - panel.offsetWidth - 8;
  left = clamp(left, minLeft, maxLeft);

  panel.style.top = `${top}px`;
  panel.style.left = `${left}px`;
};

const sendSupplies = async ({ aborter, snuid, qty, itemType, itemName, button, container }) => {
  const url = `https://www.mousehuntgame.com/managers/ajax/users/supplytransfer.php?sn=Hitgrab&hg_is_ajax=1&receiver=${snuid}&uh=${user.unique_hash}&item=${itemType}&item_quantity=${qty}`;

  button.classList.add('disabled');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-By': `MouseHunt-Improved/${mhImprovedVersion}`,
      },
      signal: aborter.signal,
    });

    if (! res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (! data.success) {
      throw new Error('API success=false');
    }

    showSuccessMessage({
      message: `Sent ${qty} ${itemName}!`,
      append: container,
      classname: 'mh-ui-quick-send-success',
    });
  } catch {
    if (aborter.signal.aborted) {
      return;
    }
    showErrorMessage({
      message: 'There was an error sending supplies',
      append: container,
      classname: 'mh-ui-quick-send-error',
    });
  } finally {
    if (! aborter.signal.aborted) {
      button.classList.remove('disabled');
    }
  }
};

const makeItemTile = ({ name, type, image }, onSelect) => {
  const tile = makeElement('div', 'quickSendItem');
  tile.title = name;

  const img = document.createElement('img');
  img.src = image;
  img.alt = name;

  const radio = makeElement('input', 'quickSendItemRadio');
  radio.type = 'radio';
  radio.name = 'item';
  radio.value = type;
  radio.setAttribute('data-name', name);

  tile.addEventListener('click', () => onSelect(tile, radio));
  tile.append(radio, img);
  return tile;
};

const buildPanel = async (btn, snuid) => {
  // If already constructed for this button, reuse it.
  const state = STATE.get(btn);
  if (state?.wrapper && state.wrapper.isConnected) {
    return state.wrapper;
  }

  hideAllPanels();

  const aborter = new AbortController();
  const wrapper = makeElement('form', ['quickSendWrapper', 'hidden']);
  wrapper.setAttribute('role', 'dialog');
  wrapper.setAttribute('aria-label', 'Quick Send Supplies');
  wrapper.setAttribute('data-snuid', snuid);
  wrapper.tabIndex = -1;

  const itemsWrapper = makeElement('div', 'itemsWrapper');

  const tiles = await buildItems();

  let selectedTile = null;

  const select = (tile, radio) => {
    wrapper.classList.add('sticky');
    [...itemsWrapper.querySelectorAll('.quickSendItem')].forEach((n) => n.classList.remove('selected'));
    tile.classList.add('selected');
    radio.checked = true;
    selectedTile = tile;
  };

  tiles.forEach((t) => {
    itemsWrapper.append(makeItemTile(t, select));
  });

  const controls = makeElement('div', 'quickSendGoWrapper');

  const qtyInput = makeElement('input', 'quickSendInput');
  qtyInput.type = 'number';
  qtyInput.placeholder = 'Quantity';
  qtyInput.min = 0;

  const sendBtn = makeMhButton({ text: 'Send', className: ['quickSendButton'] });

  const performSend = async () => {
    const errorParams = {
      append: controls,
      classname: 'mh-ui-quick-send-error',
    };

    const qty = qtyInput.value;
    if (! qty || Number(qty) <= 0) {
      showErrorMessage({ ...errorParams, message: 'Quantity is required' });
      return;
    }
    if (! selectedTile) {
      showErrorMessage({ ...errorParams, message: 'Item is required' });
      return;
    }

    const radio = selectedTile.querySelector('.quickSendItemRadio');
    const itemType = radio?.value;
    const itemName = radio?.getAttribute('data-name');
    if (! itemType || ! itemName) {
      showErrorMessage({ ...errorParams, message: 'Item is required' });
      return;
    }

    await sendSupplies({
      aborter,
      snuid,
      qty,
      itemType,
      itemName,
      button: sendBtn,
      container: controls,
    });

    qtyInput.value = '';
  };

  sendBtn.addEventListener('click', performSend);

  qtyInput.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && ! sendBtn.classList.contains('disabled') && ! wrapper.classList.contains('hidden')) {
      ev.preventDefault();
      performSend();
    }
  });

  controls.append(qtyInput, sendBtn);

  const close = makeElement('div', ['quickSendClose'], 'x');
  close.setAttribute('role', 'button');
  close.setAttribute('tabindex', '0');

  const closePanel = () => {
    wrapper.classList.remove('sticky');
    wrapper.classList.add('hidden');
  };

  close.addEventListener('click', closePanel);
  close.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      closePanel();
    }
  });

  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePanel();
    }
  });

  document.body.append(wrapper);
  wrapper.append(itemsWrapper, controls, close);

  wrapper.addEventListener('mouseleave', () => {
    if (! wrapper.classList.contains('sticky')) {
      setTimeout(() => wrapper.classList.add('hidden'), 350);
    }
  });

  const outsideClick = (event) => {
    if (! wrapper.contains(event.target) && ! btn.contains(event.target)) {
      wrapper.classList.remove('sticky');
      setTimeout(() => wrapper.classList.add('hidden'), 350);
    }
  };
  document.addEventListener('click', outsideClick);

  STATE.set(btn, { wrapper, aborter, outsideClick });
  return wrapper;
};

const attachToButtons = (root = document) => {
  const buttons = [
    ...root.querySelectorAll('.userInteractionButtonsView-button.sendSupplies'),
    ...root.querySelectorAll('.treasureMapView-hunter-wrapper.mousehuntTooltipParent')
  ];

  const seen = new WeakMap();

  buttons.forEach((btn) => {
    if (seen.get(btn)) {
      return;
    }
    seen.set(btn, true);

    const snuid =
      btn.parentNode?.parentNode?.getAttribute('data-recipient-snuid') ||
      btn.getAttribute('data-snuid') ||
      null;

    if (! snuid || snuid === user.sn_user_id) {
      return;
    }

    let hoverTimer = null;

    const onEnter = async () => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(async () => {
        const panel = await buildPanel(btn, snuid);
        panel.classList.remove('hidden');
        positionPanel(panel, btn);
        panel.focus({ preventScroll: true });
      }, HOVER_DELAY);
    };

    const onLeave = () => {
      clearTimeout(hoverTimer);
      const state = STATE.get(btn);
      if (! state) {
        return;
      }
      const { wrapper } = state;
      if (wrapper && ! wrapper.classList.contains('sticky')) {
        setTimeout(() => wrapper.classList.add('hidden'), 350);
      }
    };

    if (! btn.classList.contains('mhui-quick-send-attached')) {
      btn.classList.add('mhui-quick-send-attached');
      btn.addEventListener('mouseenter', onEnter);
      btn.addEventListener('mouseleave', onLeave);

      // Click toggles sticky
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const panel = await buildPanel(btn, snuid);
        panel.classList.toggle('hidden');
        panel.classList.add('sticky');
        positionPanel(panel, btn);
        panel.focus({ preventScroll: true });
      });
    }
  });
};

const hideAllPanels = () => {
  document.querySelectorAll('.quickSendWrapper').forEach((w) => w.remove());
  for (const [btn, state] of STATE.entries ? STATE.entries() : []) {
    try {
      state?.aborter?.abort?.();
      if (state?.outsideClick) {
        document.removeEventListener('click', state.outsideClick);
      }
    } catch {
      debug('quick-send-supplies: error aborting request');
    }
    STATE.delete(btn);
  }
};

const main = () => attachToButtons(document);

const init = () => {
  addStyles(styles, 'quick-send-supplies');

  main();
  onNavigation(main);
  onRequest('*', () => setTimeout(main, 500));
  onEvent('profile_hover', main);

  onDialogShow('map', () => setTimeout(main, 0));
  onDialogHide(hideAllPanels, 'map');

  onEvent('map_show_goals_tab_click', main);
  onEvent('map_tab_click', main);
};

export default {
  id: 'quick-send-supplies',
  name: 'Quick Send Supplies',
  type: 'feature',
  default: true,
  description: 'Hover or click on Send Supplies to quickly send any quantity of a configured item.',
  load: init,
  settings,
};
