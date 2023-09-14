import { getMapData } from '../utils';

const getRemaining = (goals, hunters) => {
  // get the completed_goal_ids.item from all the hunters
  const completed = hunters.reduce((acc, val) => {
    if (val.completed_goal_ids?.item) {
      return acc.concat(val.completed_goal_ids.item);
    }
    return acc;
  }, []);

  // get the remaining goals
  const remaining = goals.filter((goal) => {
    return ! completed.includes(goal.unique_id);
  });

  return remaining;
};

const makeItemBlock = (mice) => {
  const miceWrapper = makeElement('div', ['pageSidebarView-block', 'mh-mapper-sidebar-mice']);

  // alphabetize the mice
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
      hg.views.ItemView.show(mouse.type);
    });

    const mouseImage = makeElement('img', 'mouse-image');
    mouseImage.src = mouse.thumb;
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

const addItemsToSidebar = async (remainingItems) => {
  const sidebar = document.querySelector('.pageSidebarView');
  if (! sidebar || sidebar.children.length < 3) {
    return false;
  }

  const existingSidebar = document.querySelector('#mh-items-sidebar');
  if (existingSidebar) {
    existingSidebar.remove();
  }

  const block = makeElement('div', ['pageSidebarView-block', 'mh-mapper-sidebar']);
  block.id = 'mh-items-sidebar';

  const nameWrapper = makeElement('div', 'mh-mapper-sidebar-name');
  const nameA = makeElement('a', ['mousehuntHud-userStat', 'treasureMap']);
  nameA.href = '#';
  nameA.addEventListener('click', (e) => {
    e.preventDefault();
    hg.controllers.TreasureMapController.show();
  });
  makeElement('span', 'label', 'Remaining Items', nameA);
  nameWrapper.appendChild(nameA);

  block.appendChild(nameWrapper);

  const miceBlock = makeItemBlock(remainingItems);
  if (! miceBlock) {
    return false;
  }

  block.appendChild(miceBlock);

  sidebar.insertBefore(block, sidebar.children[2]);
};

const initScavenger = (map = null) => {
  if (! map) {
    map = getMapData();
    if (! map.is_scavenger_hunt) {
      return;
    }
  }

  const remainingItems = getRemaining(map.goals.item, map.hunters);
  addItemsToSidebar(remainingItems);
};

export default initScavenger;
