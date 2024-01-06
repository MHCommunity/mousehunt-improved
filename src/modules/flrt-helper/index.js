import {
  addStyles,
  createPopup,
  doRequest,
  getLastMaptain,
  makeElement,
  onRequest
} from '@utils';

import tradeableItems from '@data/items-tradeable.json';

import styles from './styles.css';

const addFlrtButtonToConvertible = (response) => {
  if (! (response.convertible_open && response.convertible_open.name && response.convertible_open.items)) {
    return;
  }

  const items = [];

  // Convert the items into a format that flrtPopup can use.
  response.convertible_open.items.forEach((element) => {
    // Skip items that are not tradable.
    const tradable = tradeableItems.find((tradableItem) => {
      return tradableItem.type === element.type;
    });

    if (tradable) {
      items.push({
        type: element.type,
        name: element.name,
        image: element.thumb,
        quantity: element.quantity,
      });
    }
  });

  const buttons = document.querySelector('.jsDialogContainer .suffix');
  if (! buttons) {
    return;
  }

  // Make the button and add it to the dialog.
  const flrtBtn = makeElement('button', ['mousehuntActionButton', 'small', 'button'], 'Send tradeables to Maptain');

  flrtBtn.addEventListener('click', () => {
    flrtPopup(items);
  });

  buttons.prepend(flrtBtn);
};

const sendItemsToMaptain = async (snuid, items) => {
  for (const item of items) {
    item.element.classList.add('flrt-item-sending');

    await doRequest('managers/ajax/users/supplytransfer.php', {
      item: item.type,
      item_quantity: item.quantity,
      receiver: snuid,
    });

    item.element.classList.remove('flrt-item-sending');
    item.element.classList.add('flrt-item-sent');
  }

  const sendButton = document.querySelector('.flrt-send-items');
  if (sendButton) {
    sendButton.outerHTML = '<input type="submit" value="Continue" class="jsDialogClose button">';
  }
};

const flrtPopup = (items) => {
  const lastMaptain = getLastMaptain();

  let itemContent = '';
  items.forEach((item) => {
    itemContent += `<div class="flrt-item" data-item-type="${item.type}" data-item-quantity="${item.quantity}">
      <div class="itemImage">
        <img src="${item.image}">
        <div class="quantity">${item.quantity}</div>
      </div>
      <div class="flrt-item-info">
        <input type="checkbox" checked data-item-type="${item.type}">
        <span class="flrt-item-name">${item.name}</span>
      </div>
    </div>`;
  });

  const popup = createPopup({
    template: 'ajax',
    title: 'Send tradables to Maptain',
    content: `<div class="mh-improved-flrt-helper-popup">
      <div class="flrt-friend-finder">
          <form action="https://www.mousehuntgame.com/friends.php?tab=requests&amp;sub_tab=community" method="post" class="flrt-search-form friends-page-id-search friendsPage-community-hunterIdForm" onsubmit="app.pages.FriendsPage.submitHunterIdForm(this); return false;">
            <input type="number" value="${lastMaptain || ''}" name="user_id" maxlength="10" class="friendsPage-community-hunterIdForm-input">
            <a class="mousehuntActionButton small search-for-hunter" href="#" onclick="app.pages.FriendsPage.triggerHunterForm(this); return false;"><span>Search</span></a>
          </form>
        <div class="friendsPage-community-hunterResult"></div>
        <div class="instructions">
          Select the tradable items you want to send.
        </div>
      </div>
      <div class="flrt-items-to-send">
        ${itemContent}
      </div>
    </div>`,
  });

  popup.addToken('{*prefix*}', '<h2 class="title">Send tradable items</h2>');
  popup.addToken('{*suffix*}', '<div class="mousehuntActionButton flrt-send-items"><span>Send items to Maptain</span></div>');
  popup.show();

  const flrtItems = document.querySelectorAll('.flrt-item');
  flrtItems.forEach((item) => {
    const checkbox = item.querySelector('input[type="checkbox"]');

    const toggle = () => {
      checkbox.checked = ! checkbox.checked;
      item.classList.toggle('flrt-item-disabled', ! checkbox.checked);
    };

    item.addEventListener('click', toggle);
  });

  if (lastMaptain) {
    const search = document.querySelector('.search-for-hunter');
    if (search) {
      app.pages.FriendsPage.triggerHunterForm(search);
    }
  }

  const sendBtn = document.querySelector('.flrt-send-items');
  if (! sendBtn) {
    return;
  }

  sendBtn.addEventListener('click', () => {
    sendBtn.disabled = true;
    sendBtn.classList.add('disabled');

    const id = document.querySelector('.friendsPage-community-hunterIdForm-input');
    if (! id) {
      return;
    }

    const sendingItems = document.querySelectorAll('.flrt-item');
    const itemsToSend = [];

    sendingItems.forEach((item) => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (! checkbox) {
        return;
      }

      if (checkbox.checked) {
        const itemData = {
          type: item.getAttribute('data-item-type'),
          quantity: Number.parseInt(item.getAttribute('data-item-quantity'), 10),
          element: item,
        };

        itemsToSend.push(itemData);
      }

      checkbox.disabled = true;
    });

    const row = document.querySelector('.friendsPage-friendRow.friendsPage-requestRow');
    if (! row) {
      return;
    }

    const snuid = row.getAttribute('data-snuid') || id.value;

    sendItemsToMaptain(snuid, itemsToSend);
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);

  onRequest(addFlrtButtonToConvertible, 'managers/ajax/users/useconvertible.php');
};

export default {
  id: 'flrt-helper',
  name: 'FLRT Helper',
  type: 'feature',
  default: false,
  description: 'When opening a chest from a map, adds a "Return to Maptain" button that will let you choose which tradable items to send directly to the Maptain.',
  load: init,
};
