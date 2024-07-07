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
const init = async () => {
  onNavigation(campToggle);
};

export default {
  id: 'shield-goes-to-camp',
  name: 'Shield Goes to Camp',
  type: 'feature',
  default: false,
  description: 'Click the shield to go to the Camp page if you’re not already there, otherwise, it will take you to your Hunter Profile.',
  load: init,
};
