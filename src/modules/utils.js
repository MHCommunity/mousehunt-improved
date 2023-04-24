const addUIStyles = (styles) => {
  const identifier = 'mh-ui-styles';

  const existingStyles = document.getElementById(identifier);
  if (existingStyles) {
    existingStyles.innerHTML += styles;
    return;
  }

  const style = document.createElement('style');
  style.id = identifier;
  style.innerHTML = styles;
  document.head.appendChild(style);
};

/**
 * Return an anchor element with the given text and href.
 *
 * @param {string}  text         Text to use for link.
 * @param {string}  href         URL to link to.
 * @param {array}   extraClasses Extra classes to add to the link.
 * @param {boolean} tiny         Use the tiny button style.
 *
 * @return {string} HTML for link.
 */
const makeButton = (text, href, extraClasses = [], tiny = true) => {
  href = href.replace(/\s/g, '_');
  return `<a href="${href}" class="mousehuntActionButton ${tiny ? 'tiny' : ''} ${extraClasses.join(' ')}"><span>${text}</span></a>`;
};

const makeCheeseSelector = async (id, location, cheesesToUse) => {
  if (location !== getCurrentLocation()) {
    return;
  }

  const hud = document.querySelector('#hudLocationContent');
  if (! hud) {
    return;
  }

  if (hud.classList.contains('mh-ui-cheese-selector')) {
    return;
  }

  hud.classList.add('mh-ui-cheese-selector', `mh-ui-cheese-selector-${id}`);

  const existingCheeseSelector = hud.querySelector('.mh-ui-cheese-selector-wrapper');
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
    cheeseContainer.classList.add('townOfGnawniaHUD-bait', 'mousehuntTooltipParent');

    const cheeseImage = document.createElement('div');
    cheeseImage.classList.add('townOfGnawniaHUD-bait-image', `townOfGnawniaHUD-bait-image-${cheese.type}`);
    cheeseImage.style.backgroundImage = `url(${cheese.thumbnail_transparent})`;

    const cheeseName = document.createElement('div');
    cheeseName.classList.add('townOfGnawniaHUD-bait-name', 'quantity');
    cheeseName.innerText = cheese.name.replace(' Cheese', '');

    const cheeseQuantity = document.createElement('div');
    cheeseQuantity.classList.add('townOfGnawniaHUD-bait-quantity', 'quantity');
    cheeseQuantity.innerText = cheese.quantity;

    const tooltip = document.createElement('div');
    tooltip.classList.add('mousehuntTooltip', 'tight', 'top');

    const tooltipText = document.createElement('div');
    tooltipText.classList.add('mousehuntTooltipText');

    const tooltipTitle = document.createElement('strong');
    tooltipTitle.innerText = cheese.name;

    const tooltipActions = document.createElement('div');
    tooltipActions.classList.add('townOfGnawniaHUD-bait-actions');

    const equipButton = document.createElement('a');
    equipButton.classList.add('mousehuntArmNowButton');
    equipButton.setAttribute('href', '#');
    equipButton.setAttribute('data-item-type', cheese.type);
    equipButton.setAttribute('data-item-classification', 'bait');
    equipButton.addEventListener('click', (e) => {
      e.preventDefault();
      hg.utils.TrapControl.toggleItem(e.target);
    });

    const tooltipArrow = document.createElement('div');
    tooltipArrow.classList.add('mousehuntTooltip-arrow');

    tooltipActions.appendChild(equipButton);
    tooltipText.appendChild(tooltipTitle);
    tooltip.appendChild(tooltipText);
    tooltip.appendChild(tooltipActions);
    tooltip.appendChild(tooltipArrow);
    cheeseContainer.appendChild(cheeseImage);
    cheeseContainer.appendChild(cheeseName);
    cheeseContainer.appendChild(cheeseQuantity);
    cheeseContainer.appendChild(tooltip);
    cheesesContainer.appendChild(cheeseContainer);
  });

  wrapper.appendChild(cheesesContainer);

  const frame = document.createElement('div');
  frame.classList.add('mh-ui-cheese-selector-frame');
  hud.appendChild(frame);

  hud.appendChild(wrapper);
};

export {
  addUIStyles,
  makeButton,
  makeCheeseSelector,
}
