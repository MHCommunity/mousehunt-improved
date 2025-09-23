import { addStyles, doRequest, makeElement, makeMhButton } from '@utils';
import styles from './styles.css';

/**
 * Add crafting buttons to the baits.
 *
 * @param {Object} options           Configuration for crafting buttons.
 * @param {Object} options.baits     Configuration for each bait type.
 * @param {Object} options.selectors CSS selectors for bait elements.
 */
const addCraftingButtons = async ({ baits, selectors }) => {
  addStyles(styles, 'location-huds-shared-crafting-buttons');

  const baitContainers = document.querySelectorAll(selectors.baits);
  if (! baitContainers) {
    return;
  }

  /**
   * Purchase bait from the shop.
   *
   * @param {string}  shopItem The shop item to purchase.
   * @param {number}  quantity The quantity to purchase.
   * @param {Element} popup    The popup element.
   * @return {boolean} True if the purchase was successful.
   */
  const purchaseBait = async (shopItem, quantity, popup) => {
    popup.classList.add('loading');

    const results = await doRequest('managers/ajax/purchases/itempurchase.php', {
      type: shopItem,
      quantity,
      buy: 1,
      is_kings_cart_item: 0,
    });

    popup.classList.remove('loading');
    if (! results?.success) {
      popup.classList.add('error');
      setTimeout(() => popup.classList.remove('error'), 1000);
      return false;
    }

    const updatedQuantities = {
      ...Object.fromEntries(Object.entries(results.inventory || {}).map(([key, val]) => [key, val.quantity])),
      ...Object.fromEntries(Object.entries(results.items || {}).map(([key, val]) => [key, val.num_owned])),
    };

    baitContainers.forEach((container) => {
      const baitQuantity = container.querySelector(selectors.baitQuantity);
      if (baitQuantity) {
        const baitType = baitQuantity.getAttribute('data-item-type');
        if (baitType && updatedQuantities[baitType]) {
          baitQuantity.innerText = updatedQuantities[baitType].toLocaleString();
        }
      }

      const craftQuantity = container.querySelector(selectors.baitCraftQty);
      if (craftQuantity) {
        const craftType = craftQuantity.getAttribute('data-item-type');
        if (craftType && updatedQuantities[craftType]) {
          craftQuantity.innerText = updatedQuantities[craftType].toLocaleString();
        }
      }

      if (selectors.baitBuyButton) {
        const buyButton = container.querySelector(selectors.baitBuyButton);
        if (buyButton) {
          if (buyButton.classList.contains('disabled')) {
            buyButton.classList.add('disabled');
          } else {
            buyButton.classList.remove('disabled');
          }
        }
      }
    });

    popup.classList.add('success');
    setTimeout(() => popup.classList.remove('success'), 1000);
    return true;
  };

  baitContainers.forEach((container) => {
    const quantityElement = container.querySelector(selectors.baitQuantity);
    if (! quantityElement || container.querySelector('.mh-crafting-popup')) {
      return;
    }

    quantityElement.classList.add('mousehuntTooltipParent', 'mh-crafting-popup-parent');
    const popup = makeElement('div', ['mh-crafting-popup']);
    const actions = makeElement('div', 'mh-crafting-actions');
    const baitType = container.getAttribute('data-item-type');

    if (baits[baitType]) {
      const { amounts, shop, shopNormal } = baits[baitType];
      amounts.forEach((amount) => {
        const isNormal = amount.toString().includes('-normal');
        const qty = isNormal ? Number.parseInt(amount.replace('-normal', ''), 10) : amount / 2;
        const className = isNormal ? 'mh-crafting-action' : 'mh-crafting-action lightBlue';
        const title = `Craft ${qty}${isNormal ? '' : ' using Magic Essence'}`;
        const shopItem = isNormal ? shopNormal : shop;

        const button = makeMhButton({
          text: `Craft ${qty}`,
          className,
          title,
          callback: () => purchaseBait(shopItem, qty, popup),
          appendTo: actions,
        });

        if (selectors.baitBuyButton) {
          const buyButton = container.querySelector(selectors.baitBuyButton);
          if (buyButton && buyButton.classList.contains('disabled')) {
            button.classList.add('disabled');
          }
        }
      });
    }

    popup.append(actions);

    const existingTooltip = container.querySelector('.mousehuntTooltip');
    if (existingTooltip) {
      existingTooltip.classList.remove('noEvents');
      existingTooltip.insertBefore(popup, existingTooltip.lastChild);
    } else {
      popup.classList.add('mousehuntTooltip', 'tight', 'top');
      container.append(popup);
    }
  });
};

export default addCraftingButtons;
