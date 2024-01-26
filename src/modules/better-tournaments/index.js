import {
  addStyles,
  doRequest,
  getSetting,
  makeElement,
  onEvent,
  onNavigation,
  onRequest
} from '@utils';

import settings from './settings';
import styles from './styles.css';

const updateTournamentHud = async () => {
  const activeTourney = document.querySelector('#tournamentStatusHud > a.name');
  if (! activeTourney) {
    return;
  }

  // Get the ID from the href.
  const tourneyId = activeTourney.href.split('=')[1];
  if (! tourneyId) {
    return;
  }

  const tourneyData = await doRequest('managers/ajax/pages/page.php', {
    page_class: 'Tournament',
    'page_arguments[tournament_id]': tourneyId,
  });

  if (! tourneyData?.page) {
    return;
  }

  if (tourneyData.page?.is_active) {
    const name = tourneyData?.page?.name;
    if (name) {
      activeTourney.innerText = name;
    }

    const rank = document.querySelector('.tournamentStatusHud .rank');
    if (rank) {
      const scoreHover = document.createElement('div');
      scoreHover.classList.add('scoreHover');

      tourneyData.page.scoreboard.rows.forEach((scoreboard) => {
        const scoreRow = makeElement('div', 'scoreRow');

        makeElement('div', 'scoreRank', scoreboard.rank, scoreRow);

        const teamWrapper = makeElement('a', 'teamWrapper');
        teamWrapper.href = `https://www.mousehuntgame.com/team.php?team_id=${scoreboard.team_id}`;

        const icon = makeElement('div', 'scoreIcon');

        const iconLayer1 = makeElement('div', 'scoreIconLayer1');
        iconLayer1.style.backgroundImage = `url(${scoreboard.emblem.layers[0].image})`;
        icon.append(iconLayer1);

        const iconLayer2 = makeElement('div', 'scoreIconLayer2');
        iconLayer2.style.backgroundImage = `url(${scoreboard.emblem.layers[1].image})`;
        icon.append(iconLayer2);

        const iconLayer3 = makeElement('div', 'scoreIconLayer3');
        iconLayer3.style.backgroundImage = `url(${scoreboard.emblem.layers[2].image})`;
        icon.append(iconLayer3);

        teamWrapper.append(icon);

        makeElement('div', 'scoreName', scoreboard.name, teamWrapper);

        scoreRow.append(teamWrapper);

        makeElement('div', 'scorePoints', scoreboard.points, scoreRow);

        scoreHover.append(scoreRow);
      });

      rank.append(scoreHover);
    }

    const points = document.querySelector('.tournamentStatusHud .score');
    if (points) {
      const pointsHover = document.createElement('div');
      pointsHover.classList.add('pointsHover');

      // reverse the tourneyData.mouse_groups array and loop through it.
      tourneyData.page.mouse_groups.reverse().forEach((mouseGroup) => {
        const pointsRow = makeElement('div', 'pointsRow');

        makeElement('div', 'pointsTotal', mouseGroup.name, pointsRow);

        const groupMice = document.createElement('div');
        groupMice.classList.add('pointsMice');

        mouseGroup.mice.forEach((mouse) => {
          const mouseWrapper = makeElement('div', 'pointsMouseWrapper');

          const mouseIcon = makeElement('img', 'pointsMouseIcon');
          mouseIcon.src = mouse.thumb;

          mouseWrapper.append(mouseIcon);

          makeElement('div', 'pointsMouseName', mouse.name, mouseWrapper);

          groupMice.append(mouseWrapper);
        });

        pointsRow.append(groupMice);
        pointsHover.append(pointsRow);
      });

      points.append(pointsHover);
    }
  } else {
    const members = document.querySelector('.tournamentStatusHud a.teamMembers');
    if (members) {
      const memberHover = makeElement('div', 'memberHover');

      tourneyData.page.members.forEach((member) => {
        const memberRow = makeElement('div', 'memberRow');

        if (member.is_empty) {
          makeElement('div', 'memberEmpty', 'Empty', memberRow);
          memberRow.classList.add('empty');
        } else {
          const image = makeElement('img', 'memberImage');
          image.src = member.profile_pic ?? 'https://www.mousehuntgame.com//images/ui/friends/anonymous_user.png';
          memberRow.append(image);

          makeElement('div', 'memberName', member.name ?? '', memberRow);
        }

        memberHover.append(memberRow);
      });

      members.append(memberHover);
    }
  }
};

