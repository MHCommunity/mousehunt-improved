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
    const showGiftSelector = hg?.views?.GiftSelectorView?.show;
    if (typeof showGiftSelector !== 'function') {
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();

    showGiftSelector.call(hg.views.GiftSelectorView);
  });
};

export default {
  id: 'experiments.gift-button-opens-gift-selector',
  name: 'Gift button opens gift selector',
  description: 'Clicking the "Gifts" button in the top menu will directly open the gift selector.',
  load: init,
};
