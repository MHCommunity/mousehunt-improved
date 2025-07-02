import { clearCaches, dataSet, getSetting, saveSetting } from '@utils';

export default {
  version: '0.83.0',
  update: async () => {
    if (getSetting('experiments.full-mice-images-in-journal', false)) {
      saveSetting('better-journal.full-mice-images', true);
      saveSetting('experiments.full-mice-images-in-journal', false);
    }

    const draggableKeys = Object.keys(localStorage).filter((key) => key.startsWith('mh-draggable-'));
    draggableKeys.forEach(async (key) => {
      localStorage.removeItem(key);
    });

    const catchStatsPosition = localStorage.getItem('mh-catch-stats-position');
    if (catchStatsPosition) {
      await dataSet('mh-draggable--mh-catch-stats', catchStatsPosition);
      localStorage.removeItem('mh-catch-stats-position');
    }

    await clearCaches();
    return true;
  }
};
