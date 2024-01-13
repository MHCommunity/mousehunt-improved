import { addStyles, getCurrentPage, makeElement, onNavigation } from '@utils';

import settings from './settings';
import styles from './styles.css';

const getFavoriteSetups = () => {
  return [
    {
      name: 'A cool setup',
      bait_id: 98,
      bait_thumbnail: 'https://www.mousehuntgame.com/images/items/bait/d3bb758c09c44c926736bbdaf22ee219.gif?cv=2',
      base_id: 3080,
      base_thumbnail: 'https://www.mousehuntgame.com/images/items/bases/0314ad5d2428777c9ff0e91bdc803218.jpg?cv=2',
      weapon_id: 1514,
      weapon_thumbnail: 'https://www.mousehuntgame.com/images/items/weapons/d697f7edeee01eb80864fafa37b3b771.jpg?cv=2',
      trinket_id: 3617,
      trinket_thumbnail: 'https://www.mousehuntgame.com/images/items/trinkets/553d74f9419c15b0ea85ee64ceb410eb.gif?cv=2'
    },
    {
      name: 'test',
      bait_id: 114,
      bait_thumbnail: 'https://www.mousehuntgame.com/images/items/bait/large/180edb7cd522099432ec5c1fb591f633.png?cv=2',
      base_id: 3364,
      base_thumbnail: 'https://www.mousehuntgame.com/images/items/bases/311e9e58ba0e5eca714b92ba7d7fbb23.jpg?cv=2',
      weapon_id: 3085,
      weapon_thumbnail: 'https://www.mousehuntgame.com/images/items/weapons/2c4cb89cdd16d1ad04bfb8d6ab07650c.jpg?cv=2',
      trinket_id: 1478,
      trinket_thumbnail: 'https://www.mousehuntgame.com/images/items/trinkets/b7fc9865c625420a77177ce4909ae0f4.gif?cv=2'
    },
  ];
};

const getCurrentSetup = () => {
  return {
    name: 'Current Setup',
    bait_id: user.bait_item_id,
    bait_thumbnail: user.enviroment_atts.bait_thumb,
    base_id: user.base_item_id,
    base_thumbnail: user.enviroment_atts.base_thumb,
    weapon_id: user.weapon_item_id,
    weapon_thumbnail: user.enviroment_atts.weapon_thumb,
    trinket_id: user.trinket_item_id,
    trinket_thumbnail: user.enviroment_atts.trinket_thumb,
    skin_id: user.skin_item_id,
    skin_thumbnail: user.enviroment_atts.skin_thumb,
  };
};

const makeImage = (id, thumbnail) => {
  const wrapper = makeElement('div', 'campPage-trap-itemBrowser-favorite-item');
  wrapper.setAttribute('data-item-id', id);

  const item = makeElement('div', 'campPage-trap-itemBrowser-favorite-item-image');
  item.style.backgroundImage = `url(${thumbnail})`;

  makeElement('div', 'campPage-trap-itemBrowser-favorite-item-frame', '', item);

  wrapper.append(item);

  return wrapper;
};

const makeBlueprintRow = (setup, buttons) => {
  const setupContainer = makeElement('div', ['row']);

  const labelAndControls = makeElement('div', ['labelAndControls']);
  makeElement('div', ['label'], setup.name, labelAndControls);

  const controls = makeElement('div', 'controls');

  buttons.forEach((button) => {
    const buttonElement = makeElement('a', ['button', 'campPage-trap-trapEffectiveness-button-edit'], button.text);
    buttonElement.addEventListener('click', button.callback);
    controls.append(buttonElement);
  });

  labelAndControls.append(controls);

  setupContainer.append(labelAndControls);

  setupContainer.append(makeImage('bait', setup.bait_id, setup.bait_thumbnail));
  setupContainer.append(makeImage('base', setup.base_id, setup.base_thumbnail));
  setupContainer.append(makeImage('weapon', setup.weapon_id, setup.weapon_thumbnail));
  setupContainer.append(makeImage('trinket', setup.trinket_id, setup.trinket_thumbnail));

  return setupContainer;
};

