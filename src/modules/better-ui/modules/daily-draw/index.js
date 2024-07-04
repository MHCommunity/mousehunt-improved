import { doRequest, onNavigation } from '@utils';

let _original = null;
const updateDailyDrawForm = () => {
  if (_original) {
    return;
  }

  const form = document.querySelector('#ballotPurchaseForm');
  if (! form) {
    return;
  }

  const originalSubmit = form.querySelector('#ballotConfirm input');
  if (! originalSubmit) {
    return;
  }

  originalSubmit.addEventListener('click', async (event) => {
    event.preventDefault();

    let dact = 'bb';
    const dactEl = form.querySelector('input[name="dact"]');
    if (dactEl) {
      dact = dactEl.value;
    }

    let uh = user.unique_hash || '';
    const uhEl = form.querySelector('input[name="uh"]');
    if (uhEl) {
      uh = uhEl.value;
    }

    let price = '1000';
    const priceEl = form.querySelector('input[name="ballot_price"]');
    if (priceEl) {
      price = priceEl.value;
    }

    let qty = '1';
    const amountEl = form.querySelector('input[name="qty"]');
    if (amountEl) {
      qty = amountEl.value;
    }

    originalSubmit.classList.add('mh-improved-disabled');

    await doRequest('draw.php', {
      dact,
      uh,
      ballot_price: price,
      qty,
    }, true, {
      skipAll: true,
      skipJson: true,
    });

    // Reload the page to reset all the things.
    window.location.reload();
  });

  _original = app.pages.DrawPage.submitPurchase;

  // No-op the original function.
  app.pages.DrawPage.submitPurchase = () => {};
};

export default async () => {
  onNavigation(updateDailyDrawForm, {
    page: 'draw',
  });
};
