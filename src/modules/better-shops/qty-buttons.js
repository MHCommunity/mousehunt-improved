import { makeElement, makeMathButtons } from '@utils';

export default async (block, input, maxQty) => {
  const existingButtons = block.querySelector('.mh-improved-shop-buy-controls');
  if (existingButtons) {
    return;
  }

  // if max qty has a comma, remove it
  maxQty = `${maxQty}`.replaceAll(',', '');

  const buyControls = makeElement('div', ['mh-improved-shop-buy-controls']);

  makeMathButtons([1, 10, 50, 100, 1000], {
    appendTo: buyControls,
    input,
    maxQty,
    classNames: ['mh-improved-shop-qty', 'tiny', 'gray'],
  });

  const buyMaxButton = makeElement('a', ['mousehuntActionButton', 'lightBlue', 'tiny', 'mh-improved-shop-buy-max']);
  const buyMaxButtonText = makeElement('span', '', 'Max');
  buyMaxButton.append(buyMaxButtonText);

  let hasMaxed = false;
  buyMaxButton.addEventListener('click', () => {
    if (hasMaxed) {
      input.value = 0;
      buyMaxButtonText.innerText = 'Max';
    } else {
      input.value = maxQty;
      buyMaxButtonText.innerText = 'Reset';
    }

    hasMaxed = ! hasMaxed;
  });

  buyControls.append(buyMaxButton);

  // Find the closest parent element with the class 'itemPurchaseView-action-form' and append the buyControls to it.
  const form = block.querySelector('.itemPurchaseView-action-form');
  if (form) {
    form.append(buyControls);
  } else {
    block.append(buyControls);
  }
};
