import { addUIStyles } from '../../utils';
import styles from './styles.css';
import m400 from './m400';

/**
 * Update the text (and fix the link) for the 'smash this assignment' text.
 */
const updateObjectiveFooterDisplay = () => {
  const footerText = document.querySelector('.campPage-quests-footer-smash');
  if (! footerText) {
    return;
  }

  footerText.setAttribute('href', footerText.getAttribute('href').replace('subtab', 'sub_tab'));
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

  const assignments = [
    'double_run_advanced_research_quest',
    'seasonalgardenresearch_quest_item',
    'library_adv_hween2013_research_quest_item',
    'mystickingresearch_quest_item',
    'extra_spooky_hween2014_assignment_quest_item',
    'library_m400_research_quest_item',
    'charming_study_hween2014_assignment_quest_item',
    'zurreal_trap_research_quest_item',
    'library_hween2013_research_quest_item',
    'pagoda_research_quest_item',
    'techkingresearch_quest_item',
    'library_power_type_research_quest_item',
    'library_m400_bait_research_quest_item',
    'pagoda_advanced_research_quest_item',
    'furoma_research_quest_item',
    'library_mice_research_quest_item',
    'hg_letter_research_quest_item',
    'library_catalog_quest_item',
    'mystic_advanced_research_quest_item',
    'tech_advanced_research_quest_item',
    'lab_monster_1_quest_item',
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

const main = () => {
  const activate = () => {
    addQuestTabEventListener();
    addQuestsTab();
  };

  // Add our event listener and add the quests tab.
  activate();

  onPageChange({ camp: { show: activate } });
  onOverlayChange({ show: addResearchSmashWarning });
};

export default () => {
  addUIStyles(styles);
  main();
};
