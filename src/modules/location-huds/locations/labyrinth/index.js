import {
  addHudStyles,
  getCurrentLocation,
  makeElement,
  onRequest,
  onTurn
} from '@utils';

import styles from './styles.css';

/**
 * Highlight doors based on the best clue.
 */
const highlightDoors = () => {
  if ('intersection' !== user?.quests?.QuestLabyrinth?.status) {
    return;
  }

  const existingHighlight = document.querySelector('.mh-ui-labyrinth-highlight');
  if (existingHighlight) {
    existingHighlight.classList.remove('mh-ui-labyrinth-highlight');
  }

  const clues = user.quests.QuestLabyrinth.clues || [];
  const clue = clues.reduce((a, b) => (a.quantity > b.quantity ? a : b), {});

  if (clue && clue.type) {
    const doors = user.quests.QuestLabyrinth.doors || [];
    const matchingDoors = doors.filter((door) => {
      return door?.choice?.length && door?.choice?.charAt(0).toLowerCase() === clue.type.toLowerCase();
    });

    if (! matchingDoors.length) {
      return;
    }

    const lengths = ['s', 'm', 'l', 'e'];
    const bestDoor = matchingDoors.reduce((a, b) => {
      const aLength = lengths.indexOf(a.choice.charAt(1).toLowerCase());
      const bLength = lengths.indexOf(b.choice.charAt(1).toLowerCase());
      return aLength > bLength ? a : b;
    });

    if (bestDoor) {
      const highlight = document.querySelector(`.labyrinthHUD-door.${bestDoor.css_class.replaceAll(' ', '.')}`);
      if (highlight) {
        highlight.classList.add('mh-ui-labyrinth-highlight');
      }
    }
  }
};

/**
 * Enhance the scramble gems feature.
 */
const scrambleGems = () => {
  const gems = document.querySelectorAll('.labyrinthHUD-scrambleGem');
  if (! gems) {
    return;
  }

  // remove the onclick attribute
  gems.forEach((gem) => {
    gem.removeAttribute('onclick');
    gem.addEventListener('click', () => {
      gems.forEach((g) => {
        hg.views.HeadsUpDisplayLabyrinthView.labyrinthScrambleGem(g, 2);
      });
    });
  });
};

/**
 * Expand the clues bar with count.
 */
const expandClueBar = () => {
  const clueProgresses = document.querySelectorAll('.mh-ui-labyrinth-clue-count');
  if (clueProgresses) {
    clueProgresses.forEach((progress) => {
      progress.remove();
    });
  }

  // expand the clues bar with count
  const clueProgress = document.querySelectorAll('.labyrinthHUD-clue');
  if (clueProgress) {
    clueProgress.forEach((progress) => {
      const clueType = progress.classList.value
        .replace('labyrinthHUD-clue', '')
        .replace('clueFound', '')
        .trim();

      // check if user.quests.QuestLabyrinth.clues has a clue of this type
      const clues = user.quests.QuestLabyrinth.clues || [];
      const clue = clues.find((c) => c.type === clueType);
      if (clue) {
        progress.setAttribute('title', `${clue.quantity} found`);
        const text = makeElement('span', 'mh-ui-labyrinth-clue-count', `${clue.quantity}`);
        progress.append(text);
      }
    });
  }
};

/**
 * Add a reminder to light the lantern during specific conditions.
 */
const addLanternReminder = () => {
  if ('inactive' === user?.quests?.QuestLabyrinth?.lantern_status && user?.quests?.QuestLabyrinth?.hallway_tier >= 2) {
    setTimeout(() => {
      const existingLanternReminder = document.querySelector('.mh-ui-labyrinth-lantern-reminder');
      if (existingLanternReminder) {
        existingLanternReminder.classList.remove('hidden');
      }

      const labyHud = document.querySelector('.labyrinthHUD-intersection');
      if (labyHud) {
        const lanternReminder = document.createElement('div');
        lanternReminder.classList.add('mh-ui-labyrinth-lantern-reminder');
        labyHud.append(lanternReminder);
      }
    }, 500);
  }
};

/**
 * Update the door text with the current hallway status.
 */
