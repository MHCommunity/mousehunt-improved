import { addUIStyles } from '../../utils';
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
    const bestDoor = matchingDoors.reduce((a, b) => a.choice.length > b.choice.length ? a : b);

    if (bestDoor) {
      const highlight = document.querySelector(`.labyrinthHUD-door.${bestDoor.css_class.replaceAll(' ', '.')}`);
      if (highlight) {
        highlight.classList.add('mh-ui-labyrinth-highlight');
      }
    }
  }
};

const main = () => {
  if ('labyrinth' !== getCurrentLocation()) {
    return;
  }

  // Always allow gems to be scrambled.
  scrambleGems();

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
        progress.appendChild(text);
      }
    });
  }

  if ('inactive' === user?.quests?.QuestLabyrinth?.lantern_status && user?.quests?.QuestLabyrinth?.hallway_tier >= 2) {
    const existingLanternReminder = document.querySelector('.mh-ui-labyrinth-lantern-reminder');
    if (existingLanternReminder) {
      existingLanternReminder.classList.remove('hidden');
    }

    const labyHud = document.querySelector('.labyrinthHUD-intersection');
    if (labyHud) {
      const lanternReminer = document.createElement('div');
      lanternReminer.classList.add('mh-ui-labyrinth-lantern-reminder');
      labyHud.appendChild(lanternReminer);
    }
  }

  if ('intersection' === user?.quests?.QuestLabyrinth?.status) {
    highlightDoors();
    return;
  }

  const hallwayLength = user.quests.QuestLabyrinth.hallway_length || 0;
  const tiles = user.quests.QuestLabyrinth.tiles || [];
  const completed = tiles.filter((tile) => tile.status.includes('complete'));

  makeElement('span', 'mh-ui-labyrinth-step-counter', `${completed.length}/${hallwayLength} steps completed.`, appendTo);
  const stepsToGo = hallwayLength - completed.length;

  if (stepsToGo !== 0) {
    const intersectionDoors = document.querySelector('.labyrinthHUD-doorContainer');
    if (intersectionDoors) {
      const tilesWithClues = tiles.filter((tile) => tile.status.includes('good'));
      // remove the string 'complete_good_' from each tile and sum the remaining numbers
      const cluesFound = tilesWithClues.reduce((a, b) => a + parseInt(b.status.replace('complete', '').replace('good_', '').trim()), 0);
      const cluesPerTile = (cluesFound / completed.length).toFixed(1).replace('.0', '');

      const existingIntersectionText = document.querySelector('.mh-ui-labyrinth-door-text');
      if (existingIntersectionText) {
        existingIntersectionText.remove();
      }

      const intersectionText = makeElement('div', 'mh-ui-labyrinth-door-text');

      makeElement('div', 'mh-ui-laby-steps', `${stepsToGo} hunt${(stepsToGo) > 1 ? 's' : ''} left in the hallway`, intersectionText);
      if (cluesPerTile > 0) {
        makeElement('div', 'mh-ui-laby-cpt', `Avg. ${cluesPerTile} clues per hunt`, intersectionText);
      }

      intersectionDoors.appendChild(intersectionText);
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

export default () => {
  addUIStyles(styles);

  main();

  onAjaxRequest(main);
  onPageChange({ camp: { show: main } });
  onAjaxRequest(() => {
    setTimeout(main, 500);
  }, 'managers/ajax/turns/activeturn.php', true);
};

// fealty = y
// tech = h
// scholar = s
// treasury = t
// farming = f
// dead end = m
