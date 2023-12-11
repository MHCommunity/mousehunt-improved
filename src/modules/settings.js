import { addSetting, debug, getMhuiSetting } from '@/utils';

import globalStyles from './global-styles/styles.css';

/**
 * Add the advanced settings tab.
 */
const addAdvancedSettings = () => {
  // Add the advanced override settings.
  const advancedTab = {
    id: 'mousehunt-improved-settings-overrides',
    name: 'Overrides',
    default: true,
    description: '',
  };

  addSetting(
    'Custom Styles',
    'override-styles',
    '',
    '<a href="https://github.com/MHCommunity/mousehunt-improved/wiki/Custom-CSS" target="_blank">Custom CSS</a> to apply to MouseHunt.',
    advancedTab,
    'mousehunt-improved-settings',
    { type: 'textarea' }
  );

  addSetting(
    'Feature Flags',
    'override-flags',
    '',
    'Comma seperated list of <a href="https://github.com/MHCommunity/mousehunt-improved/wiki/List-of-Feature-Flags" target="_blank">feature flags</a> to enable.',
    advancedTab,
    'mousehunt-improved-settings',
    { type: 'input' }
  );
};

/**
 * Add the settings for a module.
 *
 * @param {Object} module The module to add settings for.
 */
const addSettingForModule = (module) => {
  module.modules.forEach((subModule) => {
    if (! subModule.alwaysLoad) {
      addSetting(
        subModule.name,
        subModule.id,
        subModule.default,
        subModule.description,
        {
          id: module.id,
          name: module.name,
          description: module.description,
        },
        'mousehunt-improved-settings'
      );
    }

    if (
      subModule.settings && (
        subModule.alwaysLoad ||
        getMhuiSetting(subModule.id, subModule.default)
      )
    ) {
      const subModSettings = module;
      subModSettings.subSetting = true;
      subModule.settings(subModSettings);
    }
  });
};

/**
 * Show an error message when the script fails to load.
 *
 * @param {Error} e The error that was thrown.
 */
const showLoadingError = (e) => {
  debug('Error loading MouseHunt Improved:', e);

  // Add the error to the page.
  const errorElement = document.createElement('div');
  errorElement.classList.add('mousehunt-improved-error');
  errorElement.innerHTML = '<h1>Error loading MouseHunt Improved</h1>';
  if (e.message) {
    errorElement.innerHTML += `<pre>${e.message}</pre>`;
  }
  errorElement.innerHTML += '<p>There was an error loading MouseHunt Improved. Try refreshing the page. If the error persists, please add an issue to the <a href="https://github.com/MHCommunity/mousehunt-improved">GitHub repo</a>.</p>';
  document.body.append(errorElement);

  const errorStyles = document.createElement('style');
  errorStyles.innerHTML = globalStyles;
  document.head.append(errorStyles);
};

export {
  addAdvancedSettings,
  addSettingForModule,
  showLoadingError
};
