import { addStyles, cacheGetNoExpiration, cacheSetNoExpiration, createPopup, deleteSetting, fetchMouseRip, getSetting, makeElement, onEvent, saveSetting } from '@utils';

import icon from '@images/icons/icon-64.png';

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
 * Make the markup for the flags suggested by an update, for options that are now feature flags.
 *
 * @param {Array} suggestions The suggested flags, as { flag, label } objects.
 *
 * @return {string} The markup.
 */
const makeSuggestedFlagsMarkup = (suggestions) => {
  if (!suggestions.length) {
    return '';
  }

  return `<div class="mh-improved-update-summary-flags">
    <p>Some options you'd changed are now <a href="https://www.mousehuntgame.com/preferences.php?tab=mousehunt-improved-settings#mousehunt-improved-settings-override-flags">feature flags</a>. To keep them the way you had them, add these flags:</p>
    <ul>
      ${suggestions.map(({ flag, label }) => `<li>${label}: <code>${flag}</code></li>`).join('')}
    </ul>
    <a href="#" id="mh-improved-add-suggested-flags" class="mousehuntActionButton tiny"><span>Add these flags</span></a>
  </div>`;
};

/**
 * Add the suggested flags to the saved feature flags.
 *
 * @param {Array} suggestions The suggested flags, as { flag, label } objects.
 */
const addSuggestedFlags = (suggestions) => {
  const flags = new Set(
    getSetting('override-flags', '')
      .split(',')
      .map((flag) => flag.trim())
      .filter(Boolean)
  );

  suggestions.forEach(({ flag }) => flags.add(flag));
  saveSetting('override-flags', [...flags].join(','));
};

/**
 * Show the update summary popup.
 *
 * @param {string}     from         The version we're updating from.
 * @param {boolean}    force        Whether to force the popup to show.
 * @param {Array|null} previewFlags Suggested flags to show instead of the saved ones, without reading or saving any settings.
 */
const showUpdateSummary = async (from = '0.0.0', force = false, previewFlags = null) => {
  // When forced, show everything we ship rather than nothing.
  const summaries = getSummariesSince(force ? '0.0.0' : from);

  const isPreview = Array.isArray(previewFlags);

  // Only shown once, whether or not the flags are added.
  const suggestedFlags = isPreview ? previewFlags : getSetting('update-suggested-flags', []);
  if (!isPreview) {
    deleteSetting('update-suggested-flags');
  }

  if (!summaries.length && !suggestedFlags.length && !force) {
    return;
  }

  const body = summaries.length
    ? summaries.map((summary) => makeVersionMarkup(summary, summaries.length > 1)).join('')
    : '<p><a href="https://github.com/MHCommunity/mousehunt-improved/releases" target="_blank" rel="noopener noreferrer">Check out the latest release notes</a> for more information.</p>';

  const markup = `<div class="mh-improved-update-summary-wrapper">
	  <h1 class="mh-improved-update-summary-title">MouseHunt Improved v${mhImprovedVersion}</h1>
    <div class="mh-improved-update-summary-lists">${body}</div>
    ${makeSuggestedFlagsMarkup(suggestedFlags)}
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

  const addFlags = document.querySelector('#mh-improved-add-suggested-flags');
  addFlags?.addEventListener('click', (e) => {
    e.preventDefault();
    if (isPreview) {
      addFlags.replaceWith(Object.assign(document.createElement('p'), { textContent: 'Preview only, no flags were added.' }));
      return;
    }

    addSuggestedFlags(suggestedFlags);
    addFlags.replaceWith(Object.assign(document.createElement('p'), { textContent: 'Added! They apply after you refresh the page.' }));
  });

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
 * Show the update notice in the bottom corner.
 *
 * @param {string} version The version that's available.
 */
const showUpdateAvailable = (version) => {
  document.querySelector('.mh-improved-update-available')?.remove();

  const isUserscript = 'userscript' === mhImprovedPlatform;

  const notice = makeElement('div', 'mh-improved-update-available');
  notice.setAttribute('role', 'status');

  const image = makeElement('img', 'mh-improved-update-available-icon');
  image.src = icon;
  image.alt = '';
  notice.append(image);

  const content = makeElement('div', 'mh-improved-update-available-content');
  makeElement('div', 'mh-improved-update-available-title', 'MouseHunt Improved update available', content);
  makeElement(
    'div',
    'mh-improved-update-available-text',
    isUserscript
      ? `Get version ${version} from <a href="https://greasyfork.org/scripts/465139-mousehunt-improved" target="_blank" rel="noopener noreferrer">Greasy Fork</a>.`
      : `Restart your browser to get version ${version}.`,
    content
  );
  notice.append(content);

  const dismiss = () => {
    cacheSetNoExpiration('update-available-dismissed', version);
    notice.classList.remove('mh-improved-update-available-visible');
    setTimeout(() => notice.remove(), 300);
  };

  content.querySelector('a')?.addEventListener('click', dismiss);

  const close = makeElement('button', 'mh-improved-update-available-close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Dismiss');
  close.addEventListener('click', dismiss);
  notice.append(close);

  document.body.append(notice);
  requestAnimationFrame(() => requestAnimationFrame(() => notice.classList.add('mh-improved-update-available-visible')));
};

/**
 * Get the live store versions, checking at most every six hours.
 *
 * @return {Promise<Object|null>} The versions keyed by platform, or null if unavailable.
 */
const getStoreVersions = async () => {
  const cached = await cacheGetNoExpiration('store-versions', null);
  if (cached?.data && Date.now() - cached.checked < 6 * 60 * 60 * 1000) {
    return cached.data;
  }

  const data = await fetchMouseRip('mh-improved/versions');
  if (!data || typeof data !== 'object') {
    return cached?.data || null;
  }

  await cacheSetNoExpiration('store-versions', { checked: Date.now(), data });

  return data;
};

/**
 * Let the user know when a newer version has been live in their store for a while.
 *
 * Versions come from the stores themselves rather than GitHub, so nothing shows
 * while a release is still in review. Browsers update extensions on their own,
 * so we wait 12 hours to only catch the ones that didn't.
 */
const checkForUpdate = async () => {
  const latest = (await getStoreVersions())?.[mhImprovedPlatform];
  if (!latest?.version || compareVersions(latest.version, mhImprovedVersion) <= 0) {
    return;
  }

  if (Date.now() - Date.parse(latest.since) < 12 * 60 * 60 * 1000) {
    return;
  }

  if ((await cacheGetNoExpiration('update-available-dismissed', '')) === latest.version) {
    return;
  }

  showUpdateAvailable(latest.version);
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'update-notifications');

  onEvent('mh-improved-updated', showUpdateSummary);
  onEvent('mh-improved-update-summary', () => showUpdateSummary('0.0.0', true));

  checkForUpdate();
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
