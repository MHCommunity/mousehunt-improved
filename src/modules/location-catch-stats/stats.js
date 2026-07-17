import { doRequest, getSetting, makeElement, makeElementDraggable, parseNumber } from '@utils';

/**
 * Get the mouse stats for a location.
 *
 * @param {string|boolean} category The environment category to fetch, defaults to the current location.
 *
 * @return {Array} The mouse stats.
 */
const getMouseStats = async (category = false) => {
  const data = await doRequest('managers/ajax/mice/mouse_list.php', {
    action: 'get_environment',
    category: category || user.environment_type,
    user_id: user.user_id,
    display_mode: 'stats',
    view: 'ViewMouseListEnvironments',
  });

  // Grab the data from the response.
  const mouseData = data?.mouse_list_category?.subgroups?.[0]?.mice;

  if (!mouseData) {
    return [];
  }

  // Reorder by the num_catches key.
  mouseData.sort((a, b) => {
    return parseNumber(b.num_catches) - parseNumber(a.num_catches);
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
  const mouse = Object.assign(
    {},
    {
      name: '',
      type: '',
      image: '',
      crown: 'none',
      num_catches: 0,
    },
    mouseData
  );

  const mouseEl = makeElement('a', 'mh-catch-stats');

  mouseEl.title = mouse.name;
  mouseEl.addEventListener('click', () => {
    if (hg?.views?.MouseView?.show) {
      hg.views.MouseView.show(mouse.type);
    }
  });

  // Create the image element.
  const image = makeElement('div', 'mh-catch-stats-image');
  if (mouse.num_catches <= 0) {
    image.classList.add('mh-catch-stats-no-catches');
  }

  image.style.backgroundImage = `url('${mouse.image}')`;

  // If the mouse has a crown, add it.
  if (mouse.crown && 'none' !== mouse.crown) {
    const crown = makeElement('div', 'mh-catch-stats-crown');
    crown.style.backgroundImage = `url('https://www.mousehuntgame.com/images/ui/crowns/crown_${mouse.crown}.png')`;
    image.append(crown);

    mouseEl.classList.add(`mh-catch-stats-crown-${mouse.crown}`);
  } else {
    mouseEl.classList.add('mh-catch-stats-crown-none');
  }

  // Create the name element.
  const name = makeElement('div', 'mh-catch-stats-name');
  name.textContent = mouse.name;

  // Create a wrapper for the name and image.
  const imageNameContainer = document.createElement('div');
  imageNameContainer.append(image);
  imageNameContainer.append(name);
  mouseEl.append(imageNameContainer);

  // Create the catches element.
  const catches = makeElement('div', 'mh-catch-stats-catches');

  catches.textContent = mouse.num_catches;
  if (getSetting('location-catch-stats.show-misses', false)) {
    makeElement('span', 'mh-catch-stats-separator', '/', catches);
    makeElement('span', 'mh-catch-stats-misses', mouse.num_misses, catches);
  }

  mouseEl.append(catches);

  return mouseEl;
};

/**
 * Build the crown breakdown row for a list of mice.
 *
 * @param {Array} mice The mice to count crowns for.
 *
 * @return {Element|boolean} The crown breakdown element, or false if there are no crowns.
 */
const makeCrownBreakdown = (mice) => {
  const crownTypes = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];

  const breakdown = makeElement('div', 'mh-catch-stats-crown-breakdown');
  crownTypes.forEach((type) => {
    const count = mice.filter((mouse) => type === mouse.crown).length;
    if (!count) {
      return;
    }

    const crown = makeElement('div', ['mh-catch-stats-crown-pill', `mh-catch-stats-crown-pill-${type}`]);

    const icon = makeElement('div', 'mh-catch-stats-crown-pill-icon');
    icon.style.backgroundImage = `url('https://www.mousehuntgame.com/images/ui/crowns/crown_${type}.png')`;
    crown.append(icon);

    makeElement('span', 'mh-catch-stats-crown-pill-count', count, crown);
    makeElement('span', 'mh-catch-stats-crown-pill-label', type, crown);

    breakdown.append(crown);
  });

  return breakdown.children.length ? breakdown : false;
};

/**
 * Build the list of mouse rows with a sort-order toggle.
 *
 * @param {Array} mice The mice to list, sorted by most catches first.
 *
 * @return {Element} The list element.
 */
const makeMouseList = (mice) => {
  const wrapper = makeElement('div', 'mh-catch-stats-list');

  // Header row with the crown breakdown and the sort toggle.
  const header = makeElement('div', 'mh-catch-stats-list-header');

  const crowns = makeCrownBreakdown(mice);
  if (crowns) {
    header.append(crowns);
  }

  const sortToggle = makeElement('a', 'mh-catch-stats-sort-toggle');
  sortToggle.title = 'Reverse the sort order';
  header.append(sortToggle);
  wrapper.append(header);

  const listing = makeElement('div', 'mh-catch-stats-list-mice');
  wrapper.append(listing);

  let reversed = false;

  /**
   * Render the rows in the current sort order.
   */
  const render = () => {
    sortToggle.textContent = reversed ? 'Sort ↑' : 'Sort ↓';

    listing.replaceChildren();
    const sorted = reversed ? [...mice].reverse() : mice;
    sorted.forEach((mouse) => {
      listing.append(buildMouseMarkup(mouse));
    });
  };

  sortToggle.addEventListener('click', (e) => {
    e.preventDefault();
    reversed = !reversed;
    render();
  });

  render();

  return wrapper;
};

/**
 * Build the modal frame: wrapper, draggable header with title and close button, and body.
 *
 * @param {string} id    The ID for the modal wrapper.
 * @param {string} title The title to show in the header.
 *
 * @return {Object} The wrapper, modal, header, and body elements.
 */
const makeStatsModal = (id, title) => {
  // Remove the existing modal.
  const existing = document.querySelector(`#${id}`);
  if (existing) {
    existing.remove();
  }

  // Create the modal.
  const wrapper = document.createElement('div');
  wrapper.id = id;

  // Create the wrapper.
  const modal = makeElement('div', 'mh-catch-stats-wrapper');

  // Create the header.
  const header = makeElement('div', 'mh-catch-stats-header');

  // Add the title;
  const titleEl = document.createElement('h1');
  titleEl.textContent = title;
  header.append(titleEl);

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
    wrapper.remove();
  });

  // Append the button.
  header.append(closeIcon);

  // Add the header to the modal.
  modal.append(header);

  // Make the body.
  const body = makeElement('div', 'mh-catch-stats-body');
  modal.append(body);

  // Add the modal to the wrapper.
  wrapper.append(modal);

  return { wrapper, modal, header, body };
};

/**
 * Show catch stats for the current location using the original simplified view.
 */
const showSimplifiedModal = async () => {
  const { wrapper, body } = makeStatsModal('mh-catch-stats', 'Location Catch Stats');

  const mouseStats = await getMouseStats();
  mouseStats.forEach((mouse) => {
    body.append(buildMouseMarkup(mouse));
  });

  document.body.append(wrapper);
  makeElementDraggable('#mh-catch-stats', '#mh-catch-stats .mh-catch-stats-header', 25, 25);
};

export { getMouseStats, makeMouseList, makeStatsModal, showSimplifiedModal };
