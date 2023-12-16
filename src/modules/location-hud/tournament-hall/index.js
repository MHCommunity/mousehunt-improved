import addCheeseSelector from '../shared/cheese-selectors';

/**
 * Initialize the module.
 */
export default async () => {
  addCheeseSelector('tournament-hall', [
    'runny_cheese',
  ]);
};
