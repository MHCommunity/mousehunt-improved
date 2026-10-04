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
  type: 'personalization',
  default: true,
  description: 'Click the shield to go to Camp, or to your Hunter Profile if you’re already there.',
  load: init,
};
