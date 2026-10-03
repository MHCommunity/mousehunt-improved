import { addBodyClass, addHeaderMenuTab, addModuleBodyClass, addStyles, getSetting, makeElement, onModuleToggle, onNavigation, onSettingsChange, removeBodyClass } from '@utils';

import settings from './settings';
import styles from './styles.css';

/**
 * Move sidebar into menu tab.
 */
const moveSidebar = () => {
  if (!getSetting('no-sidebar.show-dropdown', true)) {
    document.querySelector('.menuItem.sidebar')?.remove();
    return;
  }

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

  addHeaderMenuTab(menuTab, { order: 5 });
};

/**
 * Hide the sidebar and move it into a menu tab.
 */
const hideSidebar = () => {
  removeBodyClass('hasSidebar');
  moveSidebar();
  hg.views.PageFrameView.setShowSidebar(false);
};

/**
 * Bring the sidebar back and remove the menu tab.
 */
const showSidebar = () => {
  hg.views.PageFrameView.setShowSidebar(true);
  addBodyClass('hasSidebar', true);

  document.querySelector('.menuItem.sidebar')?.remove();
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'no-sidebar');
  addModuleBodyClass('no-sidebar', 'no-sidebar');
  hideSidebar();

  // The game turns the sidebar back on when it changes pages.
  onNavigation(() => hg.views.PageFrameView.setShowSidebar(false));

  onSettingsChange('no-sidebar.show-dropdown', moveSidebar);

  onModuleToggle('no-sidebar', {
    enable: hideSidebar,
    disable: showSidebar,
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
  liveToggle: true,
  description: 'Hide the sidebar, with an optional "Sidebar" dropdown in the top menu.',
  load: init,
  settings,
};
