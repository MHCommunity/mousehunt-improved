import addCheeseSelector from '../shared/cheese-selectors';

/**
 * Initialize the module.
 */
export default async () => {
  addCheeseSelector('pinnacle-chamber', [
    'rumble_cheese',
    'onyx_gorgonzola_cheese',
  ]);
};
