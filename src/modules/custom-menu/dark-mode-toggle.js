import { addIconToMenu, doEvent, getSetting, saveSetting } from '@utils';

const ICON_ID = 'mousehunt-improved-dark-mode-toggle';

/**
 * Add a Dark Mode toggle to the top menu. It's hidden until it's shown with Custom Menu.
 *
 * It lives here rather than in the Dark Mode module so it's still there to turn Dark Mode back on.
 */
export default () => {
  addIconToMenu({
    id: ICON_ID,
    title: 'Toggle Dark Mode',
    position: 'prepend',
    action: (e) => {
      e.preventDefault();

      const enabled = !getSetting('native-dark-mode', false);
      saveSetting('native-dark-mode', enabled);

      // Dark Mode is a live module, so this turns it on or off without a reload.
      doEvent('mh-improved-settings-changed', {
        key: 'native-dark-mode',
        value: enabled,
        tab: 'mousehunt-improved-settings',
        type: 'toggle',
      });
    },
  });

  const icon = document.querySelector(`#${ICON_ID}`);
  if (icon) {
    icon.title = 'Toggle Dark Mode';
  }
};
