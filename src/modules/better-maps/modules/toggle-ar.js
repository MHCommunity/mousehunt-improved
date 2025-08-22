import { getArEl, makeMhButton, mapper } from '@utils';

/**
 * Add AR data to the map.
 *
 * @param {Object} mapData The map data.
 */
const addArDataToMap = async (mapData) => {
  let type = 'mouse';
  if (mapData?.goals?.mouse.length === 0) {
    type = 'item';
  }

  const mice = mapData?.goals?.[type] || [];

  if (! mice || mice.length === 0) {
    return;
  }

  // Remove the hidden class if we've already added the AR data.
  const goals = document.querySelectorAll('.treasureMapView-goals-groups');
  if (goals && goals.length > 0) {
    let hasAdded = false;

    goals.forEach((goal) => {
      if (goal.classList.contains('mh-ui-ar-hidden')) {
        goal.classList.remove('mh-ui-ar-hidden');
        hasAdded = true;
      }
    });

    if (hasAdded) {
      return;
    }
  }

  mice.forEach(async (mouse) => {
    const mouseEl = document.querySelector(`.treasureMapView-goals-group-goal[data-unique-id="${mouse.unique_id}"]`);
    if (! mouseEl) {
      return;
    }

    if (mouseEl.classList.contains('complete')) {
      return;
    }

    const name = mouseEl.querySelector('.treasureMapView-goals-group-goal-name');
    if (! name) {
      return;
    }

    const existingArEl = name.querySelectorAll('.mh-ui-ar');
    if (existingArEl.length > 0) {
      existingArEl.forEach((el) => {
        el.remove();
      });
    }

    const arEl = await getArEl(mouse.unique_id, type);
    if (! arEl) {
      return;
    }

    name.append(arEl);

    mouseEl.setAttribute('data-mh-ui-ar', true);
  });
};

/**
 * Toggle AR data on the map.
 */
const toggleAr = async () => {
  const mapView = document.querySelector('.treasureMapView');
  if (! mapView) {
    return;
  }

  const toggle = mapView.querySelector('.mh-ui-toggle-ar-button');
  if (! toggle) {
    return;
  }

  // Disable until we're done.
  toggle.classList.add('disabled');

  const text = toggle.querySelector('span');
  if (! text) {
    return;
  }

  let arText = 'AR';
  let arTitle = 'Attraction Rates';
  const mapClass = mapView.classList.toString();
  if (mapClass.includes('scavenger')) {
    arText = 'DR';
    arTitle = 'Drop Rates';
  }

  const showing = mapView.classList.contains('mh-ui-ar-showing');
  if (showing) {
    mapView.classList.remove('mh-ui-ar-showing');
    mapView.classList.add('mh-ui-ar-hidden');
    text.innerText = `Show ${arText}`;
    toggle.title = `Show ${arTitle}`;
  } else {
    mapView.classList.add('mh-ui-ar-showing');
    mapView.classList.remove('mh-ui-ar-hidden');
    text.innerText = '···';
    await addArDataToMap(mapper('mapData'));
    text.innerText = `Hide ${arText}`;
    toggle.title = `Hide ${arTitle}`;
  }

  toggle.classList.remove('disabled');
};

/**
 * Force click the AR toggle button.
 */
const clickArToggle = () => {
  const mapView = document.querySelector('.treasureMapView');
  if (! mapView) {
    return;
  }

  const toggle = mapView.querySelector('.mh-ui-toggle-ar-button');
  if (! toggle) {
    return;
  }

  toggle.click();
};

/**
 * Maybe click the AR toggle button.
 */
const maybeClickArToggle = () => {
  const mapView = document.querySelector('.treasureMapView');
  if (! mapView) {
    return;
  }

  const toggle = mapView.querySelector('.mh-ui-toggle-ar-button');
  if (! toggle) {
    return;
  }

  const showing = mapView.classList.contains('mh-ui-ar-showing');
  const currentButtonState = toggle
    .querySelector('span')
    .innerText.replace('AR', '')
    .replace('DR', '')
    .trim();
  if (showing && currentButtonState !== 'Hide') {
    clickArToggle();
  } else if (! showing && currentButtonState !== 'Show') {
    clickArToggle();
  }
};

let isAdding = false;

/**
 * Add the AR toggle button to the map.
 *
 * @param {string} tab The current tab.
 */
const addArToggle = async (tab = 'goals') => {
  const mapView = document.querySelector('.treasureMapView');
  if (! mapView) {
    return;
  }

  if (isAdding && tab === isAdding) {
    return;
  }

  isAdding = tab;

  const exists = document.querySelector('.mh-ui-toggle-ar-button');
  if (exists) {
    exists.classList.remove('hidden');
    // if mapView has the showing class and we're on the goals tab, then
    // we need to also add the AR data to the map.
    if ('goals' === tab && mapView.classList.contains('mh-ui-ar-showing')) {
      addArDataToMap(mapper('mapData'));
    }

    isAdding = false;
    return;
  }

  const wrapper = document.querySelector('.treasureMapRootView-subTabRow');
  if (! wrapper) {
    isAdding = false;
    return;
  }

  let arText = 'AR';
  let arTitle = 'Attraction Rates';
  if (mapper('mapData').is_scavenger_hunt) {
    arText = 'DR';
    arTitle = 'Drop Rates';
  }

  makeMhButton({
    element: 'button',
    text: `Show ${arText}`,
    title: `Show ${arTitle}`,
    className: 'mh-ui-toggle-ar-button',
    callback: toggleAr,
    appendTo: wrapper
  });

  await toggleAr();

  maybeClickArToggle();

  isAdding = false;
};

/**
 * Remove the AR toggle button.
 */
const removeArToggle = () => {
  const toggle = document.querySelector('.mh-ui-toggle-ar-button');
  if (toggle) {
    toggle.classList.add('hidden');
  }
};

export {
  addArToggle,
  removeArToggle,
  clickArToggle
};
