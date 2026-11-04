import { addStyles } from '@utils';

import styles from './styles.css';

const bodyClass = 'mh-improved-fixed-popup';
const topProperty = '--mh-improved-fixed-popup-top';

// Space to keep between the popup and the top and bottom of the window.
const viewportGap = 20;

/**
 * Pin the open popup to the window when it fits, otherwise let it scroll with the page.
 */
const updatePopupPosition = () => {
  const popup = document.querySelector('#overlayPopup');
  const overlayBg = document.querySelector('#overlayBg');
  const isOpen = popup && overlayBg?.classList.contains('active') && popup.childElementCount > 0;
  const isFixed = document.body.classList.contains(bodyClass);

  if (!isOpen) {
    document.body.classList.remove(bodyClass);
    return;
  }

  const height = popup.offsetHeight;
  if (height + viewportGap * 2 <= window.innerHeight) {
    document.documentElement.style.setProperty(topProperty, `${Math.round((window.innerHeight - height) / 2)}px`);
    document.body.classList.add(bodyClass);
    return;
  }

  if (!isFixed) {
    return;
  }

  // The popup grew taller than the window, so hand it back to the page without moving it on screen.
  const { top: fixedTop } = popup.getBoundingClientRect();
  document.body.classList.remove(bodyClass);
  const { top: pageTop } = popup.getBoundingClientRect();
  const currentTop = Number.parseFloat(getComputedStyle(popup).top) || 0;
  popup.style.top = `${currentTop + Math.min(fixedTop, viewportGap) - pageTop}px`;
};

/**
 * Initialize the module.
 */
const init = async () => {
  const popup = document.querySelector('#overlayPopup');
  const overlayBg = document.querySelector('#overlayBg');
  if (!popup || !overlayBg) {
    return;
  }

  addStyles(styles, 'experiments-fixed-popups');

  // Popups change size as their content loads, and the background toggles when they open and close.
  new ResizeObserver(updatePopupPosition).observe(popup);
  new MutationObserver(updatePopupPosition).observe(overlayBg, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', updatePopupPosition, { passive: true });

  updatePopupPosition();
};

export default {
  id: 'experiments.fixed-popups',
  name: 'Fixed popups',
  description: 'Keep popups centered in the window while you scroll, unless they are too tall to fit.',
  load: init,
};
