import { addHudStyles, getUserItems, makeElement } from '@utils';

import styles from './styles.css';

/**
 * Update the HUD images.
 */
const updateHudImages = () => {
  const upscaleMapping = {
    '/crafting_items/thumbnails/1a7897042ba8f3fa31fa6805404456d6.gif': '/crafting_items/transparent_thumb/9197ccdec26278bfb07ab7846b1a2648.png', // damaged coral.
    '/crafting_items/thumbnails/4aaa6478c10308ac865507e4d7915b3c.gif': '/crafting_items/transparent_thumb/d7f3f77c87ea7849a2ec8bc3f7d05b74.png', // mouse scale.
    '/crafting_items/thumbnails/e12ed1306d81665278952d4b4349b495.gif': '/crafting_items/transparent_thumb/5057d634368131d5ab4ad62bf0963800.png', // barnacle.
    '/bait/1f6237cebe21954e53d6586b2cbdfe39.gif': '/bait/transparent_thumb/0d27e0c72c3cbdc8e9fe06fb7bdaa56d.png', // fishy fromage.
    '/trinkets/555bb67ba245aaf2b05db070d2b4cfcb.gif': '/trinkets/transparent_thumb/be6749a947b746fbece2754d9bd02f74.png', // anchor.
    '/trinkets/5f56cb017ff9414e584ced35b2491aef.gif': '/trinkets/transparent_thumb/2dc6b3e505fd1eaac8c6069937490386.png', // water jet.
  };

  /**
   * Normalize the image URL and upscale it.
   *
   * @param {Element} image The image element.
   */
  const upscaleImage = (image) => {
    const normalizedImage = image.src
      .replace('https://www.mousehuntgame.com/images/items', '')
      .replace('?cv=1', '')
      .replace('?cv=2', '')
      .replace('?cv=3', '')
      .replace('?v=1', '')
      .replace('?v=2', '')
      .replace('?v=3', '');

    if (upscaleMapping[normalizedImage]) {
      image.src = `https://www.mousehuntgame.com/images/items/${upscaleMapping[normalizedImage]}`;
    }
  };

  const hudImages = document.querySelectorAll('.sunkenCityHud .leftSidebar .craftingItems a img');
  hudImages.forEach((image) => {
    upscaleImage(image);
  });

  const baitImage = document.querySelector('.sunkenCityHud .sunkenBait .itemImage img');
  if (baitImage) {
    upscaleImage(baitImage);
  }

  const charms = document.querySelectorAll('.sunkenCityHud .sunkenCharms a .itemImage img');
  charms.forEach((charm) => {
    upscaleImage(charm);
  });
};

/**
 * Create a charm element.
 *
 * @param {Object}  charm    The charm object.
 * @param {Element} appendTo The element to append to.
 */
const makeCharmElement = (charm, appendTo) => {
  // Remove the old one.
  const existing = document.querySelector(`.mhui-sunken-charm[data-item-type="${charm.type}"]`);
  if (existing) {
    existing.remove();
  }

  const wrapper = makeElement('a', ['charm', 'mhui-sunken-charm']);
  if (user.trinket_item_id == charm.item_id) { // eslint-disable-line eqeqeq
    wrapper.classList.add('active');
  }

  wrapper.setAttribute('href', '#');
  wrapper.setAttribute('data-item-type', charm.type);
  wrapper.setAttribute('data-item-classification', 'trinket');
  wrapper.setAttribute('title', charm.name);
  wrapper.setAttribute('onclick', 'app.views.HeadsUpDisplayView.hud.sunkenCityArmItem(this);return false;');

  const clearBlock = makeElement('div', 'clear-block');

  const itemImage = makeElement('div', 'itemImage');
  const image = makeElement('img');
  image.setAttribute('src', charm.thumbnail_transparent);
  itemImage.append(image);
  clearBlock.append(itemImage);

  const quantity = makeElement('div', 'item quantity', charm.quantity);
  quantity.setAttribute('data-item-type', charm.type);
  clearBlock.append(quantity);

  wrapper.append(clearBlock);

  /* eslint-disable eqeqeq */
  if ('smart_water_jet_trinket' == charm.type) {
    charm.description = 'Overcharge your engine for a 500m boost with an automatic unequip after the hunt.';
  } else if ('brilliant_water_jet_trinket' == charm.type) {
    charm.description = 'Supercharge your engine for a boost to the end of the current zone!';
  } else if ('spiked_anchor_trinket' == charm.type) {
    charm.description = 'Slow down your sub while also boosting your power!';
  } else if ('golden_anchor_trinket' == charm.type) {
    charm.description = 'Set your sub to super-slow and also find additional sand dollars!';
  }
  /* eslint-enable eqeqeq */

  const toolTip = makeElement('div', 'toolTip');
  toolTip.innerHTML = `<b>${charm.name}s</b><br>${charm.description}`;
  wrapper.append(toolTip);

  appendTo.append(wrapper);
};

/**
 * Add more charms to the HUD.
 */
const addMoreCharms = async () => {
  const charmsWrapper = document.querySelector('.sunkenCityHud .sunkenCharms');
  if (! charmsWrapper) {
    return;
  }

  // remove any existing ones we've added.
  const existingCharms = charmsWrapper.querySelectorAll('.mhui-sunken-charm');
  for (const charm of existingCharms) {
    charm.remove();
  }

  const itemsData = await getUserItems([
    'spiked_anchor_trinket',
    'smart_water_jet_trinket',
    'golden_anchor_trinket',
    'brilliant_water_jet_trinket',
  ]);

  if (user.trinket_item_id == 1517) { // eslint-disable-line eqeqeq
    const waterJetCharm = document.querySelector('.sunkenCityHud .sunkenCharms a[data-item-type="water_jet_trinket"]');
    if (waterJetCharm) {
      waterJetCharm.classList.add('active');
    }
  }

  if (user.trinket_item_id == 423) { // eslint-disable-line eqeqeq
    const anchorCharm = document.querySelector('.sunkenCityHud .sunkenCharms a[data-item-type="anchor_trinket"]');
    if (anchorCharm) {
      anchorCharm.classList.add('active');
    }
  }

  for (const item of itemsData) {
    makeCharmElement(item, charmsWrapper);
  }

  const charms = document.querySelectorAll('.sunkenCityHud .sunkenCharms a');
  charms.forEach((charm) => {
    charm.addEventListener('click', () => {
      const active = document.querySelectorAll('.sunkenCityHud .sunkenCharms a.active');
      active.forEach((item) => {
        item.classList.remove('active');
      });

      charm.classList.toggle('active');
    });
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);
  updateHudImages();
  addMoreCharms();
};
