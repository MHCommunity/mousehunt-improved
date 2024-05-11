import {
  addStyles,
  debounce,
  doRequest,
  getSetting,
  makeElement,
  onRequest,
  sleep
} from '@utils';
import styles from './styles.css';

const fetchAndFillMouseData = async (mouseId) => {
  if (isLoading) {
    return;
  }

  isLoading = true;

  // Artificial delay to prevent spamming the server when the user is quickly moving the mouse.
  await sleep(500);

  const mouseDataRequest = await doRequest('managers/ajax/mice/getstat.php', {
    action: 'get_mice',
    'mouse_types[]': mouseId,
  });

  if (! mouseDataRequest?.mice?.length) {
    return;
  }

  const mouse = mouseDataRequest?.mice[0];

  const mouseData = makeElement('div', 'mouse-data');
  if (mouse.crown && 'none' !== mouse.crown) {
    mouseData.classList.add('crown', mouse.crown);
  }

  const mouseImage = makeElement('img', 'mouse-image');
  mouseImage.src = mouse.square;
  mouseData.append(mouseImage);

  const mouseText = makeElement('div', 'mouse-text');
  makeElement('div', 'mouse-name', mouse.name, mouseText);

  const catchStats = makeElement('div', 'mouse-catch-stats');
  const catches = makeElement('div', 'mouse-catches');
  makeElement('span', '', 'Catches: ', catches);
  makeElement('span', '', mouse.num_catches_formatted, catches);
  catchStats.append(catches);

  const avgWeight = makeElement('div', 'mouse-avg-weight');
  makeElement('span', '', 'Avg: ', avgWeight);
  makeElement('span', '', mouse.avg_weight, avgWeight);
  catchStats.append(avgWeight);

  const misses = makeElement('div', 'mouse-misses');
  makeElement('span', '', 'Misses: ', misses);
  makeElement('span', '', mouse.num_misses_formatted, misses);
  catchStats.append(misses);

  const heaviest = makeElement('div', 'mouse-heaviest');
  makeElement('span', '', 'Heaviest: ', heaviest);
  makeElement('span', '', mouse.heaviest_catch, heaviest);
  catchStats.append(heaviest);

  mouseText.append(catchStats);

  mouseData.append(mouseText);

  mouseDataWrapper.innerHTML = mouseData.outerHTML;

  isLoading = false;
};

let debugPopup = false;
let mouseDataWrapper;
let isLoading = false;
const makeMouseMarkup = async (mouseId, e) => {
  if (mouseDataWrapper) {
    mouseDataWrapper.remove();
  }

  mouseDataWrapper = makeElement('div', 'mouse-data-wrapper');
  mouseDataWrapper.id = 'mouse-data-wrapper';
  mouseDataWrapper.innerHTML = '<span class="mouse-data-wrapper-loading">Loading...</span>';

  fetchAndFillMouseData(mouseId);

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

  if (e.target && ! debugPopup) {
    e.target.addEventListener('mouseleave', () => {
      if (mouseDataWrapper) {
        mouseDataWrapper.remove();
      }
    });
  }
};

const main = () => {
  const miceLinks = document.querySelectorAll('.journal .content .entry .journaltext a[onclick*="MouseView.show"]');
  if (! miceLinks) {
    return;
  }

  miceLinks.forEach((link) => {
    const mouseType = link.getAttribute('onclick').match(/'([^']+)'/)[1];
    link.setAttribute('onclick', `hg.views.MouseView.show('${mouseType}'); return false;`);

    link.addEventListener('mouseover', debounce((e) => {
      makeMouseMarkup(mouseType, e);
    }));

    link.addEventListener('mouseout', debounce(() => {
      if (mouseDataWrapper) {
        mouseDataWrapper.remove();
      }
    }));
  });
};

const hoverMice = () => {
  addStyles(styles, 'better-mice-hover-mice');

  debugPopup = getSetting('debug.hover-popups', false);

  setTimeout(main, 500);
  onRequest('*', () => {
    setTimeout(main, 1000);
  });
};

export default hoverMice;
