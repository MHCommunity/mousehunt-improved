
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
  ss_huntington_ii  : ['S.S. Huntington IV', 'Buccaneer', 'Captain'],
  sunken_city       : ['Sunken City'],
  tournament_hall   : ['Tournament Hall'],
  town_of_digby     : ['Town of Digby', 'Lambent Crystal'],
  town_of_gnawnia   : ['Town of Gnawnia'],
  train_station     : ['Gnawnian Express Station'],
  training_grounds  : ['Training Grounds', 'Ninja', 'Kung Fu', 'Samurai', 'Archer'],
  zugzwang_tower    : ["Zugzwang's Tower"],
  zuzwang_library   : ['Crystal Library', 'Effervescent', 'Walker', 'Tome Sprite', 'Pocketwatch'],
};
/* eslint-enable */

const replaceMiceOnlyWithMiceAndLocation = (objective) => {
  objective = objective.replace('Scarab Mice', 'Scarab Mice in the Sand Crypts');
  objective = objective.replace('Sand Colossus Mice', 'Sand Colossus Mice in the Sand Crypts');
  objective = objective.replace('Camofusion Mice', 'Camofusion Mice in the Twisted Garden');

  return objective;
};

const parseObjective = (objective) => {
  let location = null;
  let locationKey = null;

  // Normalize objective.
  objective = objective.replace(' in the ', ' in ');

  // Make mice look right.
  objective = replaceMiceOnlyWithMiceAndLocation(objective);

  let objectiveClean = objective.split('M400 Intel');
  if (objectiveClean.length > 1) {
    objective = objectiveClean[1].trim();
  } else {
    objectiveClean = objective.split('intel');
    if (objectiveClean.length > 1) {
      objective = objectiveClean[1].trim();
    }
  }

  const split = objective.split(' in ');
  if (split.length > 1) {
    location = split[1].replace('the ', '').trim();

    locationKey = Object.keys(locations).find((key) => {
      return locations[key].includes(location);
    });
  }

  let mouseName = split[0].trim();
  mouseName = mouseName.replace('from ', '');
  mouseName = mouseName.replace(' Mice', '');

  return {
    location: locationKey,
    mouse: mouseName,
  };
};

/**
 * Make the travel button.
 */
const makeTravelButton = () => {
  const quests = document.querySelectorAll('.campPage-quests-objective-container');
  if (! quests) {
    return;
  }

  const questTitle = document.querySelector('.campPage-quests-title');
  if (! questTitle) {
    return;
  }

  // Loop through the quests and grab the first one that isn't done or locked.
  quests.forEach((quest) => {
    // Skip if its done or locked.
    if (quest.classList.contains('locked')) {
      return;
    }

    // Grab the objective text.
    const objective = quest.querySelector('.campPage-quests-objective-task');
    if (! objective) {
      return;
    }

    if (quest.classList.contains('complete')) {
      objective.innerText = replaceMiceOnlyWithMiceAndLocation(objective.innerText);
    }

    const objectiveParsed = parseObjective(objective.innerText);
    if (! objectiveParsed.location || ! objectiveParsed.mouse) {
      return;
    }

    // Update the inner text to include a link for the mouse.
    if (objective.getAttribute('original-text')) {
      objective.innerHTML = objective.getAttribute('original-text');
    } else {
      objective.setAttribute('original-text', objective.innerHTML);
    }

    objective.innerHTML = replaceMiceOnlyWithMiceAndLocation(objective.innerHTML);

    // Create the link to MHCT.
    const mhctLink = `<a href="https://www.mhct.win/attractions.php?mouse_name=${objectiveParsed.mouse}" target="mhct" title="View attraction rates on MHCT">${objectiveParsed.mouse}</a>`;
    objective.innerHTML = objective.innerHTML.replace(objectiveParsed.mouse, mhctLink);

    objective.innerHTML = objective.innerHTML + '.';

    // If the button already exists and has the same location, skip it.
    const existingButton = document.querySelector('#mh-improved-m400-travel');
    if (existingButton) {
      existingButton.remove();
    }

    // Create the button.
    const travelButton = document.createElement('a');
    travelButton.id = 'mh-improved-m400-travel';

    // Add the classes to style it.
    travelButton.classList.add('mousehuntActionButton');
    travelButton.classList.add('tiny');
    travelButton.classList.add(`mh-m400-travel-${objectiveParsed.location}`);

    // Add the location to the button's data attribute.
    travelButton.setAttribute('data-location', objectiveParsed.location);
    travelButton.setAttribute('data-is-m400', objective.innerText.includes('Fusion Fondue'));

    // Set the button's text and title.
    travelButton.title = 'Travel to this location';

    if (user.environment_type === objectiveParsed.location) {
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

      // If it is m400, then let's also equip the fusion fondue.
      if (ism400) {
        hg.utils.TrapControl.setBait(1386); // eslint-disable-line no-undef
        hg.utils.TrapControl.go(); // eslint-disable-line no-undef
      }

      // Travel to the location.
      app.pages.TravelPage.travel(location); // eslint-disable-line no-undef
    });

    // Add the button to the quest.
    questTitle.appendChild(travelButton);
  });
};

/**
 * Remove the progress bars and update the text to make it a bit cleaner.
 */
const updateObjectiveListDisplay = () => {
  const objectives = document.querySelectorAll('.campPage-quests-objective');
  if (! objectives) {
    return;
  }

  // Loop through the objectives and remove the progress bars and update the text.
  objectives.forEach((objective) => {
    const progressBarText = objective.querySelector('.campPage-quests-objective-progress');
    if (! progressBarText) {
      return;
    }

    // If the text contains '1/1' or '0/1', then we can remove the progress bar.
    if (progressBarText.innerText.includes('1/1') || progressBarText.innerText.includes('0/1')) {
      const container = objective.querySelector('.campPage-quests-objective-progressBar');
      if (container) {
        container.classList.add('m400-helper-hidden');
      }

      progressBarText.classList.add('m400-helper-hidden');
    }

    const task = objective.querySelector('.campPage-quests-objective-task');
    if (! task) {
      return;
    }

    task.innerHTML = task.innerHTML.replace('1 Piece of M400 Intel', 'intel');
  });
};

export default () => {
  makeTravelButton();
  updateObjectiveListDisplay();
};
