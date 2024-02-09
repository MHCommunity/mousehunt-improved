import {
  getUserItems,
  onEvent,
  onRequest,
  sessionGet,
  sessionSet
} from '@utils';

const addSkinImages = () => {
  const items = document.querySelectorAll('.skin .campPage-trap-itemBrowser-items .campPage-trap-itemBrowser-item');
  if (! items) {
    return;
  }

  items.forEach(async (item) => {
    if (item.getAttribute('data-rendered-image')) {
      return;
    }

    const id = item.getAttribute('data-item-id');
    if (! id) {
      return;
    }

    item.setAttribute('data-rendered-image', true);

    const hasItemData = sessionGet(`mh-ui-cache-item-${id}`);
    let itemData = null;
    if (hasItemData) {
      itemData = JSON.parse(hasItemData);
    } else {
      itemData = await getUserItems([id]);
      if (! itemData || ! itemData[0]) {
        return;
      }

      sessionSet(`mh-ui-cache-item-${id}`, JSON.stringify(itemData));
    }

    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('itembrowser-skin-image-wrapper');

    const image = document.createElement('img');
    image.classList.add('itembrowser-skin-image');
    image.setAttribute('src', itemData[0].image_trap);
    image.setAttribute('data-item-classification', 'skin');
    image.setAttribute('data-item-id', id);
    image.addEventListener('click', (e) => {
      e.preventDefault();
      app.pages.CampPage.armItem(e.target);
    });

    imageWrapper.append(image);

    // Append as first child
    item.insertBefore(imageWrapper, item.firstChild);
  });
};

const addQuickLinksToTrap = () => {
  const itemBrowser = document.querySelector('.campPage-trap-itemBrowser');
  if (! itemBrowser) {
    return;
  }

  const type = itemBrowser.classList.value
    .replace('campPage-trap-itemBrowser', '')
    .trim();
  if (! type) {
    return;
  }

  if ('skin' === type) {
    addSkinImages();
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  onEvent('camp_page_toggle_blueprint', addQuickLinksToTrap);
  onRequest('users/gettrapcomponents.php', addQuickLinksToTrap);
  onRequest('users/changetrap.php', addSkinImages, true);
};
