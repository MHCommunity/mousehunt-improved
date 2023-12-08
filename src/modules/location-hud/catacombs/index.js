import addCheeseSelector from '../shared/cheese-selectors';

/**
 * Initialize the module.
 */
export default () => {
  addCheeseSelector('catacombs', [
    'ancient_cheese',
    'undead_emmental_cheese',
    'string_undead_emmental_cheese',
    'radioactive_blue_cheese',
    'super_radioactive_blue_cheese',
    'magical_radioactive_blue_cheese',
    'moon_cheese',
    'crescent_cheese',
  ]);
};
