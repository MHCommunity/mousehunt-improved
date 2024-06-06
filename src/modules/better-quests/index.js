import {
  addStyles,
  getCurrentSubtab,
  getCurrentTab,
  getSetting,
  isUserTitleAtLeast,
  makeElement,
  onNavigation,
  onOverlayChange
} from '@utils';

import settings from './settings';

import m400 from './modules/m400';
import styles from './styles.css';

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
    hg.views.HeadsUpDisplayZugswangLibraryView.showPopup();
  });

  const newQuestsButtonText = document.createElement('span');
  newQuestsButtonText.innerText = 'Quests';

  newQuestsButton.append(newQuestsButtonText);

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
    m400IfEnabled();
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

  if ('hammer' !== getCurrentSubtab()) {
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

  const assignments = [
    'charming_study_hween2014_assignment_quest_item',
    'double_run_advanced_research_quest',
    'extra_spooky_hween2014_assignment_quest_item',
    'furoma_research_quest_item',
    'hg_letter_research_quest_item',
    'lab_monster_1_quest_item',
    'library_adv_hween2013_research_quest_item',
    'library_catalog_quest_item',
    'library_hween2013_research_quest_item',
    'library_m400_bait_research_quest_item',
    'library_m400_research_quest_item',
    'library_mice_research_quest_item',
    'library_power_type_research_quest_item',
    'mystic_advanced_research_quest_item',
    'mystickingresearch_quest_item',
    'pagoda_advanced_research_quest_item',
    'pagoda_research_quest_item',
    'seasonalgardenresearch_quest_item',
    'tech_advanced_research_quest_item',
    'techkingresearch_quest_item',
    'zurreal_trap_research_quest_item',
  ];

  if (! assignments.includes(type)) {
    return;
  }

  const warningText = document.createElement('div');
  warningText.id = 'mh-research-smash-warning';
  warningText.innerText = 'If you smash an assignment, you will have to wait 1 hour until you can get a new one.';

  // append as the first child.
  confirm.insertBefore(warningText, confirm.firstChild);
};

/**
 * Move the error text to the title bar.
 */
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

  errorText = errorText
    .replace(/ \d\d seconds/, '')
    .replace(' before taking', ' for');

  const titleBar = document.querySelector('#jsDialogAjaxPrefix h2');
  if (! titleBar) {
    return;
  }

  const titleError = makeElement('h3', 'errorText', errorText);
  titleBar.parentNode.insertBefore(titleError, titleBar.nextSibling);
};

/**
 * Hide the smash quest text.
 */
const removeSmashText = () => {
  const smashText = document.querySelector('.smashQuest');
  if (smashText) {
    smashText.classList.add('hidden');
  }
};

const assignments = [
  {
    id: 'library_intro_research_assignment_convertible',
    name: 'Catalog Library Mice',
    cost: 0,
    reward: 20,
    rank: false,
  },
  {
    id: '',
    name: 'Library Research',
    cost: 20,
    reward: 30,
    rank: false,
  },
  {
    id: 'zugzwang_research_assignment_convertible',
    name: 'Zugzwang Research',
    cost: 50,
    reward: 80,
    rank: false,
  },
  {
    id: 'furoma_research_assignment_convertible',
    name: 'Furoma Research',
    cost: 130,
    reward: 90,
    rank: false,
  },
  {
    id: 'adv_zugzwang_research_assignment_convertible',
    name: 'Advanced Zugzwang Research',
    cost: 150,
    reward: 150,
    rank: false,
  },
  {
    id: 'zurreal_trap_research_convertible',
    name: 'Zurreal Trap Research',
    cost: 900,
    reward: 400,
    rank: false,
  },
  {
    id: 'library_m400_bait_assignment_convertible',
    name: 'M400 Bait Research Assignment',
    cost: 1500,
    reward: 200,
    rank: true,
  },
  {
    id: 'library_m400_assignment_convertible',
    name: 'M400 Hunting Research Assignment',
    cost: 1900,
    reward: 300,
    rank: true,
  },
];

/**
 * Get the extra text for the assignment.
 *
 * @param {Object} assignment The assignment.
 *
 * @return {string} The extra text.
 */
const getAssignmentMeta = (assignment) => {
  const wikiLink = `https://mhwiki.hitgrab.com/wiki/index.php/Library_Assignment#${assignment.name.replaceAll(' ', '_')}`;
  return `<a href="${wikiLink}" target="_blank" rel="noopener noreferrer">Wiki</a> | Requires: ${assignment.cost} | Reward: ${assignment.reward}`;
};

/**
 * Update the assignments list.
 */
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
    const assignment = assignments.find((a) => a.name === assignmentName);
    if (! assignment) {
      return;
    }

    const requirements = el.parentNode.parentNode.querySelector('.requirements');
    if (! requirements) {
      return;
    }

    const metaWrapper = makeElement('div', 'mh-ui-assignment-meta-wrapper');
    makeElement('div', 'mh-ui-assignment-meta', getAssignmentMeta(assignment), metaWrapper);

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
      hg.views.HeadsUpDisplayZugswangLibraryView.showConfirm(assignment.id);
    });
  });
};

/**
 * Update the assignment list in the popup.
 */
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

/**
 * Check if we're on the hunter's hammer page with the smashQuest hash.
 */
const checkForQuestSmash = () => {
  if (! window.location.hash || '#smashQuest' !== window.location.hash) {
    return;
  }

  if ('crafting' !== getCurrentTab() || 'hammer' !== getCurrentSubtab()) {
    return;
  }

  const assignment = document.querySelector('.inventoryPage-item.quest[data-produced-item="nothing_stat_item"]');
  if (! assignment) {
    return;
  }

  app.pages.InventoryPage.useItem(assignment);
};

/**
 * Run the M400 helper if enabled.
 */
const m400IfEnabled = () => {
  if (getSetting('better-quests.m400-helper', true)) {
    m400();
  }
};

/**
 * The main function of the module.
 */
const main = () => {
  // Don't run if we're not at least a lord.
  if (! isUserTitleAtLeast('lord')) {
    return;
  }

  /**
   * Activate the module.
   */
  const activate = () => {
    addQuestTabEventListener();
    addQuestsTab();
    checkForQuestSmash();
  };

  m400IfEnabled();

  // Add our event listener and add the quests tab.
  activate();

  onNavigation(activate, {
    page: 'camp',
  });

  onNavigation(checkForQuestSmash, {
    page: 'inventory',
    tab: 'crafting',
    subtab: 'hammer',
  });

  onOverlayChange({
    /**
     * When the overlay is shown.
     */
    show: () => {
      addResearchSmashWarning();
      modifyAvailableQuestsPopup();
    },
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-quests');
  main();
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-quests',
  name: 'Better Quests',
  type: 'better',
  default: true,
  description: 'Allows you to open the assignments popup anywhere, improves the UI of the quests tab, and adds a helper for the M400 assignments.',
  load: init,
  settings,
};