const makeBlueprintContainer = () => {
  const existing = document.querySelector('.mh-improved-favorite-setups-blueprint-container');
  if (existing) {
    return existing;
  }

  const container = makeElement('div', 'mh-improved-favorite-setups-blueprint-container');

  const header = makeElement('div', ['header']);
  makeElement('b', ['title'], 'Favorite Setups', header);
  container.append(header);

  const body = makeElement('div', ['content']);

  const setups = getFavoriteSetups();

  body.append(makeBlueprintRow(getCurrentSetup(), [{
    text: 'Save',
    callback: () => {}
  }]));

  setups.forEach((setup) => {
    const setupContainer = makeBlueprintRow(setup, [
      {
        text: 'Arm',
        callback: () => {}
      },
      {
        text: 'Edit',
        callback: () => {}
      },
    ]);

    body.append(setupContainer);
  });

  container.append(body);

  const appendTo = document.querySelector('.campPage-trap-blueprintContainer');
  if (! appendTo) {
    return false;
  }

  appendTo.append(container);

  return container;
};

const addFavoriteSetupsButton = () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const existingButton = document.querySelector('.mh-improved-favorite-setups-button');
  if (existingButton) {
    return;
  }

  const appendTo = document.querySelector('.campPage-trap-itemStats');
  if (! appendTo) {
    return;
  }

  const button = makeElement('a', ['mh-improved-favorite-setups-button', 'campPage-trap-trapEffectiveness']);
  makeElement('div', ['mh-improved-favorite-setups-button-text'], 'Favorite Setups', button);
  const label = makeElement('span', ['mh-improved-favorite-setups-button-label']);

  // todo fill in label.
  label.innerHTML = 'Saved Name';
  button.append(label);

  button.addEventListener('click', () => {
    if (isFavoriteSetupsShowing()) {
      hideFavoriteSetups();
    } else {
      makeBlueprintContainer();
      showFavoriteSetups();
    }
  });

  // Append as a sibling to the existing button.
  appendTo.parentNode.insertBefore(button, appendTo.nextSibling);
};

const isFavoriteSetupsShowing = () => {
  const pageContainer = document.querySelector('#mousehuntContainer');
  if (! pageContainer) {
    return false;
  }

  return pageContainer.classList.contains('showFavoriteSetups');
};

const hideFavoriteSetups = () => {
  const pageContainer = document.querySelector('#mousehuntContainer');
  if (! pageContainer) {
    return;
  }

  pageContainer.classList.remove('showBlueprint', 'showFavoriteSetups');

  const container = document.querySelector('.mh-improved-favorite-setups-blueprint-container');
  if (container) {
    container.classList.add('hidden');
  }
};

const showFavoriteSetups = () => {
  const pageContainer = document.querySelector('#mousehuntContainer');
  if (! pageContainer) {
    return;
  }

  pageContainer.classList.remove('editTrap', 'showTrapEffectiveness');
  pageContainer.classList.add('showBlueprint', 'showFavoriteSetups');

  const container = document.querySelector('.mh-improved-favorite-setups-blueprint-container');
  if (container) {
    container.classList.remove('hidden');
  }
};

const replaceCloseBlueprintDrawer = () => {
  const _closeBlueprintDrawer = app.pages.CampPage.closeBlueprintDrawer;
  app.pages.CampPage.closeBlueprintDrawer = (...args) => {
    if (isFavoriteSetupsShowing()) {
      hideFavoriteSetups();
    }

    _closeBlueprintDrawer(...args);
  };

  const _toggleItemBrowser = app.pages.CampPage.toggleItemBrowser;
  app.pages.CampPage.toggleItemBrowser = (...args) => {
    if (isFavoriteSetupsShowing()) {
      hideFavoriteSetups();
    }

    _toggleItemBrowser(...args);
  };

  const _toggleTrapEffectiveness = app.pages.CampPage.toggleTrapEffectiveness;
  app.pages.CampPage.toggleTrapEffectiveness = (...args) => {
    if (isFavoriteSetupsShowing()) {
      hideFavoriteSetups();
    }

    _toggleTrapEffectiveness(...args);
  };
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);

  onNavigation(addFavoriteSetupsButton);
  replaceCloseBlueprintDrawer();
};

export default {
  id: 'favorite-setups',
  name: 'Favorite Setups',
  type: 'feature',
  default: false,
  description: '',
  load: init,
  settings,
  beta: true,
};
