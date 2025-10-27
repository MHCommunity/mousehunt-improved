import { clearCaches } from '@utils';

export default {
  version: '0.93.3',
  update: async () => {
    await clearCaches();
  }
};