const updateTournamentList = async () => {
  const beginsRows = document.querySelectorAll('.tournamentPage-tournamentRow.tournamentPage-tournamentData .tournamentPage-tournament-column.value:nth-child(3)');
  if (! beginsRows.length) {
    return;
  }

  const durationRows = document.querySelectorAll('.tournamentPage-tournamentRow.tournamentPage-tournamentData .tournamentPage-tournament-column.value:nth-child(4)');
  if (! durationRows.length) {
    return;
  }

  // For each beginsRow, we want to grab the innerText, convert it from '1 hour 54 minutes' to a number of minutes, then add that to the current date and output it as the date in a child element,
  // and then take the durationRow and add it to the matching beginsRow's date and output it as the date in a child element.

  const now = new Date();
  const nowTime = now.getTime();

  const dateOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  beginsRows.forEach((beginsRow, i) => {
    const beginsText = beginsRow.innerText;
    const beginsParts = beginsText.split(' ');
    const beginsMinutes = beginsParts.reduce((acc, part) => {
      if (part === 'minutes' || part === 'minute') {
        return acc + Number.parseInt(beginsParts[beginsParts.indexOf(part) - 1], 10);
      }

      if (part === 'hours' || part === 'hour') {
        return acc + (Number.parseInt(beginsParts[beginsParts.indexOf(part) - 1], 10) * 60);
      }

      return acc;
    }, 0);

    const inlineOrHover = getSetting('better-tournaments-tournament-time-display-inline') ? 'tournament-time-display-inline' : 'tournament-time-display-hover';

    const beginsDate = new Date(nowTime + (beginsMinutes * 60000));
    const beginsDateString = beginsDate.toLocaleString('en-US', dateOptions);

    const beginsDateEl = makeElement('div', ['tournament-normal-time', 'tournament-begins-date', inlineOrHover], beginsDateString);
    beginsRow.append(beginsDateEl);

    const durationText = durationRows[i].innerText;
    const durationParts = durationText.split(' ');
    const durationMinutes = durationParts.reduce((acc, part) => {
      if (part === 'minutes' || part === 'minute') {
        return acc + Number.parseInt(durationParts[durationParts.indexOf(part) - 1], 10);
      }

      if (part === 'hours' || part === 'hour') {
        return acc + (Number.parseInt(durationParts[durationParts.indexOf(part) - 1], 10) * 60);
      }

      return acc;
    }, 0);

    const durationDate = new Date(beginsDate.getTime() + (durationMinutes * 60000));
    const durationDateString = durationDate.toLocaleString('en-US', dateOptions);

    const durationDateEl = makeElement('div', ['tournament-normal-time', 'tournament-end-date', inlineOrHover], durationDateString);
    durationRows[i].append(durationDateEl);
  });
};

const updateScoreboard = () => {
  const getRanks = document.querySelectorAll('.tournament-team-rank:not(.updated)');
  getRanks.forEach((rank) => {
    rank.classList.add('updated');

    // rank.innerText is something like 2314th or 2nd or 323rd, so we want to regex out the number, add commas, and then add the suffix back on.
    const rankParts = rank.innerText.split(/(\d+)/);
    if (rankParts.length !== 3) {
      return;
    }

    const rankNum = Number.parseInt(rankParts[1], 10);

    if (rankNum <= 25) {
      rank.classList.add('rank-first-page');
    }

    rank.setAttribute('data-rank', rankNum);
    rank.setAttribute('data-rank-page', Math.ceil(rankNum / 25));

    rank.innerText = rankNum.toLocaleString('en-US') + rankParts[2];
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);
  updateTournamentHud();

  onEvent('tournament_status_change', updateTournamentHud);
  onNavigation(updateTournamentList, {
    page: 'tournament',
  });

  onNavigation(updateScoreboard, {
    page: 'scoreboards',
  });

  onRequest(updateScoreboard, 'managers/ajax/pages/scoreboards.php');
};

export default {
  id: 'better-tournaments',
  name: 'Better Tournaments',
  type: 'better',
  default: true,
  description: 'Updates the Tournaments UI to show information on hover and a variety of small interface tweaks.',
  load: init,
  settings
};
