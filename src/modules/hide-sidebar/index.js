import { addBodyClass, addStyles, onDeactivation } from '@utils';

import styles from './styles.css';

/**
 * Move sidebar into menu tab.
 */
const moveSidebar = () => {
  // Create menu tab.
  const menuTab = document.createElement('div');
  menuTab.classList.add('menuItem');
  menuTab.classList.add('dropdown');
  menuTab.classList.add('sidebar');

  // Register click event listener.
  menuTab.addEventListener('click', () => {
    menuTab.classList.toggle('expanded');
  });

  // Make title span.
  const menuTabTitle = document.createElement('span');
  menuTabTitle.innerText = 'Sidebar';

  // Make arrow div.
  const menuTabArrow = document.createElement('div');
  menuTabArrow.classList.add('arrow');

  // Create menu tab dropdown.
  const dropdownContent = document.createElement('div');
  dropdownContent.classList.add('dropdownContent');

  // Grab sidebar content.
  const sidebarUser = document.querySelector('.pageSidebarView-user');
  if (sidebarUser) {
    // clone the sidebarUser element and append it to the dropdownContent
    const sidebarUserClone = sidebarUser.cloneNode(true);
    dropdownContent.append(sidebarUserClone);
  }

  const scoreBoardRankings = document.querySelectorAll('.scoreboardRelativeRankingTableView-table');
  if (scoreBoardRankings) {
    const scoreBoardRankingWrapper = document.createElement('div');
    scoreBoardRankingWrapper.classList.add('scoreboardRankingsWrapper');

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
const init = async () => {
  addStyles(styles, 'no-sidebar');
  addBodyClass('no-sidebar');
  moveSidebar();
  hg.views.PageFrameView.setShowSidebar(false);

  onDeactivation('no-sidebar', () => {
    hg.views.PageFrameView.setShowSidebar(true);
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
  type: 'element-hiding',
  default: true,
  description: 'Hide the sidebar and add a “Sidebar” dropdown in the top menu.',
  load: init,
};
