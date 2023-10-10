import locations from '../../data/m400-locations.json';

const main = () => {
  const questTitle = document.querySelector('.campPage-quests-title');
  if (! questTitle) {
    return;
  }

  // Make sure we're on the m400 quest.
  // TODO: also check for the bait research assignment.
  const currentQuest = user?.quests?.QuestLibraryM400Research?.is_assignment;
  if (! currentQuest) {
    return;
  }

  const steps = document.querySelectorAll('.campPage-quests-objective-container');
  if (! steps) {
    return;
  }

  let last = null;
  // Loop through each of the steps.
  steps.forEach((step) => {
    // if it has a locked class, skip it.
    if (step.classList.contains('locked')) {
      return;
    }

    last = step;

    // Grab the objective text.
    const objective = step.querySelector('.campPage-quests-objective-task');
    if (! objective) {
      return;
    }

    const alreadyModified = objective.getAttribute('m400-helper-modified');
    if (alreadyModified) {
      return;
    }

    objective.setAttribute('m400-helper-modified', true);
    objective.setAttribute('original-text', objective.innerText);

    objective.innerText = objective.innerText.replace('1 Piece of M400 Intel', 'intel');

    const progress = step.querySelector('.campPage-quests-objective-progress');
    if (progress) {
      progress.classList.add('m400-helper-hidden');
    }

    const progressBar = step.querySelector('.campPage-quests-objective-progressBar');
    if (progressBar) {
      progressBar.classList.add('m400-helper-hidden');
    }
  });

  if (last) {
    // Add the travel button linking to the location from the last step.
    // If the button already exists and has the same location, skip it.
    const existingButton = document.querySelector('#mh-improved-m400-travel');
    if (existingButton) {
      existingButton.remove();
    }

    // Get the text that comes at the end of the objective.
    const objective = last.querySelector('.campPage-quests-objective-task');
    if (! objective) {
      return;
    }

    const location = objective.getAttribute('original-text').split(' in ')[1].replace('the ', '').trim();

    // Find the location key from the locations object.
    const locationKey = Object.keys(locations).find((key) => {
      return locations[key].includes(location);
    });

    if (! locationKey) {
      return;
    }

    // Create the button.
    const travelButton = document.createElement('a');
    travelButton.id = 'mh-improved-m400-travel';

    // Add the classes to style it.
    travelButton.classList.add('mousehuntActionButton');
    travelButton.classList.add('tiny');
    travelButton.classList.add(`mh-m400-travel-${locationKey}`);

    // Add the location to the button's data attribute.
    travelButton.setAttribute('data-location', locationKey);
    travelButton.setAttribute('data-is-m400', objective.innerText.includes('Fusion Fondue'));

    // Set the button's text and title.
    travelButton.title = 'Travel to this location';

    if (user.environment_type === locationKey) {
      travelButton.classList.add('disabled');
      travelButton.title = 'You are already at this location';
    }

    const travelButtonText = document.createElement('span');
    travelButtonText.classList.add('mousehuntActionButton-text');
    travelButtonText.innerText = 'Travel to next step';

    travelButton.appendChild(travelButtonText);

    // Add a click listener to the button.
    travelButton.addEventListener('click', (e) => {
      if (! e.target.getAttribute('data-location') || ! e.target.getAttribute('data-is-m400')) {
        return;
      }

      // Travel to the location.
      app.pages.TravelPage.travel(location); // eslint-disable-line no-undef
    });

    // Add the button to the quest.
    questTitle.appendChild(travelButton);
  }
};

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

  makeElement('span', 'mousehuntActionButton-text', 'Travel to next step', button);
  button.setAttribute('data-location', location);

  button.addEventListener('click', (e) => {
    if (! e.target.getAttribute('data-location')) {
      // get the parent element.
      const parent = e.target.parentElement;
      if (! parent) {
        return;
      }

      location = parent.getAttribute('data-location');
    }

    app.pages.TravelPage.travel(location); // eslint-disable-line no-undef
  });

  title.appendChild(button);
};

const m400 = () => {
  const questTitle = document.querySelector('.campPage-quests-title');
  if (! questTitle) {
    return;
  }

  const isM400 = user.quests?.QuestLibraryM400Research?.is_assignment || user.quests.QuestLibraryM400Research.is_bait_assignment; // TODO: get the bait assignment quest here.
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

  // get the last task that doesn't have the 'locked' or 'complete' class.
  let last = null;
  allTasks.forEach((task) => {
    if (task.classList.contains('locked') || task.classList.contains('complete')) {
      return;
    }

    last = task;
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

  // get the actual location name from the locations object.
  const locationKey = Object.keys(locations).find((key) => {
    return locations[key].includes(location);
  });

  if (! locationKey) {
    return;
  }

  renderButton(locationKey);
};

export default () => {
  onNavigation(m400, {
    page: 'camp',
  });
};
