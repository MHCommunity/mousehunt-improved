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

  console.log(tourneyData);

  if (! tourneyData?.page) {
    return;
  }

  if (! tourneyData.page?.is_active) {
    return;
  }

  const name = tourneyData?.page?.name;
  if (name) {
    activeTourney.innerText = name;
  }

  const rank = document.querySelector('.tournamentStatusHud .rank');
  if (rank) {
    const scoreHover = document.createElement('div');
    scoreHover.classList.add('scoreHover');

    tourneyData.page.scoreboard.rows.forEach((scoreboard) => {
      const scoreRow = document.createElement('div');
      scoreRow.classList.add('scoreRow');

      const rankText = document.createElement('div');
      rankText.classList.add('scoreRank');
      rankText.innerText = scoreboard.rank;

      scoreRow.appendChild(rankText);

      const teamWrapper = document.createElement('a');
      teamWrapper.classList.add('teamWrapper');
      teamWrapper.href = `https://www.mousehuntgame.com/team.php?team_id=${scoreboard.team_id}`;

      const icon = document.createElement('div');
      icon.classList.add('scoreIcon');

      const iconLayer1 = document.createElement('div');
      iconLayer1.classList.add('scoreIconLayer1');
      iconLayer1.style.backgroundImage = `url(${scoreboard.emblem.layers[0].image})`;
      icon.appendChild(iconLayer1);

      const iconLayer2 = document.createElement('div');
      iconLayer2.classList.add('scoreIconLayer2');
      iconLayer2.style.backgroundImage = `url(${scoreboard.emblem.layers[1].image})`;
      icon.appendChild(iconLayer2);

      const iconLayer3 = document.createElement('div');
      iconLayer3.classList.add('scoreIconLayer3');
      iconLayer3.style.backgroundImage = `url(${scoreboard.emblem.layers[2].image})`;
      icon.appendChild(iconLayer3);

      teamWrapper.appendChild(icon);

      const scoreName = document.createElement('div');
      scoreName.classList.add('scoreName');
      scoreName.innerText = scoreboard.name;

      teamWrapper.appendChild(scoreName);

      scoreRow.appendChild(teamWrapper);

      const points = document.createElement('div');
      points.classList.add('scorePoints');
      points.innerText = scoreboard.points;

      scoreRow.appendChild(points);

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
      const pointsRow = document.createElement('div');
      pointsRow.classList.add('pointsRow');

      const groupTitle = document.createElement('div');
      groupTitle.classList.add('pointsTitle');
      groupTitle.innerText = mouseGroup.name;

      pointsRow.appendChild(groupTitle);

      const groupMice = document.createElement('div');
      groupMice.classList.add('pointsMice');

      mouseGroup.mice.forEach((mouse) => {
        const mouseWrapper = document.createElement('div');
        mouseWrapper.classList.add('pointsMouseWrapper');

        const mouseIcon = document.createElement('img');
        mouseIcon.classList.add('pointsMouseIcon');
        mouseIcon.src = mouse.thumb;

        mouseWrapper.appendChild(mouseIcon);

        const mouseName = document.createElement('div');
        mouseName.classList.add('pointsMouseName');
        mouseName.innerText = mouse.name;

        mouseWrapper.appendChild(mouseName);

        groupMice.appendChild(mouseWrapper);
      });

      pointsRow.appendChild(groupMice);

      pointsHover.appendChild(pointsRow);
    });

    points.appendChild(pointsHover);
  }
};

export default () => {
  updateTournamentHud();
};
