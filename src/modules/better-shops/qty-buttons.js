import { makeElement } from '@utils';

export default async (block, input, maxQty) => {
  const existingButtons = block.querySelector('.mh-improved-shop-buy-controls');
  if (existingButtons) {
    return;
  }

  // if max qty has a comma, remove it
  maxQty = `${maxQty}`.replaceAll(',', '');

  const buyControls = makeElement('div', ['mh-improved-shop-buy-controls']);

  const makeMathButton = (amount) => {
    const button = makeElement('a', ['mousehuntActionButton', 'tiny', 'gray', 'mh-improved-shop-qty']);
    makeElement('span', '', amount > 0 ? `+${amount}` : amount, button);
    button.addEventListener('click', () => {
      let current = Number.parseInt(input.value, 10);
      if (Number.isNaN(current)) {
        current = 0;
      }

      if (current + amount >= maxQty) {
        input.value = maxQty;
      } else if (current + amount <= 0) {
        input.value = 0;
      } else {
        input.value = current + amount;
      }
    });

    buyControls.append(button);
  };

  makeMathButton(-10);
  makeMathButton(-5);
  makeMathButton(-1);
  makeMathButton(1);
  makeMathButton(5);
  makeMathButton(10);

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
