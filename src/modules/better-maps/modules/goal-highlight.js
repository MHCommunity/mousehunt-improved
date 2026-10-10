import { addMHCTData, getData, make, makeElement, mapData, mapModel, showTravelConfirmation } from '@utils';

let minlucksData = null;

/**
 * Get the minlucks data, cached after the first fetch.
 *
 * @return {Promise<Array>} The minlucks list.
 */
const getMinlucks = async () => {
  if (!minlucksData) {
    minlucksData = await getData('minlucks');
  }

  return Array.isArray(minlucksData) ? minlucksData : [];
};

/**
 * Make the minluck row for a mouse.
 *
 * @param {string} mouseType The mouse type.
 *
 * @return {Promise<HTMLElement|null>} The minluck element, or null when there's no data.
 */
const makeMinluckEl = async (mouseType) => {
  const minlucks = await getMinlucks();
  const mouseMinlucks = minlucks.find((m) => m.type === mouseType)?.minlucks;
  if (!mouseMinlucks) {
    return null;
  }

  const values = Object.entries(mouseMinlucks)
    .filter(([, value]) => value && value > 0)
    .sort((a, b) => a[1] - b[1]);

  if (!values.length) {
    return null;
  }

  const wrapper = makeElement('div', 'mouse-minluck');
  makeElement('div', 'mouse-minluck-title', 'Minluck', wrapper);
  const list = make('div', 'mouse-minluck-values', '', wrapper);

  values.forEach(([power, value]) => {
    const powerEl = makeElement('span', 'mouse-minluck-value');
    powerEl.title = `${power.charAt(0).toUpperCase()}${power.slice(1)} minluck: ${value}`;

    const icon = makeElement('img', 'mouse-minluck-icon');
    icon.src = `https://www.mousehuntgame.com/images/powertypes/${power}.png`;
    icon.alt = power;
    powerEl.append(icon);

    makeElement('span', 'mouse-minluck-number', value, powerEl);

    list.append(powerEl);
  });

  return wrapper;
};

/**
 * Swap the power type weaknesses in a mouse popup for its minluck values. The weaknesses
 * stay when there's no minluck data for the mouse.
 *
 * @param {HTMLElement} content   The popup content.
 * @param {string}      mouseType The mouse type.
 */
const replaceWeaknessesWithMinluck = async (content, mouseType) => {
  if (!mouseType || content.querySelector('.mouse-minluck')) {
    return;
  }

  const weaknesses = content.querySelector('.treasureMapView-highlight-weaknessContainer');
  if (!weaknesses) {
    return;
  }

  const minluck = await makeMinluckEl(mouseType);

  // The game re-renders the popup on every hover, so it may be showing another mouse by now.
  if (!minluck || !content.contains(weaknesses)) {
    return;
  }

  weaknesses.replaceWith(minluck);
};

/**
 * Find the mouse a native goal popup is showing, from its name.
 *
 * @param {HTMLElement} highlight The popup.
 *
 * @return {Object|undefined} The goal data.
 */
const getGoalForHighlight = (highlight) => {
  const name = highlight.querySelector('.treasureMapView-highlight-name')?.textContent.trim();
  if (!name) {
    return;
  }

  return (mapData()?.goals?.mouse || []).find((goal) => goal.name === name);
};

const watchedHighlights = new WeakSet();

/**
 * Show minluck values in place of the weaknesses whenever the game renders a mouse popup.
 */
const watchNativeHighlight = () => {
  const highlight = document.querySelector('.treasureMapView-highlight');
  const content = highlight?.querySelector('.treasureMapView-highlight-content');
  if (!content || watchedHighlights.has(content)) {
    return;
  }

  watchedHighlights.add(content);

  const update = () => {
    if (!highlight.classList.contains('goal') || !highlight.classList.contains('mouse')) {
      return;
    }

    replaceWeaknessesWithMinluck(content, getGoalForHighlight(highlight)?.type);
  };

  new MutationObserver(update).observe(content, { childList: true });
  update();

  // Keep the environment popup open while the cursor is over it, so a long list can be scrolled.
  highlight.addEventListener('mouseenter', () => {
    if (highlight.classList.contains('environment') && highlight.classList.contains('active')) {
      highlight.classList.add('mh-ui-highlight-hovered');
    }
  });

  highlight.addEventListener('mouseleave', () => {
    highlight.classList.remove('mh-ui-highlight-hovered');
  });
};

/**
 * Get the template data the game uses for a goal popup.
 *
 * @param {string|number} goalId The goal ID.
 *
 * @return {Object|null} The template data.
 */
const getHighlightTemplateData = (goalId) => {
  const model = mapModel();
  const goal = model?.getGoalById?.(goalId);
  if (!goal) {
    return null;
  }

  const hunterSnuid = model.getGoalSnuid(goalId);
  if (hunterSnuid) {
    goal.hunter = model.getHunter(hunterSnuid);
  }

  if (goal.environment_ids?.length) {
    goal.environments = goal.environment_ids
      .map((id) => model.getEnvironmentById(id))
      .filter(Boolean)
      .sort((a, b) => a.display_order - b.display_order)
      .map((environment) => ({ map_id: model.getMapId(), name: environment.name, id: environment.id, type: environment.type }));
  }

  return goal;
};

/**
 * Make a copy of the game's goal popup, for views where the game doesn't show one.
 *
 * @param {Object} goal The goal data.
 * @param {string} type The goal type, 'mouse' or 'item'.
 *
 * @return {HTMLElement|null} The popup.
 */
const makeGoalHighlight = (goal, type = 'mouse') => {
  const templateData = getHighlightTemplateData(goal.unique_id);
  if (!templateData) {
    return null;
  }

  const highlight = makeElement('div', ['treasureMapView-highlight', 'goal', type, 'active', 'sticky', 'mh-ui-goal-highlight']);

  const close = make('a', 'treasureMapView-highlight-close', 'X', highlight);
  close.href = '#';

  const content = make('div', 'treasureMapView-highlight-content', '', highlight);
  content.innerHTML = hg.utils.TemplateUtil.renderFromFile('TreasureMapGoalsView', 'highlight_goal', templateData);

  const title = content.querySelector('.treasureMapView-highlight-name');
  if (title) {
    title.classList.add('mh-ui-mouse-links-map-name');
    title.addEventListener('click', () => {
      if ('item' === type) {
        hg.views.ItemView.show(goal.unique_id);
      } else {
        hg.views.MouseView.show(goal.type);
      }
    });
  }

  content.querySelectorAll('.treasureMapView-travelButton').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const environment = mapData().environments?.find((env) => `${env.id}` === button.getAttribute('data-environment-id'));
      if (environment) {
        showTravelConfirmation(environment, mapModel());
      }
    });
  });

  if ('mouse' === type) {
    replaceWeaknessesWithMinluck(content, goal.type);
  }

  const ars = make('div', 'mh-ui-mouse-links-map-ars', '', highlight);
  addMHCTData(goal, ars, type).then(() => {
    if (ars.childElementCount) {
      highlight.classList.add('has-mhct-ars');
    }

    highlight.dispatchEvent(new Event('mh-ui-goal-highlight-resized'));
  });

  return highlight;
};

export { makeGoalHighlight, watchNativeHighlight };
