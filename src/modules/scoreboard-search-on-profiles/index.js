import {
  addStyles,
  doRequest,
  getData,
  makeElement,
  onNavigation
} from '@utils';

import styles from './styles.css';

const main = async () => {
  const achievementsBlock = document.querySelector('.hunterInfoView-achievementsBlock');
  if (! achievementsBlock) {
    return;
  }

  if (achievementsBlock.getAttribute('data-added-scoreboard')) {
    return;
  }

  const teamTab = document.querySelector('.mousehuntTabHeaderContainer .mousehuntTabHeader[data-tab="team"]');
  if (! teamTab) {
    return;
  }

  const teamTabText = teamTab.querySelector('span');
  if (teamTabText) {
    teamTabText.textContent = 'Tournaments';
  }

  const teamTabContent = achievementsBlock.querySelector('.mousehuntTabContentContainer .mousehuntTabContent[data-tab="team"]');
  if (! teamTabContent) {
    return;
  }

  const friendName = document.querySelector('.friendsPage-friendRow-titleBar-name');
  if (! friendName) {
    return;
  }

  // Duplicate the team tab and change the text to "Scoreboard"
  const scoreboardTab = teamTab.cloneNode(true);
  scoreboardTab.setAttribute('data-tab', 'scoreboard');
  const scoreboardTabText = scoreboardTab.querySelector('span');
  if (scoreboardTabText) {
    scoreboardTabText.textContent = 'Scoreboards';
  }

  // Append it after the team tab.
  teamTab.after(scoreboardTab);

  // Duplicate the team tab content and change the data-tab attribute to "scoreboard"
  const scoreboardTabContent = teamTabContent.cloneNode(true);
  scoreboardTabContent.setAttribute('data-tab', 'scoreboard');

  const tabContent = makeElement('div', 'hunterInfoView-teamTab-content');

  const scoreboardDropdown = makeElement('select', 'mh-improved-scoreboard-dropdown');
  const scoreboards = await getData('scoreboards');

  // Make a placeholder option.
  const startingOpt = makeElement('option', '', 'Select a scoreboard');
  startingOpt.value = 'placeholder';
  startingOpt.setAttribute('disabled', true);
  startingOpt.setAttribute('selected', true);
  scoreboardDropdown.append(startingOpt);

  for (const scoreboard of scoreboards) {
    const option = makeElement('option', '', scoreboard.name);
    option.value = scoreboard.id;
    scoreboardDropdown.append(option);
  }

  tabContent.append(scoreboardDropdown);

  const results = makeElement('div', 'mh-improved-scoreboard-results');
  tabContent.append(results);

  scoreboardDropdown.addEventListener('change', async (e) => {
    if (e.target.value === 'placeholder' || ! friendName.getAttribute('data-text') || ! e.target.value) {
      return;
    }

    results.innerHTML = '<div class="mh-improved-scoreboard-loading"></div>';

    const response = await doRequest('managers/ajax/pages/scoreboards.php', {
      action: 'get_page',
      category: 'main',
      scoreboard: e.target.value,
      page: 1,
      weekly: 0,
      friends_only: 0,
      search: friendName.getAttribute('data-text'),
    });

    const data = response?.scoreboard_page?.rows;
    if (! data || ! data.length) {
      results.innerHTML = '<div class="mh-improved-scoreboard-no-results">No results found.</div>';
      return;
    }

    const score = data[0];

    results.innerHTML = `<table class="scoreboardTableView">
    <tr class="scoreboardTableView-row viewer highlight">
      <td class="scoreboardTableView-row-rank scoreboardTableView-column ">
        <div class="tournament-team-rank">
          ${score.rank}
        </div>
      </td>
      <td class="scoreboardTableView-row-name scoreboardTableView-column">
        <a href="profile.php?snuid=${user.sn_user_id}" onclick="hg.utils.PageUtil.showHunterProfile('${user.sn_user_id}'); return false;">
          <div class="scoreboardTableView-titleIcon" style="background-image: url(${user.title_icon});"></div>
          ${score.name}
        </a>
      </td>
      <td class="scoreboardTableView-row-score scoreboardTableView-column">
        ${score.points_formatted}
      </td>
    </tr></table>`;

    // window.location.href = `https://www.mousehuntgame.com/scoreboards.php?tab=main&scoreboard=${e.target.value}&search=${friendName.getAttribute('data-text')}`;
  });

  scoreboardTabContent.replaceChildren(tabContent);
  // Append it after the team tab content.
  teamTabContent.after(scoreboardTabContent);

  achievementsBlock.setAttribute('data-added-scoreboard', 'true');
};

const init = async () => {
  addStyles(styles, 'profile-scoreboard-search');

  onNavigation(main, {
    page: 'hunterprofile',
  });
};

export default {
  id: 'profile-scoreboard-search',
  name: 'Scoreboard Search on Profiles',
  type: 'feature',
  default: true,
  description: 'Easily search for a friend on the scoreboard from their profile.',
  load: init,
};
