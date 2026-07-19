import { addStyles, cacheFinishedMap, createPopup, doRequest, getData, getLastMaptain, makeMhButton, onDialogShow, onRequest, waitForElement } from '@utils';

import styles from './styles.css';

/**
 * Add the "Return to Maptain" button to the convertible dialog.
 *
 * @param {Object} response The response from the request.
 */
const addFlrtButtonToConvertible = async (response) => {
  if (!response?.convertible_open?.name || !response?.convertible_open?.items) {
    return;
  }

  const items = [];

  const tradableItems = await getData('items-tradable');

  // If the tradable item data failed to load, don't filter anything out. getData returns an
  // empty object on failure, so check for an actual list rather than truthiness.
  const hasTradableData = Array.isArray(tradableItems) && tradableItems.length > 0;

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

    // Skip items that are not tradable. Check the transformed type so the Magic Essence to
    // SB conversion matches SB's tradability rather than Magic Essence's.
    if (!hasTradableData || tradableItems.some((tradableItem) => tradableItem.type === itemData.type)) {
      items.push(itemData);
    }
  }

  // Chests opened from the map screen show their loot in a treasure map dialog that the game
  // only renders after this request finishes, so wait for its action row to appear. Chests
  // opened from inventory land in the standard item popup, which is already in the DOM.
  let buttons;
  if (document.querySelector('.treasureMapDialogView-overlay.active')) {
    buttons = await waitForElement('.treasureMapDialogView.wide.acknowledge .treasureMapDialogView-actions');
  } else {
    buttons = document.querySelector('.jsDialogContainer .suffix');
  }

  if (!buttons || buttons.querySelector('.mh-improved-flrt-button')) {
    return;
  }

  // Make the button and add it to the dialog.
  const flrtButton = makeMhButton({
    element: 'button',
    text: 'Return to Maptain',
    size: 'small',
    className: ['button', 'mh-improved-flrt-button'],
    callback: () => {
      flrtPopup(items);
    },
  });

  buttons.prepend(flrtButton);
};

/**
 * Show the popup to send the items to the Maptain.
 *
 * @param {Array} items The items to send.
 */
const flrtPopup = async (items) => {
  const lastMaptain = await getLastMaptain();

  let itemContent = '';
  if (!items.length) {
    itemContent = '<div class="flrt-no-items">No tradable items were found in this chest.</div>';
  }

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
        ${lastMaptain ? '' : '<div class="flrt-hint">Enter your maptain’s hunter ID and hit Search to enable sending.</div>'}
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

  const overlay = document.querySelector('#overlayPopup.flrt-helper-popup');
  const search = overlay?.querySelector('.search-for-hunter');
  const hunterIdInput = overlay?.querySelector('.friendsPage-community-hunterIdForm-input');
  if (!overlay || !search || !hunterIdInput) {
    return;
  }

  validatedReceiver = '';

  if (lastMaptain) {
    app.pages.FriendsPage.triggerHunterForm(search);
  }

  const flrtItems = overlay.querySelectorAll('.flrt-item');

  search.addEventListener('click', () => {
    app.pages.FriendsPage.submitHunterIdForm(hunterIdInput);
  });

  hunterIdInput.addEventListener('input', () => {
    validatedReceiver = '';
    setSendButtonsEnabled(overlay, false);
  });

  flrtItems.forEach((item) => {
    const sendButton = item.querySelector('.flrt-item-send');
    if (!sendButton) {
      return;
    }

    sendButton.addEventListener('click', async () => {
      if (!validatedReceiver) {
        return;
      }

      const type = item.getAttribute('data-item-type');
      const quantity = item.getAttribute('data-item-quantity');

      if (!type || !quantity) {
        return;
      }

      item.classList.add('flrt-item-sending');

      const response = await doRequest('managers/ajax/users/supplytransfer.php', {
        item: type,
        item_quantity: quantity,
        receiver: validatedReceiver,
      });

      item.classList.remove('flrt-item-sending');

      if (response?.success) {
        item.classList.add('flrt-item-sent');
        item.classList.add('flrt-item-sent-success');
        setTimeout(() => item.classList.remove('flrt-item-sent-success'), 1500);

        sendButton.disabled = true;
        sendButton.classList.add('disabled');
        sendButton.setAttribute('data-item-sent', 'true');
      } else {
        item.classList.add('flrt-item-send-error');
        setTimeout(() => item.classList.remove('flrt-item-send-error'), 2500);
      }
    });
  });
};

let validatedReceiver = '';

/**
 * Enable or disable every unsent item button in the FLRT popup.
 *
 * @param {Element} overlay The FLRT popup.
 * @param {boolean} enabled Whether sending should be enabled.
 */
const setSendButtonsEnabled = (overlay, enabled) => {
  const flrtSendButtons = overlay.querySelectorAll('.flrt-item-send');

  flrtSendButtons.forEach((button) => {
    if ('true' === button.getAttribute('data-item-sent')) {
      return;
    }

    button.disabled = !enabled;
    button.classList.toggle('disabled', !enabled);
  });
};

/**
 * Capture the validated hunter returned by the search and update the send controls.
 *
 * @param {Object} resp The hunter search response.
 */
const updateSendButtons = (resp) => {
  const overlay = document.querySelector('#overlayPopup.flrt-helper-popup');
  if (!overlay) {
    return;
  }

  validatedReceiver = resp?.friend?.sn_user_id ? `${resp.friend.sn_user_id}` : '';

  setSendButtonsEnabled(overlay, Boolean(validatedReceiver));
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
  type: 'locations-maps-travel',
  default: false,
  description: 'Add a “Return to Maptain” button when opening a chest from a map, allowing you to choose which tradable items to send directly to the Maptain.',
  load: init,
};
