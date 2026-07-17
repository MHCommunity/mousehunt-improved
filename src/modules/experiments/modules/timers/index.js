import { addStyles, addSubmenuItem, createPopup, getData, travelTo } from '@utils';

import { formatRotationTime, getLocationRotation, rotationLocations } from '@utils/shared/location-rotations';

import styles from './styles.css';

/**
 * The number of upcoming stages to show for each location.
 */
const upcomingLimit = 5;

let environments = [];
let lastStages = '';

/**
 * Get the current state of every rotating location.
 *
 * @return {Array} The rotation state for each location.
 */
const getRotations = () => {
  return rotationLocations.map((location) => getLocationRotation(location)).filter(Boolean);
};

/**
 * Get the label for a stage, eg. 'Mid Tide (coming in)' or 'Low Tide again'.
 *
 * @param {Object} stage The stage.
 *
 * @return {string} The label.
 */
const getStageLabel = (stage) => {
  if (stage.note) {
    return `${stage.name} <span class="mh-timers-note">(${stage.note})</span>`;
  }

  return stage.isRepeat ? `${stage.name} again` : stage.name;
};

/**
 * Build the markup for a single location.
 *
 * @param {Object} rotation The rotation state for the location.
 *
 * @return {string} The markup.
 */
const buildLocationMarkup = (rotation) => {
  const environment = environments.find((env) => env.id === rotation.id);
  const image = environment?.image ? `<div class="mh-timers-image" style="background-image: url(${environment.image});"></div>` : '';

  const stages = rotation.upcoming
    .slice(0, upcomingLimit)
    .map((stage) => {
      return `<div class="mh-timers-stage">
      <div class="mh-timers-stage-name">${getStageLabel(stage)}</div>
      <div class="mh-timers-stage-time" data-stage-time="${rotation.id}">${formatRotationTime(stage.minutes)}</div>
    </div>`;
    })
    .join('');

  return `<div class="mh-timers-location">
    <div class="mh-timers-header">
      ${image}
      <div class="mh-timers-title">
        <div class="mh-timers-name">${rotation.name}</div>
        <div class="mh-timers-current">${getStageLabel(rotation.current)}</div>
      </div>
      <a href="#" class="mousehuntActionButton tiny mh-timers-travel" data-travel-to="${rotation.id}"><span>Travel</span></a>
    </div>
    <div class="mh-timers-stages">${stages}</div>
  </div>`;
};

/**
 * Build the markup for every location.
 *
 * @param {Array} rotations The rotation state for each location.
 *
 * @return {string} The markup.
 */
const buildLocationsMarkup = (rotations) => {
  return rotations.map((rotation) => buildLocationMarkup(rotation)).join('');
};

/**
 * Get a signature of the current stages, so we can tell when one of them has changed.
 *
 * @param {Array} rotations The rotation state for each location.
 *
 * @return {string} The signature.
 */
const getStageSignature = (rotations) => {
  return rotations.map((rotation) => `${rotation.id}:${rotation.current.name}:${rotation.current.note || ''}`).join('|');
};

/**
 * Update the countdowns when the horn timer advances, rebuilding the popup when a location
 * moves to its next stage.
 */
const tick = () => {
  const wrapper = document.querySelector('.mh-timers');
  if (!wrapper) {
    return;
  }

  const rotations = getRotations();
  const signature = getStageSignature(rotations);

  // A location has moved on to its next stage, so the rows themselves have changed.
  if (signature !== lastStages) {
    lastStages = signature;
    wrapper.innerHTML = buildLocationsMarkup(rotations);

    return;
  }

  rotations.forEach((rotation) => {
    const times = wrapper.querySelectorAll(`[data-stage-time="${rotation.id}"]`);

    times.forEach((time, index) => {
      const stage = rotation.upcoming[index];
      if (stage) {
        time.textContent = formatRotationTime(stage.minutes);
      }
    });
  });
};

/**
 * Show the timers popup.
 */
const showTimersPopup = () => {
  const rotations = getRotations();
  lastStages = getStageSignature(rotations);

  const popup = createPopup({
    title: 'Timers',
    className: 'mh-improved-timers',
    content: `<div class="mh-timers">${buildLocationsMarkup(rotations)}</div>`,
  });

  if (!popup) {
    return;
  }

  const wrapper = document.querySelector('.mh-timers');
  if (wrapper) {
    wrapper.addEventListener('click', (e) => {
      const travel = e.target.closest('[data-travel-to]');
      if (!travel) {
        return;
      }

      e.preventDefault();
      travelTo(travel.getAttribute('data-travel-to'));
    });
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'timers');

  // getData() resolves to {} rather than a falsy value when the fetch fails. The environments are
  // only used to look up a background image, so fall back to an empty list and render the timers
  // without images rather than throwing on .find() and never opening the popup at all.
  const environmentData = await getData('environments');
  environments = Array.isArray(environmentData) ? environmentData : [];

  document.addEventListener('horn-countdown-tick-minute', tick);

  addSubmenuItem({
    id: 'timers',
    menu: 'camp',
    label: 'Timers',
    icon: 'https://i.mouse.rip/icons/clock.png',
    callback: showTimersPopup,
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'timers',
  name: 'Timers',
  description: "Adds a Timers item to the Camp menu with countdowns for the Forbidden Grove, Balack's Cove, Seasonal Garden, and Toxic Spill.",
  load: init,
};
