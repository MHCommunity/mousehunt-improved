import { onNavigationPatched } from '../utils';
import styles from './styles';
import userHighlighting from '../../data/user-highlighting.json';

const updateItemClassificationLinks = () => {
  const itemClassificationLink = document.querySelectorAll('.itemView-header-classification-link a');
  if (! itemClassificationLink) {
    return;
  }

  itemClassificationLink.forEach((link) => {
    // get the onclick attribute, remove 'hg.views.ItemView.hide()', then set the onclick attribute
    const onclick = link.getAttribute('onclick');
    if (! onclick) {
      return;
    }

    // get the page title and tab via regex
    const page = onclick.match(/setPage\('(.+?)'.+tab:'(.+)'/);
    if (! page) {
      return;
    }

    const pageTitle = page[1];
    let tab = page[2];
    let subtab = null;

    if ('skin' === tab || 'trinket' === tab) {
      subtab = tab;
      tab = 'traps';
    }

    // build the url
    let url = `https://www.mousehuntgame.com/${pageTitle.toLowerCase()}.php?tab=${tab}`;
    if (subtab) {
      url += `&sub_tab=${subtab}`;
    }

    // remove the onclick attribute and add the href attribute
    link.removeAttribute('onclick');
    link.setAttribute('href', url);
  });
};

const addHelpLinks = () => {
  const supportDropdown = document.querySelector('.menuItem.dropdown.support .dropdownContent');
  if (! supportDropdown) {
    return;
  }

  const helpLinks = [
    {
      id: 'mouserip',
      class: 'rules',
      title: 'MOUSE.RIP', // caps to look better
      href: 'https://mouse.rip',
      text: 'MH guides, tools, and more',
    },
    {
      id: 'mhui',
      class: 'fanPage',
      title: 'MH Improved',
      href: 'https://github.com/MHCommunity/mousehunt-improved',
      text: 'Bug reports and feature requests',
    }
  ];

  helpLinks.forEach((helpLink) => {
    const link = makeElement('a', [helpLink.id, helpLink.class]);
    makeElement('b', 'title', helpLink.title, link);
    makeElement('span', 'text', helpLink.text, link);

    link.setAttribute('href', helpLink.href);
    link.setAttribute('target', '_blank');

    supportDropdown.appendChild(link);
  });
};

const checkForDarkModeAndAddBodyClass = () => {
  if (! isDarkMode()) {
    return false;
  }

  // add the dark mode class to the body
  document.body.classList.add('mh-dark-mode');
  return true;
};

const addDarkModeBodyClass = () => {
  let added = checkForDarkModeAndAddBodyClass();
  // add a delay to make sure the body class is added before the styles are applied.
  if (! added) {
    setTimeout(() => {
      added = checkForDarkModeAndAddBodyClass();
      if (! added) {
        setTimeout(() => {
          checkForDarkModeAndAddBodyClass();
        }, 1000);
      }
    }, 500);
  }
};

const continueOnKingsReward = (req) => {
  if (req.success && req.puzzle_reward) {
    const resume = document.querySelector('.puzzleView__resumeButton');
    if (resume) {
      resume.click();
    }
  }
};

const exportRankupForecasterData = () => {
  const allArea = localStorage.getItem('Chro-forecaster-all-area');
  const currentArea = localStorage.getItem('Chro-forecaster-current-area');
  const time = localStorage.getItem('Chro-forecaster-time');

  const data = {
    allArea,
    currentArea,
    time,
  };

  const dataStr = JSON.stringify(data);

  // encode the data to base64
  const base64 = btoa(dataStr);

  // create the link
  const link = document.createElement('a');
  const date = new Date();
  const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  link.download = `rank-up-forecaster-${dateString}.json`;
  link.href = `data:application/json;base64,${base64}`;
  link.click();
};

const importRankupForecassterData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (! file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (re) => {
      const contents = re.target.result;
      const data = JSON.parse(contents);

      localStorage.setItem('Chro-forecaster-all-area', data.allArea);
      localStorage.setItem('Chro-forecaster-current-area', data.currentArea);
      localStorage.setItem('Chro-forecaster-time', data.time);
    };

    reader.readAsText(file);
  });

  input.click();

  // re-click the points button to refresh the data
  const points = document.querySelector('.mousehuntHud-userStat-row.points');
  if (points) {
    points.click();
  }
};

