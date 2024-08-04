import {
  addStyles,
  createPopup,
  getCurrentPage,
  getExtensionLink,
  getExtensionLinkText,
  getSetting,
  makeElement,
  onEvent,
  removeBodyClass,
  saveSetting
} from '@utils';

import styles from './styles.css';

import updateSummary from '@data/update-summary.json';

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
  return modules.map((module) =>
    `<div class="update-list-section">
      ${module.title ? `<h2>${module.title}</h2>` : ''}
      <ul>
        ${module.items.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </div>`
  ).join('');
};

/**
 * Show the update summary popup.
 *
 * @param {string}  from  The version we're updating from.
 * @param {boolean} force Whether to force the popup to show.
 */
const showUpdateSummary = async (from, force = false) => {
  const isMinor = from.split('.').slice(0, 2).join('.') === mhImprovedVersion.split('.').slice(0, 2).join('.');
  const missingSummaryOrDetails = ! (updateSummary.summary.length || updateSummary.details.length);
  if ((isMinor || missingSummaryOrDetails) && ! force) {
    return;
  }

  const markup = `<div class="mh-improved-update-summary-wrapper">
	  <h1 class="mh-improved-update-summary-title">MouseHunt Improved v${mhImprovedVersion}</h1>
    <p class="mh-improved-update-summary-content">${updateSummary.summary}</p>
    <div class="mh-improved-update-summary-lists">${updateSummary.details.length ? makeDetailsList(updateSummary.details) : '<p><a href="https://github.com/MHCommunity/mousehunt-improved/releases" target="_blank" rel="noopener noreferrer">Check out the latest release notes</a> for more information.</p>'}</div>
    <div class="mh-improved-update-summary-buttons">
      <a href="#" id="mh-improved-dismiss-popup" class="button">Continue</a>
    </div>
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
  if (! dismiss) {
    return;
  }

  dismiss.addEventListener('click', (e) => {
    e.preventDefault();
    popup.hide();
  });
};

const addBanner = () => {
  // Don't show except on the camp page.
  if ('camp' !== getCurrentPage()) {
    return;
  }

  // Only show the banner once.
  if (getSetting('updates.banner', false) === mhImprovedVersion) {
    removeBodyClass('mh-improved-has-update');

    return;
  }

  const banner = document.querySelector('.campPage-tabs .campPage-banner');

  const bannerWrapper = makeElement('div', ['mhui-update-banner', 'banner-fade']);
  const bannerContent = makeElement('div', 'mhui-update-banner-content');
  makeElement('div', 'mhui-update-banner-text', 'MouseHunt Improved update available!', bannerContent);

  const buttonWrapper = makeElement('div', 'mhui-update-banner-buttons', '');

  const closeButton = makeElement('a', ['mhui-update-banner-close', 'mousehuntActionButton', 'small', 'cancel']);
  makeElement('span', '', 'Dismiss', closeButton);
  closeButton.addEventListener('click', (e) => {
    e.preventDefault();

    bannerWrapper.classList.add('banner-fade-out');
    saveSetting('updates.banner', mhImprovedVersion);

    removeBodyClass('mh-improved-has-update');

    setTimeout(() => {
      bannerWrapper.remove();
    }, 1000);
  });

  buttonWrapper.append(closeButton);

  const button = makeElement('a', ['mhui-update-banner-button', 'mousehuntActionButton', 'small', 'lightBlue']);
  makeElement('span', '', getExtensionLinkText(), button);
  button.href = getExtensionLink();
  button.target = '_blank';
  buttonWrapper.append(button);

  bannerContent.append(buttonWrapper);
  bannerWrapper.append(bannerContent);

  banner.append(bannerWrapper);

  banner.classList.remove('hidden');

  setTimeout(() => {
    bannerWrapper.classList.add('banner-fade-in');
  }, 1000);
};

const checkForUpdates = async () => {
  const latestRelease = await fetch('https://api.mouse.rip/mousehunt-improved-version');
  const latestReleaseData = await latestRelease.json();

  if (latestReleaseData.version && latestReleaseData.version !== mhImprovedVersion) {
    addBanner(`MouseHunt Improved v${latestReleaseData.version} is now available!`);
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'update-notifications');

  onEvent('mh-improved-updated', showUpdateSummary);
  onEvent('mh-improved-show-update-summary', () => {
    showUpdateSummary(mhImprovedVersion, true);
  });

  checkForUpdates();
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
