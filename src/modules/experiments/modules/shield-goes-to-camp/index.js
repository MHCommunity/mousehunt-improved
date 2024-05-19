import { getCurrentPage, onNavigation } from '@utils';

/**
 * Toggle the destination when clicking the shield.
 */
const campToggle = () => {
  const shield = document.querySelector('.mousehuntHud-shield');
  if (shield) {
    if ('camp' === getCurrentPage()) {
      shield.setAttribute('onclick', 'hg.utils.PageUtil.showHunterProfile()');
    } else {
      shield.setAttribute('onclick', 'hg.utils.PageUtil.setPage("camp")');
    }
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  onNavigation(campToggle);
};
