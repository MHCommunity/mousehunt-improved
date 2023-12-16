import addCheeseSelector from '../shared/cheese-selectors';

/**
 * Initialize the module.
 */
export default async () => {
  addCheeseSelector('acolyte-realm', [
    'ancient_cheese',
    'runic_cheese',
    'radioactive_blue_cheese',
    'magical_radioactive_blue_cheese',
  ]);
};
