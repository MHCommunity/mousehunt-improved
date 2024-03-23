import {
  doRequest,
  getData,
  makeElement,
  onTravel,
  onTurn,
  sessionGet
} from '@utils';

const getCompletedGoals = (mapData) => {
  let goals = mapData?.is_scavenger_hunt ? mapData?.goals?.item : mapData?.goals?.mouse;
  const completedGoals = [];
  const hunters = mapData?.hunters;
  for (const hunter of hunters) {
    const completed = mapData?.is_scavenger_hunt ? hunter?.completed_goal_ids?.item : hunter?.completed_goal_ids?.mouse;

    if (completed) {
      completedGoals.push(...completed);
    }
  }

  // filter out completed goals and sort by name
  goals = goals.filter((goal) => ! completedGoals.includes(goal.unique_id)).sort((a, b) => a.name.localeCompare(b.name));

  return goals;
};

const addMapToSidebar = () => {
  const sidebar = document.querySelector('.pageSidebarView .pageSidebarView-block');
  if (! sidebar) {
    return;
  }

  const mapId = user?.quests?.QuestRelicHunter?.default_map_id || false;
  if (! mapId) {
    return;
  }

  const mapData = sessionGet(`mh-improved-map-cache-${mapId}`);

  const mapSidebar = makeElement('div', 'mh-improved-map-sidebar');
  const title = makeElement('h3', 'mh-improved-map-sidebar-title', mapData?.name.replaceAll('Treasure Map', '') || 'Map');
  title.addEventListener('click', async () => {
    mapSidebar.classList.add('loading');

    await refreshMap();
    addMapToSidebar();

    setTimeout(() => {
      mapSidebar.classList.remove('loading');
    }, 1000);
  });

  mapSidebar.append(title);

  const goals = getCompletedGoals(mapData);

  const goalsEl = makeElement('div', 'mh-improved-map-sidebar-goals');

  for (const goal of goals) {
    const goalEl = makeElement('div', 'mh-improved-map-sidebar-goal');

    const goalImage = makeElement('div', 'mh-improved-map-sidebar-goal-image');
    const thumbnail = miceThumbs.find((thumb) => thumb.type === goal.type);
    goalImage.style.backgroundImage = thumbnail ? `url(${thumbnail.thumb})` : `url(${goal.large})`;
    goalEl.append(goalImage);

    makeElement('div', 'mh-improved-map-sidebar-goal-name', goal.name, goalEl);

    if (goal.environment_ids.includes(user?.environment_id)) {
      goalEl.classList.add('mh-improved-map-sidebar-goal-active');
    }

    // todo: add in 'mh-improved-map-sidebar-goal-has-hunter' class and set the background image to the hunter's avatar
    // if the goal has an environment_id that matches a hunter's environment_id.
    // todo: also needs to be able to handle multiple hunters in the same environment.

    goalEl.addEventListener('click', () => {
      if (mapData.is_scavenger_hunt) {
        hg.views.ItemView.show(goal.type);
      } else {
        hg.views.MouseView.show(goal.type);
      }
    });

    goalsEl.append(goalEl);
  }

  mapSidebar.append(goalsEl);

  const existing = document.querySelector('.mh-improved-map-sidebar');
  if (existing) {
    existing.replaceWith(mapSidebar);
  } else {
    sidebar.append(mapSidebar);
  }
};

const refreshMap = async () => {
  console.log('Refreshing map data');
  const mapId = user?.quests?.QuestRelicHunter?.default_map_id || false;

  const mapData = await doRequest('managers/ajax/users/treasuremap.php', {
    action: 'map_info',
    map_id: mapId,
  });

  const currentMapData = sessionGet(`mh-improved-map-cache-${mapId}`);
  const currentGoals = getCompletedGoals(currentMapData);
  const newGoals = getCompletedGoals(mapData.treasure_map);

  if (currentGoals.length !== newGoals.length) {
    console.log('Updating map data');
    sessionSet(`mh-improved-map-cache-${mapId}`, mapData.treasure_map);
    addMapToSidebar();
  }
};

let miceThumbs;
export default async () => {
  miceThumbs = await getData('mice-thumbnails');

  addMapToSidebar();

  onTurn(async () => {
    await refreshMap();
    addMapToSidebar();
  }, 1000);
  onTravel(null, { callback: addMapToSidebar });

  // Refresh map data every 5 minutes.
  setInterval(refreshMap, 300000);
};
