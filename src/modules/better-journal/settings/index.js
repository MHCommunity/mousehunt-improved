import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default async (module) => {
  const styles = await addMhuiSetting(
    'better-journal-styles',
    'Asterios Mode',
    true,
    '',
    module
  );

  const replacements = await addMhuiSetting(
    'better-journal-no-replacements',
    'No Replacements',
    false,
    '',
    module
  );

  return [styles, replacements];
};
