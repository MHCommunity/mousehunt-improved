// treasureMapView-previewRewardsButton

import { fetchMouseRip, makeElement, mapData, waitForElement } from '@utils';

// The content stage runs on every map render pass, and several passes hit the same button
// element. Without this the click handler stacks, and each copy prepends the quantity and
// appends the drop-chance row again.
const boundPreviewButtons = new WeakSet();

export default () => {
  const previewRewardsButton = document.querySelector('.treasureMapView-previewRewardsButton');
  if (!previewRewardsButton) {
    return;
  }

  if (boundPreviewButtons.has(previewRewardsButton)) {
    return;
  }

  boundPreviewButtons.add(previewRewardsButton);

  previewRewardsButton.addEventListener('click', async () => {
    const theMapData = mapData();
    if (!theMapData) {
      return;
    }

    const preview = await waitForElement('.treasureMapDialogView-chestPreview');
    if (!preview) {
      return;
    }

    const rewardType = theMapData?.reward?.type;
    if (!rewardType) {
      return;
    }

    const rewardContents = theMapData?.reward?.contents || [];
    const reward = await fetchMouseRip(`items/${encodeURIComponent(rewardType)}`);
    if (!reward?.id) {
      return;
    }

    const convertibleContents = await fetchMouseRip(`convertible/${reward.id}`);
    if (!Array.isArray(convertibleContents)) {
      return;
    }

    const previeItems = document.querySelectorAll('.treasureMapDialogView-chest-item');
    previeItems.forEach((item) => {
      const itemNameEl = item.querySelector('.treasureMapDialogView-chest-item-name span');
      if (!itemNameEl) {
        return;
      }

      const itemName = itemNameEl.textContent.trim();

      if (!rewardContents.some((convertible) => convertible.name === itemName)) {
        return;
      }

      const itemData = convertibleContents.find((convertible) => convertible.name === itemName);
      if (itemData) {
        const itemPadding = item.querySelector('.treasureMapDialogView-chest-item-padding');
        if (!itemPadding) {
          return;
        }

        const details = makeElement('div', 'mh-improved-reward-details');

        const min = Number.parseInt(itemData.min, 10);
        const max = Number.parseInt(itemData.max, 10);
        const quantity = makeElement('div', 'mh-improved-reward-quantity', min === max ? min.toLocaleString() : `${min.toLocaleString()} - ${max.toLocaleString()}`);
        itemNameEl.prepend(quantity);

        const chance = Number.parseFloat(itemData.chance) || 0;
        makeElement('div', 'mh-improved-reward-chance', `${chance.toFixed(chance < 1 ? 2 : 0)}%`, details);
        itemPadding.append(details);
      }
    });
  });
};
