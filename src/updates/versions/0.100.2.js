import { deleteSetting, getSetting, saveSetting } from '@utils';

export default {
  version: '0.100.2',
  update: async () => {
    // The 0.100.0 merge into Hunter ID Shortcuts could turn copying off for hunters who had it on, so
    // move to a new key and only keep a deliberate profile picture choice; everything else is the button.
    const copyMode = getSetting('hunter-id-shortcuts.copy-0', null);
    saveSetting('hunter-id-shortcuts.copy-mode-0', 'profile-picture' === copyMode ? 'profile-picture' : 'button');
    deleteSetting('hunter-id-shortcuts.copy-0');
  },
};
