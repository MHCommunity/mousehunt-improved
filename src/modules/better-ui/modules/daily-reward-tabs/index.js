import { onDialogShow } from '@utils';

/**
 * Mark the tab header for the visible tab as active.
 *
 * The game only sets the active header after a tab is clicked, so the
 * initially shown tab has no highlighted header.
 *
 * @param {HTMLElement} popup The popup element.
 */
const markActiveTab = (popup) => {
  const headers = popup.querySelectorAll('.kingsGiveawayCalibratorPopup-tabHeader[data-tab]');
  for (const header of headers) {
    const content = popup.querySelector(`.kingsGiveawayCalibratorPopup-tabContent.${CSS.escape(header.dataset.tab)}`);
    header.classList.toggle('active', !!content?.classList.contains('active'));
  }
};

/**
 * Keep the active tab header in sync, including when the game re-renders the popup.
 */
const fixActiveTab = () => {
  const popup = document.querySelector('#overlayPopup.dailyCheeseSelectorPopup');
  if (!popup) {
    return;
  }

  markActiveTab(popup);

  const container = popup.querySelector('#jsDialogAjaxContent');
  if (container && !container.dataset.mhActiveTabObserved) {
    container.dataset.mhActiveTabObserved = 'true';
    new MutationObserver(() => markActiveTab(popup)).observe(container, { childList: true });
  }
};

export default async () => {
  onDialogShow('dailyCheeseSelectorPopup', () => {
    // The layout is rendered right after the dialog is shown.
    setTimeout(fixActiveTab, 0);
  });
};
