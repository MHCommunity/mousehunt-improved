import {
  addBodyClass,
  addStyles,
  debuglog,
  getCurrentPage,
  getCurrentTab,
  getSetting,
  makeElement,
  onNavigation,
  removeBodyClass,
  saveSetting
} from '@utils';

import styles from './styles.css';

/**
 * Get the link to a version's release notes.
 *
 * @param {string} version The version to get the link for.
 *
 * @return {string} The link to the release notes.
 */
const getUpdateLink = (version) => {
  return `https://github.com/MHCommunity/mousehunt-improved/releases/tag/v${version}`;
};

/**
 * Check if the user has seen the update banner.
 *
 * @return {boolean} True if the user has seen the banner, false otherwise.
 */
const hasSeenBanner = () => {
  return mhImprovedVersion === getSetting('updates.banner', '');
};

/**
 * Check if the user has seen the onboarding step.
 *
 * @param {number} step The step to check.
 *
 * @return {boolean} True if the user has seen the onboarding step, false otherwise.
 */
const hasSeenOnboarding = (step = 0) => {
  const savedStepNumber = getSetting('updates.onboarding', 0);
  return savedStepNumber >= step;
};

/**
 * Save the onboarding step.
 *
 * @param {number} step The step to save.
 */
const saveOnboardingStep = (step) => {
  const savedStepNumber = getSetting('updates.onboarding', 0);
  if (savedStepNumber < step) {
    saveSetting('updates.onboarding', step);
  }
};

/**
 * Add the update banner.
 *
 * @param {boolean} hasNewSettings Whether there are new settings.
 */
const addBanner = (hasNewSettings = false) => {
  // Only show the banner once.
  if (hasSeenBanner()) {
    if (hasNewSettings) {
      removeBodyClass('mh-improved-has-update');
    }

    return;
  }

  // Also add a class to the body so the settings page can show a "new" badge if there are new settings.
  if (hasNewSettings) {
    addBodyClass('mh-improved-has-update');
  }

  // Don't show except on the camp page.
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const banner = document.querySelector('.campPage-tabs .campPage-banner');

  const bannerWrapper = makeElement('div', ['mhui-update-banner', 'banner-fade']);
  const bannerContent = makeElement('div', 'mhui-update-banner-content');
  makeElement('div', 'mhui-update-banner-text', `Welcome to MouseHunt Improved v${mhImprovedVersion}!`, bannerContent);

  const buttonWrapper = makeElement('div', 'mhui-update-banner-buttons', '');
  const button = makeElement('a', ['mhui-update-banner-button', 'mousehuntActionButton', 'small', 'lightBlue']);
  makeElement('span', '', 'See what\'s new', button);
  button.href = getUpdateLink(mhImprovedVersion);
  button.target = '_blank';
  buttonWrapper.append(button);

  const closeButton = makeElement('a', ['mhui-update-banner-close', 'mousehuntActionButton', 'small', 'cancel']);
  makeElement('span', '', 'Dismiss', closeButton);
  closeButton.addEventListener('click', (e) => {
    e.preventDefault();

    bannerWrapper.classList.add('banner-fade-out');
    saveSetting('updates.banner', mhImprovedVersion);

    removeBodyClass('mh-improved-has-update');

    setTimeout(() => {
      bannerWrapper.remove();
    }, 1000);
  });

  buttonWrapper.append(closeButton);

  bannerContent.append(buttonWrapper);
  bannerWrapper.append(bannerContent);

  banner.append(bannerWrapper);

  banner.classList.remove('hidden');

  setTimeout(() => {
    bannerWrapper.classList.add('banner-fade-in');
  }, 1000);
};

/**
 * Register an onboarding step.
 *
 * @param {Object}   options                   The options for the onboarding step.
 * @param {string}   options.highlightSelector The selector to highlight.
 * @param {string}   options.classname         The class name to add to the onboarding step.
 * @param {string}   options.content           The content for the onboarding step.
 * @param {string}   options.button            The button text for the onboarding step.
 * @param {string}   options.direction         The direction for the onboarding step.
 * @param {Function} options.onShowCallback    The callback to run when the onboarding step is shown.
 * @param {Function} options.onCloseCallback   The callback to run when the onboarding step is closed.
 * @param {number}   options.step              The step number for the onboarding step.
 * @param {string}   options.page              The page to show the onboarding step on.
 * @param {string}   options.tab               The tab to show the onboarding step on.
 */
const registerOnboardingStep = (options) => {
  const {
    highlightSelector,
    classname,
    content,
    button,
    direction,
    onShowCallback,
    onCloseCallback,
    step,
    page,
    tab,
  } = options;

  if (hasSeenOnboarding(step)) {
    return;
  }

  debuglog('update-notifications', `Registering onboarding step ${step}`);

  if (page && page !== getCurrentPage()) {
    return;
  }

  if (tab && tab !== getCurrentTab()) {
    return;
  }

  hg.views.MessengerView.addMessage({
    content: {
      body: hg.views.OnboardingTutorialView().wrapInfoArrow(content, button || 'OK'),
    },
    highlight_dom: highlightSelector,
    highlight_padding: 3,
    css_class: `larryCircle mh-improved-onboarding ${classname || ''}`,
    on_show_callback() {
      hg.views.OnboardingTutorialView().showBouncyArrow(highlightSelector, direction);
      if (onShowCallback) {
        onShowCallback();
      }
    },
    on_close_callback() {
      hg.views.OnboardingTutorialView().hideBouncyArrow();

      saveOnboardingStep(step);

      if (onCloseCallback) {
        onCloseCallback();
      }
    },
    show_overlay: true,
  });

  hg.views.MessengerView.go();
};

/**
 * Do the onboarding.
 */
const doOnboarding = () => {
  registerOnboardingStep({
    step: 1,
    page: 'camp',
    highlightSelector: '.mousehunt-improved-icon-menu',
    classname: 'mh-improved-onboarding-icon',
    content: 'Welcome to the new version of MouseHunt Improved! You can quickly get to the settings using this icon.',
    direction: 'bottomLeft',
  });

  registerOnboardingStep({
    step: 2,
    page: 'preferences',
    tab: 'mousehunt-improved-settings',
    highlightSelector: '#mousehunt-improved-settings-better',
    classname: 'mh-improved-onboarding-settings',
    content: 'Here you can toggle features on and off, and customize them to your liking.',
    direction: 'top',
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'update-notifications');

  addBanner(false); // True if there are new settings, otherwise false.

  // Delay the onboarding a bit so the banner has time to show.
  onNavigation(() => {
    setTimeout(doOnboarding, 500);
  });
};

export default {
  id: 'update-notifications',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
