import { addUIStyles } from '../utils';
import styles from './styles.css';
import getTradableItems from '../../tradable-items';

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
    getSetting('quick-send-supplies-items-0', 'super_brie_cheese'),
    getSetting('quick-send-supplies-items-1', 'rare_map_dust_stat_item'),
    getSetting('quick-send-supplies-items-2', 'floating_trap_upgrade_stat_item'),
    getSetting('quick-send-supplies-items-3', 'rift_torn_roots_crafting_item'),
  ];

  const allTradableItems = getTradableItems('all');
  itemOptions.forEach((item) => {
    const tradableItem = allTradableItems.find((i) => i.type === item);
    if (tradableItem) {
      let image = tradableItem.thumbnail_transparent.length ? tradableItem.thumbnail_transparent : tradableItem.thumbnail;
      makeItem(tradableItem.name, tradableItem.type, image, itemsWrapper);
    }
  });

  quickSendLinkWrapper.appendChild(itemsWrapper);

  const quickSendGoWrapper = makeElement('div', 'quickSendGoWrapper');

  const quickSendInput = makeElement('input', 'quickSendInput');
  quickSendInput.setAttribute('type', 'number');
  quickSendInput.setAttribute('placeholder', 'Quantity');

  const quickSendButton = makeElement('div', ['quickSendButton', 'mousehuntActionButton', 'tiny'], '<span>Send</span>');
  const message = makeElement('div', 'quickSendmessage', 'Sent!', quickSendGoWrapper);

  quickSendButton.addEventListener('click', () => {
    const qty = quickSendInput.value;
    if (! qty) {
      message.innerHTML = 'Please enter a quantity';
      message.classList.add('full-opacity', 'error');
      return;
    }

    const selected = document.querySelector('.quickSendItem.selected');
    const item = selected.querySelector('.quickSendItemRadio');
    if (! item) {
      message.innerHTML = 'Please select an item';
      message.classList.add('full-opacity', 'error');
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

        message.innerHTML = `Sent ${qty} ${itemName}!`;
        message.classList.remove('error');

        message.style.opacity = 1;
        setTimeout(() => {
          message.style.opacity = 0;
        }, 2000);
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

export default function quickSendSupplies() {
  addUIStyles(styles);

  main();
  onPageChange(main);
  onAjaxRequest(main);
  onEvent('profile_hover', main);

  onDialogShow(addToMapUsers, 'map');
}
