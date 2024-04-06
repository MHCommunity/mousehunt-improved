import { getFlag, getSetting, saveSetting } from '@utils';

const update = () => {
  if (getSetting('experiments.iceberg-always-show-progress', getFlag('iceberg-always-show-progress'))) {
    saveSetting('location-huds.iceberg-sticky-tooltip', true);
  }
};

export default {
  id: '0.40.0',
  update
};
