import {
  addStyles,
  getData,
  getSetting,
  makeElement,
  onEvent,
  onRequest
} from '@utils';

import styles from './styles.css';

const addSkin = (skin) => {
  const { name, id, type, imageUrl, thumbUrl, description, tradeable, appendTo } = skin;

  let markup = `<div class="campPage-trap-itemBrowser-item-leftBar">
        <a href="#" class="campPage-trap-itemBrowser-item-image" style="background-image:url(${thumbUrl});" data-item-type="${type}"></a>
        <a href="#" class="campPage-trap-itemBrowser-item-armButton" data-item-id="${id}" data-item-classification="skin" ${tradeable ? `onclick="hg.views.MarketplaceView.showItem(${id}); return false;"` : ''}></a>
    </div>
    <div class="campPage-trap-itemBrowser-item-content">
        <div class="campPage-trap-itemBrowser-item-name">${name}</div>
        <div class="campPage-trap-itemBrowser-item-description shortDescription">${description}</div>
    </div>
    <a data-item-id="${id}" href="#" class="campPage-trap-itemBrowser-item-favorite no"></a>
</div>`;

  if (getSetting('better-ui.larger-skin-images', true)) {
    markup = `<div class="itembrowser-skin-image-wrapper">
      <img class="itembrowser-skin-image" src="${imageUrl}" data-item-classification="skin" data-item-id="${id}">
    </div>${markup}`;
  }

  const skinEl = makeElement('div', [
    'mh-unowned-skin-item',
    'campPage-trap-itemBrowser-item',
    'loaded',
    'skin',
    'cannotArm',
    'cannotDisarm', // TODO: this makes it black and white
    type,
    tradeable ? 'canBuy' : 'cannotBuy',
  ], markup);
  skinEl.setAttribute('data-item-id', id);
  appendTo.append(skinEl);
};

const addUnownedSkins = async () => {
  const header = document.querySelector('.trapSelectorView__itemBrowserContainer.trapSelectorView__outerBlock.campPage-trap-itemBrowser.skin .campPage-trap-itemBrowser-filterContainer');
  if (! header) {
    return;
  }

  const items = await getData('items');

  const currentTrap = items.find((item) => item.id === user.weapon_item_id);
  if (! currentTrap) {
    return;
  }

  if (! currentTrap.skins || currentTrap.skins.length === 0) {
    return;
  }

  const existingSkins = document.querySelectorAll('.trapSelectorView__blueprint--active .campPage-trap-itemBrowser-item.skin:not(.mh-unowned-skin-item)');

  let unownedSkins = [...currentTrap.skins];
  for (const skinEl of existingSkins) {
    unownedSkins = unownedSkins.filter((skinType) => ! [...skinEl.classList].includes(skinType));
  }

  const container = document.querySelector('.trapSelectorView__blueprint--active .campPage-trap-itemBrowser-items .campPage-trap-itemBrowser-tagGroup');
  if (! container) {
    return;
  }

  for (const skin of unownedSkins) {
    const skinItem = items.find((item) => item.type === skin);
    if (! skinItem) {
      continue;
    }

    addSkin({
      name: skinItem.name,
      id: skinItem.id,
      type: skinItem.type,
      imageUrl: skinItem.images.trap,
      thumbUrl: skinItem.images.thumbnail,
      description: skinItem.description,
      tradeable: skinItem.is_tradable,
      appendTo: container,
    });
  }
};

let addUnownedSkinsTimeout = null;
const maybeAddUnownedSkins = () => {
  clearTimeout(addUnownedSkinsTimeout);
  addUnownedSkinsTimeout = setTimeout(() => {
    addUnownedSkins();
  }, 250);
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-ui-show-unowned-skins');
  onEvent('camp_page_toggle_blueprint', maybeAddUnownedSkins);
  onRequest('users/gettrapcomponents.php', maybeAddUnownedSkins);
};
