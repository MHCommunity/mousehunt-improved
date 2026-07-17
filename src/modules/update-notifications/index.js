import { addStyles, createPopup, onEvent } from '@utils';

import styles from './styles.css';

import * as imported from '../../data/update-summaries/*.json'; // eslint-disable-line import/no-unresolved
const updateSummaries = imported;

/**
 * Compare two dot-separated version strings.
 *
 * @param {string} a The first version.
 * @param {string} b The second version.
 *
 * @return {number} Negative if a < b, positive if a > b, zero if equal.
 */
const compareVersions = (a, b) => {
  const aParts = `${a}`.split('.');
  const bParts = `${b}`.split('.');

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = Number.parseInt(aParts[i], 10) || 0;
    const bPart = Number.parseInt(bParts[i], 10) || 0;

    if (aPart !== bPart) {
      return aPart - bPart;
    }
  }

  return 0;
};

/**
 * Get the summaries the user hasn't seen yet, newest version first.
 *
 * Someone updating from 0.97.0 straight to 0.98.1 never saw the 0.98.0 summary,
 * so every version between the two is shown, not just the one being installed.
 *
 * @param {string} from The version we're updating from.
 *
 * @return {Array} The summaries to show.
 */
const getSummariesSince = (from) => {
  return updateSummaries
    .filter((summary) => summary?.version && compareVersions(summary.version, from) > 0 && compareVersions(summary.version, mhImprovedVersion) <= 0)
    .sort((a, b) => compareVersions(b.version, a.version));
};

/**
 * Make the markup for the update summary for the modules.
 *
 * @param {Array}  modules         The module details.
 * @param {string} modules[].title The title of the module.
 * @param {Array}  modules[].items The items of the module.
 *
 * @return {string} The markup.
 */
const makeDetailsList = (modules) => {
  return modules
    .map(
      (module) =>
        `<div class="update-list-section">
      ${module.title ? `<h3>${module.title}</h3>` : ''}
      <ul>
        ${module.items.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </div>`
    )
    .join('');
};

/**
 * Make the markup for a single version's summary.
 *
 * @param {Object}  summary         The summary.
 * @param {string}  summary.version The version.
 * @param {string}  summary.summary The summary text.
 * @param {Array}   summary.details The module details.
 * @param {boolean} showVersion     Whether to label the section with its version.
 *
 * @return {string} The markup.
 */
const makeVersionMarkup = (summary, showVersion) => {
  return `<div class="mh-improved-update-summary-version">
    ${showVersion ? `<h2 class="mh-improved-update-summary-version-title">Version ${summary.version}</h2>` : ''}
    ${summary.summary ? `<p class="mh-improved-update-summary-content">${summary.summary}</p>` : ''}
    ${summary.details?.length ? makeDetailsList(summary.details) : ''}
  </div>`;
};

/**
 * Show the update summary popup.
 *
 * @param {string}  from  The version we're updating from.
 * @param {boolean} force Whether to force the popup to show.
 */
const showUpdateSummary = async (from = '0.0.0', force = false) => {
  // When forced, show everything we ship rather than nothing.
  const summaries = getSummariesSince(force ? '0.0.0' : from);

  if (!summaries.length && !force) {
    return;
  }

  const body = summaries.length
    ? summaries.map((summary) => makeVersionMarkup(summary, summaries.length > 1)).join('')
    : '<p><a href="https://github.com/MHCommunity/mousehunt-improved/releases" target="_blank" rel="noopener noreferrer">Check out the latest release notes</a> for more information.</p>';

  const markup = `<div class="mh-improved-update-summary-wrapper">
	  <h1 class="mh-improved-update-summary-title">MouseHunt Improved v${mhImprovedVersion}</h1>
    <div class="mh-improved-update-summary-lists">${body}</div>
    <div class="mh-improved-update-summary-buttons">
      <a href="#" id="mh-improved-dismiss-popup" class="button">Continue</a>
    </div>
  </div>`;

  // Initiate the popup.
  const popup = createPopup({
    hasCloseButton: false,
    template: 'ajax',
    content: markup,
    show: false,
    className: 'mh-improved-update-summary',
  });

  // Set more of our tokens.
  popup.addToken('{*prefix*}', '');
  popup.addToken('{*suffix*}', '');

  // If we want to show the popup, show it.
  popup.show();

  const dismiss = document.querySelector('#mh-improved-dismiss-popup');
  if (!dismiss) {
    return;
  }

  dismiss.addEventListener('click', (e) => {
    e.preventDefault();
    popup.hide();
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'update-notifications');

  onEvent('mh-improved-updated', showUpdateSummary);
  onEvent('mh-improved-update-summary', () => showUpdateSummary('0.0.0', true));

  window.mhuiDebug = window.mhuiDebug || {};
  window.mhuiDebug.showUpdateSummary = showUpdateSummary;
};

/**
 * Initialize the module.
 */
export default {
  id: 'update-notifications',
  type: 'required',
  alwaysLoad: true,
  order: 200,
  load: init,
};
