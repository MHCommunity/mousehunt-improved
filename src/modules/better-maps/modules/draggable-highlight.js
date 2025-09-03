import { onEvent } from '@utils';

const modifyStickyHighlights = async () => {
  const goals = document.querySelectorAll('.treasureMapView-goals-group-goal');
  if (goals && goals.length > 0) {
    goals.forEach((goal) => {
      goal.addEventListener('click', stickHighlightGoal);
    });
  }
};

const stickHighlightGoal = (event) => {
  const goalId = event.currentTarget.getAttribute('data-unique-id');
  if (! goalId) {
    return;
  }

  stickiedHighlight = goalId;

  const highlight = document.querySelector('.treasureMapView-highlight.active');
  if (! highlight) {
    return;
  }

  // Variables to track drag state
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  // Start dragging
  const onMouseDown = (e) => {
    isDragging = true;
    offsetX = e.clientX - highlight.offsetLeft;
    offsetY = e.clientY - highlight.offsetTop;

    // Add event listeners for dragging and stopping
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // set the cursor to grabbing
    highlight.classList.add('dragging');
  };

  // Handle dragging
  const onMouseMove = (e) => {
    if (! isDragging) {
      return;
    }

    // Update the position of the highlight
    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;

    highlight.style.position = 'absolute';
    highlight.style.left = `${newX}px`;
    highlight.style.top = `${newY}px`;
    highlight.style.zIndex = 1000; // Ensure it stays on top
  };

  // Stop dragging
  const onMouseUp = () => {
    isDragging = false;

    // Remove event listeners
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    highlight.classList.remove('dragging');
  };

  highlight.addEventListener('mousedown', onMouseDown);

  highlight.classList.add('mh-ui-sticky-highlight');
};

export default () => {
  onEvent('map_show_goals_tab_click', () => {
    modifyStickyHighlights();
  });
};
