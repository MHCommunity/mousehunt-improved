import { getData, getSetting, saveSetting } from '@utils';

const update = async () => {
  const items = await getData('items');

  let itemSettings = getSetting('inventory-lock-and-hide.items', {
    locked: [],
    hidden: [],
  });

  itemSettings.locked = itemSettings.locked.map((i) => Number.parseInt(i, 10));
  itemSettings.hidden = itemSettings.hidden.map((i) => Number.parseInt(i, 10));

  itemSettings = {
    locked: itemSettings.locked,
    hidden: itemSettings.hidden,
    lockedTypes: itemSettings.locked.map((id) => items.find((item) => item.id === id)?.type),
    hiddenTypes: itemSettings.hidden.map((id) => items.find((item) => item.id === id)?.type),
  };

  saveSetting('inventory-lock-and-hide.items', itemSettings);
}

export default {
  id: '0.45.0',
  update
};
