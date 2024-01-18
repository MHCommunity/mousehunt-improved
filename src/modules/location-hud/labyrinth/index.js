import { addHudStyles, getCurrentLocation, makeElement, onRequest } from '@utils'

import styles from './styles.css';

const highlightDoors = () => {
  if ('intersection' !== user?.quests?.QuestLabyrinth?.status) {
    return;
  }

  const existingHighlight = document.querySelector('.mh-ui-labyrinth-highlight');
  if (existingHighlight) {
    existingHighlight.classList.remove('mh-ui-labyrinth-highlight');
  }

  const clues = user.quests.QuestLabyrinth.clues || [];
  const clue = clues.reduce((a, b) => a.quantity > b.quantity ? a : b);

  if (clue) {
    const doors = user.quests.QuestLabyrinth.doors || [];
    const matchingDoors = doors.filter((door) => {
      if (door.choice && door.choice.length) {
        return door.choice.includes(clue.type);
      }
      return false;
    });

    if (! matchingDoors.length) {
      return;
    }

    const bestDoor = matchingDoors.reduce((a, b) => a.choice.length > b.choice.length ? a : b);

    if (bestDoor) {
      const highlight = document.querySelector(`.labyrinthHUD-door.${bestDoor.css_class.replaceAll(' ', '.')}`);
      if (highlight) {
        highlight.classList.add('mh-ui-labyrinth-highlight');
      }
    }
  }
};

const scrambleGems = () => {
  const gems = document.querySelectorAll('.labyrinthHUD-scrambleGem');
  if (! gems) {
    return;
  }

  // remove the onclick attribute
  gems.forEach((gem) => {
    gem.removeAttribute('onclick');
    gem.addEventListener('click', () => {
      hg.views.HeadsUpDisplayLabyrinthView.labyrinthScrambleGem(gem, 2);
    });
  });
};

const hud = () => {
  if ('labyrinth' !== getCurrentLocation()) {
    return;
  }

  // Always allow gems to be scrambled.
  scrambleGems();

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
      const clueType = progress.classList.value.replace('labyrinthHUD-clue', '').replace('clueFound', '').trim();

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

  if ('inactive' === user?.quests?.QuestLabyrinth?.lantern_status && user?.quests?.QuestLabyrinth?.hallway_tier >= 2) {
    setTimeout(() => {
      const existingLanternReminder = document.querySelector('.mh-ui-labyrinth-lantern-reminder');
      if (existingLanternReminder) {
        existingLanternReminder.classList.remove('hidden');
      }

      const labyHud = document.querySelector('.labyrinthHUD-intersection');
      if (labyHud) {
        const lanternReminer = document.createElement('div');
        lanternReminer.classList.add('mh-ui-labyrinth-lantern-reminder');
        labyHud.append(lanternReminer);
      }
    }, 500);
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
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  hud();
  onRequest(hud);
};
