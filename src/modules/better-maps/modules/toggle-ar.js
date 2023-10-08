import { getArEl } from '../../utils';

const addArDataToMap = async (mapData) => {
  let type = 'mouse';
  if (mapData?.goals?.mouse.length === 0) {
    type = 'item';
  }

  const mice = mapData?.goals?.[type];

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

    if (mouseEl.getAttribute('data-mh-ui-ar')) {
      const existing = mouseEl.querySelector('.mh-ui-ar');
      if (existing) {
        existing.remove();
      }
    }

    const name = mouseEl.querySelector('.treasureMapView-goals-group-goal-name');
    if (! name) {
      return;
    }

    const arEl = await getArEl(mouse.unique_id, type);
    if (! arEl) {
      return;
    }

    name.appendChild(arEl);

    mouseEl.setAttribute('data-mh-ui-ar', true);
  });
};

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

  const text = toggle.querySelector('.toggle-ar-text');
  if (! text) {
    return;
  }

  const showing = mapView.classList.contains('mh-ui-ar-showing');
  if (showing) {
    mapView.classList.remove('mh-ui-ar-showing');
    mapView.classList.add('mh-ui-ar-hidden');
    text.innerText = 'Show AR';
  } else {
    mapView.classList.add('mh-ui-ar-showing');
    mapView.classList.remove('mh-ui-ar-hidden');
    text.innerText = '···';
    await addArDataToMap(window.mhui.mapper?.mapData);
    text.innerText = 'Hide AR';
  }

  toggle.classList.remove('disabled');
};

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
  const currentButtonState = toggle.querySelector('.toggle-ar-text').innerText;
  if (showing && currentButtonState !== 'Hide AR') {
    toggle.click();
  } else if (! showing && currentButtonState !== 'Show AR') {
    toggle.click();
  }
};

const addArToggle = (tab = 'goals') => {
  const mapView = document.querySelector('.treasureMapView');
  if (! mapView) {
    return;
  }

  const exists = document.querySelector('.mh-ui-toggle-ar-button');
  if (exists) {
    exists.classList.remove('hidden');
    // if mapView has the showing class and we're on the goals tab, then
    // we need to also add the AR data to the map.
    if ('goals' === tab && mapView.classList.contains('mh-ui-ar-showing')) {
      addArDataToMap(window.mhui.mapper?.mapData);
    }

    return;
  }

  const wrapper = document.querySelector('.treasureMapRootView-subTabRow');
  if (! wrapper) {
    return;
  }

  const toggle = makeElement('button', ['mousehuntActionButton', 'tiny', 'mh-ui-toggle-ar-button']);
  makeElement('span', 'toggle-ar-text', 'Show AR', toggle);

  toggle.addEventListener('click', toggleAr);

  wrapper.appendChild(toggle);

  maybeClickArToggle();
};

const removeArToggle = () => {
  const toggle = document.querySelector('.mh-ui-toggle-ar-button');
  if (toggle) {
    toggle.classList.add('hidden');
  }
};

export {
  addArToggle,
  removeArToggle
};
