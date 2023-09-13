import { addMapperStyles, getMapData } from '../utils.js';

const makeMiceBlock = (mice, type = 'map') => {
  const miceWrapper = makeElement('div', ['pageSidebarView-block', 'mh-mapper-sidebar-mice']);

  mice.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    return 1;
  });

  mice.forEach((mouse) => {
    const mouseWrapper = makeElement('div', 'mh-mapper-sidebar-mouse');
    mouseWrapper.addEventListener('click', (e) => {
      e.preventDefault();
      hg.views.MouseView.show(mouse.type);
    });

    const mouseImage = makeElement('img', 'mouse-image');
    mouseImage.src = type === 'map' ? mouse.small : mouse.thumb;
    mouseImage.alt = mouse.name;
    mouseWrapper.appendChild(mouseImage);

    const mouseName = makeElement('a', 'mouse-name', mouse.name);
    mouseName.href = '#';
    mouseName.addEventListener('click', (e) => {
      e.preventDefault();
      hg.views.MouseView.show(mouse.type);
    });

    mouseWrapper.appendChild(mouseName);

    miceWrapper.appendChild(mouseWrapper);
  });

  return miceWrapper;
};

const addToSidebar = (mapData) => {
  const sidebar = document.querySelector('.pageSidebarView');
  if (! sidebar || sidebar.children.length < 3) {
    return false;
  }

  const existingSidebar = document.querySelector('#mh-mapper-sidebar');
  if (existingSidebar) {
    existingSidebar.remove();
  }

  const block = makeElement('div', ['pageSidebarView-block', 'mh-mapper-sidebar']);
  block.id = 'mh-mapper-sidebar';

  const nameWrapper = makeElement('div', 'mh-mapper-sidebar-name');
  const nameA = makeElement('a', ['mousehuntHud-userStat', 'treasureMap']);
  nameA.href = '#';
  nameA.addEventListener('click', (e) => {
    e.preventDefault();
    hg.controllers.TreasureMapController.show(mapData.map_id);
  });

  const icon = makeElement('div', 'icon');
  icon.style.backgroundImage = `url(${mapData.thumb})`;

  // const model = new hg.models.TreasureMapModel(mapData);

  // check model.hasMessage() here probably.
  const notification = makeElement('div', 'notification', '0');
  icon.appendChild(notification);

  // check for corkboard update here.
  const corkboardUpdate = makeElement('div', 'corkboardUpdate');
  if (user?.quests?.QuestRelicHunter?.new_chat) {
    corkboardUpdate.classList.add('active');
  }
  icon.appendChild(corkboardUpdate);

  const miceWarning = makeElement('div', 'miceWarning');
  if (user?.quests?.QuestRelicHunter?.mice_warning) {
    miceWarning.classList.add('active');
  }
  icon.appendChild(miceWarning);
  nameA.appendChild(icon);

  makeElement('span', 'label', mapData.name, nameA);
  nameWrapper.appendChild(nameA);

  block.appendChild(nameWrapper);

  const mice = mapData?.goals?.mouse;
  if (! mice || ! mice.length) {
    return false;
  }

  let unsortedMice = [];
  if (mapData?.goals?.mouse) {
    unsortedMice = mapData.goals.mouse;
  }

  let caughtMice = [];
  // get the ids from currentMapData.hunters.completed_goal_ids.mouse
  mapData.hunters.forEach((hunter) => {
    caughtMice = caughtMice.concat(hunter.completed_goal_ids.mouse);
  });

  // Remove the caught mice from the unsorted mice.
  unsortedMice = unsortedMice.filter((mouse) => {
    return caughtMice.indexOf(mouse.unique_id) === -1;
  });

  const miceBlock = makeMiceBlock(unsortedMice);
  if (! miceBlock) {
    return false;
  }

  block.appendChild(miceBlock);

  sidebar.insertBefore(block, sidebar.children[2]);
};

export default main;

// playing with sidebar
const getMiceEffectivness = async () => {
  const data = await doRequest('managers/ajax/users/getmiceeffectiveness.php');
  if (! data.effectiveness) {
    return;
  }

  // get all the mice arrays that are in the different jeys in the effectiveness object
  const mice = Object.values(data.effectiveness).reduce((acc, val) => {
    if (val.difficulty !== 'impossible') {
      return acc.concat(val.mice);
    }
    return acc;
  }, []);

  return mice;
};

const addMiceToSidebar = async () => {
  const mice = await getMiceEffectivness();
  if (! mice) {
    return;
  }

  const sidebar = document.querySelector('.pageSidebarView');
  if (! sidebar || sidebar.children.length < 3) {
    return false;
  }

  const existingSidebar = document.querySelector('#mh-mice-sidebar');
  if (existingSidebar) {
    existingSidebar.remove();
  }

  const block = makeElement('div', ['pageSidebarView-block', 'mh-mapper-sidebar']);
  block.id = 'mh-mice-sidebar';

  const nameWrapper = makeElement('div', 'mh-mapper-sidebar-name');
  const nameA = makeElement('a', ['mousehuntHud-userStat', 'treasureMap']);
  nameA.href = '#';
  nameA.addEventListener('click', (e) => {
    e.preventDefault();
    app.pages.CampPage.toggleTrapEffectiveness(true);
  });
  makeElement('span', 'label', 'Available Mice', nameA);
  nameWrapper.appendChild(nameA);

  block.appendChild(nameWrapper);

  const miceBlock = makeMiceBlock(mice, 'available-mice');
  if (! miceBlock) {
    return false;
  }

  block.appendChild(miceBlock);

  sidebar.insertBefore(block, sidebar.children[2]);
};

const main = async () => {
  const mapId = user.quests?.QuestRelicHunter?.default_map_id;
  if (mapId) {
    addToSidebar(getMapData(mapId));
  }

  addMiceToSidebar();
};
