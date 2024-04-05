import { doRequest } from '@utils';
import { getData } from '@utils/data';

import { exportPopup, recursiveFetch } from './exporter';

const getScoreboardData = async (scoreboard, useWeekly = false, useFriendsOnly = false) => {
  const totalItemsEl = document.querySelector(`.item-wrapper[data-region="${scoreboard.id}"] .total-items`);
  if (totalItemsEl) {
    totalItemsEl.textContent = '…';
    totalItemsEl.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }

  const response = await doRequest('managers/ajax/pages/scoreboards.php', {
    action: 'get_page',
    category: 'main',
    scoreboard: scoreboard.id,
    page: 1,
    weekly: useWeekly ? 1 : 0,
    friends_only: useFriendsOnly ? 1 : 0,
    search: '',
  });

  if (null === response.scoreboard_page?.viewer_row) {
    if (totalItemsEl) {
      totalItemsEl.textContent = '-';
    }

    return {
      scoreboard: scoreboard.name,
      rank: '',
      value: '',
    };
  }

  const entry = {
    rank: response.scoreboard_page.viewer_row.rank,
    points: response.scoreboard_page.viewer_row.points,
  };

  const rankSuffix = response.scoreboard_page.viewer_row.rank_formatted.replaceAll(/[\d\s]+/g, '');

  if (totalItemsEl) {
    totalItemsEl.textContent = `${entry.rank.toLocaleString()}${rankSuffix}`;
  }

  // resolve the promise with the data
  return {
    scoreboard: scoreboard.name,
    rank: entry.rank,
    value: entry.points,
  };
};

const exportScoreboards = async ({ useWeekly = false, useFriendsOnly = false } = {}) => {
  let inventoryMarkup = '';

  let scoreboardsToUse = await getData('scoreboards');

  if (useWeekly) {
    scoreboardsToUse = scoreboards.filter((scoreboard) => scoreboard.weekly);
  }

  for (const region of scoreboardsToUse) {
    inventoryMarkup += `<div class="item-wrapper scoreboard" data-region="${region.id}">
      <div class="region-name">${region.name}</div>
      <div class="total-items">-</div>
  </div>`;
  }

  exportPopup({
    type: `scoreboard-rankings${useWeekly ? '-weekly' : ''}${useFriendsOnly ? '-friends' : ''}`,
    text: `Scoreboard Rankings${useWeekly ? (useFriendsOnly ? ' (Weekly, Friends)' : ' (Weekly)') : (useFriendsOnly ? ' (Friends)' : '')}`,
    headerMarkup: '<div class="region-name">Scoreboard</div><div class="total-items">Place</div>',
    itemsMarkup: inventoryMarkup,
    fetch: () => recursiveFetch(scoreboardsToUse, (scoreboard) => getScoreboardData(scoreboard, useWeekly, useFriendsOnly)),
    download: {
      headers: ['Scoreboard', 'Rank', 'Value'],
    },
  });
};

export default exportScoreboards;
