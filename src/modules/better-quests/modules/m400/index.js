import { doEvent, getArForMouse, getCurrentLocation, getData, makeElement, makeMhButton, onNavigation, travelTo } from '@utils';

/**
 * Find a mouse by the name an objective uses for it.
 *
 * @param {Array}  allMice The mice data.
 * @param {string} name    The name from the objective, without "Mice".
 *
 * @return {Object|undefined} The mouse.
 */
const findMouse = (allMice, name) => {
  return allMice.find((m) => m.abbreviated_name === name || m.name === `${name} Mouse`);
};

/**
 * Show the best bait for the mouse in each open objective, from MHCT attraction rates.
 *
 * @param {Object} locations The M400 locations data, keyed by environment ID.
 */
const addBaitSuggestions = async (locations) => {
  const tasks = document.querySelectorAll('.mh-m400-quest .campPage-quests-objective-container:not(.locked, .complete) .campPage-quests-objective-task');
  if (!tasks.length) {
    return;
  }

  const allMice = await getData('mice');
  if (!allMice) {
    return;
  }

  for (const task of tasks) {
    // Mark the task before awaiting, so an overlapping run doesn't add a second suggestion.
    if (task.dataset.mhM400Bait) {
      continue;
    }

    task.dataset.mhM400Bait = 'pending';

    const match = task.innerText.match(/from (.+?) Mice/);
    const mouse = match ? findMouse(allMice, match[1]) : null;
    const rates = mouse ? await getArForMouse(mouse.type, 'mouse') : null;
    if (!Array.isArray(rates) || !rates.length) {
      delete task.dataset.mhM400Bait;
      continue;
    }

    // Prefer the rates for the objective's location, falling back to the best anywhere.
    const locationName = Object.values(locations).find((names) => names.includes(match[1]))?.[0];
    const inLocation = rates.filter((rate) => rate.location === locationName);
    const best = [...(inLocation.length ? inLocation : rates)].sort((a, b) => b.rate - a.rate)[0];
    if (!best?.cheese) {
      delete task.dataset.mhM400Bait;
      continue;
    }

    const details = [`${(best.rate / 100).toFixed(1)}%`];
    if (!inLocation.length) {
      details.push(`in ${best.location}`);
    }

    if (best.stage) {
      details.push(best.stage);
    }

    const suggestion = makeElement('div', 'mh-m400-bait', `Best bait: ${best.cheese} (${details.join(', ')})`);
    suggestion.title = 'Attraction rate from MHCT';
    task.after(suggestion);
    task.dataset.mhM400Bait = 'done';
  }
};

/**
 * Link the mice named in the quest objectives, so they get hover cards and
 * open the mouse view when clicked.
 */
const linkMiceInObjectives = async () => {
  const tasks = document.querySelectorAll('.mh-m400-quest .campPage-quests-objective-task');
  if (!tasks.length) {
    return;
  }

  const allMice = await getData('mice');
  if (!allMice) {
    return;
  }

  let added = false;
  tasks.forEach((task) => {
    if (task.getAttribute('data-mh-m400-mouse-linked')) {
      return;
    }

    const match = task.innerText.match(/from (.+?) Mice/);
    if (!match) {
      return;
    }

    const mouse = findMouse(allMice, match[1]);
    if (!mouse) {
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
  if (!title) {
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
    if (!clickedLocation) {
      // get the parent element.
      const parent = e.target.parentElement;
      if (!parent) {
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
  if (!questTitle) {
    return;
  }

  const isM400 = user.quests?.QuestLibraryM400Research?.is_assignment;
  const isM400Bait = user.quests?.QuestLibraryM400BaitResearch?.is_assignment;
  if (!(isM400 || isM400Bait)) {
    return;
  }

  const container = document.querySelector('.campPage-quests-container');
  if (!container) {
    return;
  }

  container.classList.add('mh-m400-quest');
  if (isM400Bait) {
    container.classList.add('mh-m400-bait-quest');
  }

  const allTasks = document.querySelectorAll('.campPage-quests-objective-container');
  if (!allTasks.length) {
    return;
  }

  const taskNames = document.querySelectorAll('.campPage-quests-objective-task');
  taskNames.forEach((task) => {
    const newText = task.innerText.replaceAll('Collect 1 Piece of M400 Intel', 'Collect Intel');
    // Only write when something changed, so the mouse links don't get wiped.
    if (newText !== task.innerText) {
      task.innerText = newText;
    }
  });

  await linkMiceInObjectives();

  const locations = await getData('m400-locations');
  addBaitSuggestions(locations);

  // get the first task that doesn't have the 'locked' or 'complete' class.
  const next = [...allTasks].find((task) => {
    return !task.classList.contains('locked') && !task.classList.contains('complete');
  });

  if (!next) {
    // Everything is done, so remove the travel button if it's there.
    const existingButton = document.querySelector('#mh-improved-m400-travel');
    if (existingButton) {
      existingButton.remove();
    }

    return;
  }

  // Get the text that comes at the end of the objective.
  const objective = next.querySelector('.campPage-quests-objective-task');
  if (!objective) {
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

  // get the actual location name from the locations object.
  const locationKey = Object.keys(locations).find((key) => {
    return locations[key].includes(location);
  });

  if (!locationKey) {
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
