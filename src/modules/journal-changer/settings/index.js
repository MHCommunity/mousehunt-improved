import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
  return addMhuiSetting(
    'journal-changer-change-daily',
    'Randomize Journal Daily',
    false,
    'Randomize the journal theme daily',
    module
  );

  return addMhuiSetting(
    'journal-changer-change-location',
    'Change Journal for Location',
    true,
    'Change the journal theme based on the current location',
    module
  );
}
