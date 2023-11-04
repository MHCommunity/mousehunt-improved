import { addMhuiSetting } from '../../utils';

export default function (module) {
  addMhuiSetting(
    'better-inventory-open-all-but-one',
    'Add \'Open All but One\' Buttons',
    true,
    'Add \'Open All but One\' buttons to convertible items in the inventory.',
    module
  );

  addMhuiSetting(
    'better-inventory-lock-open-all',
    'Only Open Multiple',
    false,
    'Lock opening things in your inventory unless you have more than one',
    module
  );
}
