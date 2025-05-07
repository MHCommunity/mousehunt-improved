import {
  addStyles,
  addSubmenuItem,
  doRequest,
  getSetting,
  makeElement,
  makeElementDraggable
} from '@utils';

import styles from './styles.css';

import settings from './settings';

const normalize = (value) => {
  return Number.parseInt(value.toString().replaceAll(',', ''), 10);
};

/**
 * Get the mouse stats.
 *
 * @return {Object} The mouse stats.
 */
const getMouseStats = async () => {
  const data = await doRequest('managers/ajax/mice/mouse_list.php', {
    action: 'get_environment',
    category: user.environment_type,
    user_id: user.user_id,
    display_mode: 'stats',
    view: 'ViewMouseListEnvironments',
  });

  // Grab the data from the response.
  const mouseData = data?.mouse_list_category?.subgroups[0]?.mice;

  if (! mouseData) {
    return [];
  }

  // Reorder by the num_catches key.
  mouseData.sort((a, b) => {
    return normalize(b.num_catches) - normalize(a.num_catches);
  });

  // Return the data.
  return mouseData ?? [];
};

/**
 * Build the markup for the stats.
 *
 * @param {Object} mouseData The mouse data.
 *
 * @return {Node} The node to append.
 */
const buildMouseMarkup = (mouseData) => {
  // Fallbacks for mouse data.
  const mouse = Object.assign({}, {
    name: '',
    type: '',
    image: '',
    crown: 'none',
    num_catches: 0,
  }, mouseData);

  const mouseEl = document.createElement('a');
  mouseEl.classList.add('mh-catch-stats');

  mouseEl.title = mouse.name;
  mouseEl.addEventListener('click', () => {
    if ('undefined' !== hg?.views?.MouseView?.show) {
      hg.views.MouseView.show(mouse.type);
    }
  });

  // Create the image element.
  const image = document.createElement('div');
  image.classList.add('mh-catch-stats-image');
  image.style.backgroundImage = `url('${mouse.image}')`;

  // If the mouse has a crown, add it.
  if (mouse.crown && 'none' !== mouse.crown) {
    const crown = document.createElement('div');
    crown.classList.add('mh-catch-stats-crown');
    crown.style.backgroundImage = `url('https://www.mousehuntgame.com/images/ui/crowns/crown_${mouse.crown}.png')`;
    image.append(crown);
  }

  // Create the name element.
  const name = document.createElement('div');
  name.classList.add('mh-catch-stats-name');
  name.innerText = mouse.name;

  // Create a wrapper for the name and image.
  const imageNameContainer = document.createElement('div');
  imageNameContainer.append(image);
  imageNameContainer.append(name);
  mouseEl.append(imageNameContainer);

  // Create the catches element.
  const catches = document.createElement('div');
  catches.classList.add('mh-catch-stats-catches');

  catches.innerText = mouse.num_catches;
  if (showMisses) {
    makeElement('span', 'mh-catch-stats-separator', '/', catches);
    makeElement('span', 'mh-catch-stats-misses', mouse.num_misses, catches);
  }

  mouseEl.append(catches);

  return mouseEl;
};

/**
 * Show the stat modal.
 */
const showModal = async () => {
  showMisses = getSetting('location-catch-stats.show-misses', false);

  // Remove the existing modal.
  const existing = document.querySelector('#mh-catch-stats');
  if (existing) {
    existing.remove();
  }

  // Create the modal.
  const modalWrapper = document.createElement('div');
  modalWrapper.id = 'mh-catch-stats';

  // Create the wrapper.
  const modal = document.createElement('div');
  modal.classList.add('mh-catch-stats-wrapper');

  // Create the header.
  const header = document.createElement('div');
  header.classList.add('mh-catch-stats-header');

  // Add the title;
  const title = document.createElement('h1');
  title.innerText = 'Location Catch Stats';
  header.append(title);

  // Create a close button icon.
  const closeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  closeIcon.classList.add('mh-catch-stats-close');
  closeIcon.setAttribute('viewBox', '0 0 24 24');
  closeIcon.setAttribute('width', '18');
  closeIcon.setAttribute('height', '18');
  closeIcon.setAttribute('fill', 'none');
  closeIcon.setAttribute('stroke', 'currentColor');
  closeIcon.setAttribute('stroke-width', '1.5');

  // Create the path.
  const closePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  closePath.setAttribute('d', 'M18 6L6 18M6 6l12 12');
  closeIcon.append(closePath);

  // Close the modal when the icon is clicked.
  closeIcon.addEventListener('click', () => {
    modalWrapper.remove();
  });

  // Append the button.
  header.append(closeIcon);

  // Add the header to the modal.
  modal.append(header);

  // Make the mouse stats table.
  const mouseBody = document.createElement('div');
  mouseBody.classList.add('mh-catch-stats-body');

  // Get the mouse stats.
  const mouseStats = await getMouseStats();

  // Loop through the stats and add them to the modal.
  mouseStats.forEach((mouseData) => {
    mouseBody.append(buildMouseMarkup(mouseData, mouseBody));
  });

  // Add the mouse stats to the modal.
  modal.append(mouseBody);

  // Add the modal to the wrapper.
  modalWrapper.append(modal);

  // Add the wrapper to the body.
  document.body.append(modalWrapper);

  // Make the modal draggable.
  makeElementDraggable('#mh-catch-stats', '.mh-catch-stats-header', 25, 25, 'mh-catch-stats-position');
};

let showMisses = false;

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'location-catch-stats');

  addSubmenuItem({
    menu: 'mice',
    label: 'Location Catch Stats',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/prize_shoppe.png?',
    callback: showModal,
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'location-catch-stats',
  name: 'Location Catch Stats',
  type: 'feature',
  default: true,
  description: 'Add a “Location Catch Stats” option to the Mice menu to see your catch stats for the current location.',
  load: init,
  settings,
};
