import { onRequest } from '@utils';

/**
 * Update the shops markup.
 */
const updateShopsMarkup = async () => {
  const shops = document.querySelectorAll('.treasureMapShopsView-shopItems .treasureMapPopup-shop');
  if (! shops.length) {
    return;
  }

  shops.forEach((shop) => {
    const environment = shop.querySelector('.treasureMapPopup-shop-environment');
    if (! environment) {
      return;
    }

    const heading = environment.querySelector('.treasureMapView-block-content-heading');
    if (! heading) {
      return;
    }

    const container = environment.querySelector('.treasureMapPopup-shop-environmentItems');
    if (! container) {
      return;
    }

    if (! environment.classList.contains('active')) {
      container.classList.add('hidden');
    }

    heading.addEventListener('click', () => {
      container.classList.toggle('hidden');
    });
  });
};

/**
 * Update the shops markup from a click.
 */
const updateFromClick = async () => {
  const _showShops = hg.controllers.TreasureMapController.showShops;

  /**
   * Show the shops.
   *
   * @param {Object} data The data.
   */
  hg.controllers.TreasureMapController.showShops = (data) => {
    _showShops(data);
    updateShopsMarkup();
  };
};

/**
 * Update the shops from a request.
 *
 * @param {Object} response The response.
 * @param {Object} data     The data.
 */
const updateFromRequest = (response, data) => {
  if (data?.action !== 'get_shops') {
    return;
  }

  updateShopsMarkup();
};

/**
 * Initialize the module.
 */
export default async () => {
  updateFromClick();
  onRequest('users/treasuremap.php', updateFromRequest);
};
