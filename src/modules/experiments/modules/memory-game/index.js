import { addSubmenuItem, getData } from '@utils';
import { startMemoryGame } from '@utils/shared/memory-game';

let validItemsPromise = null;

const isValidItem = (item) => {
  const excludedImages = new Set([
    'https://i.mouse.rip/upscaled/parts-new.png',
    'https://i.mouse.rip/upscaled/egg-paint.png',
    'https://i.mouse.rip/upscaled/blueprint-new2.png',
    'https://i.mouse.rip/nothing.png',
  ]);

  const excludedClassifications = new Set(['adventure', 'skin']);

  const excludedTypes = new Set(['bucket_o_cannon_parts_crafting_item']);

  return (
    item.images &&
    item.images.best &&
    item.images.upscaled &&
    !excludedImages.has(item.images.best) &&
    !excludedImages.has(item.images.upscaled) &&
    !excludedClassifications.has(item.classification) &&
    !excludedTypes.has(item.type) &&
    !item.is_airship_part &&
    item.name.length < 25
  );
};

const getValidItems = async () => {
  if (!validItemsPromise) {
    validItemsPromise = getData('items').then((items) => {
      if (!Array.isArray(items)) {
        return [];
      }

      return items.filter((element) => isValidItem(element));
    });
  }

  const validItems = await validItemsPromise;
  if (validItems.length === 0) {
    validItemsPromise = null;
  }

  return validItems;
};

const startGame = async (settings) => {
  const items = await getValidItems();
  if (items.length === 0) {
    return;
  }

  startMemoryGame({
    items,
    ...settings,
  });
};

const init = async () => {
  addSubmenuItem({
    menu: 'camp',
    label: 'Memory Matching Game',
    icon: 'https://i.mouse.rip/icons/game.png',
    callback: () =>
      startGame({
        mode: 'easy',
      }),
  });

  addSubmenuItem({
    menu: 'camp',
    label: 'Memory Game (hard)',
    icon: 'https://i.mouse.rip/icons/game.png',
    callback: () =>
      startGame({
        mode: 'hard',
      }),
  });

  addSubmenuItem({
    menu: 'camp',
    label: 'Memory Game (extreme)',
    icon: 'https://i.mouse.rip/icons/game.png',
    callback: () =>
      startGame({
        title: 'Memory Matching Game (150 items)',
        mode: 'nope',
      }),
  });
};

export default {
  id: 'experiments.memory-game',
  name: 'Memory Matching Game',
  description: 'Find it under the Camp submenu.',
  load: init,
};
