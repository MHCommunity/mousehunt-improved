import favorites from './modules/favorites';
import recipes from './modules/recipes';
import sorting from './modules/sorting';

const featureManifest = [
  { id: 'sorting', setting: 'better-inventory.add-trap-sorting', default: false, load: sorting },
  { id: 'favorites', setting: 'better-inventory.favorites', default: false, load: favorites },
  { id: 'recipes', load: recipes },
];

export default featureManifest;
