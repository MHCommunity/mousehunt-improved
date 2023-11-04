import { addMhuiSetting } from '../../utils';
import getTradableItems from '../../../data/tradable-items';

export default function (module) {
  addMhuiSetting(
    'send-supplies-pinned-items',
    'Better Send Supplies Pinned Items',
    [
      {
        name: 'SUPER|brie+',
        value: 'SUPER|brie+',
      },
      {
        name: 'Empowered SUPER|brie+',
        value: 'Empowered SUPER|b...',
      },
      {
        name: 'Rift Cherries',
        value: 'Rift Cherries',
      },
      {
        name: 'Rift-torn Roots',
        value: 'Rift-torn Roots',
      },
      {
        name: 'Sap-filled Thorns',
        value: 'Sap-filled Thorns',
      },
    ],
    'Items to pin at the top of the send supplies page.',
    module,
    {
      type: 'multi-select',
      number: 5,
      options: getTradableItems('truncated_name'),
    }
  );
}
