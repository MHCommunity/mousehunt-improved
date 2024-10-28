const init = async () => {
  const giftButton = document.querySelector('#hgbar_freegifts');
  if (! giftButton) {
    return;
  }

  if (giftButton.getAttribute('data-gift-selector')) {
    return;
  }

  giftButton.setAttribute('data-gift-selector', true);

  giftButton.addEventListener('click', (e) => {
    e.preventDefault();

    hg.views.GiftSelectorView.show();
  });
};

export default {
  id: 'experiments.gift-button-opens-gift-selector',
  name: 'Gift button opens gift selector',
  load: init,
};
