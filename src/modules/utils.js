const addUIStyles = (styles) => {
  const identifier = 'mh-ui-styles';

  const existingStyles = document.getElementById(identifier);
  if (existingStyles) {
    existingStyles.innerHTML += styles;
    return;
  }

  const style = document.createElement('style');
  style.id = identifier;
  style.innerHTML = styles;
  document.head.appendChild(style);
};

/**
 * Return an anchor element with the given text and href.
 *
 * @param {string}  text         Text to use for link.
 * @param {string}  href         URL to link to.
 * @param {Array}   extraClasses Extra classes to add to the link.
 * @param {boolean} tiny         Use the tiny button style.
 *
 * @return {string} HTML for link.
 */
const makeButton = (text, href, extraClasses = [], tiny = true) => {
  href = href.replace(/\s/g, '_');
  return `<a href="${href}" class="mousehuntActionButton ${tiny ? 'tiny' : ''} ${extraClasses.join(' ')}"><span>${text}</span></a>`;
};

/**
 * Adds classes to the body to enable styling based on the location or if dark mode is enabled.
 */
const addLocationBodyClass = () => {
  const addClass = () => {
    const location = getCurrentLocation();
    document.body.classList.add(`mh-location-${location}`);
  };

  addClass();
  onTravel(null, { callback: addClass });
};

const addDarkModeBodyClass = () => {
  if (getComputedStyle(document.documentElement).getPropertyValue('--mhdm-black')) {
    document.body.classList.add('mh-dark-mode');
  }
};

const addBodyClassesCallback = () => {
  addLocationBodyClass();
  addDarkModeBodyClass();
};

const addBodyClasses = () => {
  window.addEventListener('load', addBodyClassesCallback);
  eventRegistry.addEventListener(hg.utils.PageUtil.EventSetPage, addBodyClassesCallback);
};

const getArForMouse = async (mouseId, type = 'mouse') => {
  let mhctjson = [];

  // check if the attraction rates are cached
  const cachedAr = sessionStorage.getItem(`mhct-ar-${mouseId}-${type}`);
  if (cachedAr) {
    mhctjson = JSON.parse(cachedAr);
    if (! mhctjson || mhctjson.length === 0) {
      return;
    }
  } else {
    let mhctPath = 'mhct';
    if ('item' === type) {
      mhctPath = 'mhct-item';
    }

    const mhctdata = await fetch(`https://api.mouse.rip/${mhctPath}/${mouseId}`);
    mhctjson = await mhctdata.json();

    if (! mhctjson || mhctjson.length === 0) {
      return;
    }

    sessionStorage.setItem(`mhct-ar-${mouseId}`, JSON.stringify(mhctjson));
  }

  return mhctjson;
};

const getArText = async (type) => {
  const rates = await getArForMouse(type);
  if (! rates) {
    return false;
  }

  // find the rate that matches window.mhctLocation.stage and window.mhctLocation.location and has the highest rate
  const rate = rates.find((r) => r.stage === window.mhctLocation.stage && r.location === window.mhctLocation.location);
  if (! rate) {
    return false;
  }

  return (rate.rate / 100).toFixed(2);
};

const getHighestArText = async (type) => {
  const rates = await getArForMouse(type);
  if (! rates) {
    return false;
  }

  // sort by rate descending
  rates.sort((a, b) => b.rate - a.rate);

  const rate = rates[0];
  if (! rate) {
    return false;
  }

  return (rate.rate / 100).toFixed(2);
};

/**
 * Add links to the mouse details on the map.
 */
const addArDataToMap = () => {
  const overlayClasses = document.getElementById('overlayPopup').classList;
  if (! overlayClasses.contains('treasureMapPopup')) {
    return;
  }

  const mouseIcon = document.querySelectorAll('.treasureMapView-goals-group-goal');
  if (! mouseIcon || mouseIcon.length === 0) {
    setTimeout(addArDataToMap, 500);
    return;
  }

  const mapViewClasses = document.querySelector('.treasureMapView.treasure');
  if (! mapViewClasses) {
    return;
  }

  if (mapViewClasses.classList.value.indexOf('scavenger_hunt') !== -1) {
    return;
  }

  mouseIcon.forEach((mouse) => {
    const mouseType = mouse.classList.value
      .replace('treasureMapView-goals-group-goal ', '')
      .replace(' mouse', '')
      .trim();

    mouse.addEventListener('click', () => {
      const title = document.querySelector('.treasureMapView-highlight-name');
      if (! title) {
        return;
      }

      title.classList.add('mh-mouse-links-map-name');

      title.addEventListener('click', () => {
        hg.views.MouseView.show(mouseType);
      });

      title.setAttribute('data-mouse-id', mouseType);

      const div = document.createElement('div');
      div.classList.add('mh-mouse-links-map');
      div.innerHTML = getLinkMarkup(title.innerText);

      const envs = document.querySelector('.treasureMapView-highlight-environments');
      if (envs) {
        envs.parentNode.insertBefore(div, envs.nextSibling);
      }
    });
  });
};

export {
  addUIStyles,
  makeButton,
  addBodyClasses,
  getArForMouse,
  getArText,
  getHighestArText,
  addArDataToMap
};
