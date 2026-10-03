import { defaultHiddenMenuItems, deleteSetting, getSetting, saveSetting } from '@utils';

export default {
  version: '0.99.16',
  update: async () => {
    // The Journal Privacy and Location HUD toggle icons are now shown or hidden
    // with Custom Menu, replacing their separate settings.
    const layout = getSetting('custom-menu.layout', null);
    const hidden = new Set(Array.isArray(layout?.hidden) ? layout.hidden : defaultHiddenMenuItems);

    if (false === getSetting('journal-privacy.show-toggle-icon', true)) {
      hidden.add('mousehunt-improved-journal-privacy');
    }

    if (getSetting('location-huds.location-hud-toggle', false)) {
      hidden.delete('mousehunt-improved-location-huds');
    } else {
      hidden.add('mousehunt-improved-location-huds');
    }

    // Only save a layout if there's one already, or the result isn't just the defaults.
    const isDefault = hidden.size === defaultHiddenMenuItems.length && defaultHiddenMenuItems.every((id) => hidden.has(id));
    if (layout || !isDefault) {
      saveSetting('custom-menu.layout', { ...layout, hidden: [...hidden] });
    }

    deleteSetting('journal-privacy.show-toggle-icon');
    deleteSetting('location-huds.location-hud-toggle');
  },
};
