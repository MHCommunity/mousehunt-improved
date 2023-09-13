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

  const tourneyData = await doRequest(
    'managers/ajax/pages/page.php',
    {
      page_class: 'Tournament',
      'page_arguments[tournament_id]': tourneyId,
    }
  );

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
        icon.appendChild(iconLayer1);

        const iconLayer2 = makeElement('div', 'scoreIconLayer2');
        iconLayer2.style.backgroundImage = `url(${scoreboard.emblem.layers[1].image})`;
        icon.appendChild(iconLayer2);

        const iconLayer3 = makeElement('div', 'scoreIconLayer3');
        iconLayer3.style.backgroundImage = `url(${scoreboard.emblem.layers[2].image})`;
        icon.appendChild(iconLayer3);

        teamWrapper.appendChild(icon);

        makeElement('div', 'scoreName', scoreboard.name, teamWrapper);

        scoreRow.appendChild(teamWrapper);

        makeElement('div', 'scorePoints', scoreboard.points, scoreRow);

        scoreHover.appendChild(scoreRow);
      });

      rank.appendChild(scoreHover);
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

          mouseWrapper.appendChild(mouseIcon);

          makeElement('div', 'pointsMouseName', mouse.name, mouseWrapper);

          groupMice.appendChild(mouseWrapper);
        });

        pointsRow.appendChild(groupMice);
        pointsHover.appendChild(pointsRow);
      });

      points.appendChild(pointsHover);
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
          image.src = member.profile_pic ? member.profile_pic : 'https://www.mousehuntgame.com//images/ui/friends/anonymous_user.png';
          memberRow.appendChild(image);

          makeElement('div', 'memberName', member.name ? member.name : '', memberRow);
        }

        memberHover.appendChild(memberRow);
      });

      members.appendChild(memberHover);
    }
  }
};

const main = async () => {
  updateTournamentHud();

  onEvent('tournament_status_change', updateTournamentHud);
};

export default main;
