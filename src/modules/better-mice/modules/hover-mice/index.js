import {
  addStyles,
  createHoverCard,
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
  mouseImage.src = mouse?.square || mouse?.large || mouse?.thumb || '';
  mouseImage.alt = mouse.name;
  mouseImage.width = '82';
  mouseImage.height = '82';
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

const hoverCard = createHoverCard({
  wrapperId: 'mouse-data-wrapper',
  hrefParam: 'mouse_type',
  fetchData: fetchMouseData,
  render: makeMouseMarkup,
});

/**
 * The main function.
 *
 * @param {HTMLElement|null} element The parent element to search for mouse links.
 */
const main = (element = null) => {
  let allMiceLinks = [];

  const parentElement = element || document;
  const miceLinks = parentElement.querySelectorAll('.journal .content .entry .journaltext a[onclick*="MouseView.show"]');
  if (miceLinks) {
    allMiceLinks = [...miceLinks];
  }

  const creMiceLinks = document.querySelectorAll('.mh-improved-cre-name a[onclick*="MouseView.show"]');
  if (creMiceLinks) {
    allMiceLinks = [...allMiceLinks, ...creMiceLinks];
  }

  // Mouse links in the quests panel, e.g. the M400 helper.
  const questsMiceLinks = document.querySelectorAll('.campPage-quests-container a[onclick*="MouseView.show"]');
  if (questsMiceLinks) {
    allMiceLinks = [...allMiceLinks, ...questsMiceLinks];
  }

  allMiceLinks.forEach((link) => {
    const mouseType = link.getAttribute('onclick').match(/'([^']+)'/)[1];
    link.setAttribute('onclick', `hg.views.MouseView.show('${mouseType}'); return false;`);

    hoverCard.attach(link);
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
