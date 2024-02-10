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

const getUpdateLink = (version) => {
  return `https://github.com/MHCommunity/mousehunt-improved/releases/tag/v${version}`;
};

const hasSeenBanner = () => {
  return mhImprovedVersion === getSetting('has-seen-update-banner', '');
};

const hasSeenOnboarding = (step = 0) => {
  const savedStepNumber = getSetting('has-seen-onboarding', 0);
  return savedStepNumber >= step;
};

const saveOnboardingStep = (step) => {
  const savedStepNumber = getSetting('has-seen-onboarding', 0);
  if (savedStepNumber < step) {
    saveSetting('has-seen-onboarding', step);
  }
};

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
    saveSetting('has-seen-update-banner', mhImprovedVersion);

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
