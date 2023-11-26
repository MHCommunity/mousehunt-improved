import {
  addSubmenuItem,
  addUIStyles,
  doRequest,
  makeElementDraggable
} from '../utils';

import styles from './styles.css';

/**
 * Get the mouse stats.
 *
 * @return {Object} The mouse stats.
 */
const getMouseStats = async () => {
  const data = await doRequest(
    'managers/ajax/mice/mouse_list.php',
    {
      action: 'get_environment',
      category: user.environment_type, // eslint-disable-line no-undef
      user_id: user.user_id, // eslint-disable-line no-undef
      display_mode: 'stats',
      view: 'ViewMouseListEnvironments',
    }
  );

  // Grab the data from the response.
  const mouseData = data?.mouse_list_category?.subgroups[0]?.mice;

  // Reorder by the num_catches key.
  mouseData.sort((a, b) => {
    return b.num_catches - a.num_catches;
  });

  // Return the data.
  return mouseData ? mouseData : [];
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
    if ('undefined' !== hg?.views?.MouseView?.show) { // eslint-disable-line no-undef
      hg.views.MouseView.show(mouse.type); // eslint-disable-line no-undef
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
    image.appendChild(crown);
  }

  // Create the name element.
  const name = document.createElement('div');
  name.classList.add('mh-catch-stats-name');
  name.innerText = mouse.name;

  // Create a wrapper for the name and image.
  const imageNameContainer = document.createElement('div');
  imageNameContainer.appendChild(image);
  imageNameContainer.appendChild(name);

  // Create the catches element.
  const catches = document.createElement('div');
  catches.classList.add('mh-catch-stats-catches');
  catches.innerText = mouse.num_catches;

  mouseEl.appendChild(imageNameContainer);
  mouseEl.appendChild(catches);

  return mouseEl;
};

/**
 * Show the stat modal.
 */
const showModal = async () => {
  // Remove the existing modal.
  const existing = document.getElementById('mh-catch-stats');
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
  title.innerText = 'Mouse Catch Stats';
  header.appendChild(title);

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
  closeIcon.appendChild(closePath);

  // Close the modal when the icon is clicked.
  closeIcon.addEventListener('click', () => {
    modalWrapper.remove();
  });

  // Append the button.
  header.appendChild(closeIcon);

  // Add the header to the modal.
  modal.appendChild(header);

  // Make the mouse stats table.
  const mouseBody = document.createElement('div');
  mouseBody.classList.add('mh-catch-stats-body');

  // Get the mouse stats.
  const mouseStats = await getMouseStats();

  // Loop through the stats and add them to the modal.
  mouseStats.forEach((mouseData) => {
    mouseBody.appendChild(buildMouseMarkup(mouseData, mouseBody));
  });

  // Add the mouse stats to the modal.
  modal.appendChild(mouseBody);

  // Add the modal to the wrapper.
  modalWrapper.appendChild(modal);

  // Add the wrapper to the body.
  document.body.appendChild(modalWrapper);

  // Make the modal draggable.
  makeElementDraggable('#mh-catch-stats', '.mh-catch-stats-header', 25, 25, 'mh-catch-stats-position');
};

addSubmenuItem({
  menu: 'mice',
  label: 'Location Catch Stats',
  icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/prize_shoppe.png?',
  callback: showModal
});

export default () => {
  addUIStyles(styles);

  addSubmenuItem({
    menu: 'mice',
    label: 'Location Catch Stats',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/prize_shoppe.png?',
    callback: showModal
  });
};
