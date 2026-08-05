import { cacheDelete } from '@utils';

export default {
  version: '0.99.12',
  update: async () => {
    // The map-groups and ultimate-checkmark data files are no longer fetched
    // remotely — the bundled copies are the only ones used — so drop the
    // cached downloads.
    await cacheDelete('map-groups');
    await cacheDelete('ultimate-checkmark');
  },
};
