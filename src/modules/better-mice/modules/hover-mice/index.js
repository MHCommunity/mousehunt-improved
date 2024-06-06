import {
  addStyles,
  doRequest,
  makeElement,
  onRequest,
  onTurn
} from '@utils';
import styles from './styles.css';

/**
 * Fetch the mouse data.
 *
 * @param {string} mouseId The mouse ID.
 *
 * @return {Promise<Object>} The mouse data.
 */
const fetchMouseData = async (mouseId) => {
  const mouseDataRequest = await doRequest('managers/ajax/mice/getstat.php', {
    action: 'get_mice',
    'mouse_types[]': mouseId,
  });

  return mouseDataRequest?.mice?.[0];
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

/**
 * Get the mouse data.
 *
 * @param {string} mouseType The mouse type.
 *
 * @return {Promise<Object>} The mouse data.
 */
const getMouseData = async (mouseType) => {
  let mouse;
  if (cachedMouseData[mouseType]) {
    mouse = cachedMouseData[mouseType];
  } else {
    mouse = await fetchMouseData(mouseType);
    cachedMouseData[mouseType] = mouse;

    setTimeout(() => {
      delete cachedMouseData[mouseType];
    }, 60 * 1000);
  }

  return mouse;
};

let mouseDataWrapper;
let cachedMouseData = {};

/**
 * The main function.
 */
const main = () => {
  const miceLinks = document.querySelectorAll('.journal .content .entry .journaltext a[onclick*="MouseView.show"]');
  if (! miceLinks) {
    return;
  }

  miceLinks.forEach((link) => {
    const mouseType = link.getAttribute('onclick').match(/'([^']+)'/)[1];
    link.setAttribute('onclick', `hg.views.MouseView.show('${mouseType}'); return false;`);

    let timeoutId = null;
    let isMouseOver = false;

    link.addEventListener('mouseenter', async (e) => {
      isMouseOver = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        if (! isMouseOver) {
          return;
        }

        makeLoadingMarkup(e);
        const mouseData = await getMouseData(mouseType);
        if (mouseData && mouseDataWrapper && isMouseOver) {
          const markup = makeMouseMarkup(mouseData);
          mouseDataWrapper.innerHTML = markup.outerHTML;
        }
      }, 500);
    });

    link.addEventListener('mouseleave', () => {
      isMouseOver = false;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (mouseDataWrapper) {
        mouseDataWrapper.remove();
      }
    });
  });
};

/**
 * Initialize the module.
 */
export default () => {
  addStyles(styles, 'better-mice-hover-mice');

  setTimeout(main, 500);
  onRequest('*', () => {
    setTimeout(main, 1000);
  });

  onTurn(() => cachedMouseData = {});
};
