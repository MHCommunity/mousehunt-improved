import { addStyles, addSubmenuItem, createPopup, onEvent } from '@utils';

import { exportFavoriteSetupsUserscript, hasFavoriteSetupsUserscript } from './exporters/export-favorite-setups-userscript';
import { exportRankupForecaster, hasRankupForecaster } from './exporters/export-rankup-forecaster';

import exportFavoriteSetups from './exporters/export-favorite-setups';
import exportInventory from './exporters/export-inventory';
import exportJournalEntries from './exporters/export-journal-entries';
import exportMarketplace from './exporters/export-marketplace';
import exportMice from './exporters/export-mice';
import exportScoreboards from './exporters/export-scoreboards';

import styles from './styles.css';

/**
 * Export the data.
 */
const exportDataPopup = () => {
  const exporters = [
    {
      id: 'mouse-stats-by-group',
      name: 'Mouse Stats by Group',
      callback: () => exportMice('group'),
    },
    {
      id: 'mouse-stats-by-region',
      name: 'Mouse Stats by Region',
      callback: () => exportMice('region'),
    },
    {
      id: 'mouse-stats-by-location',
      name: 'Mouse Stats by Location',
      callback: () => exportMice('location'),
    },
    {
      id: 'inventory',
      name: 'Inventory',
      callback: exportInventory,
    },
    {
      id: 'marketplace-transactions',
      name: 'Marketplace Transactions',
      callback: exportMarketplace,
    },
    {
      id: 'scoreboard-rankings',
      name: 'Scoreboard Rankings',
      callback: () => exportScoreboards(),
    },
    {
      id: 'scoreboard-rankings-weekly',
      name: 'Scoreboard Rankings (Weekly)',
      callback: () => exportScoreboards({ useWeekly: true }),
    },
    {
      id: 'scoreboard-rankings-friends',
      name: 'Scoreboard Rankings (Friends)',
      callback: () => exportScoreboards({ useFriendsOnly: true }),
    },
    {
      id: 'scoreboard-rankings-weekly-friends',
      name: 'Scoreboard Rankings (Weekly, Friends)',
      callback: () => exportScoreboards({ useWeekly: true, useFriendsOnly: true }),
    },
    {
      id: 'journal-entries',
      name: 'Journal Entries',
      callback: exportJournalEntries,
    },
    {
      id: 'favorite-setups',
      name: 'Favorite Setups',
      callback: exportFavoriteSetups,
    }
  ];

  if (hasFavoriteSetupsUserscript()) {
    exporters.push({
      id: 'favorite-setups-userscript',
      name: 'Favorite Setups (userscript)',
      callback: exportFavoriteSetupsUserscript,
    });
  }

  if (hasRankupForecaster()) {
    exporters.push({
      id: 'rankup-forecaster-history',
      name: 'Rankup Forecaster History',
      callback: exportRankupForecaster,
    });
  }

  let exporterList = '';
  exporters.forEach(({ id, name }) => {
    exporterList += `<li><a href="#" id="export-${id}">${name}</a></li>`;
  });

  createPopup({
    title: 'Export Data',
    content: `<ul class="mh-improved-export-data-landing">${exporterList}</ul>`,
  });

  exporters.forEach(({ id, callback }) => {
    const button = document.querySelector(`#export-${id}`);
    if (button) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        callback();
      });
    }
  });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'data-exporters');

  onEvent('show-export-data', exportDataPopup);

  addSubmenuItem({
    menu: 'kingdom',
    label: 'Export Data',
    icon: 'https://www.mousehuntgame.com/images/items/crafting_items/transparent_thumb/c6f39c2b522f114c788f5fb65e3ab8d7.png',
    class: 'export-data',
    callback: exportDataPopup,
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'data-exporters',
  name: 'Data Exporters',
  type: 'feature',
  default: true,
  description: 'Export data from the game.',
  load: init,
};
