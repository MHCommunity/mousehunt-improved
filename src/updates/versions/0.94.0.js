import { migrateSetting } from '@utils';

export default {
  version: '0.94.0',
  update: async () => {
    migrateSetting('experiments.trap-background', 'better-ui.trap-gradient-background');
  }
};
