import {
  addStyles,
  dbGet,
  dbSet,
  debounce,
  makeElement,
  onEvent,
  onNavigation,
  onRequest
} from '@utils';

import styles from './styles.css';

const skinImages = {};
let isAdding = false;
const addSkinImages = async (panel, force = false) => {
  if ('item_browser' !== panel) {
    return;
  }

  if (isAdding) {
    return;
  }

  isAdding = true;

  const blueprint = document.querySelector('.trapSelectorView__blueprint--active .trapSelectorView__browserStateParent');
  if (! blueprint) {
    isAdding = false;
    return;
  }

  if (! force) {
    const type = blueprint.getAttribute('data-blueprint-type');
    if (! type || type !== 'skin') {
      isAdding = false;
      return;
    }
  }

  const items = document.querySelectorAll('.campPage-trap-itemBrowser-item.skin');
  if (! items) {
    isAdding = false;
    return;
  }

  for (const item of items) {
    const id = item.getAttribute('data-item-id');
    if (! id) {
      return;
    }

    let skin;

    if (skinImages[id]) {
      skin = skinImages[id];
    } else {
      const cachedData = await dbGet('cache', `skin-image-${id}`);
      if (cachedData && cachedData.data && cachedData.data.skin) {
        skin = cachedData.data.skin;
      } else {
        const itemData = await fetch(`https://api.mouse.rip/item/${id}`).then((res) => res.json());

        if (! (itemData && itemData.images.trap)) {
          return;
        }

        skin = itemData.images.trap;

        dbSet('cache', {
          id: `skin-image-${id}`,
          skin
        });
      }

      skinImages[id] = skin;
    }

    const imageWrapper = makeElement('div', 'itembrowser-skin-image-wrapper');
    const imageEl = makeElement('img', 'itembrowser-skin-image');
    imageEl.setAttribute('src', skin);
    imageEl.setAttribute('data-item-classification', 'skin');
    imageEl.setAttribute('data-item-id', id);
    imageWrapper.append(imageEl);

    const existingImage = item.querySelector('.itembrowser-skin-image-wrapper');
    if (! existingImage) {
      item.insertBefore(imageWrapper, item.firstChild);
    }
  }

  const searchInput = document.querySelector('.campPage-trap-itemBrowser-filter input');
  if (searchInput) {
    searchInput.addEventListener('keyup', debounce(() => {
      addSkinImages('item_browser', true);
    }, 300));
  }

  isAdding = false;
};

const triggerFromClick = () => {
  const button = document.querySelector('.trapSelectorView__armedItem[data-item-classification=skin]');
  if (button) {
    button.addEventListener('click', () => {
      addSkinImages('item_browser', true);
    });
  }
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'larger-skin-images');

  onEvent('camp_page_toggle_blueprint', addSkinImages);

  onRequest('users/gettrapcomponents.php', (data) => {
    if (data?.components && 'skin' === data?.components[0]?.classification) {
      setTimeout(() => {
        addSkinImages('item_browser');
      }, 250);
    }
  });

  onRequest('users/changetrap.php', (data) => {
    if (data.skin && data.skin.length) {
      addSkinImages('item_browser');
    }
  });

  onNavigation(triggerFromClick, {
    page: 'camp',
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'larger-skin-images',
  name: 'Larger Skin Images',
  type: 'feature',
  default: true,
  description: 'Shows larger images for skins in the trap selector.',
  load: init,
};
