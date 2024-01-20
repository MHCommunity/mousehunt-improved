import { getUserItems, onEvent, onNavigation, onRequest } from '@utils';

/**
 * Adds a cheese selector a a location that usually doesn't have a HUD.
 *
 * @param {string} location     Name of the location.
 * @param {Array}  cheesesToUse Array of cheese types to use.
 */
const makeCheeseSelector = async (location, cheesesToUse) => {
  if (isProcessing) {
    return;
  }

  isProcessing = true;

  const hud = document.querySelector('#hudLocationContent');
  if (! hud) {
    return;
  }

  hud.classList.remove('empty');

  const wrapper = document.createElement('div');
  wrapper.classList.add('townOfGnawniaHUD', 'allBountiesComplete', 'mh-ui-cheese-selector-wrapper');

  const cheesesContainer = document.createElement('div');
  cheesesContainer.classList.add('townOfGnawniaHUD-baitContainer', 'mh-ui-cheese-selector');

  const cheeses = await getUserItems(cheesesToUse);

  for (const cheese of cheeses) {
    const cheeseContainer = document.createElement('div');
    cheeseContainer.classList.add('townOfGnawniaHUD-bait', `mh-ui-cheese-selector-${cheese.type}`);

    // if this is the currently selected cheese, add the selected class.
    if (user.bait_item_id === cheese.item_id) {
      cheeseContainer.classList.add('active');
    } else {
      cheeseContainer.classList.remove('active');
    }

    const cheeseImage = document.createElement('div');
    cheeseImage.classList.add('townOfGnawniaHUD-bait-image');
    const thumbnail = cheese.thumbnail_transparent || cheese.thumbnail;
    cheeseImage.style.backgroundImage = `url(${thumbnail})`;

    const cheeseName = document.createElement('div');
    cheeseName.classList.add('townOfGnawniaHUD-bait-name', 'quantity');
    cheeseName.innerText = cheese.name.replace(' Cheese', '');

    const cheeseQuantity = document.createElement('div');
    cheeseQuantity.classList.add('townOfGnawniaHUD-bait-quantity', 'quantity');
    cheeseQuantity.innerText = numberFormat(cheese.quantity);

    const tooltipArrow = document.createElement('div');
    tooltipArrow.classList.add('mousehuntTooltip-arrow');

    cheeseContainer.append(cheeseImage);
    cheeseContainer.append(cheeseName);
    cheeseContainer.append(cheeseQuantity);

    cheeseContainer.setAttribute('data-item-type', cheese.type);
    cheeseContainer.setAttribute('data-item-classification', 'bait');
    // add onclick attribute to the cheeseContainer
    cheeseContainer.setAttribute('onclick', 'hg.utils.TrapControl.toggleItem(this); return false;');

    cheesesContainer.append(cheeseContainer);
  }

  wrapper.append(cheesesContainer);

  const existingCheeseSelector = hud.querySelector('.mh-ui-cheese-selector-wrapper');
  if (existingCheeseSelector) {
    existingCheeseSelector.replaceWith(wrapper);
  } else {
    hud.append(wrapper);
  }

  isProcessing = false;
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
    eventRegistry.doEvent('set_camp_tab', ...args);
  };
};

let isProcessing = false;
export default async (location, cheeses) => {
  replaceCampShowTab();

  const main = () => {
    makeCheeseSelector(location, getCheeses(cheeses));
  };

  main();
  onNavigation(main);

  onEvent('ajax_response', main);
};
