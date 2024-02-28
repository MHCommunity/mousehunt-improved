import {
  addStyles,
  cacheGet,
  cacheSet,
  makeElement,
  onEvent,
  onRequest
} from '@utils';

import styles from './styles.css';

const addSkinImages = async () => {
  const blueprint = document.querySelector('.trapSelectorView__blueprint--active .trapSelectorView__browserStateParent');
  if (! blueprint) {
    return;
  }

  const type = blueprint.getAttribute('data-blueprint-type');
  if (! type || type !== 'skin') {
    return;
  }

  const items = document.querySelectorAll('.campPage-trap-itemBrowser-item.skin');
  if (! items) {
    return;
  }

  const existingImages = document.querySelectorAll('.itembrowser-skin-image-wrapper');
  if (existingImages) {
    existingImages.forEach((img) => {
      img.remove();
    });
  }

  getSkinCache();

  items.forEach(async (item) => {
    const id = item.getAttribute('data-item-id');
    if (! id) {
      return;
    }

    skin = skinCache.find((s) => s.item_id == id); // eslint-disable-line eqeqeq
    if (! skin || ! skin.image_trap) {
      return;
    }

    const imageWrapper = makeElement('div', 'itembrowser-skin-image-wrapper');
    const imageEl = makeElement('img', 'itembrowser-skin-image');
    imageEl.setAttribute('src', skin.image_trap);
    imageEl.setAttribute('data-item-classification', 'skin');
    imageEl.setAttribute('data-item-id', id);
    imageEl.addEventListener('click', (e) => {
      e.preventDefault();
      app.pages.CampPage.armItem(e.target);
    });

    imageWrapper.append(imageEl);

    // Append as first child
    item.insertBefore(imageWrapper, item.firstChild);
  });
};

const updateSkinCache = async (data) => {
  skinCache = data;
  cacheSet('skin-cache', data);
};

const getSkinCache = async () => {
  const cache = await cacheGet('skin-cache');
  if (cache) {
    skinCache = cache;
  }

  return skinCache;
};

let skinCache = [];
/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'larger-skin-images');

  onEvent('camp_page_toggle_blueprint', addSkinImages);

  onRequest('users/gettrapcomponents.php', (data) => {
    if (data?.components && 'skin' === data?.components[0]?.classification) {
      updateSkinCache(data.components);
    }
  });
};

export default {
  id: 'larger-skin-images',
  name: 'Larger Skin Images',
  type: 'feature',
  default: true,
  description: 'Shows larger images for skins in the trap selector.',
  load: init,
};
