import {
  addStyles,
  getSetting,
  makeElement,
  makeMhButton,
  onDeactivation,
  onDialogShow,
  onRender,
  onRequest,
  replaceInTemplate
} from '@utils';

import settings from './settings';
import styles from './styles.css';

/**
 * Get the ignored gifts.
 *
 * @return {Array} The ignored gifts.
 */
const getIgnoredGifts = () => {
  const ignored = getSetting('better-gifts-settings.ignore-bad-gifts-0', 'skip');

  const skipOptions = {
    skip: ['mozzarella_cheese', 'stale_cheese', 'stale_cheese_craft_item'],
    'no-skip': [],
    mozzarella: ['mozzarella_cheese'],
    stale: ['stale_cheese_craft_item'],
    sludge: ['radioactive_sludge'],
    'mozzarella-stale': ['mozzarella_cheese', 'stale_cheese_craft_item'],
    'mozzarella-sludge': ['mozzarella_cheese', 'radioactive_sludge'],
    'stale-sludge': ['stale_cheese_craft_item', 'radioactive_sludge'],
  };

  return skipOptions[ignored] || skipOptions.skip;
};

/**
 * Claim all the gifts.
 *
 * @param {boolean} send    Whether to send the gifts.
 * @param {number}  retries The number of retries.
 *
 * @return {boolean} Whether the gifts were claimed.
 */
const claimGifts = async (send = false, retries = 0) => {
  // First, show the gift selector.
  hg.views.GiftSelectorView.show();

  const isLoaded = document.querySelector('.giftSelectorView-tabContent.active .giftSelectorView-friendRow');
  if (! isLoaded) {
    if (retries <= 10) {
      setTimeout(claimGifts, 250, send, retries + 1);
    }

    return;
  }

  let gifts = hg.views.GiftSelectorView.getClaimableGiftsSortedByTime();
  if (getSetting('better-gifts.send-order-0', 'default') === 'reverse') {
    gifts.reverse();
  }

  const ignoredGifts = getIgnoredGifts();

  let sendLimit = hg.views.GiftSelectorView.getNumSendableActionsRemaining();
  let claimLimit = hg.views.GiftSelectorView.getNumClaimableActionsRemaining();

  // remove all the gifts that don't have the channel of "gift" and the ones that are ignored.
  gifts = gifts.filter((gift) => {
    if (gift.channel !== 'gift') {
      return false;
    }

    if (ignoredGifts.includes(gift.item_type)) {
      return false;
    }

    return true;
  });

  for (const gift of gifts) {
    const verb = send && sendLimit > 0 && gift.is_returnable ? 'return' : 'claim';

    const giftEl = document.querySelector(`.giftSelectorView-friendRow[data-gift-id="${gift.gift_id}"] .giftSelectorView-friendRow-action.${verb}`);
    if (! giftEl) {
      continue;
    }

    const event = { target: giftEl };
    if (send && 'return' === verb && sendLimit > 0) {
      hg.views.GiftSelectorView.selectReturnableGift(event, giftEl);
      sendLimit--;
      claimLimit--;
    } else if (! send && 'claim' === verb && claimLimit > 0) {
      hg.views.GiftSelectorView.selectClaimableGift(giftEl);
      claimLimit--;
    }
  }

  setTimeout(() => {
    // hit the confirm button.
    const confirm = document.querySelector('.mousehuntActionButton.giftSelectorView-action-confirm.small');
    if (confirm) {
      setTimeout(() => hg.views.GiftSelectorView.submitConfirm(), 250, confirm);
    }
  }, 500);
};

/**
 * Make the Accept button.
 *
 * @param {HTMLElement} buttonContainer The container for the buttons.
 * @param {boolean}     isTiny          Whether the buttons are tiny or not.
 */
const makeAcceptButton = (buttonContainer, isTiny = false) => {
  const acceptButton = makeMhButton({
    element: 'button',
    text: 'Accept All',
    size: isTiny ? 'tiny' : 'small',
    className: ['mh-gift-button', 'mh-gift-buttons-accept'],
    appendTo: buttonContainer,
  });

  const acceptLimit = document.querySelector('.giftSelectorView-numClaimActionsRemaining');
  if (acceptLimit && acceptLimit.innerText === '0') {
    acceptButton.classList.add('disabled');
  } else {
    acceptButton.addEventListener('click', () => {
      claimGifts();
    });
  }
};

