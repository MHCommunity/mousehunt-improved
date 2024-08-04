import { getCurrentPage, getCurrentTab } from './page';
import { getSetting, saveSetting } from './settings';
import { waitForElement } from './elements';

const hasSeenOnboardingStep = (step) => {
  return getSetting(`onboarding.${step}`, false);
};

const saveOnboardingStep = (step) => {
  saveSetting(`onboarding.${step}`, true);
};

let hasAddedOnboardingStep = false;
const addOnboardingMessage = async (options) => {
  const {
    step,
    page,
    tab,
    highlightSelector,
    content,
    direction,
    highlightPadding = 3,
    classname,
    button,
    onShowCallback = () => {},
    onCloseCallback = () => {},
    showOverlay = true,
    delay = 100,
  } = options;

  if (
    hasAddedOnboardingStep ||
    hasSeenOnboardingStep(step) ||
    (page && page !== getCurrentPage()) ||
    (tab && tab !== getCurrentTab())
  ) {
    return;
  }

  hasAddedOnboardingStep = true;

  await waitForElement(highlightSelector);

  hg.views.MessengerView.addMessage({
    content: {
      body: hg.views.OnboardingTutorialView().wrapInfoArrow(content, button || 'OK'),
    },
    highlight_dom: highlightSelector,
    highlight_padding: highlightPadding,
    css_class: `larryCircle mh-improved-onboarding${classname ? ` ${classname}` : ''}`,
    show_overlay: showOverlay,
    on_show_callback() {
      hg.views.OnboardingTutorialView().showBouncyArrow(highlightSelector, direction);
      onShowCallback();
    },
    on_close_callback() {
      hg.views.OnboardingTutorialView().hideBouncyArrow();
      hasAddedOnboardingStep = false;
      saveOnboardingStep(step);
      onCloseCallback();
    },
  });

  setTimeout(() => {
    hg.views.MessengerView.go();
  }, delay);
};

export {
  hasSeenOnboardingStep,
  saveOnboardingStep,
  addOnboardingMessage
};
