import { addUIStyles, getCurrentLocation } from '../../utils';
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
    const matchingDoors = doors.filter((door) => door.choice.includes(clue.type));
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
  console.log('main')
  console.log(getCurrentLocation());

  if ('labyrinth' !== getCurrentLocation()) {
    return;
  }

  if (! user?.quests?.QuestLabyrinth?.hallway_length || ! user?.quests?.QuestLabyrinth?.tiles) {
    return;
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

  if ('intersection' === user?.quests?.QuestLabyrinth?.status) {
    highlightDoors();
    return;
  }

  const hallwayLength = user.quests.QuestLabyrinth.hallway_length;
  const completed = user.quests.QuestLabyrinth.tiles.filter((tile) => tile.status.includes('complete'));

  makeElement('span', 'mh-ui-labyrinth-step-counter', `${completed.length}/${hallwayLength} steps completed.`, appendTo);
  const stepsToGo = hallwayLength - completed.length;

  if (stepsToGo === 0) {
    return;
  }

  const intersectionDoors = document.querySelector('.labyrinthHUD-doorContainer');
  if (intersectionDoors) {
    makeElement('div', 'mh-ui-labyrinth-steps-to-go', `${stepsToGo} hunt${(stepsToGo) > 1 ? 's' : ''} left in the hallway`, intersectionDoors);
  }
};

export default () => {
  addUIStyles(styles);

  main();
  onPageChange({ change: main });
  onAjaxRequest(main, 'managers/ajax/turns/activeturn.php');
};

// fealty = y
// tech = h
// scholar = s
// treasury = t
// farming = f
// dead end = m
