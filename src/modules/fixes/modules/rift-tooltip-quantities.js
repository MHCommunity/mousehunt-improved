import { getCurrentLocation, getUserItems, onTravel } from '@utils';

/**
 * Fix the tooltip quantities for Gnawnia Rift.
 */
const fixRiftTooltipQuantities = async () => {
  if ('rift_gnawnia' !== getCurrentLocation()) {
    return;
  }

  const cheeseQtys = await getUserItems(['gnawnia_boss_cheese', 'riftiago_cheese']);
  if (! cheeseQtys || ! cheeseQtys.length) {
    return;
  }

  const craft = document.querySelector('.riftGnawniaHud-craftingBait .riftGnawniaHud-tooltip-quantity');
  if (craft) {
    craft.textContent = cheeseQtys[0]?.quantity || 0;
  }

  const potion = document.querySelector('.riftGnawniaHud-potion .riftGnawniaHud-tooltip-quantity');
  if (potion) {
    craft.textContent = cheeseQtys[1]?.quantity || 0;
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  fixRiftTooltipQuantities();
  onTravel('rift_gnawnia', {
    callback: fixRiftTooltipQuantities,
  });
};
