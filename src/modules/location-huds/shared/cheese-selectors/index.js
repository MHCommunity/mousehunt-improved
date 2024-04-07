import {
  doEvent,
  getCurrentLocation,
  getUserItems,
  makeElement,
  onRequest
} from '@utils';

const makeCheeseSelectorElement = async (cheesesToUse) => {
  const wrapper = makeElement('div', ['townOfGnawniaHUD', 'allBountiesComplete', 'mh-ui-cheese-selector-wrapper']);
  const cheesesContainer = makeElement('div', ['townOfGnawniaHUD-baitContainer', 'mh-ui-cheese-selector']);

  const cheeses = await getUserItems(cheesesToUse);

  for (const cheese of cheeses) {
    const cheeseContainer = makeElement('div', ['townOfGnawniaHUD-bait', `mh-ui-cheese-selector-${cheese.type}`]);
    cheeseContainer.setAttribute('data-item-type', cheese.type);
    cheeseContainer.setAttribute('data-item-classification', 'bait');
    cheeseContainer.setAttribute('onclick', 'hg.utils.TrapControl.toggleItem(this); return false;');

    // if this is the currently selected cheese, add the selected class.
    if (user.bait_item_id === cheese.item_id) {
      cheeseContainer.classList.add('active');
    } else {
      cheeseContainer.classList.remove('active');
    }

    const cheeseImage = makeElement('div', 'townOfGnawniaHUD-bait-image');
    cheeseImage.style.backgroundImage = `url(${cheese.thumbnail_transparent || cheese.thumbnail})`;
    cheeseContainer.append(cheeseImage);

    makeElement('div', ['townOfGnawniaHUD-bait-name', 'quantity'], cheese.name.replace(' Cheese', ''), cheeseContainer);
    makeElement('div', ['townOfGnawniaHUD-bait-quantity', 'quantity'], cheese.quantity.toLocaleString(), cheeseContainer);

    cheesesContainer.append(cheeseContainer);
  }

  wrapper.append(cheesesContainer);

  return wrapper;
};

/**
 * Adds a cheese selector a a location that usually doesn't have a HUD.
 *
 * @param {string} location     Name of the location.
 * @param {Array}  cheesesToUse Array of cheese types to use.
 */
const makeCheeseSelector = async (location, cheesesToUse) => {
  if (location.replaceAll('-', '_') !== getCurrentLocation()) {
    const existingCheeseSelector = document.querySelector('.mh-ui-cheese-selector-wrapper');
    if (existingCheeseSelector) {
      existingCheeseSelector.remove();
    }

    return;
  }

  const hud = document.querySelector('#hudLocationContent');
  if (! hud) {
    return;
  }

  const cheeseSelector = await makeCheeseSelectorElement(cheesesToUse);

  const existingCheeseSelector = document.querySelector('.mh-ui-cheese-selector-wrapper');
  if (existingCheeseSelector) {
    existingCheeseSelector.replaceWith(cheeseSelector);
  } else {
    hud.after(cheeseSelector);
  }

  doEvent('mh-improved-cheese-selector-added', location, cheesesToUse);
};

const getCheeses = (cheeses) => {
  const defaultCheeses = [
    'cheddar_cheese',
    'brie_cheese',
    'gouda_cheese',
    'super_brie_cheese',
  ];

  // Append cheeses to make the array 4 items long.
  while (cheeses.length < 4) {
    // add it in reverse so we don't mess up the order.
    cheeses.unshift(defaultCheeses.pop());
  }

  return cheeses;
};

let replaced = false;
const replaceCampShowTab = () => {
  if (replaced) {
    return;
  }

  replaced = true;

  const _original = app.pages.CampPage.showTab;
  app.pages.CampPage.showTab = (...args) => {
    _original(...args);
    doEvent('set_camp_tab', ...args);
  };
};

/**
 * Initialize the module.
 *
 * @param {string} location Name of the location.
 * @param {Array}  cheeses  Array of cheese types to use.
 */
export default (location, cheeses) => {
  replaceCampShowTab();

  const main = () => {
    makeCheeseSelector(location, getCheeses(cheeses));
  };

  main();
  onRequest('*', main);
};
