import { debug, getCurrentLocation, getSetting, makeElement, saveSetting } from '@utils';

/**
 * Update the shops markup.
 *
 * @param {Document|Element} root The shops root or document.
 */
const updateShopsMarkup = async (root = document) => {
  const shopsNodeList = root.querySelectorAll('.treasureMapShopsView-shopItems .treasureMapPopup-shop');
  if (!shopsNodeList.length) {
    return;
  }

  let shops = [...shopsNodeList];

  const getPinnedShops = getSetting('better-maps.pinned-shops', []);

  shops.sort((aEl, bEl) => {
    const a = aEl.querySelector('.treasureMapPopup-shop-environment');
    if (!a) {
      return 1;
    }

    const b = bEl.querySelector('.treasureMapPopup-shop-environment');
    if (!b) {
      return -1;
    }

    const aEnv = a.getAttribute('data-environment-type') || '';
    const bEnv = b.getAttribute('data-environment-type') || '';

    const aPinned = getPinnedShops.includes(aEnv);
    const bPinned = getPinnedShops.includes(bEnv);

    if (aPinned && !bPinned) {
      return -1; // a is pinned, b is not
    }

    if (!aPinned && bPinned) {
      return 1; // b is pinned, a is not
    }

    const aName = a.textContent.trim().toLowerCase();
    const bName = b.textContent.trim().toLowerCase();
    return aName.localeCompare(bName);
  });

  const currentLocation = getCurrentLocation();
  shops = shops.sort((shop) => {
    const environmentType = shop.querySelector('.treasureMapPopup-shop-environment').getAttribute('data-environment-type') || '';
    if (environmentType === currentLocation) {
      shop.classList.add('current-location');
      return -1;
    }
    return environmentType === currentLocation ? -1 : 0;
  });

  const shopContainer = root.querySelector('.treasureMapShopsView-shopItems');
  while (shopContainer.firstChild) {
    shopContainer.firstChild.remove();
  }

  shops.forEach((shop) => {
    shopContainer.append(shop);

    const environmentEl = shop.querySelector('.treasureMapPopup-shop-environment');
    if (!environmentEl) {
      return;
    }

    const heading = environmentEl.querySelector('.treasureMapView-block-content-heading');
    if (!heading) {
      return;
    }

    const container = environmentEl.querySelector('.treasureMapPopup-shop-environmentItems');
    if (!container) {
      return;
    }

    if (!environmentEl.classList.contains('active')) {
      container.classList.add('hidden');
    }

    const existingPin = heading.querySelector('.treasureMapPopup-shop-pinIcon');
    if (existingPin) {
      return;
    }

    heading.addEventListener('click', () => {
      container.classList.toggle('hidden');
    });

    const pinIconWrapper = makeElement('div', ['treasureMapPopup-shop-pinIcon', 'mousehuntTooltipParent']);
    pinIconWrapper.title = 'Pin this shop';
    const environmentType = environmentEl.getAttribute('data-environment-type') || '';

    if (getPinnedShops.includes(environmentType)) {
      pinIconWrapper.classList.add('pinned');
      shop.classList.add('pinned');
      pinIconWrapper.title = 'Unpin this shop';
    }

    pinIconWrapper.addEventListener('click', () => {
      const pinnedShops = getSetting('better-maps.pinned-shops', []);
      if (pinnedShops.includes(environmentType)) {
        pinIconWrapper.classList.remove('pinned');
        shop.classList.remove('pinned');
        const index = pinnedShops.indexOf(environmentType);
        if (index > -1) {
          pinnedShops.splice(index, 1);
        }
      } else {
        pinIconWrapper.classList.add('pinned');
        shop.classList.add('pinned');
        pinnedShops.push(environmentType);
      }
      debug('Toggle pin for shop', environmentType, pinnedShops);
      saveSetting('better-maps.pinned-shops', pinnedShops);
      hg.controllers.TreasureMapController.showShops();
    });

    heading.append(pinIconWrapper);
  });

  const lastPinned = root.querySelectorAll('.treasureMapShopsView-shopItems .treasureMapPopup-shop.pinned');
  if (lastPinned.length) {
    const lastPinnedEl = lastPinned[lastPinned.length - 1]; // eslint-disable-line unicorn/prefer-at
    lastPinnedEl.classList.add('last-pinned');
  }
};

export { updateShopsMarkup };
