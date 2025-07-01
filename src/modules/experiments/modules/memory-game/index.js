import { addSubmenuItem, getData, startMemoryGame } from '@utils';

const isValidItem = (item) => {
  const excludedImages = new Set([
    'https://i.mouse.rip/upscaled/parts-new.png',
    'https://i.mouse.rip/upscaled/egg-paint.png',
    'https://i.mouse.rip/upscaled/blueprint-new2.png',
    'https://i.mouse.rip/nothing.png'
  ]);

  const excludedClassifications = new Set([
    'adventure',
    'skin',
  ]);

  const excludedTypes = new Set([
    'bucket_o_cannon_parts_crafting_item',
  ]);

  return item.images &&
    item.images.best &&
    item.images.upscaled &&
    ! excludedImages.has(item.images.best) &&
    ! excludedImages.has(item.images.upscaled) &&
    ! excludedClassifications.has(item.classification) &&
    ! excludedTypes.has(item.type) &&
    ! item.is_airship_part &&
    item.name.length < 25;
};

const init = async () => {
  addSubmenuItem({
    menu: 'camp',
    label: 'Memory Matching Game',
    icon: 'https://i.mouse.rip/icons/game.png',
    callback: async () => {
      const items = await getData('items');
      startMemoryGame({
        items: items.filter((element) => isValidItem(element)),
        mode: 'easy'
      });
    }
  });

  addSubmenuItem({
    menu: 'camp',
    label: 'Memory Game (hard)',
    icon: 'https://i.mouse.rip/icons/game.png',
    callback: async () => {
      const items = await getData('items');
      startMemoryGame({
        items: items.filter((element) => isValidItem(element)),
        mode: 'hard'
      });
    }
  });

  addSubmenuItem({
    menu: 'camp',
    label: 'Memory Game (extreme)',
    icon: 'https://i.mouse.rip/icons/game.png',
    callback: async () => {
      const items = await getData('items');
      startMemoryGame({
        title: 'Memory Matching Game (150 items)',
        items: items.filter((element) => isValidItem(element)),
        mode: 'nope'
      });
    }
  });
};

export default {
  id: 'experiments.memory-game',
  name: 'Memory Matching Game',
  description: 'Find it under the Camp submenu.',
  load: init,
};
