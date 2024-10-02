import {
  getSetting,
  makeElement,
  onDialogHide,
  onDialogShow,
  onRequest,
  onTurn,
  saveSetting
} from '@utils';

/**
 * Save the hidden state of an upgrade.
 *
 * @param {string}  upgradeId The ID of the upgrade.
 * @param {boolean} isHidden  The hidden state.
 */
const saveHidden = (upgradeId, isHidden) => {
  const upgradeIds = getSetting('location-huds.folklore-forest-visibility-toggles', {});
  upgradeIds[upgradeId] = isHidden;

  saveSetting('location-huds.folklore-forest-visibility-toggles', upgradeIds);
};

/**
 * Check if an upgrade is hidden.
 *
 * @param {string} upgradeId The ID of the upgrade.
 *
 * @return {boolean} If the upgrade is hidden.
 */
const isHidden = (upgradeId) => {
  const setting = getSetting('location-huds.folklore-forest-visibility-toggles', {});
  return setting[upgradeId] || false;
};

/**
 * Get the visibility mapping for the upgrades.
 *
 * @return {Object} The visibility mapping.
 */
const getToggleVisibilityMapping = () => {
  return {
    tackle_box: '.prologuePondView-fishingBoat-paperDoll-layer.tackle_box',
    fridge_bait_box: '.prologuePondView-fishingBoat-paperDoll-layer.fridge_bait_box',
    fishing_rod: '.prologuePondView-fishingBoat-paperDoll-layer.fishing_rod',
    fish_net: '.prologuePondView-fishingBoat-paperDoll-layer.fish_net',
    fishing_line: '.prologuePondView-fishingBoat-paperDoll-layer.fishing_line',
    steam_reel: '.prologuePondView-fishingBoat-paperDoll-layer.steam_reel',
    binding_thread: '.tableOfContentsView-bookContainer.active .tableOfContentsView-bookImage-layer.tableOfContentsView-bookImage-paper',
    leather_cover: '.tableOfContentsView-bookContainer.active .tableOfContentsView-bookImage-layer.tableOfContentsView-bookImage-binding',
    edge_gilding: '.tableOfContentsView-bookContainer.active .tableOfContentsView-bookImage-layer.tableOfContentsView-bookImage-silk',
    gold_foil: '.tableOfContentsView-bookContainer.active .tableOfContentsView-bookImage-layer.tableOfContentsView-bookImage-goldFoil',
    silver_quill: '',
    golden_quill: '',
  };
};

/**
 * Toggle the visibility of all upgrades.
 */
const toggleAllVisibility = () => {
  const mapping = getToggleVisibilityMapping();
  const upgradeIds = Object.keys(mapping);

  if (upgradeIds.length === 0) {
    return;
  }

  upgradeIds.forEach((upgradeId) => {
    hideOrShowBlock(upgradeId, isHidden(upgradeId));
  });
};

/**
 * Check if an upgrade is unlocked.
 *
 * @param {string} upgradeId The ID of the upgrade.
 *
 * @return {boolean} If the upgrade is unlocked.
 */
const isUnlocked = (upgradeId) => {
  let userQuest;

  if (user.quests?.QuestTableOfContents) {
    userQuest = user.quests.QuestTableOfContents;
  } else if (user.quests?.QuestProloguePond) {
    userQuest = user.quests.QuestProloguePond;
  } else if (user.quests?.QuestForewordFarm) {
    userQuest = user.quests.QuestForewordFarm;
  } else {
    return false;
  }

  if (! userQuest || ! userQuest.upgrades) {
    return false;
  }

  const upgrade = userQuest.upgrades.find((u) => u.type === upgradeId);
  if (! upgrade) {
    return false;
  }

  return upgrade.is_unlocked;
};

/**
 * Hide or show an upgrade block.
 *
 * @param {string}  blockId        The ID of the block.
 * @param {boolean} isBlockToggled If the block is toggled.
 */
