import {
  addUIStyles,
  getMhuiSetting,
  makeElement,
  onDialogShow,
  onEvent,
  onNavigation,
  onRequest,
  showErrorMessage,
  showSuccessMessage
} from '../utils';

import styles from './styles.css';

import getTradableItems from '../../data/tradable-items';

const makeItem = (name, type, image, appendTo) => {
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

    const items = document.querySelectorAll('.quickSendItem');
    items.forEach((i) => {
      i.classList.remove('selected');
    });

    item.classList.add('selected');
  });

  item.appendChild(selected);
  item.appendChild(itemImage);

  appendTo.appendChild(item);
};

const makeSendSuppliesButton = (btn, snuid) => {
  if (snuid === user.sn_user_id) {
    return false;
  }

  btn.setAttribute('data-quick-send', 'true');

  btn.classList.remove('mousehuntTooltipParent');
  const tooltip = btn.querySelector('.mousehuntTooltip');
  if (tooltip) {
    tooltip.remove();
  }

  const quickSendLinkWrapper = makeElement('form', ['quickSendWrapper', 'hidden']);
  const itemsWrapper = makeElement('div', 'itemsWrapper');

  const itemOptions = [
    getMhuiSetting('quick-send-supplies-items-0', 'super_brie_cheese'),
    getMhuiSetting('quick-send-supplies-items-1', 'rare_map_dust_stat_item'),
    getMhuiSetting('quick-send-supplies-items-2', 'floating_trap_upgrade_stat_item'),
    getMhuiSetting('quick-send-supplies-items-3', 'rift_torn_roots_crafting_item'),
  ];

  const allTradableItems = getTradableItems('all');
  itemOptions.forEach((item) => {
    const tradableItem = allTradableItems.find((i) => i.type === item);
    if (tradableItem) {
      const image = tradableItem.thumbnail_transparent ? tradableItem.thumbnail_transparent : tradableItem.thumbnail;
      makeItem(tradableItem.name, tradableItem.type, image, itemsWrapper);
    }
  });

  quickSendLinkWrapper.appendChild(itemsWrapper);

  const quickSendGoWrapper = makeElement('div', 'quickSendGoWrapper');

  const quickSendInput = makeElement('input', 'quickSendInput');
  quickSendInput.setAttribute('type', 'number');
  quickSendInput.setAttribute('placeholder', 'Quantity');

  const quickSendButton = makeElement('div', ['quickSendButton', 'mousehuntActionButton', 'tiny'], '<span>Send</span>');

  quickSendButton.addEventListener('click', () => {
    if (quickSendButton.classList.contains('disabled')) {
      return;
    }

    const qty = quickSendInput.value;
    if (! qty) {
      showErrorMessage('Please enter a quantity', quickSendGoWrapper, 'mh-ui-quick-send-error');
      return;
    }

    const selected = document.querySelector('.quickSendItem.selected');
    if (! selected) {
      showErrorMessage('Please select an item', quickSendGoWrapper, 'mh-ui-quick-send-error');
      return;
    }

    const item = selected.querySelector('.quickSendItemRadio');
    if (! item) {
      showErrorMessage('Please select an item', quickSendGoWrapper, 'mh-ui-quick-send-error');
      return;
    }

    quickSendButton.classList.add('disabled');

    const itemType = item.getAttribute('value');
    const itemName = item.getAttribute('data-name');
    const url = `https://www.mousehuntgame.com/managers/ajax/users/supplytransfer.php?sn=Hitgrab&hg_is_ajax=1&receiver=${snuid}&uh=${user.unique_hash}&item=${itemType}&item_quantity=${qty}`;

    fetch(url, {
      method: 'POST',
    }).then((response) => {
      if (response.status === 200) {
        quickSendInput.value = '';

        quickSendButton.classList.remove('disabled');

        showSuccessMessage(`Sent ${qty} ${itemName}!`, quickSendGoWrapper, 'mh-ui-quick-send-success');
      }
    });
  });

  quickSendGoWrapper.appendChild(quickSendInput);
  quickSendGoWrapper.appendChild(quickSendButton);
  quickSendLinkWrapper.appendChild(quickSendGoWrapper);

  return quickSendLinkWrapper;
};

const main = () => {
  const sendSupplies = document.querySelectorAll('.userInteractionButtonsView-button.sendSupplies');
  if (! sendSupplies) {
    return;
  }

  sendSupplies.forEach((btn) => {
    if (btn.classList.contains('disabled')) {
      return;
    }

    const existing = btn.getAttribute('data-quick-send');
    if (existing) {
      return;
    }

    // get the parent parent
    const snuid = btn.parentNode.parentNode.getAttribute('data-recipient-snuid');
    if (! snuid) {
      return;
    }

    const quickSendLinkWrapper = makeSendSuppliesButton(btn, snuid);
    if (quickSendLinkWrapper) {
      btn.parentNode.insertBefore(quickSendLinkWrapper, btn.nextSibling);
    }
  });
};

const addToMapUsers = (attempts = 0) => {
  const mapUsers = document.querySelectorAll('.treasureMapView-hunter-wrapper.mousehuntTooltipParent');
  if (! mapUsers || ! mapUsers.length) {
    if (attempts < 10) {
      setTimeout(() => {
        addToMapUsers(attempts + 1);
      }, 500 * (attempts + 1));
    }

    return;
  }

  mapUsers.forEach((btn) => {
    const existing = btn.getAttribute('data-quick-send');
    if (existing) {
      return;
    }

    // get the parent parent
    const snuid = btn.getAttribute('data-snuid');
    if (! snuid) {
      return;
    }

    const quickSendLinkWrapper = makeSendSuppliesButton(btn, snuid);
    if (quickSendLinkWrapper) {
      btn.appendChild(quickSendLinkWrapper);
    }
  });
};

export default () => {
  addUIStyles(styles);

  main();
  onNavigation(main);
  onRequest(main);
  onEvent('profile_hover', main);

  onDialogShow(addToMapUsers, 'map');
};
