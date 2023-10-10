import { addUIStyles } from '../utils';
// import m400 from './m400';
import styles from './styles.css';
import libraryAssignments from '../../data/library-assignments.json';

/**
 * Update the text (and fix the link) for the 'smash this assignment' text.
 */
const updateObjectiveFooterDisplay = () => {
  const footerText = document.querySelector('.campPage-quests-footer-smash');
  if (! footerText) {
    return;
  }

  const newHref = footerText.getAttribute('href').replace('subtab', 'sub_tab');
  footerText.setAttribute('href', `${newHref}#smashQuest`);
  footerText.innerHTML = footerText.innerHTML.replace('Don\'t like an assignment? Cancel it by smashing the assignment ', 'Cancel this assignment by smashing it ');
};

/**
 * Add the quests tab if we don't have an assignment, so we can grab one from anywhere.
 */
const addQuestsTab = () => {
  // Bail if we don't have the tabs.
  const tabs = document.querySelector('.campPage-tabs-tabRow');
  if (! tabs) {
    return;
  }

  // Bail if we already did it.
  const existing = tabs.querySelector('a[data-tab="quests"]');
  if (existing) {
    return;
  }

  // Make the new tab.
  const newQuestsButton = document.createElement('a');
  newQuestsButton.classList.add('campPage-tabs-tabHeader');
  newQuestsButton.classList.add('quests');
  newQuestsButton.setAttribute('data-tab', 'quests');

  // Fire the popup when the tab is clicked.
  newQuestsButton.addEventListener('click', () => {
    hg.views.HeadsUpDisplayZugswangLibraryView.showPopup(); // eslint-disable-line no-undef
  });

  const newQuestsButtonText = document.createElement('span');
  newQuestsButtonText.innerText = 'Quests';

  newQuestsButton.appendChild(newQuestsButtonText);

  tabs.insertBefore(newQuestsButton, tabs.lastChild);
};

/**
 * Watch the quest tab for changes.
 */
const addQuestTabEventListener = () => {
  // Grab the quest tab content.
  const questTabContent = document.querySelector('.campPage-tabs-tabContent[data-tab="quests"]');
  if (! questTabContent) {
    return;
  }

  // Add an observer to the quest tab content.
  const observer = new MutationObserver(() => {
    updateObjectiveFooterDisplay();
    m400();
  });

  observer.observe(questTabContent, { childList: true });
};

/**
 * Add a warning when smashing a research assignment.
 */
const addResearchSmashWarning = () => {
  const existing = document.querySelector('#mh-research-smash-warning');
  if (existing) {
    existing.remove();
  }

  const subtab = hg.utils.PageUtil.getCurrentPageSubTab();
  if ('hammer' !== subtab) {
    return;
  }

  const confirm = document.querySelector('.inventoryPage-confirmPopup');
  if (! confirm) {
    return;
  }

  const type = confirm.getAttribute('data-item-type');
  if (! type) {
    return;
  }

  if (! libraryAssignments.all.includes(type)) {
    return;
  }

  const warningText = document.createElement('div');
  warningText.id = 'mh-research-smash-warning';
  warningText.innerText = 'If you smash an assignment, you will have to wait 1 hour until you can get a new one.';

  // append as the first child.
  confirm.insertBefore(warningText, confirm.firstChild);
};

const moveErrorText = () => {
  const errorTextEl = document.querySelectorAll('.questLink .requirements .error');
  if (! errorTextEl) {
    return;
  }

  let errorText = '';
  errorTextEl.forEach((el) => {
    if (el.innerText) {
      errorText = el.innerText;
    }

    el.classList.add('hidden');
  });

  if (! errorText) {
    return;
  }

  errorText = errorText.replace(/ \d\d seconds/, '').replace(' before taking', ' for');

  const titleBar = document.querySelector('#jsDialogAjaxPrefix h2');
  if (! titleBar) {
    return;
  }

  const titleError = makeElement('h3', 'errorText', errorText);
  titleBar.parentNode.insertBefore(titleError, titleBar.nextSibling);
};

