import { addOnboardingMessage } from '@utils';

const init = async () => {
  addOnboardingMessage({
    step: 'mh-improved-onboarding-1',
    page: 'camp',
    highlightSelector: '.mousehunt-improved-icon-menu',
    content: 'Welcome to MouseHunt Improved! You can quickly get to the settings using this icon.',
    direction: 'bottom',
    showOverlay: true,
  });

  addOnboardingMessage({
    step: 'mh-improved-onboarding-2',
    page: 'preferences',
    highlightSelector: '#mousehunt-improved-settings-better',
    content: 'Here you can toggle features and customize things to your liking.',
    direction: 'top',
    showOverlay: true,
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'onboarding',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
