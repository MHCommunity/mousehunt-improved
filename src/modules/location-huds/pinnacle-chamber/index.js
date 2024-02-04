import addCheeseSelector from '../shared/cheese-selectors';

/**
 * Initialize the module.
 */
export default async () => {
  addCheeseSelector('pinnacle-chamber', [
    'maki_cheese',
    'onyx_gorgonzola_cheese',
  ]);
};