const removeSmashText = () => {
  const smashText = document.querySelector('.smashQuest');
  if (smashText) {
    smashText.classList.add('hidden');
  }
};

const updateAssignmentList = () => {
  const assignmentList = document.querySelectorAll('#overlayPopup.zugzwangsLibraryQuestShopPopup .questLink');
  if (! assignmentList) {
    return;
  }

  assignmentList.forEach((outerEl) => {
    const el = outerEl.querySelector('.content b');
    if (! el) {
      return;
    }

    // Get the assignment name.
    const assignmentName = el.innerText;

    // get the assignment from the list.
    const assignment = libraryAssignments.data.find((a) => a.name === assignmentName);
    if (! assignment) {
      return;
    }

    const requirements = el.parentNode.parentNode.querySelector('.requirements');
    if (! requirements) {
      return;
    }

    const metaWrapper = makeElement('div', 'mh-ui-assignment-meta-wrapper');
    const wikiLink = makeElement('a', 'mh-ui-assignment-wiki', `View on MHWiki →`, metaWrapper);
    wikiLink.href = `https://mhwiki.hitgrab.com/wiki/index.php/Library_Assignment#${assignment.name.replace(/ /g, '_')}`;
    makeElement('div', 'mh-ui-assignment-cost', `Requires: ${assignment.cost} library points`, metaWrapper);
    makeElement('div', 'mh-ui-assignment-reward', `Reward: ${assignment.reward} library points`, metaWrapper);

    requirements.parentNode.insertBefore(metaWrapper, requirements.nextSibling);
    // remove the requirements.
    requirements.remove();

    if ('M400 Hunting Research Assignment' === assignmentName) {
      const m400Wrapper = makeElement('div', ['content', 'mh-ui-m400-wrapper']);
      makeElement('b', 'mh-ui-m400-title', assignmentName, m400Wrapper); // b tag just to match.
      makeElement('span', 'mh-ui-m400-content', 'This envelope contains a Research Assignment that will have you looking for the elusive M400 prototype.', m400Wrapper);

      // replace the .content with our new content.
      el.parentNode.parentNode.querySelector('.content').replaceWith(m400Wrapper);
    }

    // remove the onclick.
    outerEl.removeAttribute('onclick');

    const button = outerEl.querySelector('.actions .mousehuntActionButton');
    if (! button) {
      return;
    }

    button.addEventListener('click', () => {
      hg.views.HeadsUpDisplayZugswangLibraryView.showConfirm(assignment.id); // eslint-disable-line no-undef
    });
  });
};

const modifyAvailableQuestsPopup = () => {
  if (! document.querySelector('#overlayPopup.zugzwangsLibraryQuestShopPopup')) {
    return;
  }

  updateAssignmentList();

  const isError = document.querySelector('.questLink .requirements .error');
  if (isError) {
    moveErrorText();
    removeSmashText();
  }
};

const checkForQuestSmash = () => {
  if (! window.location.hash || '#smashQuest' !== window.location.hash) {
    return;
  }

  if ('crafting' !== getCurrentTab() || 'hammer' !== getCurrentSubtab()) { // eslint-disable-line no-undef
    return;
  }

  const assignment = document.querySelector('.inventoryPage-item.quest[data-produced-item="nothing_stat_item"]');
  if (! assignment) {
    return;
  }

  app.pages.InventoryPage.useItem(assignment); // eslint-disable-line no-undef
};

const main = () => {
  const activate = () => {
    addQuestTabEventListener();
    addQuestsTab();
    checkForQuestSmash();
  };

  // m400();

  // Add our event listener and add the quests tab.
  activate();

  onNavigation(activate, {
    page: 'camp'
  });

  onNavigation(checkForQuestSmash, {
    page: 'inventory',
    tab: 'crafting',
    subtab: 'hammer',
  });

  onOverlayChange({
    show: () => {
      addResearchSmashWarning();
      modifyAvailableQuestsPopup();
    }
  });
};

export default () => {
  addUIStyles(styles);
  main();
};
