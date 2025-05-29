import {
  addStyles,
  debounce,
  getSetting,
  getTradableItems,
  makeElement,
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

const activeHoverDebounces = new WeakMap();

/**
 * Make the markup for an item.
 *
 * @param {string}      name                 The name of the item.
 * @param {string}      type                 The type of the item.
 * @param {string}      image                The image of the item.
 * @param {HTMLElement} appendTo             The element to append to.
 * @param {HTMLElement} quickSendLinkWrapper The quick send link wrapper.
 */
const makeItem = (name, type, image, appendTo, quickSendLinkWrapper) => {
  const item = makeElement('div', 'quickSendItem');
  item.title = name;

  const itemImage = document.createElement('img');
  itemImage.setAttribute('src', image);
  itemImage.setAttribute('alt', name);

  const selected = makeElement('input', 'quickSendItemRadio');
  selected.setAttribute('type', 'radio');
  selected.setAttribute('name', 'item');
  selected.setAttribute('value', type);
  selected.setAttribute('data-name', name);

  item.addEventListener('click', () => {
    selected.checked = true;

    quickSendLinkWrapper.classList.add('sticky');
    quickSendLinkWrapper.setAttribute('data-selected', type);

    const items = document.querySelectorAll('.quickSendItem');
    items.forEach((i) => {
      i.classList.remove('selected');
    });

    item.classList.add('selected');
  });

  item.append(selected);
  item.append(itemImage);

  appendTo.append(item);
};

/**
 * Create the button to send supplies.
 *
 * @param {HTMLElement} btn   The button to append to.
 * @param {string}      snuid The SN User ID of the recipient.
 *
 * @return {HTMLElement|boolean} The quick send link wrapper or false.
 */
const makeSendSuppliesButton = async (btn, snuid) => {
  if (snuid === user.sn_user_id) {
    return false;
  }

  btn.setAttribute('data-quick-send', 'true');

  const existing = document.querySelectorAll('.quickSendWrapper');
  let found = false;
  if (existing && existing.length) {
    existing.forEach((el) => {
      if (el.getAttribute('data-snuid') === snuid) {
        found = true;
        el.classList.remove('hidden');
      } else {
        el.remove();
      }
    });
  }

  if (found) {
    return;
  }

  const quickSendLinkWrapper = makeElement('form', ['quickSendWrapper', 'hidden']);
  quickSendLinkWrapper.setAttribute('data-snuid', snuid);

  const itemsWrapper = makeElement('div', 'itemsWrapper');

  const itemOptions = [
    getSetting('quick-send-supplies.items-0', 'super_brie_cheese'),
    getSetting('quick-send-supplies.items-1', 'rare_map_dust_stat_item'),
    getSetting('quick-send-supplies.items-2', 'floating_trap_upgrade_stat_item'),
    getSetting('quick-send-supplies.items-3', 'rift_torn_roots_crafting_item'),
  ];

  const allTradableItems = await getTradableItems('all');
  for (const item of itemOptions) {
    const tradableItem = allTradableItems.find((i) => i.type === item);
    if (tradableItem) {
      makeItem(tradableItem.name, tradableItem.type, tradableItem.image, itemsWrapper, quickSendLinkWrapper);
    }
  }

  quickSendLinkWrapper.append(itemsWrapper);

  const quickSendGoWrapper = makeElement('div', 'quickSendGoWrapper');

  const quickSendInput = makeElement('input', 'quickSendInput');
  quickSendInput.setAttribute('type', 'number');
  quickSendInput.setAttribute('placeholder', 'Quantity');
  quickSendInput.setAttribute('min', 0);

  const quickSendButton = makeElement('div', ['quickSendButton', 'mousehuntActionButton', 'tiny'], '<span>Send</span>');

  const sendIt = async () => {
    if (quickSendButton.classList.contains('disabled')) {
      return;
    }

    const errorMessageOpts = {
      message: 'There was an error sending supplies',
      append: quickSendGoWrapper,
      classname: 'mh-ui-quick-send-error',
    };

    const qty = quickSendInput.value;
    if (! qty) {
      errorMessageOpts.message = 'Quantity is required';
      showErrorMessage(errorMessageOpts);
      return;
    }

    const selected = document.querySelector('.quickSendItem.selected');
    if (! selected) {
      errorMessageOpts.message = 'Item is required';
      showErrorMessage(errorMessageOpts);
      return;
    }

    const item = selected.querySelector('.quickSendItemRadio');
    if (! item) {
      errorMessageOpts.message = 'Item is required';
      showErrorMessage(errorMessageOpts);
      return;
    }

    quickSendButton.classList.add('disabled');

    const itemType = item.getAttribute('value');
    const itemName = item.getAttribute('data-name');
    const url = `https://www.mousehuntgame.com/managers/ajax/users/supplytransfer.php?sn=Hitgrab&hg_is_ajax=1&receiver=${snuid}&uh=${user.unique_hash}&item=${itemType}&item_quantity=${qty}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-By': `MouseHunt-Improved/${mhImprovedVersion}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          quickSendInput.value = '';
          quickSendButton.classList.remove('disabled');
          showSuccessMessage({
            message: `Sent ${qty} ${itemName}!`,
            append: quickSendGoWrapper,
            classname: 'mh-ui-quick-send-success',
          });
        } else {
          throw new Error('Response not successful');
        }
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Fetch error:', error); // eslint-disable-line no-console
      quickSendButton.classList.remove('disabled');
      showErrorMessage({
        message: 'There was an error sending supplies',
        append: quickSendGoWrapper,
        classname: 'mh-ui-quick-send-error',
      });
    }
  };

  quickSendButton.addEventListener('click', sendIt);

  quickSendInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sendIt();
    }
  });

  quickSendGoWrapper.append(quickSendInput);
  quickSendGoWrapper.append(quickSendButton);
  quickSendLinkWrapper.append(quickSendGoWrapper);

  const close = makeElement('div', ['quickSendClose'], '✕');
  close.addEventListener('click', () => {
    quickSendLinkWrapper.remove();
  });
  quickSendLinkWrapper.append(close);

  document.body.append(quickSendLinkWrapper);

  setTimeout(() => {
    quickSendLinkWrapper.classList.remove('hidden');
  }, 100);

  const rect = btn.getBoundingClientRect();

  quickSendLinkWrapper.style.top = `${rect.top + window.scrollY + rect.height - 20}px`;
  quickSendLinkWrapper.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (quickSendLinkWrapper.offsetWidth / 2)}px`;

  quickSendLinkWrapper.addEventListener('mouseleave', () => {
    if (! quickSendLinkWrapper.classList.contains('sticky')) {
      setTimeout(() => {
        quickSendLinkWrapper.remove();
      }, 350);
    }
  });

  let buttonTimeout;
  btn.addEventListener('mouseleave', () => {
    if (! quickSendLinkWrapper.classList.contains('sticky')) {
      buttonTimeout = setTimeout(() => {
        quickSendLinkWrapper.remove();
      }, 350);
    }
  });

  quickSendLinkWrapper.addEventListener('mouseenter', () => {
    clearTimeout(buttonTimeout);
  });

  document.addEventListener('click', (event) => {
    if (! quickSendLinkWrapper.contains(event.target) && ! btn.contains(event.target)) {
      quickSendLinkWrapper.classList.remove('sticky');
      setTimeout(() => {
        quickSendLinkWrapper.remove();
      }, 350);
    }
  });

  return quickSendLinkWrapper;
};

/**
 * Main function.
 */
const main = async () => {
  const sendSupplies = document.querySelectorAll('.userInteractionButtonsView-button.sendSupplies');
  if (! sendSupplies) {
    return;
  }

  for (const btn of sendSupplies) {
    if (btn.classList.contains('disabled')) {
      return;
    }

    const existing = btn.getAttribute('data-quick-send');
    if (existing) {
      return;
    }

    const snuid = btn.parentNode?.parentNode?.getAttribute('data-recipient-snuid');
    if (! snuid) {
      return;
    }

    let debounceTimeout;

    const onMouseEnter = () => {
      debounceTimeout = setTimeout(() => {
        makeSendSuppliesButton(btn, snuid);
        activeHoverDebounces.delete(btn);
      }, 400);
      activeHoverDebounces.set(btn, debounceTimeout);
    };

    const onMouseLeave = () => {
      const timeout = activeHoverDebounces.get(btn);
      if (timeout) {
        clearTimeout(timeout);
        activeHoverDebounces.delete(btn);
      }
    };

    btn.addEventListener('mouseenter', onMouseEnter);
    btn.addEventListener('mouseleave', onMouseLeave);
  }
};

const addToMapUsers = async (attempts = 0) => {
  const mapUsers = document.querySelectorAll('.treasureMapView-hunter-wrapper.mousehuntTooltipParent');
  if (! mapUsers?.length) {
    if (attempts < 10) {
      setTimeout(() => addToMapUsers(attempts + 1), 500 * (attempts + 1));
    }
    return;
  }

  mapUsers.forEach((btn) => {
    const existing = btn.getAttribute('data-quick-send');
    if (existing) {
      return;
    }

    const snuid = btn.getAttribute('data-snuid');
    if (! snuid) {
      return;
    }

    let debounceTimeout;

    const onMouseEnter = () => {
      debounceTimeout = setTimeout(() => {
        makeSendSuppliesButton(btn, snuid);
        activeHoverDebounces.delete(btn);
      }, 400);
      activeHoverDebounces.set(btn, debounceTimeout);
    };

    const onMouseLeave = () => {
      const timeout = activeHoverDebounces.get(btn);
      if (timeout) {
        clearTimeout(timeout);
        activeHoverDebounces.delete(btn);
      }
    };

    btn.addEventListener('mouseenter', onMouseEnter);
    btn.addEventListener('mouseleave', onMouseLeave);
  });
};

const hideQuickSendSupplies = () => {
  const quickSendLinkWrappers = document.querySelectorAll('.quickSendWrapper');
  if (quickSendLinkWrappers.length) {
    quickSendLinkWrappers.forEach((el) => el.remove());
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'quick-send-supplies');

  main();
  onNavigation(main);

  onRequest('*', () => {
    setTimeout(main, 500);
  });

  onEvent('profile_hover', main);

  onDialogShow('map', addToMapUsers);
  onDialogHide(hideQuickSendSupplies, 'map');

  onEvent('map_show_goals_tab_click', addToMapUsers);
  onEvent('map_tab_click', addToMapUsers);
};

/**
 * Initialize the module.
 */
export default {
  id: 'quick-send-supplies',
  name: 'Quick Send Supplies',
  type: 'feature',
  default: true,
  description: 'Hover over the Send Supplies button on someone’s profile or hover-profile to easily send any quantity of an item.',
  load: init,
  settings,
};
