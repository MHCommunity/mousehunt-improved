import { makeElement, onNavigation, sessionGet, sessionSet } from '@utils';

/**
 * Add the maintenance banner classes.
 */
const addMaintenanceClasses = () => {
  const banner = document.querySelector('div[style="background: #f2f27c; border:1px solid #555; border-radius: 3px; text-align: center; font-size: 12px; padding: 6px 3px"]');
  if (! banner) {
    return;
  }

  const isHidden = sessionGet('maintenance-banner-hidden');
  if (isHidden) {
    banner.classList.add('hidden');
    return;
  }

  banner.classList.add('maintenance-banner', 'mh-ui-fade', 'mh-ui-fade-in');

  const existingClose = banner.querySelector('.close');
  if (existingClose) {
    return;
  }

  banner.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      node.innerHTML = `${node.innerHTML}.`;
    } else if (node.nodeType === Node.TEXT_NODE) {
      node.textContent = `${node.textContent}.`;
    }
  });

  const close = makeElement('div', 'close', '✕');
  close.addEventListener('click', () => {
    banner.classList.add('mh-ui-fade-out');

    setTimeout(() => banner.classList.add('hidden'), 350);
    setTimeout(() => sessionSet('maintenance-banner-hidden', true), 350);
  });

  banner.append(close);
};

export default async () => {
  addMaintenanceClasses();
  onNavigation(addMaintenanceClasses, {
    page: 'camp',
  });
};
