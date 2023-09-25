/**
 * Adds a cheese selector a a location that usually doesn't have a HUD.
 *
 * @param {string} location     Name of the location.
 * @param {Array}  cheesesToUse Array of cheese types to use.
 */
const makeCheeseSelector = async (location, cheesesToUse) => {
  const hud = document.querySelector('#hudLocationContent');
  if (! hud) {
    return;
  }

  if (hud.classList.contains('mh-ui-cheese-selector')) {
    return;
  }

  hud.classList.add('mh-ui-cheese-selector', `mh-ui-cheese-selector-${location}`);

  let existingCheeseSelector = hud.querySelector('.mh-ui-cheese-selector-wrapper');
  if (existingCheeseSelector) {
    existingCheeseSelector.remove();
  }

  const wrapper = document.createElement('div');
  wrapper.classList.add('townOfGnawniaHUD', 'allBountiesComplete', 'mh-ui-cheese-selector-wrapper');

  const cheesesContainer = document.createElement('div');
  cheesesContainer.classList.add('townOfGnawniaHUD-baitContainer');

  const cheeses = await getUserItems(cheesesToUse);

  cheeses.forEach((cheese) => {
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

    cheeseContainer.appendChild(cheeseImage);
    cheeseContainer.appendChild(cheeseName);
    cheeseContainer.appendChild(cheeseQuantity);

    cheeseContainer.setAttribute('data-item-type', cheese.type);
    cheeseContainer.setAttribute('data-item-classification', 'bait');
    // add onclick attribute to the cheeseContainer
    cheeseContainer.setAttribute('onclick', 'hg.utils.TrapControl.toggleItem(this); return false;');

    cheesesContainer.appendChild(cheeseContainer);
  });

  // recheck for existingCheeseSelector because it might have been added already.
  existingCheeseSelector = hud.querySelector('.mh-ui-cheese-selector-wrapper');
  if (existingCheeseSelector) {
    existingCheeseSelector.remove();
  }

  wrapper.appendChild(cheesesContainer);
  hud.appendChild(wrapper);
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

const addCheeseSelector = async (location, cheeses) => {
  await makeCheeseSelector(location, getCheeses(cheeses));
};

export default addCheeseSelector;
