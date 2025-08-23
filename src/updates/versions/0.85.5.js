import { getSetting, saveSetting } from '@utils';

export default {
  version: '0.85.5',
  update: async () => {
    if (
      getSetting('location-huds.bountiful-beanstalk-flip-avatar') ||
      getSetting('location-huds.valour-rift-flip-avatar')
    ) {
      saveSetting('location-huds.flip-avatar-images', true);
    }

    if (getSetting('experiments.fi-draggable-airship', false)) {
      saveSetting('location-huds.fi-draggable-airship', true);
    }
  }
};
