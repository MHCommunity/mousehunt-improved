import { addOnboardingMessage, addStyles, hasSeenOnboardingStep } from '@utils';

import styles from './styles.css';

const init = async () => {
  const steps = [
    {
      step: 'mh-improved-onboarding-1',
      page: 'camp',
      highlightSelector: '.mousehunt-improved-icon-menu',
      content: 'Welcome to <strong>MouseHunt Improved</strong>! This icon takes you to the setting page, where you can enable and customize all the features.',
      direction: 'bottom',
      showOverlay: true,
    },
    {
      step: 'mh-improved-onboarding-2',
      page: 'preferences',
      highlightSelector: '#mousehunt-improved-settings-better',
      content: 'Here you can toggle features and customize things to your liking.',
      direction: 'top',
      showOverlay: true,
    }
  ];

  if (steps.every(({ step }) => hasSeenOnboardingStep(step))) {
    return;
  }

  addStyles(styles, 'onboarding');

  for (const stepOptions of steps) {
    addOnboardingMessage(stepOptions);
  }
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
