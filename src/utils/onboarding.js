import { getCurrentPage, getCurrentTab } from './page';
import { getSetting, saveSetting } from './settings';
import { waitForElement } from './elements';

/**
 * Check if an onboarding step has been seen.
 *
 * @param {string} step The step to check.
 *
 * @return {boolean} Whether the step has been seen.
 */
const hasSeenOnboardingStep = (step) => {
  return getSetting(`onboarding.${step}`, false);
};

/**
 * Mark an onboarding step as completed.
 *
 * @param {string} step The step to save.
 */
const saveOnboardingStep = (step) => {
  saveSetting(`onboarding.${step}`, true);
};

let hasAddedOnboardingStep = false;
/**
 * Add an onboarding/tutorial message.
 *
 * @param {Object}   options                   The options for the message.
 * @param {string}   options.step              The step for the message.
 * @param {string}   options.page              The page for the message.
 * @param {string}   options.tab               The tab for the message.
 * @param {string}   options.highlightSelector The selector to highlight.
 * @param {string}   options.content           The content for the message.
 * @param {string}   options.direction         The direction for the arrow.
 * @param {number}   options.highlightPadding  The padding for the highlight.
 * @param {string}   options.classname         The classname for the message.
 * @param {string}   options.button            The button text.
 * @param {Function} options.onShowCallback    The callback for the show event.
 * @param {Function} options.onCloseCallback   The callback for the close event.
 * @param {boolean}  options.showOverlay       Whether to show the overlay.
 * @param {number}   options.delay             The delay for the message.
 */
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

  setTimeout(hg.views.MessengerView.go, delay);
};

export {
  hasSeenOnboardingStep,
  saveOnboardingStep,
  addOnboardingMessage
};
