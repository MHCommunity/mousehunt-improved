import { addStyles, createPopup, onEvent } from '@utils';

import styles from './styles.css';

const github = 'https://github.com/MHCommunity/mousehunt-improved';

const getExtensionLink = () => {
  if ('chrome' === mhImprovedPlatform) {
    return 'https://chromewebstore.google.com/detail/mousehunt-improved/fgjkidgknmkhnbeobehlfabjbignhkhm';
  }

  if ('firefox' === mhImprovedPlatform) {
    return 'https://addons.mozilla.org/en-US/firefox/addon/mousehunt-improved/';
  }

  if ('userscript' === mhImprovedPlatform) {
    return 'https://greasyfork.org/en/scripts/465139-mousehunt-improved';
  }

  return github;
};

const makeList = (title, items) => {
  if (! items || ! items.length) {
    return '';
  }

  let markup = `<div class="update-list-section"><h2>${title}</h2><ul>`;
  for (const item of items) {
    markup += `<li>${item}</li>`;
  }
  markup += '</ul></div>';

  return markup;
};

const showUpdateSummary = async () => {
  const updateSummaries = await fetch('https://api.mouse.rip/update-summary');
  const updates = await updateSummaries.json();

  if (! updates[mhImprovedVersion]) {
    updates[mhImprovedVersion] = {
      summary: '',
      details: [],
    };
  }

  const update = updates[mhImprovedVersion];

  update.summary = update.summary || '';
  update.details = update.details || [];

  let lists = '';

  for (const list of update.details) {
    lists += makeList(list.title, list.items);
  }

  let noChanges = '';
  if (! update.summary.length && ! update.details.length) {
    noChanges = ' no-changes';
    lists = '<p><a href="https://github.com/MHCommunity/mousehunt-improved/releases" target="_blank" rel="noopener noreferrer">Check out the latest release notes</a> for more information.</p>';
  }

  const links = [
    '<a href="https://www.mousehuntgame.com/preferences.php?tab=mousehunt-improved-settings">Settings</a>',
    `<a href="${getExtensionLink()}" target="_blank" rel="noopener noreferrer">Leave a review</a>`,
    // '<a href="#">Support on Patreon</a>',
    `<a href="${github}/issues">Report an issue</a>`,
  ];

  const markup = `<div class="mh-improved-update-summary-wrapper">
	<h1 class="mh-improved-update-summary-title">MouseHunt Improved v${mhImprovedVersion}</h1>
	<div class="mh-improved-update-summary-content">
		<p>${update.summary || ''}</p>
	</div>
	<div class="mh-improved-update-summary-body">
		<div class="mh-improved-update-summary-changes${noChanges}">
      ${lists}
    </div>
    <div class="mh-improved-update-summary-links">
      ${makeList('Links', links)}
      <div class="mh-improved-update-summary-misc">
        Want to contribute to MouseHunt Improved? Check out our <a href="${github}" target="_blank" rel="noopener noreferrer">GitHub</a>.
      </div>
      <div class="mh-improved-update-summary-buttons">
        <a href="#" id="mh-improved-dismiss-popup" class="button">Continue</a>
      </div>
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
  dismiss.addEventListener('click', (e) => {
    e.preventDefault();
    popup.hide(); // TODO: maybe refresh the page here if the update needs it?
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'update-notifications');

  onEvent('mh-improved-updated', showUpdateSummary);
  onEvent('mh-improved-show-update-summary', showUpdateSummary);
};

export default {
  id: 'update-notifications',
  type: 'required',
  alwaysLoad: true,
  order: 200,
  load: init,
};
