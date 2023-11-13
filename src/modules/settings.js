import { debug } from './utils';
import globalStyles from './global-styles/styles.css';

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
    'Custom CSS to apply to MouseHunt.',
    advancedTab,
    'mousehunt-improved-settings',
    { type: 'textarea' }
  );

  addSetting(
    'Custom Flags',
    'override-flags',
    '',
    'Comma seperated list of feature flags to enable.',
    advancedTab,
    'mousehunt-improved-settings',
    { type: 'input' }
  );
};

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
        getSetting(subModule.id, subModule.default, 'mousehunt-improved-settings')
      )
    ) {
      subModule.settings(module);
    }
  });
};

const showLoadingError = (e) => {
  debug('Error loading MouseHunt Improved:', e); // eslint-disable-line no-console

  // Add the error to the page.
  const errorElement = document.createElement('div');
  errorElement.classList.add('mousehunt-improved-error');
  errorElement.innerHTML = '<h1>Error loading MouseHunt Improved</h1>';
  if (e.message) {
    errorElement.innerHTML += `<pre>${e.message}</pre>`;
  }
  errorElement.innerHTML += '<p>There was an error loading MouseHunt Improved. Try refreshing the page. If the error persists, please add an issue to the <a href="https://github.com/MHCommunity/mousehunt-improved">GitHub repo</a>.</p>';
  document.body.appendChild(errorElement);

  const errorStyles = document.createElement('style');
  errorStyles.innerHTML = globalStyles;
  document.head.appendChild(errorStyles);
};

export {
  addAdvancedSettings,
  addSettingForModule,
  showLoadingError
};
