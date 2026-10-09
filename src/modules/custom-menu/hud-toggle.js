import { addBodyClass, addIconToMenu, getSetting, removeBodyClass, saveSetting } from '@utils';

const ICON_ID = 'mousehunt-improved-hud-toggle';
const HIDDEN_CLASS = 'mh-improved-hud-hidden';
const settingKey = 'custom-menu.hud-hidden';

/**
 * Show or hide the location HUD, and match the menu item to it.
 *
 * It's hidden with CSS rather than the game's showBlankLocationHud(), which empties the HUD, and most
 * locations can't render it again without a refresh.
 *
 * @param {boolean} isHidden Whether the HUD is hidden.
 */
const applyHudHidden = (isHidden) => {
  if (isHidden) {
    addBodyClass(HIDDEN_CLASS, true);
  } else {
    removeBodyClass(HIDDEN_CLASS);
  }

  const icon = document.querySelector(`#${ICON_ID}`);
  if (icon) {
    icon.title = isHidden ? 'Show HUD' : 'Hide HUD';
  }
};

/**
 * Add a toggle to the top menu that hides and shows the location HUD. It's hidden until it's shown
 * with Custom Menu.
 */
export default () => {
  addIconToMenu({
    id: ICON_ID,
    title: 'Toggle HUD',
    position: 'prepend',
    action: (e) => {
      e.preventDefault();

      const isHidden = !getSetting(settingKey, false);
      saveSetting(settingKey, isHidden);
      applyHudHidden(isHidden);
    },
  });

  applyHudHidden(getSetting(settingKey, false));
};