/**
 * Make the return button.
 *
 * @param {HTMLElement} buttonContainer The container for the buttons.
 * @param {boolean}     isTiny          Whether the buttons are tiny or not.
 */
const makeReturnButton = (buttonContainer, isTiny = false) => {
  const returnWrapper = makeElement('div', 'mh-gift-buttons-return-wrapper');
  const returnButton = makeMhButton({
    element: 'button',
    text: 'Accept & Return All',
    size: isTiny ? 'tiny' : 'small',
    className: ['mh-gift-button', 'mh-gift-buttons-return'],
    appendTo: returnWrapper,
  });

  const returnLimit = document.querySelector('.giftSelectorView-numSendActionsRemaining');
  if (returnLimit && returnLimit.innerText === '0') {
    returnButton.classList.add('disabled');
  } else {
    returnButton.addEventListener('click', () => {
      claimGifts(true);
    });
  }

  buttonContainer.append(returnWrapper);
};

/**
 * Fix typos in the gift selector.
 */
const fixTypo = () => {
  onRender({
    group: 'GiftSelectorView',
    callback: (data, results) => {
      return results
        .replaceAll('You can send 1 free gifts', 'You can send 1 free gift')
        .replaceAll('<b>1</b> free gifts', '<b>1</b> free gift');
    }
  });
};

const addCloseButtonToConfirmPopup = (resp, req) => {
  if ('claim_and_send' !== req.action) {
    return;
  }

  const confirmTitle = document.querySelector('.giftSelectorView-confirmPopup-title');
  if (! confirmTitle) {
    return;
  }

  const closeButton = makeElement('a', 'giftSelectorView-confirmPopup-submitCloseButton', '✕');
  closeButton.addEventListener('click', () => {
    hg.views.GiftSelectorView.submitConfirm(closeButton);
  });

  confirmTitle.append(closeButton);
};

/**
 * Add a line break to the gift footer.
 */
const lineBreakGiftFooter = () => {
  replaceInTemplate('GiftSelectorView', [
    [
      'more free gifts today. You can',
      'more free gifts today. <p class="mh-ui-footer-gifts-second-line">You can',
    ],
    [
      'class="giftSelectorView-inboxHeader-closeButton" onclick="hg.views.GiftSelectorView.hideInbox(); return false;">Close</a>',
      'class="giftSelectorView-inboxHeader-closeButton" onclick="hg.views.GiftSelectorView.hideInbox(); return false;">✕</a>',
    ],
  ]);
};

/**
 * Get the buttons for the gift selector.
 *
 * @param {string}  className The class name for the buttons.
 * @param {boolean} isTiny    Whether the buttons are tiny or not.
 *
 * @return {HTMLElement} The button container.
 */
const getButtons = (className = false, isTiny = false) => {
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'bulk-gifting-gift-buttons';
  if (className) {
    buttonContainer.classList.add(className);
  }

  makeAcceptButton(buttonContainer, isTiny);
  makeReturnButton(buttonContainer, isTiny);

  return buttonContainer;
};

/**
 * Make the buttons and add them to the page.
 */
const makeButtons = () => {
  if (document.querySelector('#bulk-gifting-gift-buttons')) {
    return;
  }

  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'bulk-gifting-gift-buttons';

  makeAcceptButton(buttonContainer);
  makeReturnButton(buttonContainer);

  // Add the buttons to the page.
  const giftFooter = document.querySelector('.giftSelectorView-inbox-footer');
  if (giftFooter && giftFooter.firstChild) {
    giftFooter.insertBefore(buttonContainer, giftFooter.firstChild);
  }
};

/**
 * Get the limit for sending gifts.
 *
 * @return {number} The limit.
 */
const getLimit = () => {
  const limitEl = document.querySelector('.giftSelectorView-tabContent.active .giftSelectorView-actionLimit.giftSelectorView-numSendActionsRemaining');
  return limitEl ? Number.parseInt(limitEl.innerText, 10) : 0;
};

/**
 * Pick friends to send gifts to.
 *
 * @param {Array}   friends   The friends to pick from.
 * @param {boolean} useRandom Whether to use random selection.
 */
