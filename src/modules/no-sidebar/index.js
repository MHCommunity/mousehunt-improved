import { addUIStyles, persistBodyClass } from '../utils';
import styles from './styles.css';

// Move sidebar into menu tab.
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
    dropdownContent.appendChild(sidebarUser);
  }

  const scoreBoardRankings = document.querySelectorAll('.scoreboardRelativeRankingTableView-table');
  if (scoreBoardRankings) {
    const scoreBoardRankingWrapper = document.createElement('div');
    scoreBoardRankingWrapper.classList.add('scoreboardRankingsWrapper');

    // for each scoreBoardRanking in scoreBoardRankings, append
    scoreBoardRankings.forEach((scoreBoardRanking) => {
      scoreBoardRankingWrapper.appendChild(scoreBoardRanking);
    });

    dropdownContent.appendChild(scoreBoardRankingWrapper);
  }

  // Append menu tab title and arrow to menu tab.
  menuTab.appendChild(menuTabTitle);
  menuTab.appendChild(menuTabArrow);

  // Append menu tab dropdown to menu tab.
  menuTab.appendChild(dropdownContent);

  const tabsContainer = document.querySelector('.mousehuntHeaderView-dropdownContainer');
  if (! tabsContainer) {
    return;
  }

  // Append as the second to last tab.
  tabsContainer.insertBefore(menuTab, tabsContainer.lastChild);
};

export default () => {
  addUIStyles(styles);
  persistBodyClass('no-sidebar');
  moveSidebar();
};
