import {
  addStyles,
  cacheFinishedMap,
  createPopup,
  doRequest,
  getData,
  getLastMaptain,
  makeElement,
  onDialogShow,
  onRequest
} from '@utils';

import styles from './styles.css';

/**
 * Add the "Return to Maptain" button to the convertible dialog.
 *
 * @param {Object} response The response from the request.
 */
const addFlrtButtonToConvertible = async (response) => {
  if (! response?.convertible_open?.name || ! response?.convertible_open?.items) {
    return;
  }

  const items = [];

  const tradableItems = await getData('items-tradable');

  // Convert the items into a format that flrtPopup can use.
  for (const element of response.convertible_open.items) {
    const itemData = {
      type: element.type,
      name: element.name,
      image: element.thumb,
      quantity: element.quantity,
    };

    // If it's Magic essence, then transform it into SB.
    if (element.type === 'magic_essence_craft_item') {
      itemData.type = 'super_brie_cheese';
      itemData.name = 'SUPER|brie+';
      itemData.image = 'https://www.mousehuntgame.com/images/items/bait/large/32b20c3984d2f03b132c295ea3b99e7e.png';
    }

    // Skip items that are not tradable.
    if (tradableItems) {
      const tradable = tradableItems.find((tradableItem) => {
        return tradableItem.type === element.type;
      });

      if (tradable) {
        items.push(itemData);
      }
    } else {
      // If we don't have the data for tradable items, just add them all.
      items.push(itemData);
    }
  }

  const buttons = document.querySelector('.jsDialogContainer .suffix');
  if (! buttons) {
    return;
  }

  // Make the button and add it to the dialog.
  const flrtBtn = makeElement('button', ['mousehuntActionButton', 'small', 'button']);
  makeElement('span', [], 'Return to Maptain', flrtBtn);

  flrtBtn.addEventListener('click', () => {
    flrtPopup(items);
  });

  buttons.prepend(flrtBtn);
};

/**
 * Show the popup to send the items to the Maptain.
 *
 * @param {Array} items The items to send.
 */
const flrtPopup = async (items) => {
  const lastMaptain = await getLastMaptain();

  let itemContent = '';
  items.forEach((item) => {
    itemContent += `<div class="flrt-item" data-item-type="${item.type}" data-item-quantity="${item.quantity}">
      <div class="itemImage">
        <img src="${item.image}" alt="${item.name}" title="${item.name}" />
        <div class="quantity">${item.quantity}</div>
      </div>
      <div class="flrt-item-info">
        <span class="flrt-item-name">${item.name}</span>
      </div>
      <button class="flrt-item-send mousehuntActionButton small disabled" data-item-type="${item.type}" data-item-quantity="${item.quantity}" disabled>
        <span>Send</span>
      </button>
    </div>`;
  });

  const popup = createPopup({
    template: 'ajax',
    className: 'flrt-helper-popup',
    title: 'Send tradables to Maptain',
    content: `<div class="mh-improved-flrt-helper-popup">
      <div class="flrt-friend-finder">
          <form action="https://www.mousehuntgame.com/friends.php?tab=requests&amp;sub_tab=community" method="post" class="flrt-search-form friends-page-id-search friendsPage-community-hunterIdForm" onsubmit="app.pages.FriendsPage.submitHunterIdForm(this); return false;">
            <input type="number" value="${lastMaptain || ''}" name="user_id" maxlength="10" class="friendsPage-community-hunterIdForm-input">
            <a class="mousehuntActionButton small search-for-hunter" href="#" onclick="app.pages.FriendsPage.triggerHunterForm(this); return false;"><span>Search</span></a>
          </form>
        <div class="friendsPage-community-hunterResult"></div>
      </div>
      <div class="flrt-items-to-send">
        ${itemContent}
      </div>
    </div>`,
  });

  popup.addToken('{*prefix*}', '<h2 class="title">Send tradable items</h2>');
  popup.addToken('{*suffix*}', '');
  popup.show();

  const search = document.querySelector('.search-for-hunter');
  if (! search) {
    return;
  }

  hasFoundMaptain = !! lastMaptain;

  if (lastMaptain) {
    app.pages.FriendsPage.triggerHunterForm(search);
  }

  const flrtItems = document.querySelectorAll('.flrt-item');

  search.addEventListener('click', () => {
    const id = document.querySelector('.friendsPage-community-hunterIdForm-input');
    if (! id) {
      return;
    }

    app.pages.FriendsPage.submitHunterIdForm(id);
  });

  flrtItems.forEach((item) => {
    const sendButton = item.querySelector('.flrt-item-send');
    if (! sendButton) {
      return;
    }

    sendButton.addEventListener('click', async () => {
      if (! hasFoundMaptain) {
        return;
      }

      const type = item.getAttribute('data-item-type');
      const quantity = item.getAttribute('data-item-quantity');

      if (! type || ! quantity) {
        return;
      }

      item.classList.add('flrt-item-sending');

      await doRequest('managers/ajax/users/supplytransfer.php', {
        item: type,
        item_quantity: quantity,
        receiver: lastMaptain,
      });

      item.classList.remove('flrt-item-sending');
      item.classList.add('flrt-item-sent');
      item.classList.add('flrt-item-sent-success');
      setTimeout(item.classList.remove, 1500, 'flrt-item-sent-success');

      sendButton.disabled = true;
      sendButton.classList.add('disabled');
      sendButton.setAttribute('data-item-sent', 'true');
    });
  });
};

let hasFoundMaptain = false;
const updateSendButtons = async (resp) => {
  hasFoundMaptain = resp.friend && resp.friend.sn_user_id ? true : false;

  const overlay = document.querySelector('#overlayPopup.flrt-helper-popup');
  if (! overlay) {
    return;
  }

  const flrtSendButtons = document.querySelectorAll('.flrt-item-send');
  if (! flrtSendButtons) {
    return;
  }

  flrtSendButtons.forEach((button) => {
    if (button.getAttribute('data-item-sent') === 'true') {
      return;
    }

    button.disabled = ! hasFoundMaptain;
    button.classList.toggle('disabled', ! hasFoundMaptain);
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'flrt-helper');

  onDialogShow('treasureMapPopup', cacheFinishedMap);

  onRequest('users/useconvertible.php', addFlrtButtonToConvertible);
  onRequest('pages/friends.php', updateSendButtons);
};

/**
 * Initialize the module.
 */
export default {
  id: 'flrt-helper',
  name: 'FLRT Helper',
  type: 'feature',
  default: false,
  description: 'Add a “Return to Maptain” button when opening a chest from a map, allowing you to choose which tradable items to send directly to the Maptain.',
  load: init,
};
