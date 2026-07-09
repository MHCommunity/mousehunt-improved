import {
  addBodyClass,
  addStyles,
  makeElement,
  onDeactivation,
  removeBodyClass
} from '@utils';

import styles from './styles.css';

/**
 * Move sidebar into menu tab.
 */
const moveSidebar = () => {
  if (document.querySelector('.menuItem.sidebar')) {
    return;
  }

  // Create menu tab.
  const menuTab = makeElement('div', ['menuItem', 'dropdown', 'sidebar']);

  // Register click event listener.
  menuTab.addEventListener('click', () => {
    menuTab.classList.toggle('expanded');
  });

  // Make title span.
  const menuTabTitle = document.createElement('span');
  menuTabTitle.innerText = 'Sidebar';

  // Make arrow div.
  const menuTabArrow = makeElement('div', 'arrow');

  // Create menu tab dropdown.
  const dropdownContent = makeElement('div', 'dropdownContent');

  // Grab sidebar content.
  const sidebarUser = document.querySelector('.pageSidebarView-user');
  if (sidebarUser) {
    // clone the sidebarUser element and append it to the dropdownContent
    const sidebarUserClone = sidebarUser.cloneNode(true);
    dropdownContent.append(sidebarUserClone);
  }

  const scoreBoardRankings = document.querySelectorAll('.scoreboardRelativeRankingTableView-table');
  if (scoreBoardRankings) {
    const scoreBoardRankingWrapper = makeElement('div', 'scoreboardRankingsWrapper');

    // for each scoreBoardRanking in scoreBoardRankings, append
    scoreBoardRankings.forEach((scoreBoardRanking) => {
      const scoreBoardRankingClone = scoreBoardRanking.cloneNode(true);
      scoreBoardRankingWrapper.append(scoreBoardRankingClone);
    });

    dropdownContent.append(scoreBoardRankingWrapper);
  }

  // Append menu tab title and arrow to menu tab.
  menuTab.append(menuTabTitle);
  menuTab.append(menuTabArrow);

  // Append menu tab dropdown to menu tab.
  menuTab.append(dropdownContent);

  const tabsContainer = document.querySelector('.mousehuntHeaderView-dropdownContainer');
  if (! tabsContainer) {
    return;
  }

  // Append as the second to last tab.
  tabsContainer.insertBefore(menuTab, tabsContainer.lastChild);
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'no-sidebar');
  addBodyClass('no-sidebar');
  removeBodyClass('hasSidebar');
  moveSidebar();
  hg.views.PageFrameView.setShowSidebar(false);

  onDeactivation('no-sidebar', () => {
    hg.views.PageFrameView.setShowSidebar(true);
    removeBodyClass('no-sidebar');
    addBodyClass('hasSidebar', true);

    const menuTab = document.querySelector('.menuItem.sidebar');
    if (menuTab) {
      menuTab.remove();
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'no-sidebar',
  name: 'Hide Sidebar',
  type: 'hide-simplify',
  default: true,
  description: 'Hide the sidebar and add a "Sidebar" dropdown in the top menu.',
  load: init,
};
