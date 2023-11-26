import {
  addUIStyles,
  getCurrentPage,
  onNavigation,
  onRequest
} from '../utils';

import styles from './styles.css';

const updatePlaceholderText = () => {
  const purchaseBlocks = document.querySelectorAll('.itemPurchaseView-action-state.view');
  if (purchaseBlocks) {
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

      // maxQty = parseInt(maxQty) ? parseInt(maxQty) + 1 : 0;

      input.setAttribute('placeholder', maxQty);
    });
  }
};

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

  updatePlaceholderText();

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

      nameEl.appendChild(ownedItem);
    });
  }

  const kingsCart = document.querySelectorAll('.itemPurchaseView-container.kingsCartItem');
  if (kingsCart) {
    kingsCart.forEach((cart) => {
      // cart.classList.remove('kingsCartItem');
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
        contentSection.appendChild(stat);
      }
    });
  }

  const itemStatsTitle = document.querySelectorAll('.itemViewStatBlock.horizontal .itemViewStatBlock-stat');
  if (itemStatsTitle) {
    itemStatsTitle.forEach((title) => {
      if (title.classList.contains('title') || title.classList.contains('powerType')) {
        const imageContainer = title.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('.itemPurchaseView-image-container');
        if (imageContainer) {
          imageContainer.appendChild(title);
        }
      }
    });
  }
};

export default () => {
  addUIStyles(styles);

  onNavigation(main, {
    page: 'shops'
  });

  onRequest(updatePlaceholderText, 'managers/ajax/purchases/itempurchase.php');
};
