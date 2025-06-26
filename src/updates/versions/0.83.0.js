import { clearCaches, saveSetting } from '@utils';

export default {
  version: '0.83.0',
  update: async () => {
    if (getSetting('experiments.full-mice-images-in-journal', false)) {
      saveSetting('better-journal.full-mice-images', true);
      saveSetting('experiments.full-mice-images-in-journal', false);
    }

    await clearCaches();
    return true;
  }
};
