import { getSetting, saveSetting } from './settings';
import { makeElement, waitForElement } from './elements';
import { addStylesDirect } from './styles';
import { getCurrentPage } from './page-current';
import { getCurrentTab } from './page';

import tipStyles from './styles/onboarding-tip.css';

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
    disabled = false,
  } = options;

  if (
    disabled ||
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
    css_class: `larryCircle mh-improved-onboarding ${step} ${classname || ''}`,
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

  setTimeout(() => hg.views.MessengerView.go(), delay);
};

const TIP_ARROW_INSET = 14;
const TIP_ARROW_SIZE = 6;
const TIP_EDGE_MARGIN = 8;

const TIP_INTERVAL = 24 * 60 * 60 * 1000;
const TIP_MAX_SHOWS = 3;
const TIP_LAST_SHOWN_SETTING = 'onboarding.tip-last-shown';

/**
 * Clamp a number between a minimum and maximum.
 *
 * @param {number} value The value to clamp.
 * @param {number} min   The lowest allowed value.
 * @param {number} max   The highest allowed value.
 *
 * @return {number} The clamped value.
 */
const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Check whether tips are being previewed from the URL, which shows them
 * regardless of whether they're due or have already been dismissed.
 *
 * @return {boolean} Whether preview mode is active.
 */
const isTipPreview = () => {
  return new URLSearchParams(window.location.search).has('mh-improved-tips');
};

/**
 * Check whether we're due to give another tip. Tips are rationed to one a day
 * so that a new user isn't handed every one of them at once.
 *
 * @return {boolean} Whether a tip can be shown right now.
 */
const canShowOnboardingTip = () => {
  const lastShown = getSetting(TIP_LAST_SHOWN_SETTING, 0);

  return (Date.now() - lastShown) >= TIP_INTERVAL;
};

/**
 * Record that a tip was shown, using up today's tip.
 *
 * A tip that's shown but never dismissed would otherwise keep taking the daily
 * slot forever, so it retires itself after being shown a few times.
 *
 * @param {string} step The step that was shown.
 */
const saveOnboardingTipShown = (step) => {
  saveSetting(TIP_LAST_SHOWN_SETTING, Date.now());

  const shows = getSetting(`onboarding.${step}-shows`, 0) + 1;
  saveSetting(`onboarding.${step}-shows`, shows);

  if (shows >= TIP_MAX_SHOWS) {
    saveOnboardingStep(step);
  }
};

/**
 * Add a one-time tip pointing at an element, explaining a feature we've added.
 *
 * The tip is positioned against the anchor's on-screen box rather than being
 * placed in the document flow, so it can't be pushed around by the game's
 * layout, and it follows the anchor when the page is scrolled or resized.
 *
 * Tips are rationed to one a day across every module, so whichever tip the user
 * happens to walk into first is the one they get, and the rest wait their turn.
 *
 * @param {Object}         options                      The options for the tip.
 * @param {string}         options.step                 The onboarding step, used to only ever show the tip once.
 * @param {Element|string} options.anchor               The element the tip points at, or a selector for it.
 * @param {string}         options.title                The title of the tip.
 * @param {string}         options.content              The body of the tip.
 * @param {string}         options.position             Where to place the tip: `below` (default) or `above` the anchor.
 * @param {boolean}        options.dismissOnAnchorClick Whether clicking the anchor dismisses the tip.
 *
 * @return {Element|boolean} The tip element, or false if it wasn't shown.
 */
const addOnboardingTip = ({
  step,
  anchor,
  title,
  content,
  position = 'below',
  dismissOnAnchorClick = true,
}) => {
  const isPreview = isTipPreview();
  if (! isPreview && (hasSeenOnboardingStep(step) || ! canShowOnboardingTip())) {
    return false;
  }

  // Only ever show one tip at a time, so a page that has a few of them to give
  // doesn't bury the user in bubbles.
  const anchorEl = 'string' === typeof anchor ? document.querySelector(anchor) : anchor;
  if (! anchorEl || document.querySelector('.mh-improved-tip')) {
    return false;
  }

  addStylesDirect(tipStyles, 'onboarding-tip', true);

  const isAbove = 'above' === position;
  const tip = makeElement('div', ['mh-improved-tip', isAbove ? 'mh-improved-tip-above' : '']);
  tip.setAttribute('data-step', step);
  tip.setAttribute('role', 'note');

  if (title) {
    makeElement('strong', 'mh-improved-tip-title', title, tip);
  }

  makeElement('span', 'mh-improved-tip-content', content, tip);

  const dismissButton = makeElement('button', 'mh-improved-tip-dismiss', '&times;');
  dismissButton.type = 'button';
  dismissButton.setAttribute('aria-label', 'Dismiss tip');
  tip.append(dismissButton);

  document.body.append(tip);

  /**
   * Point the tip at the anchor, or tear it down if the anchor is gone.
   */
  const reposition = () => {
    if (! anchorEl.isConnected) {
      remove();
      return;
    }

    const anchorRect = anchorEl.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const anchorCenter = anchorRect.left + (anchorRect.width / 2);

    const left = clamp(
      anchorCenter - (tipRect.width / 2),
      TIP_EDGE_MARGIN,
      Math.max(TIP_EDGE_MARGIN, document.documentElement.clientWidth - tipRect.width - TIP_EDGE_MARGIN)
    );

    const top = isAbove
      ? anchorRect.top - tipRect.height - TIP_ARROW_SIZE
      : anchorRect.bottom + TIP_ARROW_SIZE;

    tip.style.left = `${left + window.scrollX}px`;
    tip.style.top = `${top + window.scrollY}px`;
    tip.style.setProperty('--mh-improved-tip-arrow', `${clamp(anchorCenter - left, TIP_ARROW_INSET, tipRect.width - TIP_ARROW_INSET)}px`);
  };

  /**
   * Take the tip off the page and stop tracking the anchor. The step isn't
   * saved, so a tip that's torn down because its anchor went away can be shown
   * again the next time the user sees it.
   */
  const remove = () => {
    window.removeEventListener('resize', reposition);
    window.removeEventListener('scroll', reposition, true);
    document.removeEventListener('keydown', onKeydown);
    observer.disconnect();

    tip.remove();
  };

  /**
   * Dismiss the tip for good.
   */
  const dismiss = () => {
    if (! isPreview) {
      saveOnboardingStep(step);
    }

    remove();
  };

  /**
   * Dismiss the tip when escape is pressed.
   *
   * @param {KeyboardEvent} event The keydown event.
   */
  const onKeydown = (event) => {
    if ('Escape' === event.key) {
      dismiss();
    }
  };

  const observer = new ResizeObserver(reposition);
  observer.observe(document.body);
  observer.observe(anchorEl);

  window.addEventListener('resize', reposition);
  window.addEventListener('scroll', reposition, true);
  document.addEventListener('keydown', onKeydown);

  dismissButton.addEventListener('click', dismiss);
  if (dismissOnAnchorClick) {
    anchorEl.addEventListener('click', dismiss, { once: true });
  }

  reposition();

  if (! isPreview) {
    saveOnboardingTipShown(step);
  }

  return tip;
};

export {
  hasSeenOnboardingStep,
  saveOnboardingStep,
  addOnboardingMessage,
  addOnboardingTip
};