const pickFriends = (friends, useRandom = true) => {
  const selected = [];
  let sent = 0;

  // fake the first "random" selection to be in the first 35 friends so that
  // you can see that it's working.
  if (useRandom) {
    const bound = friends.length > 35 ? 35 : friends.length;
    const firstRandom = Math.floor(Math.random() * bound);
    selected.push(firstRandom);
    sent++;
  }

  let limit = getLimit();
  while (sent < limit) {
    if (selected.length >= friends.length) {
      break;
    }

    if (useRandom) {
      const random = Math.floor(Math.random() * friends.length);
      if (selected.includes(random)) {
        continue;
      }

      selected.push(random);
    } else {
      selected.push(sent);
    }

    sent++;
    limit = getLimit();
  }

  selected.forEach((index) => {
    friends[index].click();
  });

  if (getLimit() < 1) {
    const buttons = document.querySelectorAll('.mh-gift-buttons');
    buttons.forEach((button) => {
      button.classList.add('disabled');
    });
  }
};

/**
 * Add the send buttons to the gift selector.
 *
 * @param {string}      className       The class name for the button.
 * @param {string}      text            The button text.
 * @param {string}      selector        The selector for the friends.
 * @param {HTMLElement} buttonContainer The container for the buttons.
 */
const addSendButton = (className, text, selector, buttonContainer) => {
  const existing = document.querySelector(`.mh-gift-buttons-send-${className}`);
  if (existing) {
    existing.remove();
  }

  const sendButton = makeMhButton({
    element: 'button',
    text,
    className: ['mh-gift-buttons', `mh-gift-buttons-send-${className}`],
    appendTo: buttonContainer,
  });

  if (getLimit() < 1) {
    sendButton.classList.add('disabled');
  }

  sendButton.addEventListener('click', (event) => {
    const friends = document.querySelectorAll(selector);
    if (! friends.length) {
      return;
    }

    if (event.target.classList.contains('disabled')) {
      const selectedFriends = document.querySelectorAll('.giftSelectorView-friend.selected');
      selectedFriends.forEach((friend) => {
        friend.click();
      });

      const buttons = document.querySelectorAll('.mh-gift-buttons.disabled');
      buttons.forEach((button) => {
        button.classList.remove('disabled');
      });

      return;
    }

    if ('faves' === className) {
      pickFriends(friends, false);
    } else {
      pickFriends(friends);
    }
  });
};

/**
 * Add the random send button to the gift selector.
 */
const addRandomSendButton = () => {
  const _selectGift = hg.views.GiftSelectorView.selectGift;

  /**
   * Select a gift.
   *
   * @param {Object} gift The gift to select.
   *
   * @return {boolean} Returns true if the gift is successfully selected, false otherwise.
   */
  hg.views.GiftSelectorView.selectGift = (gift) => {
    _selectGift(gift);

    const title = document.querySelector('.giftSelectorView-tabContent.active .selectFriends .giftSelectorView-content-title');
    if (! title) {
      return false;
    }

    addSendButton('random', 'Select Random Friends', '.giftSelectorView-tabContent.active .giftSelectorView-friend:not(.disabled, .selected)', title);
    addSendButton('faves', 'Select Frequent Gifters', '.giftSelectorView-tabContent.active .giftSelectorView-friend-group.favorite .giftSelectorView-friend:not(.disabled, .selected)', title);

    return true;
  };
};

let _showTab;
let _selectGift;
let _updateGiftMultiplierQuantity;

/**
 * Add the gift switcher to the gift selector.
 */
