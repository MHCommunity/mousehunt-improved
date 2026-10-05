import { addBodyClass, addHeaderMenuTab, makeElement, onNavigation, removeBodyClass } from '@utils';

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
  // Marked so Custom Menu can show the icon, the name, or both.
  const menuTabTitle = makeElement('span', 'mhui-menu-label', 'Sidebar');

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

  addHeaderMenuTab(menuTab, { id: 'sidebar', name: 'Sidebar', icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/scoreboard.png', order: 5 });
};

/**
 * Hide the sidebar and move it into a menu tab.
 */
const moveSidebarToMenu = () => {
  removeBodyClass('hasSidebar');
  moveSidebar();
  hg.views.PageFrameView.setShowSidebar(false);
};

/**
 * Bring the sidebar back and remove the menu tab.
 */
const restoreSidebar = () => {
  hg.views.PageFrameView.setShowSidebar(true);
  addBodyClass('hasSidebar', true);

  document.querySelector('.menuItem.sidebar')?.remove();
};

/**
 * Hide the sidebar while it's set to be hidden, and show a "Sidebar" dropdown in the top menu instead.
 *
 * @param {Function} isHidden Whether the sidebar is hidden.
 *
 * @return {Function} Call to apply the current setting.
 */
export default (isHidden) => {
  let hidden = false;

  const update = () => {
    if (isHidden() === hidden) {
      return;
    }

    hidden = isHidden();
    if (hidden) {
      moveSidebarToMenu();
    } else {
      restoreSidebar();
    }
  };

  // The game turns the sidebar back on when it changes pages.
  onNavigation(() => {
    if (hidden) {
      hg.views.PageFrameView.setShowSidebar(false);
    }
  });

  update();

  return update;
};
