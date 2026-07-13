import {
  addStyles,
  getSetting,
  hasSeenOnboardingStep,
  makeElement,
  onEvent,
  saveOnboardingStep,
  saveSetting,
  setPage
} from '@utils';

import styles from './styles.css';

const WELCOME_STEP = 'mh-improved-welcome';
const WELCOME_PREVIEW_PARAM = 'mh-improved-welcome';
let welcomeRetry = null;

/**
 * Check whether the welcome is being explicitly previewed from the URL.
 *
 * @return {boolean} Whether preview mode is active.
 */
const isWelcomePreview = () => {
  return new URLSearchParams(window.location.search).has(WELCOME_PREVIEW_PARAM);
};

/**
 * Check whether the welcome should be shown.
 *
 * @return {boolean} Whether the welcome should be shown.
 */
const shouldShowWelcome = () => {
  return isWelcomePreview() || (
    getSetting('onboarding.fresh-install', false) &&
    ! hasSeenOnboardingStep(WELCOME_STEP)
  );
};

/**
 * Show the first-install welcome panel.
 */
const showWelcome = () => {
  if (! shouldShowWelcome()) {
    return;
  }

  if (document.querySelector('.mh-improved-welcome-overlay')) {
    return;
  }

  // Do not visually stack the welcome over a dialog the game is already
  // showing. This uses our own DOM rather than the game's shared jsDialog, so
  // neither dialog can replace the other.
  if (document.querySelector('#overlayBg.active')) {
    clearTimeout(welcomeRetry);
    welcomeRetry = setTimeout(showWelcome, 1000);
    return;
  }

  const overlay = makeElement('div', 'mh-improved-welcome-overlay');
  const dialog = makeElement('section', 'mh-improved-welcome-popup');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'mh-improved-welcome-title');
  dialog.innerHTML = `<button type="button" class="mh-improved-welcome-close" aria-label="Dismiss welcome">&times;</button>
    <h2 id="mh-improved-welcome-title">Welcome to MouseHunt Improved</h2>
    <div class="mh-improved-welcome">
    <p class="mh-improved-welcome-copy">Most features are ready to go. Use the <img class="mh-improved-welcome-icon" src="https://i.mouse.rip/mh-improved/icon.png" alt=""> button at the top right of the menu to explore and customize them anytime.</p>
    <div class="mh-improved-welcome-buttons">
      <a href="#" class="mh-improved-welcome-settings mousehuntActionButton"><span>Explore MouseHunt Improved</span></a>
      <a href="#" class="mh-improved-welcome-start mousehuntActionButton lightBlue"><span>Start Hunting</span></a>
    </div>
  </div>`;
  overlay.append(dialog);
  document.body.append(overlay);

  const completeWelcome = () => {
    if (! isWelcomePreview()) {
      saveOnboardingStep(WELCOME_STEP);
      saveSetting('onboarding.fresh-install', false);
    }

    document.removeEventListener('keydown', handleKeydown, true);
    overlay.remove();
  };

  const handleKeydown = (event) => {
    if ('Escape' === event.key) {
      event.preventDefault();
      event.stopImmediatePropagation();
      completeWelcome();
      return;
    }

    if ('Tab' !== event.key) {
      return;
    }

    const focusable = [...dialog.querySelectorAll('button, a[href]')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && dialog.ownerDocument.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (! event.shiftKey && dialog.ownerDocument.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  document.addEventListener('keydown', handleKeydown, true);

  dialog.querySelector('.mh-improved-welcome-close')?.addEventListener('click', completeWelcome);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      completeWelcome();
    }
  });

  dialog.querySelector('.mh-improved-welcome-start')?.addEventListener('click', (event) => {
    event.preventDefault();
    completeWelcome();
  });

  dialog.querySelector('.mh-improved-welcome-settings')?.addEventListener('click', (event) => {
    event.preventDefault();
    completeWelcome();
    setPage('Preferences', { tab: 'mousehunt-improved-settings' });
  });

  dialog.querySelector('.mh-improved-welcome-start')?.focus();
};

const init = async () => {
  if (! shouldShowWelcome()) {
    return;
  }

  addStyles(styles, 'onboarding');
  onEvent('mh-improved-init', showWelcome, true);
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
