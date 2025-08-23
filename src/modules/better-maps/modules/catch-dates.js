import {
  cacheGet,
  dbGet,
  getMapData,
  makeElement,
  onEvent
} from '@utils';

const addCatchDates = async () => {
  const mapId = user?.quests?.QuestRelicHunter?.default_map_id || false;
  if (! mapId) {
    return;
  }

  const catchDatesData = await dbGet('cache', `map-catches-${mapId}`);
  const catchDates = catchDatesData?.data?.value || {};
  const goals = document.querySelectorAll('.treasureMapView-goals-group-goal.complete');
  goals.forEach((goal) => {
    const goalId = goal.getAttribute('data-unique-id') || goal.getAttribute('data-mouse-type');
    if (! goalId || ! catchDates[goalId]) {
      return;
    }

    let dateEl = goal.querySelector('.mh-improved-catch-date');
    if (! dateEl) {
      const nameEl = goal.querySelector('.treasureMapView-goals-group-goal-name');
      if (nameEl) {
        dateEl = makeElement('div', 'mh-improved-catch-date');
        nameEl.append(dateEl);
      }
    }

    const caught = new Date(catchDates[goalId]);
    dateEl.textContent = caught.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  });
};

const addMapStartDate = async () => {
  const mapId = user?.quests?.QuestRelicHunter?.default_map_id || false;
  if (! mapId) {
    return;
  }

  const mapName = document.querySelector('.treasureMapView-mapName');
  if (! mapName) {
    return;
  }

  const start = await cacheGet(`map-start-${mapId}`);
  if (! start) {
    return;
  }

  let existing = mapName.querySelector('.mh-improved-map-start');
  if (existing) {
    existing.remove();
  }

  const mapData = await getMapData(mapId);
  if (! mapData || ! mapData.hunters || ! mapData.hunters[0] || ! mapData.hunters[0].sn_user_id) {
    return;
  }

  const didOpenMap = mapData.hunters[0].sn_user_id === user.sn_user_id;

  const started = new Date(start);
  const startText = `${didOpenMap ? 'Started' : 'Joined'}: ${started.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  existing = makeElement('div', 'mh-improved-map-start', startText, mapName);
};

export default () => {
  onEvent('map_show_goals_tab_click', () => {
    addCatchDates();
    addMapStartDate();
  });
};
