import { makeElement, makeMathButtons, makeMhButton } from '@utils';

/**
 * Add quantity buttons to the shop.
 *
 * @param {Element} block  The shop block.
 * @param {Element} input  The input field.
 * @param {number}  maxQty The most that can be afforded, used by the Max button.
 * @param {number}  limit  The purchase limit for the +/- buttons, so costs can be previewed past what's affordable.
 */
export default async (block, input, maxQty, limit = Infinity) => {
  // if max qty has a comma, remove it
  maxQty = `${maxQty}`.replaceAll(',', '');

  // Only rebuild the buttons if the max changed, since each math button adds window listeners.
  const existingButtons = block.querySelector('.mh-improved-shop-buy-controls');
  if (existingButtons) {
    if (existingButtons.dataset.maxQty === maxQty && existingButtons.dataset.limit === `${limit}`) {
      return;
    }

    existingButtons.remove();
  }

  const buyControls = makeElement('div', ['mh-improved-shop-buy-controls']);
  buyControls.dataset.maxQty = maxQty;
  buyControls.dataset.limit = `${limit}`;

  makeMathButtons([1, 10, 50, 100, 1000], {
    appendTo: buyControls,
    input,
    maxQty: Number(limit),
    classNames: ['mh-improved-shop-qty', 'tiny', 'lightBlue'],
  });

  const buyMaxButton = makeMhButton({
    text: 'Max',
    size: 'tiny',
    className: ['mh-improved-shop-buy-max', 'lightBlue'],
    appendTo: buyControls,
  });

  let hasMaxed = false;
  const buyMaxButtonText = buyMaxButton.querySelector('span') || buyMaxButton;
  buyMaxButton.addEventListener('click', () => {
    if (hasMaxed) {
      input.value = 0;
      buyMaxButtonText.textContent = 'Max';
    } else {
      input.value = maxQty;
      buyMaxButtonText.textContent = 'Reset';
    }

    hasMaxed = !hasMaxed;

    // Let the game know the quantity changed.
    input.dispatchEvent(new Event('keyup'));
  });

  // Find the closest parent element with the class 'itemPurchaseView-action-form' and append the buyControls to it.
  const form = block.querySelector('.itemPurchaseView-action-form');
  if (form) {
    form.append(buyControls);
  } else {
    block.append(buyControls);
  }
};
