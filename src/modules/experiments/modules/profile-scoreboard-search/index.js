import { addStyles, getData, makeElement, onNavigation } from '@utils';

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
    scoreboardTabText.textContent = 'Scoreboard';
  }

  // Append it after the team tab.
  teamTab.after(scoreboardTab);

  // Duplicate the team tab content and change the data-tab attribute to "scoreboard"
  const scoreboardTabContent = teamTabContent.cloneNode(true);
  scoreboardTabContent.setAttribute('data-tab', 'scoreboard');

  const existingTeamTabContent = scoreboardTabContent.querySelector('.hunterInfoView-teamTab-content');

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

  scoreboardDropdown.addEventListener('change', async (e) => {
    if (e.target.value === 'placeholder' || ! friendName.getAttribute('data-text') || ! e.target.value) {
      return;
    }

    window.location.href = `https://www.mousehuntgame.com/scoreboards.php?tab=main&scoreboard=${e.target.value}&search=${friendName.getAttribute('data-text')}`;
  });

  tabContent.append(scoreboardDropdown);

  existingTeamTabContent.replaceWith(tabContent);

  // Append it after the team tab content.
  teamTabContent.after(scoreboardTabContent);

  achievementsBlock.setAttribute('data-added-scoreboard', 'true');
};

export default async () => {
  addStyles(styles, 'profile-scoreboard-search');

  onNavigation(main, {
    page: 'hunterprofile',
  });
};
