const locations = {
  /* eslint-disable */
  balacks_cove      : ["Balack's Cove", 'Derr Lich', 'Elub Lich', 'Nerg Lich'],
  bazaar            : ['Bazaar', 'Master Burglar', 'Burglar', 'Granite'],
  calm_clearing     : ['Calm Clearing'],
  cape_clawed       : ['Cape Clawed'],
  catacombs         : ['Catacombs', 'Lycan', 'Terror Knight', 'Keeper'],
  claw_shot_city    : ['Claw Shot City', 'Prospector', 'Ruffian', 'Saloon Gal', 'Lasso Cowgirl', 'Shopkeeper', 'Tumbleweed', 'Pyrite'],
  derr_dunes        : ['Derr Dunes', 'Grunt', 'Guardian', 'Renegade', 'Seer', 'Trailblazer'],
  desert_city       : ['Muridae Market', 'Blacksmith', 'Mage Weaver', 'Market Guard', 'Spice Merchant', 'Market Thief', 'Pie Thief', 'Lumberjack', 'Glass Blower', 'Limestone Miner'],
  desert_oasis      : ['Living Garden', 'Twisted Garden', 'Barkshell', 'Camofusion', 'Thorn', 'Twisted Hotcakes', 'Bark', 'Camoflower', 'Strawberry Hotcakes', 'Thistle', 'Calalilly', 'Shroom'],
  desert_warpath    : ['Fiery Warpath'],
  dojo              : ['Dojo'],
  dracano           : ['Dracano', 'Draconic Warden', 'Whelpling', 'Dragon'],
  elub_shore        : ['Elub Shore', 'Mystic', 'Pack', 'Protector', 'Scout', 'Vanquisher'],
  forbidden_grove   : ['Acolyte Realm', 'Gate Guardian', 'Sorceror', 'Gorgon', 'Forbidden Grove', 'Realm Ripper', 'Realm Rippers'],
  fort_rox          : ['Fort Rox'],
  great_gnarled_tree: ['Great Gnarled Tree'],
  harbour           : ['Harbour'],
  iceberg           : ['Iceberg'],
  jungle_of_dread   : ['Jungle of Dread', 'Magma Carrier', 'Primal', 'Stonework Warrior', 'Pygmy Wrangler', 'Swarm of Pygmy'],
  kings_arms        : ["King's Arms"],
  kings_gauntlet    : ["King's Gauntlet", 'Cavalier', 'Terra', 'Knight', 'Page', 'Phalanx', 'Stealth'],
  laboratory        : ['Laboratory', 'Monster'],
  lagoon            : ['Lagoon'],
  lost_city         : ['Cursed City', 'Lost City', 'Cursed Librarian', 'Cursed Enchanter', 'Essence Guardian', 'Essence Collector', 'Ethereal Enchanter', 'Ethereal Librarian', 'Ethereal Librarians', 'Ethereal Enchanters'],
  meadow            : ['Meadow', 'Bionic'],
  meditation_room   : ['Meditation Room', 'Master of the Cheese Belt', 'Master of the Cheese Claw', 'Master of the Cheese Fang', 'Masters of the Cheese Belt', 'Masters of the Cheese Claw', 'Masters of the Cheese Fang'],
  mountain          : ['Mountain'],
  mousoleum         : ['Mousoleum', 'Zombie', 'Ravenous Zombie'],
  nerg_plains       : ['Nerg Plains', 'Conjurer', 'Conqueror', 'Defender', 'Finder', 'Pathfinder'],
  pinnacle_chamber  : ['Pinnacle Chamber', 'Master of the Dojo', 'Masters of the Dojo', 'Dojo Sensei'],
  pollution_outbreak: ['Toxic Spill'],
  sand_dunes        : ['Sand Dunes', 'Sand Crypts', 'Sand Colossus', 'Scarab', 'Serpentine', 'Grubling Herder', 'Sand Pilgrim', 'Sand Pilgrims', 'Quesodillo', 'Spiky Devil', 'Dunehopper'],
  seasonal_garden   : ['Seasonal Garden', 'Mystic Knight', 'Technic Knight', 'Mystic Bishop', 'Technic Bishop'],
  slushy_shoreline  : ['Slushy Shoreline', 'Chipper', 'Snow Slinger', 'Snow Sniper', 'Snow Soldier', 'Yeti', 'Polar Bear'],
  ss_huntington_ii  : ['SS Huntington IV', 'Buccaneer', 'Captain'],
  sunken_city       : ['Sunken City'],
  tournament_hall   : ['Tournament Hall'],
  town_of_digby     : ['Town of Digby', 'Lambent Crystal'],
  town_of_gnawnia   : ['Town of Gnawnia'],
  train_station     : ['Gnawnian Express Station'],
  training_grounds  : ['Training Grounds', 'Ninja', 'Kung Fu', 'Samurai', 'Archer'],
  zugzwang_tower    : ["Zugzwang's Tower"],
  zuzwang_library   : ['Crystal Library', 'Effervescent', 'Walker', 'Tome Sprite', 'Pocketwatch'],
};

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

    // replace 'm400 intel' with 'intel'
    const newText = objective.innerText.replace('1 Piece of M400 Intel', 'intel');
    objective.innerText = `${newText}. View on MHCT.`; // TODO

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
      // Get the location from the button's data attribute.
      const location = e.target.getAttribute('data-location');
      if (! location) {
        return;
      }

      const ism400 = e.target.getAttribute('data-is-m400');
      if (! ism400) {
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
  makeElement('span', 'mousehuntActionButton-text', 'Travel to next step', button);
  button.setAttribute('data-location', location);

  button.addEventListener('click', (e) => {
    let location = e.target.getAttribute('data-location');
    if (! location) {
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
}

export default () => {
  addStyles(`.mh-m400-travel {
    margin-left: 10px;
    margin-top: -2px;
  }

  .mh-m400-quest .campPage-quests-objective-progress,
  .mh-m400-quest .campPage-quests-objective-progressBar {
    display: none;
  }`);

  m400();

  onPageChange({
    camp: { show: m400 },
  });
}
