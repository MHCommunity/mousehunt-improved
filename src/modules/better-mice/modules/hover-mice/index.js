import {
  addStyles,
  doRequest,
  makeElement,
  onEvent,
  onJournalEntry
} from '@utils';
import styles from './styles.css';

let lastFetchedMouse = null;
let lastFetchedTime = 0;
let lastFetchedData = null;

/**
 * Fetch the mouse data.
 *
 * @param {string} mouseId The mouse ID.
 *
 * @return {Promise<Object>} The mouse data.
 */
const fetchMouseData = async (mouseId) => {
  // Cache the data if it's been less than 30 seconds
  const now = Date.now();
  if (lastFetchedMouse === mouseId && now - lastFetchedTime < 30000 && lastFetchedData) {
    return lastFetchedData;
  }

  const mouseDataRequest = await doRequest('managers/ajax/mice/getstat.php', {
    action: 'get_mice',
    'mouse_types[]': mouseId,
  });

  const mouseData = mouseDataRequest?.mice?.[0];
  if (! mouseData) {
    return null;
  }

  lastFetchedMouse = mouseId;
  lastFetchedTime = now;
  lastFetchedData = mouseData;

  return mouseData;
};

/**
 * Create the markup for the mouse data.
 *
 * @param {Object} mouse The mouse data.
 *
 * @return {HTMLElement|boolean} The mouse data markup or false.
 */
const makeMouseMarkup = (mouse) => {
  if (! mouse) {
    return false;
  }

  const mouseData = makeElement('div', 'mouse-data');
  if (mouse.crown && 'none' !== mouse.crown) {
    mouseData.classList.add('crown', mouse.crown);
  }

  const mouseImage = makeElement('img', 'mouse-image');
  mouseImage.alt = mouse.name;
  mouseImage.width = '82';
  mouseImage.height = '82';
  if (mouse.square) {
    mouseImage.src = mouse.square;
  }
  mouseData.append(mouseImage);

  const mouseText = makeElement('div', 'mouse-text');

  if (mouse.name) {
    makeElement('div', 'mouse-name', mouse.name, mouseText);
  }

  const catchStats = makeElement('div', 'mouse-catch-stats');

  const catches = makeElement('div', 'mouse-catches');
  makeElement('span', '', 'Catches: ', catches);
  makeElement('span', '', mouse.num_catches_formatted || 0, catches);
  catchStats.append(catches);

  const avgWeight = makeElement('div', 'mouse-avg-weight');
  makeElement('span', '', 'Avg: ', avgWeight);
  makeElement('span', '', mouse.avg_weight || '0z', avgWeight);
  catchStats.append(avgWeight);

  const misses = makeElement('div', 'mouse-misses');
  makeElement('span', '', 'Misses: ', misses);
  makeElement('span', '', mouse.num_misses_formatted || 0, misses);
  catchStats.append(misses);

  const heaviest = makeElement('div', 'mouse-heaviest');
  makeElement('span', '', 'Heaviest: ', heaviest);
  makeElement('span', '', mouse.heaviest_catch || '0z', heaviest);
  catchStats.append(heaviest);

  mouseText.append(catchStats);
  mouseData.append(mouseText);

  return mouseData;
};

/**
 * Create the loading markup.
 *
 * @param {Event} e The event.
 *
 * @return {HTMLElement} The loading markup.
 */
const makeLoadingMarkup = (e) => {
  if (mouseDataWrapper) {
    mouseDataWrapper.remove();
  }

  mouseDataWrapper = makeElement('div', 'mouse-data-wrapper');
  mouseDataWrapper.id = 'mouse-data-wrapper';
  mouseDataWrapper.innerHTML = '<span class="mouse-data-wrapper-loading">Loading...</span>';

  document.body.append(mouseDataWrapper);

  const rect = e.target.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const left = rect.left + window.scrollX;

  let tooltipTop = top - mouseDataWrapper.offsetHeight - 10;
  if (tooltipTop < 0) {
    tooltipTop = top + rect.height + 10;
  }

  mouseDataWrapper.style.top = `${tooltipTop}px`;
  mouseDataWrapper.style.left = `${left - (mouseDataWrapper.offsetWidth / 2) + (rect.width / 2)}px`;

  return mouseDataWrapper;
};

let mouseDataWrapper;

const listeners = {};

const addHoverListener = (link) => {
  let timeoutId = null;
  let isMouseOver = false;

  if (listeners[link]) {
    link.removeEventListener('mouseenter', listeners[link].mouseenter);
    link.removeEventListener('mouseleave', listeners[link].mouseleave);
  }

  const enter = link.addEventListener('mouseenter', async (e) => {
    isMouseOver = true;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
      if (! isMouseOver) {
        return;
      }

      makeLoadingMarkup(e);
      let match;
      if (link.getAttribute('onclick')) {
        match = link.getAttribute('onclick').match(/'([^']+)'/);
      } else if (link.getAttribute('href')) {
        match = link.getAttribute('href').match(/mouse_type=([^&]+)/);
      }

      if (! match || match.length < 2) {
        return;
      }

      const mouseType = match[1];

      const mouseData = await fetchMouseData(mouseType);
      if (mouseData && mouseDataWrapper && isMouseOver) {
        const markup = makeMouseMarkup(mouseData);
        mouseDataWrapper.innerHTML = markup.outerHTML;
      }
    }, 500);
  });

  const leave = link.addEventListener('mouseleave', () => {
    isMouseOver = false;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (mouseDataWrapper) {
      mouseDataWrapper.remove();
    }
  });

  listeners[link] = { mouseenter: enter, mouseleave: leave };
};

/**
 * The main function.
 *
 * @param {HTMLElement|null} element The parent element to search for mouse links.
 */
const main = (element = null) => {
  const parentElement = element || document;
  const miceLinks = parentElement.querySelectorAll('.journal .content .entry .journaltext a[onclick*="MouseView.show"]');
  if (! miceLinks) {
    return;
  }

  miceLinks.forEach((link) => {
    const mouseType = link.getAttribute('onclick').match(/'([^']+)'/)[1];
    link.setAttribute('onclick', `hg.views.MouseView.show('${mouseType}'); return false;`);

    addHoverListener(link);
  });
};

/**
 * Initialize the module.
 */
export default () => {
  addStyles(styles, 'better-mice-hover-mice');

  onEvent('journal-mouse-link-modified', main);
  onJournalEntry(main, {
    id: 'better-mice-hover-mice',
    weight: 9900,
  });
};
