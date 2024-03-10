import {
  getCurrentLocation,
  getData,
  makeElement,
  onNavigation,
  setPage,
  travelTo
} from '@utils';

const renderButton = (location) => {
  const title = document.querySelector('.campPage-quests-title');
  if (! title) {
    return;
  }

  const existingButton = document.querySelector('#mh-improved-m400-travel');
  if (existingButton) {
    existingButton.remove();
  }

  const button = makeElement('div', ['mousehuntActionButton', 'tiny', 'mh-m400-travel', `mh-m400-travel-${location}`]);
  button.id = 'mh-improved-m400-travel';

  if (location === getCurrentLocation()) {
    button.classList.add('disabled');
  }

  makeElement('span', 'mousehuntActionButton-text', 'Travel to next step', button);
  button.setAttribute('data-location', location);

  button.addEventListener('click', (e) => {
    let clickedLocation = e.target.getAttribute('data-location');
    if (! clickedLocation) {
      // get the parent element.
      const parent = e.target.parentElement;
      if (! parent) {
        return;
      }

      clickedLocation = parent.getAttribute('data-location');
    }

    travelTo(clickedLocation);
    setPage('Camp', null, () => {});
  });

  title.append(button);
};

const main = async () => {
  const questTitle = document.querySelector('.campPage-quests-title');
  if (! questTitle) {
    return;
  }

  const isM400 = user.quests?.QuestLibraryM400Research?.is_assignment || user.quests.QuestLibraryM400Research?.is_bait_assignment; // TODO: get the bait assignment quest here.
  if (! isM400) {
    return;
  }

  const container = document.querySelector('.campPage-quests-container');
  if (! container) {
    return;
  }

  container.classList.add('mh-m400-quest');

  const allTasks = document.querySelectorAll('.campPage-quests-objective-container');
  if (! allTasks) {
    return;
  }

  const taskNames = document.querySelectorAll('.campPage-quests-objective-task');
  if (taskNames) {
    taskNames.forEach((task) => {
      const newText = task.innerText.replaceAll('Collect 1 Piece of M400 Intel', 'Collect Intel');
      task.innerText = newText;
    });
  }

  // get the last task that doesn't have the 'locked' or 'complete' class.
  const last = [...allTasks].reverse().find((task) => {
    return ! task.classList.contains('locked') && ! task.classList.contains('complete');
  });

  if (! last) {
    return;
  }

  // Get the text that comes at the end of the objective.
  const objective = last.querySelector('.campPage-quests-objective-task');
  if (! objective) {
    return;
  }

  // get the location or mice name by splitting on the 'in' and 'from' keywords.
  let location = objective.innerText.split(' in ');
  if (location.length === 1) {
    location = objective.innerText.split(' from ');
  }

  if (location.length === 1) {
    return;
  }

  location = location[1].replace('Mice', '').replace('the ', '').trim();

  const locations = await getData('m400-locations');

  // get the actual location name from the locations object.
  const locationKey = Object.keys(locations).find((key) => {
    return locations[key].includes(location);
  });

  if (! locationKey) {
    return;
  }

  renderButton(locationKey);
};

/**
 * Initialize the module.
 */
export default async () => {
  main();

  onNavigation(main, {
    page: 'camp',
  });
};
