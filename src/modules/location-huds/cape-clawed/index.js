import addCheeseSelector from '../shared/cheese-selectors';

/**
 * Initialize the module.
 */
export default async () => {
  addCheeseSelector('cape-clawed', [
    'shell_cheese',
    'gumbo_cheese',
    'crunchy_cheese',
  ]);
};
