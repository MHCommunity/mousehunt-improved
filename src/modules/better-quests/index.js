import {
  addStyles,
  getCurrentSubtab,
  getCurrentTab,
  getSetting,
  getUserItems,
  isUserTitleAtLeast,
  makeElement,
  onNavigation,
  onOverlayChange,
  onRequest
} from '@utils';

import settings from './settings';

import m400 from './modules/m400';
import styles from './styles.css';

import assignmentDetails from '@data/library-assignments.json';

const questAssignments = new Set([
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
]);

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

  footerText.addEventListener('click', (e) => {
    e.preventDefault();

    // Search through all the user.quests objects to find one that has is_assignment = true and a type that ends with _quest_item.
    const assignment = Object.values(user.quests).find((quest) => {
      return quest.is_assignment && quest.type.endsWith('_quest_item');
    });

    if (! assignment) {
      return;
    }

    e.target.classList.add('inventoryPage-item');
    e.target.setAttribute('data-item-type', assignment.type);
    e.target.setAttribute('data-produced-item', 'nothing_stat_item');

    app.pages.InventoryPage.showConfirmPopup(e.target, 'hammer');

    e.target.classList.remove('inventoryPage-item');
  });
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
  const newQuestsButton = makeElement('a', ['campPage-tabs-tabHeader', 'quests']);
  newQuestsButton.setAttribute('data-tab', 'quests');

  // Fire the popup when the tab is clicked.
  newQuestsButton.addEventListener('click', () => {
    hg.views.HeadsUpDisplayZugswangLibraryView.showPopup();
  });

  makeElement('span', '', 'Quests', newQuestsButton);

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

  if (! questAssignments.has(type)) {
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

/**
 * Update the assignments list.
 */
const updateAssignmentList = async () => {
  const assignmentList = document.querySelectorAll('#overlayPopup.zugzwangsLibraryQuestShopPopup .questLink');
  if (! assignmentList) {
    return;
  }

  assignmentList.forEach((questLink) => {
    let type = questLink.getAttribute('data-quest-type');
    if (! type) {
      // Get the details about the assignment.
      const onclickAttr = questLink.getAttribute('onclick') || '';
      if (! onclickAttr.includes('hg.views.HeadsUpDisplayZugswangLibraryView.showConfirm')) {
        return;
      }

      type = onclickAttr.replace('hg.views.HeadsUpDisplayZugswangLibraryView.showConfirm(\'', '').replace('\'); return false;', '');
      if (! type) {
        return;
      }
    }

    questLink.removeAttribute('onclick');
    const actionButton = questLink.querySelector('.actions .mousehuntActionButton');
    if (actionButton) {
      actionButton.setAttribute('onclick', `hg.views.HeadsUpDisplayZugswangLibraryView.showConfirm('${type}'); return false;`);
    }

    const content = questLink.querySelector('.content');
    if (! content) {
      return;
    }

    const name = content.querySelector('b');
    if (! name) {
      return;
    }

    // Set the attribute because we blank the onclick later.
    questLink.setAttribute('data-quest-type', type);

    const assignment = assignmentDetails[type];

    // Remove the requirements as we're going to replace them.
    const requirements = questLink.querySelector('.requirements');
    if (requirements) {
      requirements.remove();
    }

    const metaWrapper = makeElement('div', 'mh-ui-assignment-meta-wrapper');

    const cost = makeElement('div', ['mh-ui-assignment-price', 'mh-ui-assignment-cost']);
    makeElement('span', 'mh-ui-assignment-price-label', 'Requires', cost);
    makeElement('strong', 'mh-ui-assignment-price-value', assignment.cost, cost);
    metaWrapper.append(cost);

    const reward = makeElement('div', ['mh-ui-assignment-price', 'mh-ui-assignment-reward']);
    makeElement('span', 'mh-ui-assignment-price-label', 'Reward', reward);
    makeElement('strong', 'mh-ui-assignment-price-value', assignment.rewardPoints, reward);
    metaWrapper.append(reward);

    const wiki = makeElement('a', 'mh-ui-assignment-wiki-button', 'View on Wiki →');
    wiki.href = `https://mhwiki.hitgrab.com/wiki/index.php/Library_Assignment#${assignment.name.replaceAll(' ', '_')}`;
    wiki.target = '_blank';
    wiki.rel = 'noreferrer';
    metaWrapper.append(wiki);

    // Insert it after the content.
    content.after(metaWrapper);

    if ('M400 Hunting Research Assignment' === assignment.name) {
      const m400Wrapper = makeElement('div', ['content', 'mh-ui-m400-wrapper']);
      makeElement('b', 'mh-ui-m400-title', assignment.name, m400Wrapper); // b tag just to match.
      makeElement('span', 'mh-ui-m400-content', 'This envelope contains a Research Assignment that will have you looking for the elusive M400 prototype.', m400Wrapper);

      // replace the .content with our new content.
      if (content) {
        content.replaceWith(m400Wrapper);
      }
    }

    if (assignment.assignments) {
      const assigmentDetails = makeElement('details', 'mh-ui-assignment-details');
      makeElement('summary', 'mh-ui-assignment-details-summary', 'Assignment Details', assigmentDetails);

      for (const singleAssignment of assignment.assignments) {
        const assignmentWrapper = makeElement('div', 'mh-ui-assignment-details-wrapper');
        makeElement('h4', 'mh-ui-assignment-details-title', singleAssignment.name, assignmentWrapper);

        const singleAssignmentTasks = singleAssignment.tasks || [];
        for (const task of singleAssignmentTasks) {
          // Title.
          const taskEl = makeElement('div', 'mh-ui-assignment-details-task');
          makeElement('h5', 'mh-ui-assignment-details-task-title', task.title, taskEl);

          // Tasks.
          const taskList = makeElement('ul', 'mh-ui-assignment-details-task-list');
          if (Array.isArray(task.text)) {
            for (const taskItem of task.text) {
              makeElement('li', 'mh-ui-assignment-details-task-item', taskItem, taskList);
            }
          } else {
            makeElement('li', 'mh-ui-assignment-details-task-item', task.text, taskList);
          }

          taskEl.append(taskList);
          assignmentWrapper.append(taskEl);
        }

        assigmentDetails.append(assignmentWrapper);
      }

      content.append(assigmentDetails);
    }

    if (assignment.rewards) {
      const rewardsWrapper = makeElement('details', 'mh-ui-assignment-details-wrapper');
      makeElement('summary', 'mh-ui-assignment-details-summary', 'Rewards', rewardsWrapper);

      const rewardsList = makeElement('ul', 'mh-ui-assignment-details-task-list');
      for (const singleReward of assignment.rewards) {
        makeElement('li', 'mh-ui-assignment-details-task-item', singleReward, rewardsList);
      }

      rewardsWrapper.append(rewardsList);

      content.append(rewardsWrapper);
    }
  });

  // Add our wisdom tomes to the sidebar too.
  const resources = document.querySelector('#overlayPopup.zugzwangsLibraryQuestShopPopup .questResources');
  if (! resources) {
    return;
  }

  const tomeDetails = await getUserItems([
    'library_boss_trinket', // not a tome but we want it here.
    'tome_of_wisdom_yellow_convertible',
    'tome_of_wisdom_green_convertible',
    'tome_of_wisdom_blue_convertible',
    'tome_of_wisdom_convertible', // purple.
    'tome_of_wisdom_red_convertible',
    'tome_of_wisdom_white_convertible' // silver.
  ]);

  if (tomeDetails) {
    for (const tome of tomeDetails) {
      if (! tome.type) {
        continue;
      }

      const tomeEl = makeElement('div', ['item', 'mh-ui-quest-resources']);
      const imageEl = makeElement('div', 'itemImage');

      const image = makeElement('img');
      image.src = tome.thumbnail_transparent || tome.thumbnail || tome.image || '';
      imageEl.append(image);

      makeElement('div', 'quantity', tome.quantity || 0, imageEl);

      tomeEl.append(imageEl);

      makeElement('span', 'itemName', tome.name || '', tomeEl);

      tomeEl.addEventListener('click', () => {
        hg.views.ItemView.show(tome.type);
      });

      resources.append(tomeEl);
    }
  }
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
 * Reset the quests tab after smashing a quest.
 *
 * @param {Object} request The request object.
 * @param {Object} data    The data object.
 */
const restoreQuestTabAfterSmash = (request, data) => {
  if (! (data && data.item_type && questAssignments.has(data.item_type))) {
    return;
  }

  const questsTab = document.querySelector('.campPage-tabs-tabHeader.quests');
  if (! questsTab) {
    return;
  }

  questsTab.remove();
  addQuestsTab();
};

/**
 * Run the M400 helper if enabled.
 */
const m400IfEnabled = () => {
  if (! getSetting('better-quests.m400-helper', true)) {
    return;
  }

  m400();
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

  onRequest('users/usehammer.php', restoreQuestTabAfterSmash);
};

/**
 * Initialize the module.
 */
const init = () => {
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
  description: 'Allow opening the assignments popup anywhere, improve the UI of the quests tab, and add a helper for the M400 assignments.',
  load: init,
  settings,
};
