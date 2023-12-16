import { addHudStyles, makeElement, onDialogShow, onRequest } from '@utils';

import styles from './styles.css';

const updateGolemFooter = () => {
  const footer = document.querySelector('.greatWinterHuntDialogView__inventoryFooter');
  if (! footer) {
    return;
  }

  const headsEl = footer.querySelector('.greatWinterHuntDialogView__footerItemQuantity[data-item-type="golem_part_head_stat_item"]');
  const torsoEl = footer.querySelector('.greatWinterHuntDialogView__footerItemQuantity[data-item-type="golem_part_torso_stat_item"]');
  const limbsEl = footer.querySelector('.greatWinterHuntDialogView__footerItemQuantity[data-item-type="golem_part_limb_stat_item"]');

  if (! headsEl && ! torsoEl && ! limbsEl) {
    return;
  }

  const heads = headsEl ? Number.parseInt(headsEl.textContent, 10) : 0;
  const torso = torsoEl ? Number.parseInt(torsoEl.textContent, 10) : 0;
  const limbs = limbsEl ? Number.parseInt(limbsEl.textContent, 10) : 0;

  const limbSet = Math.floor(limbs / 4);
  const possibleGolems = Math.min(heads, torso, limbSet);

  const existing = footer.querySelector('.greatWinterHuntDialogView__footerItem.possibleGolems');
  if (existing) {
    existing.remove();
  }

  const possibleWrapper = makeElement('div', ['greatWinterHuntDialogView__footerItem', 'mousehuntTooltipParent', 'possibleGolems']);

  const possibleImage = makeElement('div', ['greatWinterHuntDialogView__footerItemImage']);
  possibleImage.style.backgroundImage = 'url(https://i.mouse.rip/mh-improved/golem-thumb.png)';
  possibleWrapper.append(possibleImage);

  makeElement('div', ['greatWinterHuntDialogView__footerItemQuantity', 'quantity'], possibleGolems, possibleWrapper);

  const possibleTooltip = makeElement('div', ['mousehuntTooltip', 'tight', 'top', 'noEvents'], `You can make ${possibleGolems} golem${possibleGolems === 1 ? '' : 's'}`);
  makeElement('div', ['mousehuntTooltip-arrow'], null, possibleTooltip);
  possibleWrapper.append(possibleTooltip);

  // append as the 4th child
  footer.insertBefore(possibleWrapper, footer.children[3]);
};

const getFraction = (num) => {
  switch (num) {
  case 1:
    return '¼';
  case 2:
    return '½';
  case 3:
    return '¾';
  default:
    return '';
  }
};

const updateGolemPartsQuantity = () => {
  const limbs = document.querySelector('.greatWinterHuntRecycleDialogView__itemQuantity.quantity[data-item-type="golem_part_limb_stat_item"]');
  if (! limbs) {
    return;
  }

  const original = limbs.getAttribute('original-quantity');
  if (original) {
    const footerLimbs = document.querySelector('.greatWinterHuntDialogView__footerItemQuantity.quantity[data-item-type="golem_part_limb_stat_item"]');
    limbs.textContent = footerLimbs ? footerLimbs.textContent : original;
  }

  const limbCount = Number.parseInt(limbs.textContent, 10);
  limbs.setAttribute('original-quantity', limbCount);

  // Make a text node that looks like (4¼)
  const limbSet = Math.floor(limbCount / 4);
  const limbSetFraction = getFraction(limbCount % 4);

  const newLimbsEl = makeElement('span', ['golemLimbsTotal'], limbCount);
  const newLimbsSetEl = makeElement('span', ['golemLimbsPossible'], `(${limbSet}${limbSetFraction})`);
  limbs.textContent = '';
  limbs.append(newLimbsEl, newLimbsSetEl);
};

const updateGolemPopup = () => {
  setTimeout(updateGolemFooter, 250);
  setTimeout(updateGolemPartsQuantity, 250);
};

/**
 * Initialize the module.
 */
export default () => {
  addHudStyles(styles);
  onDialogShow(updateGolemPopup, 'greatWinterHuntDialog');

  onRequest(() => {
    updateGolemPartsQuantity();
    setTimeout(updateGolemFooter, 250);
  }, 'managers/ajax/purchases/itempurchase.php');
};

// .greatWinterHuntClaimRewardDialogView__golem wrapper needs to not scale golem
