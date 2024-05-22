import { getCurrentLocation, makeElement, onRequest } from '@utils';

const addMHCTLink = (action, scrollType) => {
  const miceLink = makeElement('a', 'map-link', 'Mice List');
  // TODO: convert the scrollType to the MHCT numeric ID.
  miceLink.href = `https://mhct.win/mapper.php?item=${scrollType}`;
  miceLink.target = '_blank';
  miceLink.rel = 'noopener noreferrer';

  action.appendChild(miceLink);
  action.classList.add('has-link');
};

/**
 * Update the shops markup.
 */
const updateShopsMarkup = async () => {
  const shopsNodeList = document.querySelectorAll('.treasureMapShopsView-shopItems .treasureMapPopup-shop');
  if (!shopsNodeList.length) {
    return;
  }

  let shops = Array.from(shopsNodeList);

  shops.sort((a, b) => {
    const aName = a.querySelector('.treasureMapPopup-shop-environment').textContent.trim().toLowerCase();
    const bName = b.querySelector('.treasureMapPopup-shop-environment').textContent.trim().toLowerCase();
    return aName.localeCompare(bName);
  });

  const currentLocation = getCurrentLocation();
  shops = shops.sort((shop) => {
    const environmentType = shop.querySelector('.treasureMapPopup-shop-environment').getAttribute('data-environment-type') || '';
    return environmentType === currentLocation ? -1 : 0;
  });

  const shopContainer = document.querySelector('.treasureMapShopsView-shopItems');
  while (shopContainer.firstChild) {
    shopContainer.removeChild(shopContainer.firstChild);
  }

  shops.forEach((shop) => {
    shopContainer.appendChild(shop);

    const environmentEl = shop.querySelector('.treasureMapPopup-shop-environment');
    if (! environmentEl) {
      return;
    }

    const heading = environmentEl.querySelector('.treasureMapView-block-content-heading');
    if (! heading) {
      return;
    }

    const container = environmentEl.querySelector('.treasureMapPopup-shop-environmentItems');
    if (! container) {
      return;
    }

    if (! environmentEl.classList.contains('active')) {
      container.classList.add('hidden');
    }

    heading.addEventListener('click', () => {
      container.classList.toggle('hidden');
    });

    const scrolls = container.querySelectorAll('.treasureMapInventoryView-scrollCase');
    if (! scrolls.length) {
      return;
    }

    scrolls.forEach((scroll) => {
      const action = scroll.querySelector('.treasureMapInventoryView-scrollCase-action');
      if (! action) {
        return;
      }

      const button = action.querySelector('.mousehuntActionButton');
      if (! button) {
        return;
      }

      const mapType = button.getAttribute('data-item-type');
      if (! mapType) {
        return;
      }

      addMHCTLink(action, mapType);
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