const addRankupForecasterButtons = () => {
  const forecastOpen = document.querySelector('.mousehuntHud-userStat-row.points');
  if (! forecastOpen) {
    return;
  }

  forecastOpen.addEventListener('click', () => {
    setTimeout(() => {
      const rankup = document.querySelector('#forecaster-content-div');
      if (! rankup) {
        return;
      }

      const existing = document.querySelector('.mh-ui-forecaster-buttons');
      if (existing) {
        return;
      }

      const wrapper = makeElement('div', 'mh-ui-forecaster-buttons');

      const exportButton = makeElement('button', 'mh-ui-export-forecaster-data', 'Export Data');
      exportButton.addEventListener('click', exportRankupForecasterData);
      wrapper.appendChild(exportButton);

      const importButton = makeElement('button', 'mh-ui-import-forecaster-data', 'Import Data');
      importButton.addEventListener('click', importRankupForecassterData);
      wrapper.appendChild(importButton);

      rankup.appendChild(wrapper);
    }, 250);
  });
};

const getUserHighlightingShield = (type) => {
  let text = 'MouseHunt Improved Supporter';
  if ('developer' === type) {
    text = 'MouseHunt Improved Developer';
  }

  const wrapper = makeElement('div', 'blackTooltip');
  makeElement('div', 'hunterInfoView-verifiedUserImage', null, wrapper);
  makeElement('span', 'blackTooltiptext hunterInfoView-verifiedUser', text, wrapper);

  return wrapper;
};

const highlightUsers = () => {
  const id = document.querySelector('.hunterInfoView-hunterId-idText span');
  if (! id) {
    return;
  }

  const profilePage = document.querySelector('#mousehuntContainer.PageHunterProfile');
  if (! profilePage) {
    return;
  }

  const idHeader = document.querySelector('.hunterInfoView-idCardBlock-secondaryHeader');
  if (! idHeader) {
    return;
  }

  // for each key in userHiglighting, check if the user id is in the array and add the key as a class
  Object.keys(userHighlighting).forEach((key) => {
    if (userHighlighting[key].includes(parseInt(id.innerText, 10))) {
      profilePage.classList.add('mh-improved-highlight-user', `mh-improved-${key}`);
      idHeader.appendChild(getUserHighlightingShield(key));
    }
  });
};

const addExportSettings = () => {
  const wrapper = document.querySelector('.mousehuntHud-page-tabContent.mousehunt-improved-settings');
  if (! wrapper) {
    return;
  }

  const exportSettings = makeElement('div', ['mousehunt-improved-export-settings', 'mousehuntActionButton', 'tiny']);
  makeElement('span', '', 'Export Settings', exportSettings);

  exportSettings.addEventListener('click', () => {
    const settings = JSON.stringify(JSON.parse(localStorage.getItem('mousehunt-improved-settings')), null, 2);
    const link = document.createElement('a');
    link.download = 'mousehunt-improved-settings.json';
    link.href = `data:application/json;base64,${btoa(settings)}`;
    link.click();
  });

  wrapper.appendChild(exportSettings);
};

export default () => {
  styles();

  if ('item' === getCurrentPage()) {
    updateItemClassificationLinks();
  }

  addHelpLinks();
  addMouseripLink();
  addDarkModeBodyClass();
  addRankupForecasterButtons();

  onNavigationPatched(addDarkModeBodyClass);
  onRequest(addDarkModeBodyClass);

  onRequest(continueOnKingsReward, 'managers/ajax/users/puzzle.php', true);

  onNavigationPatched(highlightUsers, {
    page: 'hunterprofile'
  });

  onNavigationPatched(addExportSettings, {
    page: 'preferences',
    tab: 'mousehunt-improved-settings',
  });
};
