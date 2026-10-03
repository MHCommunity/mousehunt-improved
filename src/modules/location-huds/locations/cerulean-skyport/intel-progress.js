import { onSkyportRaidDialogShow } from '@utils/shared/skyport-raid-dialog';

/**
 * Color the raid intel bars according to how close they are to 50 intel.
 */
const colorIntelProgressBars = () => {
  const costs = document.querySelectorAll('.ceruleanSkyportRaidChoiceDialogView__raidBarCostContainer');

  costs.forEach((cost) => {
    const quantityText = cost.querySelector('.ceruleanSkyportRaidChoiceDialogView__userQuantity')?.textContent;
    const progressBar = cost.querySelector('.ceruleanSkyportRaidChoiceDialogView__raidProgressBar');
    const quantity = Number(quantityText?.replaceAll(',', '').trim());

    if (!progressBar || !Number.isFinite(quantity)) {
      return;
    }

    progressBar.dataset.intelLevel = 50 <= quantity ? 'high' : 30 <= quantity ? 'near' : 10 <= quantity ? 'medium' : 'low';
  });
};

/**
 * Initialize the raid intel progress bar colors.
 */
const initIntelProgressBars = () => {
  onSkyportRaidDialogShow(colorIntelProgressBars);
};

export { initIntelProgressBars };