const addGiftSwitcher = () => {
  if (_showTab || _selectGift || _updateGiftMultiplierQuantity) {
    return;
  }

  _showTab = hg.views.GiftSelectorView.showTab;
  _selectGift = hg.views.GiftSelectorView.selectGift;
  _updateGiftMultiplierQuantity = hg.views.GiftSelectorView.updateGiftMultiplierQuantity;

  /**
   * Show a tab in the gift selector.
   *
   * @param {string}  tabType           The type of tab to show.
   * @param {string}  viewState         The view state to show.
   * @param {boolean} preserveVariables Whether to preserve the variables.
   * @param {boolean} preserveActions   Whether to preserve the actions.
   */
  hg.views.GiftSelectorView.showTab = (tabType, viewState, preserveVariables, preserveActions) => {
    _showTab.call(hg.views.GiftSelectorView, tabType, viewState, preserveVariables, preserveActions);

    /**
     * Update the gift multiplier quantity.
     *
     * @param {HTMLElement} input The input element.
     *
     * @return {boolean} Returns true if the quantity was updated, false otherwise.
     */
    hg.views.GiftSelectorView.updateGiftMultiplierQuantity = (input) => {
      // Remove the maxlength attribute so that we can send more than 99 gifts.
      if (input && input.hasAttribute('maxlength')) {
        input.removeAttribute('maxlength');
      }

      return _updateGiftMultiplierQuantity.call(hg.views.GiftSelectorView, input);
    };

    /**
     * Clone the nodes and wait until the selectGift function is called and
     * then we append the cloned nodes to the gift container.
     *
     * @param {Object} gift The gift to select.
     *
     * @return {boolean} Returns true if the gift was selected, false otherwise.
     */
    hg.views.GiftSelectorView.selectGift = (gift) => {
      _selectGift.call(hg.views.GiftSelectorView, gift);

      const giftContainer = document.querySelector('.giftSelectorView-tabContent.active.selectFriends .giftSelectorView-content-leftBar');
      if (! giftContainer) {
        return false;
      }

      const existing = document.querySelector('.mh-gift-buttons-clone-wrapper');
      if (existing) {
        existing.remove();
      }

      const giftType = tabType === 'send_free_gifts' ? 'gift' : 'paidgift';

      const gifts = document.querySelectorAll(`.active .selectGift .giftSelectorView-scroller.giftSelectorView-giftContainer .giftSelectorView-gift.sendable.${giftType}`);
      if (! gifts.length) {
        return false;
      }

      const cloneWrapper = makeElement('div', 'mh-gift-buttons-clone-wrapper');

      gifts.forEach((toClone) => {
        const clone = toClone.cloneNode(true);
        const giftWrap = makeElement('div', 'giftSelectorView-content-leftBar-highlightBlock');
        giftWrap.append(clone);

        giftWrap.addEventListener('click', () => {
          const prevSelected = document.querySelectorAll('.mh-gift-buttons-clone-selected');
          prevSelected.forEach((el) => {
            el.classList.remove('mh-gift-buttons-clone-selected');
          });

          giftWrap.classList.add('mh-gift-buttons-clone-selected');
        });

        cloneWrapper.append(giftWrap);
      });

      giftContainer.append(cloneWrapper);

      return true;
    };
  };
};

/**
 * Add the buttons to the dropdown.
 */
const addButtonsToDropdown = () => {
  const buttonLink = document.querySelector('#hgbar_freegifts');
  if (! buttonLink) {
    return;
  }

  buttonLink.addEventListener('click', () => {
    makeButtons();
  });
};

/**
 * Add the buttons to the gift popup.
 */
const addButtonsToPopup = () => {
  const actionRow = document.querySelector('.giftSelectorView-tabContentContainer .giftSelectorView-tabContent.active .giftSelectorView-actionContainer');
  if (! actionRow) {
    return;
  }

  const existing = document.querySelector('.mh-gift-buttons-send-popup');
  if (existing) {
    existing.remove();
  }

  const buttons = getButtons('mh-gift-buttons-send-popup', true);
  actionRow.insertBefore(buttons, actionRow.firstChild);
};

/**
 * Main function.
 */
const main = () => {
  onRequest('users/socialGift.php', makeButtons);

  addButtonsToDropdown();
  onDialogShow('giftSelectorViewPopup', addButtonsToPopup);

  addRandomSendButton();
  addGiftSwitcher();
  fixTypo();
  lineBreakGiftFooter();

  onRequest('users/socialGift.php', addCloseButtonToConfirmPopup);
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'better-gifts');
  main();

  onDeactivation('better-gifts', () => {
    const buttons = document.querySelectorAll('.mh-gift-buttons');
    buttons.forEach((button) => {
      button.remove();
    });
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-gifts',
  name: 'Better Gifts',
  type: 'better',
  default: true,
  description: 'Quickly accept and return all your gifts, and pick random friends to send to.',
  load: init,
  settings,
};
