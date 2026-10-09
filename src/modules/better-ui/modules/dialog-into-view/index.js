import { onDialogShow } from '@utils';

/**
 * Scroll the page so the top of the dialog is visible if it opened off screen.
 */
const scrollDialogIntoView = async () => {
  const popup = document.querySelector('#overlayPopup');
  if (!popup) {
    return;
  }

  // The popup slides into place with a reveal animation, so wait for its final position.
  await Promise.allSettled(popup.getAnimations().map((animation) => animation.finished));

  const dialog = popup.querySelector('.jsDialogContainer');
  if (!dialog) {
    return;
  }

  const { top } = dialog.getBoundingClientRect();
  if (top >= 0 && top < window.innerHeight - 100) {
    return;
  }

  // Smooth scrolling never runs in a background tab.
  window.scrollBy({ top: top - 20, behavior: document.hidden ? 'instant' : 'smooth' });
};

export default async () => {
  onDialogShow('all', () => {
    setTimeout(scrollDialogIntoView, 0);
  });
};
