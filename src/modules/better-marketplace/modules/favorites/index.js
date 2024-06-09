import {
  addStyles,
  getSetting,
  makeElement,
  onDialogShow,
  onRequest,
  saveSetting
} from '@utils';

import styles from './styles.css';

const addToSaved = (item) => {
  const saved = getSetting('better-marketplace.favourites', []);
  saved.push(item);

  saveSetting('better-marketplace.favourites', saved);
};

const removeFromSaved = (item) => {
  const saved = getSetting('better-marketplace.favourites', []);
  const index = saved.indexOf(item);
  if (-1 === index) {
    return;
  }

  saved.splice(index, 1);
  saveSetting('better-marketplace.favourites', saved);
};

const maybeSaveFavourite = (response, request) => {
  if ('toggle_favourite' !== request.action || ! request?.item_id) {
    return;
  }

  const toggledItem = Number.parseInt(request?.item_id, 10);

  if (response.marketplace_pinned_items.includes(toggledItem)) {
    addToSaved(toggledItem);
  } else {
    removeFromSaved(toggledItem);
  }
};

const addShowFavoritesButton = () => {
  const favoritesElement = document.querySelector('.marketplaceHome-block.favourites');
  if (! favoritesElement) {
    return;
  }

  const existingButton = favoritesElement.querySelector('.show-favorites');
  if (existingButton) {
    return;
  }

  const button = makeElement('a', ['marketplaceHome-block-viewAll', 'show-favorites'], 'View All');
  button.addEventListener('click', (e) => {
    e.preventDefault();

    hg.views.MarketplaceView.updateFavouriteItems();
    hg.views.MarketplaceView.showFavouriteItems();
  });

  favoritesElement.append(button);
};

let _showHome;
const overrideMethods = () => {
  if (_showHome) {
    return;
  }

  _showHome = hg.views.MarketplaceView.showHome;
  hg.views.MarketplaceView.showHome = (...args) => {
    _showHome(...args);

    addShowFavoritesButton();
  };
};

export default async () => {
  addStyles(styles, 'better-marketplace-favorites');

  overrideMethods();

  onDialogShow('marketplace', addShowFavoritesButton);
  onRequest('users/marketplace.php', (data, request) => {
    maybeSaveFavourite(data, request);
    addShowFavoritesButton();
  });
};