const updateDoorText = () => {
  const doorTextExisting = document.querySelector('.mh-ui-labyrinth-door-text');
  if (doorTextExisting) {
    doorTextExisting.remove();
  }

  const appendTo = document.querySelector('.labyrinthHUD-hallwayDescription');
  if (! appendTo) {
    return;
  }

  const existing = document.querySelector('.mh-ui-labyrinth-step-counter');
  if (existing) {
    existing.remove();
  }

  const existingStepsToGo = document.querySelector('.mh-ui-labyrinth-steps-to-go');
  if (existingStepsToGo) {
    existingStepsToGo.remove();
  }

  const hallwayLength = user.quests.QuestLabyrinth.hallway_length || 0;
  const tiles = user.quests.QuestLabyrinth.tiles || [];
  const completed = tiles.filter((tile) => tile.status.includes('complete'));

  if (completed.length !== hallwayLength) {
    makeElement('span', 'mh-ui-labyrinth-step-counter', `${completed.length}/${hallwayLength} steps completed.`, appendTo);
  }

  const stepsToGo = hallwayLength - completed.length;

  const existingIntersectionText = document.querySelector('.mh-ui-labyrinth-door-text');
  if (existingIntersectionText) {
    existingIntersectionText.remove();
  }

  const stepsExisting = document.querySelector('.mh-ui-laby-steps');
  if (stepsExisting) {
    stepsExisting.remove();
  }

  const cptExisting = document.querySelector('.mh-ui-laby-cpt');
  if (cptExisting) {
    cptExisting.remove();
  }

  if (stepsToGo !== 0) { // eslint-disable-line unicorn/no-negated-condition
    const intersectionDoors = document.querySelector('.labyrinthHUD-doorContainer');
    if (intersectionDoors) {
      const tilesWithClues = tiles.filter((tile) => tile.status.includes('good'));
      // remove the string 'complete_good_' from each tile and sum the remaining numbers
      const cluesFound = tilesWithClues.reduce((a, b) => a + Number.parseInt(b.status.replace('complete', '').replace('good_', '').trim()), 0);
      const cluesPerTile = (cluesFound / completed.length).toFixed(1).replace('.0', '');

      const intersectionText = makeElement('div', 'mh-ui-labyrinth-door-text');

      let stepsNoun = 'hunt';
      if (stepsToGo > 1 || stepsToGo < 1) {
        stepsNoun = 'hunts';
      }

      makeElement('div', 'mh-ui-laby-steps', `${stepsToGo} ${stepsNoun} left in the hallway`, intersectionText);
      if (cluesPerTile !== 'NaN') {
        let clueNoun = 'clue';
        if (cluesPerTile > 1 || cluesPerTile < 1) {
          clueNoun = 'clues';
        }

        makeElement('div', 'mh-ui-laby-cpt', `Avg. ${cluesPerTile} ${clueNoun} per tile`, intersectionText);
      }

      intersectionDoors.append(intersectionText);
    }
  }

  if ('intersection' === user?.quests?.QuestLabyrinth?.status) {
    highlightDoors();
  }
};

/**
 * Highlight the clues bar when the user has 100 clues.
 */
const highlight100Clues = () => {
  const clues = document.querySelector('.labyrinthHUD-clueBar-totalContainer');
  if (! clues) {
    return;
  }

  if (Number.parseInt(user?.quests?.QuestLabyrinth.total_clues || 0) < 100) {
    clues.classList.remove('mh-ui-labyrinth-100clues');
  } else {
    clues.classList.add('mh-ui-labyrinth-100clues');
  }
};

/**
 * Add a highlight effect to the tiles when the user clicks on them.
 *
 * @param {HTMLElement} tile The tile to highlight.
 */
const highlightTileForMinigame = (tile) => {
  tile.classList.add('mh-ui-labyrinth-tile-clicked');

  const id = tile.getAttribute('data-index');
  const length = user?.quests?.QuestLabyrinth?.hallway_length || 10;
  const degree = (id / length) * 360;

  tile.style.filter = `brightness(1.5) hue-rotate(${Math.floor(degree)}deg)`;

  setTimeout(() => {
    tile.classList.add('mh-ui-labyrinth-tile-clicked-fade-in');
  }, 100);

  setTimeout(() => {
    tile.style.filter = 'brightness(1) hue-rotate(0deg)';
  }, 500);

  setTimeout(() => {
    tile.classList.remove('mh-ui-labyrinth-tile-clicked-fade-in');
    tile.classList.remove('mh-ui-labyrinth-tile-clicked');
    tile.style.filter = '';
  }, 510);
};

/**
 * Add an easter egg minigame to the labyrinth HUD.
 */
const minigame = async () => {
  // whenever a user clicks on a .labyrinthHUD-hallway-tile.locked, change it to a random color for 2 seconds
  const tiles = document.querySelectorAll('.labyrinthHUD-hallway-tile');
  if (! tiles) {
    return;
  }

  tiles.forEach((tile) => {
    if ([...tile.classList].includes('active')) {
      tile.addEventListener('click', () => {
        let delay = 0;
        tiles.forEach((t) => {
          setTimeout(() => {
            highlightTileForMinigame(t);
          }, delay);
          delay += 50;
        });
      });
    }
  });
};

/**
 * Refresh the HUD.
 */
const refreshHud = async () => {
  if ('labyrinth' !== getCurrentLocation()) {
    return;
  }

  expandClueBar();
  updateDoorText();
  highlight100Clues();
  minigame();
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  scrambleGems();

  refreshHud();
  addLanternReminder();

  onRequest('*', refreshHud);
  onTurn(refreshHud, 1000);
};
