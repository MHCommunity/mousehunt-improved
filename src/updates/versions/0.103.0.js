import { defaultHiddenMenuItems, deleteSetting, getSetting, lsGet, migrateSetting, saveSectionCollapsed, saveSetting } from '@utils';

import replaceSettingsWithFlags from '../replace-settings-with-flags';

/**
 * Hunters Online and Friends Online are Custom Menu items now, so anyone who hid the bar they're in
 * has them hidden in Custom Menu instead.
 */
const migrateGameInfoBar = () => {
  const key = 'hide-page-elements.hide-game-info-bar';

  // It only hid the bar while Hide Page Elements was on.
  if (getSetting('hide-page-elements', true) && true === getSetting(key, false)) {
    const ids = ['hunters-online', 'friends-online'];
    const layout = getSetting('custom-menu.layout', null) || {};
    const remove = (list) => (Array.isArray(list) ? list.filter((id) => !ids.includes(id)) : list);

    saveSetting('custom-menu.layout', {
      ...layout,
      left: remove(layout.left),
      right: remove(layout.right),
      info: remove(layout.info),
      // A layout that was never changed hides the default items, so they stay hidden.
      hidden: [...remove(Array.isArray(layout.hidden) ? layout.hidden : defaultHiddenMenuItems), ...ids],
    });
  }

  deleteSetting(key);
};

/**
 * Reverse Daily Draw order is a flag now, so anyone who had it on gets the flag.
 */
const migrateReverseDailyDraw = () => {
  const key = 'reverse-daily-draw-order';
  const flag = 'better-ui-reverse-daily-draw';

  if (true === getSetting(key, false)) {
    const flags = getSetting('override-flags', '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!flags.includes(flag)) {
      saveSetting('override-flags', [...flags, flag].join(','));
    }
  }

  deleteSetting(key);
};

/**
 * The three Fabled max title experiments are one module now, with a picker for which one to show.
 */
const migrateFabledMaxTitle = () => {
  const styles = [
    ['experiments.fabled-random-title', 'random'],
    ['experiments.fabled-custom-title', 'custom'],
    ['experiments.fabled-max-title-progress-bar', 'progress-bar'],
  ];

  const enabled = styles.find(([key]) => true === getSetting(key, false));
  if (enabled) {
    saveSetting('fabled-max-title', true);
    saveSetting('fabled-max-title.style-0', enabled[1]);
  }

  for (const [key] of styles) {
    deleteSetting(key);
  }

  migrateSetting('experiments.fabled-custom-title-text', 'fabled-max-title.custom-text');
};

/**
 * Collapsible sections share one setting now, so carry over the ones that were saved separately.
 */
const migrateCollapsedSections = () => {
  const lists = [
    ['better-mice.collapsed-crown-groups', 'kings-crowns'],
    ['skyport-star-tracker.collapsed-raids', 'skyport-star-tracker'],
  ];

  for (const [key, prefix] of lists) {
    const collapsed = getSetting(key, []);
    if (Array.isArray(collapsed)) {
      collapsed.forEach((id) => saveSectionCollapsed(`${prefix}.${id}`, true));
    }

    deleteSetting(key);
  }

  const toggles = [
    ['better-marketplace.markethunt-chart-collapsed', 'marketplace.markethunt-chart'],
    ['better-marketplace.price-history-chart-collapsed', 'marketplace.price-chart'],
  ];

  for (const [key, section] of toggles) {
    if (true === getSetting(key, false)) {
      saveSectionCollapsed(section, true);
    }

    deleteSetting(key);
  }

  const planKey = 'mh-improved-map-plan-guaranteed-collapsed';
  if (true === lsGet(planKey, false)) {
    saveSectionCollapsed('maps.plan-guaranteed', true);
  }

  localStorage.removeItem(planKey);
};

/**
 * The two "Open All But One" toggles are one picker now.
 */
const migrateOpenAllButOne = () => {
  const showKey = 'inventory-buttons.open-all-but-one';
  const onlyKey = 'inventory-buttons.only-open-extras';

  if (true === getSetting(onlyKey, false)) {
    saveSetting(`${showKey}-0`, 'only');
  } else if (true === getSetting(showKey, false)) {
    saveSetting(`${showKey}-0`, 'show');
  }

  deleteSetting(showKey);
  deleteSetting(onlyKey);
};

/**
 * Hide Page Elements, Hover Delays, Hunter ID Shortcuts, and Convertible Opening Buttons can't be turned
 * off anymore, so anyone who had one off has each of its options turned off instead.
 */
const migrateAlwaysOnModules = () => {
  const modules = {
    'hide-page-elements': {
      'hide-page-elements.hide-sidebar': false,
      'hide-page-elements.hide-ads': false,
      'hide-page-elements.hide-share': false,
      'hide-page-elements.hide-news-ticker': false,
      'hide-page-elements.hide-footer': false,
      'hide-page-elements.hide-daily-draw': false,
      'hide-page-elements.hide-daily-reward-popup': false,
    },
    'hover-delays': {
      'hover-delays.menus': false,
      'hover-delays.tooltips': false,
    },
    'hunter-id-shortcuts': {
      'hunter-id-shortcuts.copy-mode-0': 'off',
      'hunter-id-shortcuts.paste': false,
    },
    'inventory-buttons': {
      'inventory-buttons.open-one': false,
      'inventory-buttons.open-all': false,
      'inventory-buttons.open-all-but-one-0': 'off',
    },
  };

  for (const [id, offSettings] of Object.entries(modules)) {
    if (false === getSetting(id, true)) {
      for (const [key, value] of Object.entries(offSettings)) {
        saveSetting(key, value);
      }
    }

    deleteSetting(id);
  }
};

/**
 * Location Dashboard can't be turned off anymore, so anyone who had it off has its menu item hidden in
 * Custom Menu instead.
 */
const migrateLocationDashboard = () => {
  const id = 'location-dashboard';

  if (false === getSetting(id, true)) {
    const layout = getSetting('custom-menu.layout', null) || {};
    // A layout that was never changed hides the default items, so they stay hidden.
    const hidden = Array.isArray(layout.hidden) ? layout.hidden : defaultHiddenMenuItems;

    saveSetting('custom-menu.layout', {
      ...layout,
      hidden: [...hidden.filter((item) => item !== id), id],
    });
  }

  deleteSetting(id);
};

export default {
  version: '0.103.0',
  update: async () => {
    migrateGameInfoBar();
    migrateSetting('experiments.airship-randomizer', 'location-huds.fi-airship-randomizer');
    migrateReverseDailyDraw();
    migrateFabledMaxTitle();
    migrateCollapsedSections();
    migrateOpenAllButOne();
    migrateAlwaysOnModules();
    migrateLocationDashboard();
    // Item Abbreviation Search is always on now, unless it's turned off with a flag.
    deleteSetting('enhanced-search');

    replaceSettingsWithFlags([
      ['better-trap-selector.larger-skin-images', 'better-trap-selector-no-larger-skin-images', 'Show the small skin images in the trap selector'],
      ['better-trap-selector.show-unowned-skins', 'better-trap-selector-no-unowned-skins', "Don't show unowned skins in the trap selector"],
      ['better-trap-selector.larger-codices', 'custom-trap-selector-no-larger-codices', 'Show the small codex images in the trap selector'],
      ['better-inventory.sort-inventory', 'better-inventory-no-sort', "Don't sort the inventory alphabetically"],
      ['journal-privacy.transparent', 'journal-privacy-transparent', 'Hide names in the journal instead of blurring them', true],
    ]);
  },
};
