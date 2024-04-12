import { getCurrentPage, onNavigation } from '@utils';

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

export default async () => {
  onNavigation(campToggle);
};
