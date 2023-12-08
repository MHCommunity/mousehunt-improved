import {
  getSetting,
  makeElement,
  onDialogHide,
  onDialogShow,
  onRequest,
  saveSetting
} from '@/utils';

const saveHidden = (upgradeId, isHidden) => {
  saveSetting(upgradeId, isHidden, 'mh-improved-visibility-toggles');
};

const isHidden = (upgradeId) => {
  const setting = getSetting(upgradeId, false, 'mh-improved-visibility-toggles');
  return setting;
};

const getToggleVisibilityMapping = () => {
  return {
    tackle_box: '.prologuePondView-fishingBoat-paperDoll-layer.tackle_box',
    fridge_bait_box: '.prologuePondView-fishingBoat-paperDoll-layer.fridge_bait_box',
    fishing_rod: '.prologuePondView-fishingBoat-paperDoll-layer.fishing_rod',
    fish_net: '.prologuePondView-fishingBoat-paperDoll-layer.fish_net',
    fishing_line: '.prologuePondView-fishingBoat-paperDoll-layer.fishing_line',
    steam_reel: '.prologuePondView-fishingBoat-paperDoll-layer.steam_reel',
    binding_thread: '.tableOfContentsView-bookContainer .tableOfContentsView-bookImage-layer.tableOfContentsView-bookImage-paper',
    leather_cover: '.tableOfContentsView-bookContainer .tableOfContentsView-bookImage-layer.tableOfContentsView-bookImage-binding',
    edge_gilding: '.tableOfContentsView-bookContainer .tableOfContentsView-bookImage-layer.tableOfContentsView-bookImage-silk',
    gold_foil: '.tableOfContentsView-bookContainer .tableOfContentsView-bookImage-layer.tableOfContentsView-bookImage-goldFoil',
  };
};

const toggleAllVisibility = () => {
  const mapping = getToggleVisibilityMapping();
  const upgradeIds = Object.keys(mapping);
  upgradeIds.forEach((upgradeId) => {
    hideOrShowBlock(upgradeId, isHidden(upgradeId));
  });
};

const hideOrShowBlock = (blockId, isBlockToggled) => {
  const mapping = getToggleVisibilityMapping();

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

const addToggle = (upgradeBlock) => {
  if (upgradeBlock.classList.contains('toggle-added')) {
    return;
  }

  const classList = upgradeBlock.classList.value;
  const blockId = classList.replace('folkloreForestRegionView-dialog-block', '').replace('active', '').replace('prologue_pond', '').replace('table_of_contents', '').trim();
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
export default () => {
  onDialogShow(addUpgradeVisibilityToggles, 'fabledForestDialog');
  onDialogHide(() => hasAddedUpgradeVisibilityToggles = false);

  toggleAllVisibility();
  onRequest(toggleAllVisibility);
};
