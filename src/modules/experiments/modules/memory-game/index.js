import { addSubmenuItem, getData, startMemoryGame } from '@utils';

const init = async () => {
  addSubmenuItem({
    menu: 'camp',
    label: 'Memory Matching Game',
    icon: 'https://i.mouse.rip/icons/game.png',
    callback: async () => {
      const items = await getData('items');
      startMemoryGame({ items: items.filter((item) => {
        return ! item.is_limited_edition && item.name.length < 25 && item.images && item.images.best;
      }) });
    }
  });
};

export default {
  id: 'experiments.memory-game',
  name: 'Memory Matching Game',
  description: 'Find it under the Camp submenu.',
  load: init,
};
