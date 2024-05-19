import {
  addStyles,
  getCurrentPage,
  getSetting,
  onNavigation,
  onRequest
} from '@utils';

import settings from './settings';

import qtyButtons from './qty-buttons';
import qtyButtonsStyles from './qty-buttons.css';

import maxOwnedHide from './max-owned-hide.css';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Update the input field placeholder, add qty buttons, and listen for the enter key.
 */
const updateInputField = async () => {
  const purchaseBlocks = document.querySelectorAll('.itemPurchaseView-action-state.view');
  if (! purchaseBlocks) {
    return;
  }

  purchaseBlocks.forEach((block) => {
    const qty = block.querySelector('.itemPurchaseView-action-maxPurchases');
    if (! qty) {
      return;
    }

    let maxQty = qty.innerText;
    if (maxQty.includes('Inventory max')) {
      maxQty = 0;
    }

    const input = block.querySelector('input');
    if (! input) {
      return;
    }

    input.setAttribute('placeholder', maxQty);

    // listen for the enter key when the input is focused
    const buyButton = block.querySelector('.itemPurchaseView-action-form-button.buy');
    if (buyButton) {
      input.addEventListener('focus', () => {
        const enterEvt = input.addEventListener('keydown', (e) => {
          if ('Enter' === e.key) {
            buyButton.click();

            setTimeout(() => {
              const confirmButton = document.querySelector('.itemPurchaseView-container.confirmPurchase .itemPurchaseView-action-confirm-button');
              if (confirmButton) {
                confirmButton.focus();
              }
            }, 200);
          }
        });

        input.addEventListener('blur', () => {
          input.removeEventListener('keydown', enterEvt);
        });
      });
    }

    if (getSetting('better-shops.show-qty-buttons', true)) {
      qtyButtons(block, input, maxQty);
    }
  });
};

/**
 * Main function.
 */
const main = () => {
  const body = document.querySelector('body');
  if (! body) {
    return;
  }

  if ('item' === getCurrentPage()) {
    body.classList.remove('shopCustomization');
    return;
  }

  body.classList.add('shopCustomization');

  // Remove the 'Cost:' text.
  const golds = document.querySelectorAll('.itemPurchaseView-action-goldGost');
  if (golds) {
    golds.forEach((gold) => {
      gold.innerText = gold.innerText.replace('Cost:', '');
    });
  }

  // Fix the buy/sell buttons.
  const buyBtns = document.querySelectorAll('.itemPurchaseView-action-form-button.buy');
  if (buyBtns) {
    buyBtns.forEach((btn) => {
      btn.classList.add('mousehuntActionButton');
      btn.innerHTML = '<span>Buy</span>';
    });
  }

  const sellBtns = document.querySelectorAll('.itemPurchaseView-action-form-button.sell');
  if (sellBtns) {
    sellBtns.forEach((btn) => {
      btn.classList.add('mousehuntActionButton');
      btn.classList.add('lightBlue');
      btn.innerHTML = '<span>Sell</span>';
    });
  }

  updateInputField();

  const owned = document.querySelectorAll('.itemPurchaseView-action-purchaseHelper-owned');
  if (owned) {
    owned.forEach((ownedItem) => {
      if (ownedItem.getAttribute('moved-to-title')) {
        return;
      }

      // oops that's not pretty.
      const container = ownedItem.parentNode.parentNode.parentNode.parentNode.parentNode;
      const nameEl = container.querySelector('.itemPurchaseView-content-name');

      // ownedItem.innerHTML = ownedItem.innerHTML.replace('You own:', 'You have');
      ownedItem.setAttribute('moved-to-title', 'true');

      nameEl.append(ownedItem);
    });
  }

  const kingsCart = document.querySelectorAll('.itemPurchaseView-container.kingsCartItem');
  if (kingsCart) {
    kingsCart.forEach((cart) => {
      cart.querySelector('input').value = '';
    });
  }

  const shopQty = document.querySelectorAll('.itemPurchaseView-action-quantity input');
  if (! shopQty) {
    return;
  }

  shopQty.forEach((qty) => {
    qty.setAttribute('maxlength', '100');
  });

  const itemStats = document.querySelectorAll('.itemViewStatBlock');
  if (itemStats) {
    itemStats.forEach((stat) => {
      if (stat.classList.contains('horizontal')) {
        return;
      }

      const contentSection = stat.parentNode.parentNode.querySelector('.itemPurchaseView-content-container');
      if (contentSection) {
        contentSection.append(stat);
      }
    });
  }

  const itemStatsTitle = document.querySelectorAll('.itemViewStatBlock.horizontal .itemViewStatBlock-stat');
  if (itemStatsTitle) {
    itemStatsTitle.forEach((title) => {
      if (title.classList.contains('title') || title.classList.contains('powerType')) {
        const imageContainer = title.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('.itemPurchaseView-image-container');
        if (imageContainer) {
          imageContainer.append(title);
        }
      }
    });
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  const stylesToAdd = [...styles];

  if (getSetting('better-shops.hide-max-owned', false)) {
    stylesToAdd.push(maxOwnedHide);
  }

  if (getSetting('better-shops.show-qty-buttons', true)) {
    stylesToAdd.push(qtyButtonsStyles);
  }

  addStyles(stylesToAdd, 'better-shops');

  onNavigation(main, {
    page: 'shops',
  });

  onRequest('purchases/itempurchase.php', updateInputField);
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-shops',
  name: 'Better Shops',
  type: 'better',
  default: true,
  description: 'Updates the Shop layout and appearance, minimizes owned items that have an inventory limit of 1, and more.',
  load: init,
  settings,
};
