import { addStyles, dbGet, dbSet, debounce, fetchMouseRip, makeElement } from '@utils';

import { registerTrapSelectorDecorator } from '../../trap-selector-runtime';

import styles from './styles.css';

const skinImages = {};
const boundSearchInputs = new WeakSet();
const boundSkinButtons = new WeakSet();
let isAdding = false;
let delayedAdd = null;

/**
 * Add skin images to the trap selector.
 *
 * @param {string}   panel     The panel to add the skin images to.
 * @param {boolean}  force     Whether to force add the skin images.
 * @param {Function} isCurrent Whether this render session remains current.
 */
const addSkinImages = async (panel, force = false, isCurrent = () => true) => {
  if ('item_browser' !== panel) {
    return;
  }

  if (isAdding) {
    return;
  }

  isAdding = true;

  try {
    const blueprint = document.querySelector('.trapSelectorView__blueprint--active .trapSelectorView__browserStateParent');
    if (!blueprint) {
      return;
    }

    if (!force) {
      const type = blueprint.getAttribute('data-blueprint-type');
      if (!type || type !== 'skin') {
        return;
      }
    }

    const items = document.querySelectorAll('.campPage-trap-itemBrowser-item.skin');
    if (!items.length) {
      return;
    }

    for (const item of items) {
      if (!isCurrent()) {
        return;
      }

      if (item.classList.contains('mh-unowned-skin-item')) {
        continue;
      }

      if (!isCurrent()) {
        return;
      }

      const id = item.getAttribute('data-item-id');
      if (!id) {
        continue;
      }

      let skin;

      if (skinImages[id]) {
        skin = skinImages[id];
      } else {
        const cachedData = await dbGet('cache', `skin-image-${id}`);
        if (cachedData && cachedData.data && cachedData.data.skin) {
          skin = cachedData.data.skin;
        } else {
          const itemData = await fetchMouseRip(`item/${id}`);

          if (!itemData?.images?.trap) {
            continue;
          }

          skin = itemData.images.trap;

          dbSet('cache', {
            id: `skin-image-${id}`,
            skin,
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
      if (!existingImage) {
        item.insertBefore(imageWrapper, item.firstChild);
      }
    }

    const searchInput = document.querySelector('.campPage-trap-itemBrowser-filter input');
    if (searchInput && !boundSearchInputs.has(searchInput)) {
      boundSearchInputs.add(searchInput);
      searchInput.addEventListener(
        'keyup',
        debounce(() => {
          addSkinImages('item_browser', true);
        }, 300)
      );
    }
  } finally {
    isAdding = false;
  }
};

/**
 * Re-add skin images when the skin tab is clicked.
 */
const triggerFromClick = () => {
  const button = document.querySelector('.trapSelectorView__armedItem[data-item-classification=skin]');
  if (button && !boundSkinButtons.has(button)) {
    boundSkinButtons.add(button);
    button.addEventListener('click', () => {
      addSkinImages('item_browser', true);
    });
  }
};

/**
 * Initialize the module.
 */
export default () => {
  addStyles(styles, 'better-ui-larger-skin-images');
  registerTrapSelectorDecorator('images', 'larger-skin-images', ({ type, panel, data, isCurrent }) => {
    triggerFromClick();

    if ('blueprint' === type) {
      return addSkinImages(panel, false, isCurrent);
    }

    if ('components' === type && 'skin' === data?.components?.[0]?.classification) {
      clearTimeout(delayedAdd);
      delayedAdd = setTimeout(addSkinImages, 250, 'item_browser', false, isCurrent);
    } else if ('trap-change' === type && data?.skin?.length) {
      return addSkinImages('item_browser', false, isCurrent);
    }

    return null;
  });
};
