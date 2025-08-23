import {
  cacheGetNoExpiration,
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

  const catchDates = await cacheGetNoExpiration(`map-catches-${mapId}`);
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

  const mapActions = document.querySelector('.treasureMapView-mapMenu-group-actions');
  if (! mapActions) {
    return;
  }

  const existing = document.querySelector('.mh-improved-map-start');
  if (existing) {
    return;
  }

  const start = await cacheGetNoExpiration(`map-start-${mapId}`);
  if (! start) {
    return;
  }

  const mapData = await getMapData(mapId);
  if (! mapData || ! mapData.hunters || ! mapData.hunters[0] || ! mapData.hunters[0].sn_user_id) {
    return;
  }

  const didOpenMap = mapData.hunters[0].sn_user_id === user.sn_user_id;

  const started = new Date(start);
  const startText = `${didOpenMap ? 'Started' : 'Joined'}: ${started.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  makeElement('div', 'mh-improved-map-start', startText, mapActions);
};

export default () => {
  onEvent('map_show_goals_tab_click', () => {
    addCatchDates();
    addMapStartDate();
  });
};