const hideOrShowBlock = (blockId, isBlockToggled) => {
  const mapping = getToggleVisibilityMapping();

  if (! mapping[blockId]) {
    const quill = document.querySelector('.tableOfContentsProgressView-quillContainer');
    if (! quill) {
      return;
    }
    // if it's a quill, we need to remove the 'quill--gold' or 'quill--silver' class from the quill.

    if (isBlockToggled) {
      if ('golden_quill' === blockId) {
        quill.classList.remove('quill--gold');
      } else if ('silver_quill' === blockId) {
        quill.classList.remove('quill--silver');
      }

      return;
    }

    // Not toggled, so re-add the class.
    if ('golden_quill' === blockId && isUnlocked('golden_quill')) {
      quill.classList.add('quill--gold');
    } else if ('silver_quill' === blockId && isUnlocked('silver_quill')) {
      quill.classList.add('quill--silver');
    }

    return;
  }

  if (! isUnlocked(blockId)) {
    return;
  }

  const selector = mapping[blockId];
  if (! selector) {
    return;
  }

  const element = document.querySelector(selector);
  if (! element) {
    return;
  }

  element.classList.toggle('active', ! isBlockToggled);
};

/**
 * Add a toggle to an upgrade block.
 *
 * @param {HTMLElement} upgradeBlock The upgrade block.
 */
const addToggle = (upgradeBlock) => {
  if (upgradeBlock.classList.contains('toggle-added')) {
    return;
  }

  const classList = upgradeBlock.classList.value;
  const blockId = classList
    .replace('folkloreForestRegionView-dialog-block', '')
    .replace('active', '')
    .replace('prologue_pond', '')
    .replace('table_of_contents', '')
    .trim();
  let isBlockToggled = isHidden(blockId);

  const toggle = makeElement('div', ['mhui-folklore-forest-upgrade-toggle', 'mousehuntActionButton', 'tiny', 'lightBlue']);
  const toggleText = makeElement('span', 'upgrade-toggle-text', isBlockToggled ? 'Show' : 'Hide');
  toggle.append(toggleText);

  toggle.addEventListener('click', () => {
    isBlockToggled = ! isBlockToggled;
    saveHidden(blockId, isBlockToggled);
    toggleText.innerText = isBlockToggled ? 'Show' : 'Hide';

    hideOrShowBlock(blockId, isBlockToggled);

    upgradeBlock.classList.toggle('toggle-is-hidden', isBlockToggled);
  });

  const action = upgradeBlock.querySelector('.folkloreForestRegionView-dialog-block-action');
  if (action) {
    action.append(toggle);
  } else {
    upgradeBlock.append(toggle);
  }

  upgradeBlock.classList.add('toggle-added');
  upgradeBlock.classList.add(isBlockToggled ? 'toggle-is-hidden' : 'toggle-is-visible');
};

/**
 * Add the upgrade visibility toggles.
 */
const addUpgradeVisibilityToggles = () => {
  if (hasAddedUpgradeVisibilityToggles) {
    return;
  }

  hasAddedUpgradeVisibilityToggles = true;
  // log a trace so we can see why this is being called twice.
  const pondUpgrades = document.querySelectorAll('.folkloreForestRegionView-dialog-blockContainer.upgrades .folkloreForestRegionView-dialog-block.prologue_pond.active');
  const bookUpgrades = document.querySelectorAll('.folkloreForestRegionView-dialog-blockContainer.upgrades .folkloreForestRegionView-dialog-block.table_of_contents.active');

  if (! pondUpgrades || ! bookUpgrades) {
    return;
  }

  for (const upgrade of pondUpgrades) {
    addToggle(upgrade);
  }

  for (const upgrade of bookUpgrades) {
    addToggle(upgrade);
  }
};

let hasAddedUpgradeVisibilityToggles = false;

/**
 * Initialize the module.
 */
export default async () => {
  toggleAllVisibility();
  onDialogShow('fabledForestDialog', addUpgradeVisibilityToggles);
  onDialogHide(() => (hasAddedUpgradeVisibilityToggles = false));
  onTurn(toggleAllVisibility, 500);
  onRequest('*', toggleAllVisibility);
};
