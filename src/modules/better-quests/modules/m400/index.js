import {
  doEvent,
  getCurrentLocation,
  getData,
  makeMhButton,
  onNavigation,
  travelTo
} from '@utils';

/**
 * Link the mice named in the quest objectives, so they get hover cards and
 * open the mouse view when clicked.
 */
const linkMiceInObjectives = async () => {
  const tasks = document.querySelectorAll('.mh-m400-quest .campPage-quests-objective-task');
  if (! tasks.length) {
    return;
  }

  const allMice = await getData('mice');
  if (! allMice) {
    return;
  }

  let added = false;
  tasks.forEach((task) => {
    if (task.getAttribute('data-mh-m400-mouse-linked')) {
      return;
    }

    const match = task.innerText.match(/from (.+?) Mice/);
    if (! match) {
      return;
    }

    const mouse = allMice.find((m) => m.abbreviated_name === match[1] || m.name === `${match[1]} Mouse`);
    if (! mouse) {
      return;
    }

    const linkText = `${match[1]} Mice`;
    task.innerHTML = task.innerHTML.replace(
      linkText,
      `<a href="https://www.mousehuntgame.com/adversaries.php?mouse_type=${mouse.type}" class="mh-m400-mouse-link" onclick="hg.views.MouseView.show('${mouse.type}'); return false;">${linkText}</a>`
    );

    task.setAttribute('data-mh-m400-mouse-linked', 'true');
    added = true;
  });

  if (added) {
    // Let the mouse hover cards attach to the new links.
    doEvent('journal-mouse-link-modified');
  }
};

/**
 * Add a button to travel to the next step in the M400 quest.
 *
 * @param {string} location The location to travel to.
 */
const renderButton = (location) => {
  const title = document.querySelector('.campPage-quests-title');
  if (! title) {
    return;
  }

  const existingButton = document.querySelector('#mh-improved-m400-travel');
  if (existingButton) {
    existingButton.remove();
  }

  const button = makeMhButton({
    id: 'mh-improved-m400-travel',
    text: 'Travel to next step',
    className: ['mh-m400-travel', `mh-m400-travel-${location}`],
  });

  button.setAttribute('data-location', location);

  if (location === getCurrentLocation()) {
    button.classList.add('disabled');
  }

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
  });

  title.append(button);
};

/**
 * Main function.
 */
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
      // Only write when something changed, so the mouse links don't get wiped.
      if (newText !== task.innerText) {
        task.innerText = newText;
      }
    });
  }

  await linkMiceInObjectives();

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
