import { getCurrentLocation, onTravel } from '@utils';

/**
 * Fix the tooltip quantities for Gnawnia Rift.
 */
const fixRiftTooltipQuantities = async () => {
  if ('rift_gnawnia' !== getCurrentLocation()) {
    return;
  }

  const craft = document.querySelector('.riftGnawniaHud-craftingBait .riftGnawniaHud-tooltip-quantity');
  if (craft) {
    craft.textContent = user?.enviroment_atts?.items?.gnawnia_boss_cheese?.quantity || 0;
  }

  const potion = document.querySelector('.riftGnawniaHud-potion .riftGnawniaHud-tooltip-quantity');
  if (potion) {
    potion.textContent = user?.enviroment_atts?.items?.riftiago_cheese?.quantity || 0;
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
