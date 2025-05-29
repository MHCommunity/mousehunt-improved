// treasureMapView-previewRewardsButton

import { getData, makeElement, mapData, waitForElement } from '@utils';

export default () => {
  const previewRewardsButton = document.querySelector('.treasureMapView-previewRewardsButton');
  if (! previewRewardsButton) {
    return;
  }

  previewRewardsButton.addEventListener('click', async () => {
    const theMapData = mapData();
    if (! theMapData) {
      return;
    }

    const preview = await waitForElement('.treasureMapDialogView-chestPreview');
    if (! preview) {
      return;
    }

    const mhctConvertibles = await getData('mhct-convertibles');
    if (! mhctConvertibles) {
      return;
    }

    const rewardType = theMapData?.reward?.type;
    const rewardContents = theMapData?.reward?.contents || [];

    const rewardData = mhctConvertibles.find((item) => item.type === rewardType);

    console.log('Preview Rewards Button Clicked', rewardType, rewardData, rewardContents, rewardData?.convertibles);

    const previeItems = document.querySelectorAll('.treasureMapDialogView-chest-item');
    previeItems.forEach((item) => {
      const itemNameEl = item.querySelector('.treasureMapDialogView-chest-item-name span');
      if (! itemNameEl) {
        return;
      }

      const itemName = itemNameEl.textContent.trim();

      const itemType = rewardContents.find((convertible) => convertible.name === itemName);
      if (! itemType || ! itemType.type) {
        return;
      }

      const itemData = rewardData?.convertibles?.find((convertible) => convertible.item === itemType.type);
      console.log('Item Data', itemName, itemData);
      if (itemData) {
        const itemPadding = item.querySelector('.treasureMapDialogView-chest-item-padding');
        if (! itemPadding) {
          return;
        }

        const details = makeElement('div', 'mh-improved-reward-details');

        const min = Number.parseInt(itemData.min_item_quantity, 10);
        const max = Number.parseInt(itemData.max_item_quantity, 10);
        const quantity = makeElement('div', 'mh-improved-reward-quantity', min === max ? min.toLocaleString() : `${min.toLocaleString()} - ${max.toLocaleString()}`);
        itemNameEl.prepend(quantity);

        const chance = (itemData?.times_with_any || 0) / (itemData?.single_opens || 1) * 100;
        makeElement('div', 'mh-improved-reward-chance', `${chance.toFixed(chance < 1 ? 2 : 0)}%`, details);
        itemPadding.append(details);
      }
    });
  });
};
