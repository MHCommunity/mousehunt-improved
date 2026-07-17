import { deleteSetting } from '@utils';

export default {
  version: '0.99.4',
  update: async () => {
    // Full mice images now always mask out the white background, replacing the
    // separate no-border setting.
    deleteSetting('better-journal.full-mice-images-no-border');
  },
};
