import { migrateFlag, migrateSetting } from '@utils';

export default {
  version: '0.98.0',
  update: async () => {
    migrateSetting('experiments.full-mice-images-no-border', 'better-journal.full-mice-images-no-border');
    migrateSetting('experiments.consistent-profile-pics', 'better-ui.square-profile-pics');
    migrateSetting('experiments.gift-button-opens-gift-selector', 'better-gifts.gift-button-opens-gift-selector');
    migrateSetting('better-shop.qty-buttons', 'better-shops.qty-buttons');
    migrateSetting('wisdom-in-stat-bar-auto-refresh', 'wisdom-in-stat-bar.auto-refresh');

    migrateFlag('rankup-forecaster', 'userscript-styles-no-rankup-forecaster');
  },
};
