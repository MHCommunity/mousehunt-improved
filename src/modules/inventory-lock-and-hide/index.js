import {
  addEvent,
  addStyles,
  getCurrentPage,
  getCurrentTab,
  getData,
  getSetting,
  makeElement,
  onEvent,
  onNavigation,
  onRequest,
  saveSetting
} from '@utils';

import styles from './styles.css';

const saveSettings = (shouldUpdateTitles = true) => {
  saveSetting('inventory-lock-and-hide.items', itemSettings);
  if (shouldUpdateTitles) {
    updateGroupTitles();
  }
};

const getSettings = () => {
  return getSetting('inventory-lock-and-hide.items', {
    locked: [],
    hidden: [],
  });
};

const shouldAddLocks = (currentTab) => {
  return 'collectibles' !== currentTab || 'bait' !== currentTab;
};

const addControlsToItems = async () => {
  const items = document.querySelectorAll('.inventoryPage-item');
  if (! items) {
    return;
  }

  const currentTab = getCurrentTab();

  items.forEach((item) => {
    let id = item.getAttribute('data-item-id');
    id = Number.parseInt(id, 10);
    if (! id) {
      return;
    }

    const hasControls = item.querySelector('.mhui-inventory-lock-and-hide-item-controls');
    if (hasControls) {
      return;
    }

    let isLocked = itemSettings?.locked ? itemSettings.locked.includes(id) : false;
    let isHidden = itemSettings?.hidden ? itemSettings.hidden.includes(id) : false;

    const controls = makeElement('div', 'mhui-inventory-lock-and-hide-item-controls');

    if (shouldAddLocks(currentTab)) {
      const lock = makeElement('div', ['mousehuntActionButton', 'tiny', 'mhui-inventory-lock-and-hide-controls-lock']);
      const lockText = makeElement('span', '', isLocked ? 'Unlock' : 'Lock');
      lock.append(lockText);

      const clickLock = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLocked) {
          itemSettings.locked = itemSettings.locked.filter((i) => i !== id);
          lockText.innerText = 'Lock';
          isLocked = false;
          item.classList.remove('locked');
        } else {
          itemSettings.locked.push(id);
          lockText.innerText = 'Unlock';
          isLocked = true;
          item.classList.add('locked');
        }

        saveSettings();
      };

      lock.addEventListener('click', clickLock);

      controls.addEventListener('click', (e) => {
        if ((e.altKey && e.shiftKey) || e.metaKey) {
          clickLock(e);
        }
      });

      controls.append(lock);
    }

    const hide = makeElement('div', ['mousehuntActionButton', 'tiny', 'mhui-inventory-lock-and-hide-controls-hide']);
    const hideText = makeElement('span', '', isHidden ? 'Show' : 'Hide');
    hide.append(hideText);

    const clickHide = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isHidden) {
        itemSettings.hidden = itemSettings.hidden.filter((i) => i !== id);
        hideText.innerText = 'Hide';
        isHidden = false;
        item.classList.remove('hidden');
      } else {
        itemSettings.hidden.push(id);
        hideText.innerText = 'Show';
        isHidden = true;
        item.classList.add('hidden');
      }

      saveSettings();
    };

    hide.addEventListener('click', clickHide);

    controls.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.altKey && ! e.shiftKey) {
        clickHide(e);
      }
    });

    controls.append(hide);

    item.append(controls);
  });
};

const updateGroupTitles = () => {
  const container = getCurrentTabContainer();
  if (! container) {
    return;
  }

  const groups = container.querySelectorAll('.inventoryPage-tagContent-tagGroup');
  if (! groups) {
    return;
  }

  groups.forEach((group) => {
    // find the group title, count how many items we hid in this group and add it to the title.
    const title = group.querySelector('.inventoryPage-tagContent-tagTitle');
    if (! title) {
      return;
    }

    const hiddenItems = group.querySelectorAll('.inventoryPage-item.hidden');
    if (! hiddenItems) {
      return;
    }

    const existingCount = title.querySelector('.mhui-inventory-lock-and-hide-hidden-count');
    if (existingCount) {
      existingCount.remove();
    }

    if (0 === hiddenItems.length) {
      return;
    }

    makeElement('span', 'mhui-inventory-lock-and-hide-hidden-count', ` (${hiddenItems.length} hidden)`, title);
  });
};

const maybeLockOrHideItems = async () => {
  const items = document.querySelectorAll('.inventoryPage-item');
  if (! items) {
    return;
  }

  for (const item of items) {
    let id = item.getAttribute('data-item-id');
    id = Number.parseInt(id, 10);
    if (! id) {
      return;
    }

    if (itemSettings?.locked?.length > 0 && itemSettings.locked.includes(id)) {
      item.classList.add('locked');
    }

    if (itemSettings?.hidden?.length > 0 && itemSettings.hidden.includes(id)) {
      item.classList.add('hidden');
    }
  }

  updateGroupTitles();
};

const addBulkControls = () => {
  if (! shouldAddLocks(getCurrentTab())) {
    return;
  }

  const container = getCurrentTabContainer();
  if (! container) {
    return;
  }

  // Get all of the groups and add a bulk lock and hide button.
  const groups = container.querySelectorAll('.inventoryPage-tagContent-tagGroup');
  if (! groups) {
    return;
  }

  groups.forEach((group) => {
    const title = group.querySelector('.inventoryPage-tagContent-tagTitle');
    if (! title) {
      return;
    }

    const existingControls = title.querySelector('.mhui-inventory-lock-and-hide-bulk-controls');
    if (existingControls) {
      return;
    }

    const controls = makeElement('div', 'mhui-inventory-lock-and-hide-bulk-controls');

    const lock = makeElement('div', ['mousehuntActionButton', 'tiny', 'mhui-inventory-lock-and-hide-controls-lock']);
    const lockText = makeElement('span', '', 'Lock All');
    lock.append(lockText);

    lock.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const items = group.querySelectorAll('.inventoryPage-item');
      if (! items) {
        return;
      }

      items.forEach((item) => {
        const id = item.getAttribute('data-item-id');
        if (! id) {
          return;
        }

        if (itemSettings.locked.includes(id)) {
          return;
        }

        itemSettings.locked.push(id);
        item.classList.add('locked');

        const lockButtonText = item.querySelector('.mhui-inventory-lock-and-hide-controls-lock span');
        if (lockButtonText) {
          lockButtonText.innerText = 'Unlock';
        }
      });

      saveSettings(false);
    });

    controls.append(lock);

    const unlock = makeElement('div', ['mousehuntActionButton', 'tiny', 'mhui-inventory-lock-and-hide-controls-lock']);
    const unlockText = makeElement('span', '', 'Unlock All');
    unlock.append(unlockText);

    unlock.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const items = group.querySelectorAll('.inventoryPage-item');
      if (! items) {
        return;
      }

      items.forEach((item) => {
        const id = item.getAttribute('data-item-id');
        if (! id) {
          return;
        }

        if (! itemSettings.locked.includes(id)) {
          return;
        }

        itemSettings.locked = itemSettings.locked.filter((i) => i !== id);
        item.classList.remove('locked');

        const lockButtonText = item.querySelector('.mhui-inventory-lock-and-hide-controls-lock span');
        if (lockButtonText) {
          lockButtonText.innerText = 'Lock';
        }
      });

      saveSettings();
    });

    controls.append(unlock);
    title.append(controls);
  });
};

const getCurrentTabContainer = () => {
  let currentTab = getCurrentTab();
  if (! currentTab || 'inventory' === currentTab) {
    currentTab = 'cheese';
  }

  return document.querySelector(`.mousehuntHud-page-tabContent.${currentTab} .mousehuntHud-page-subTabContent.active`);
};

const addLockAndHideControls = () => {
  if ('inventory' !== getCurrentPage()) {
    return;
  }

  let currentTab = getCurrentTab();
  if (! currentTab || 'inventory' === currentTab) {
    currentTab = 'cheese';
  }

  if (
    'crafting' === currentTab ||
    'plankrun' === currentTab
  ) {
    return;
  }

  const container = getCurrentTabContainer();
  if (! container) {
    return;
  }

  if (container.hasAttribute('mh-improved-inventory-lock-and-hide')) {
    return;
  }

  container.setAttribute('mh-improved-inventory-lock-and-hide', true);

  const controlsWrapper = makeElement('div', 'mhui-inventory-lock-and-hide-controls-wrapper');

  const controls = makeElement('div', ['mousehuntActionButton', 'tiny', 'mhui-inventory-lock-and-hide-controls']);
  const text = makeElement('span', '', 'Toggle Lock/Hide');
  controls.append(text);

  let isEditing = false;
  controls.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    addBulkControls();
    addControlsToItems();

    isEditing = ! isEditing;

    container.setAttribute('mhui-inventory-lock-and-hide-controls-active', isEditing);

    container.classList.toggle('mhui-inventory-lock-and-hide-controls-active');
  });

  controlsWrapper.append(controls);
  container.prepend(controlsWrapper);
};

const toggleControls = () => {
  const button = document.querySelector('.mhui-inventory-lock-and-hide-controls');
  if (button) {
    button.click();
  }
};

const onSetPage = () => {
  main();
  addEvent('ajax_request', main, { removeAfterFire: true, id: 'inventory-lock-and-hide' });
};

// TODO: this doesn't take owned items into for the category hiding
const addHideStyles = (items) => {
  if (! items || ! items.components) {
    return;
  }

  const classifications = ['base', 'weapon', 'bait', 'trinket'];

  const tagsToHide = {
    base: [],
    weapon: [],
    bait: [],
    trinket: [],
  };

  // Initialize an object to store items by tags
  const itemsByTags = {
    base: {},
    weapon: {},
    bait: {},
    trinket: {},
  };

  // Group items by their tags
  items.components.forEach((item) => {
    if (! item.tag_types || ! item.classification) {
      return;
    }

    // if the item.classification is not in the classifications array, skip it
    if (! classifications.includes(item.classification)) {
      return;
    }

    item.tag_types.forEach((tag) => {
      if (! itemsByTags[item.classification][tag]) {
        itemsByTags[item.classification][tag] = new Set();
      }

      itemsByTags[item.classification][tag].add(item.item_id);
    });
  });

  // Get the tags to hide
  classifications.forEach((classification) => {
    const tags = Object.keys(itemsByTags[classification]);
    tags.forEach((tag) => {
      // if itemSettings.hidden includes all items in this tag, hide the tag
      if ([...itemsByTags[classification][tag]].every((id) => itemSettings.hidden.includes(id))) {
        tagsToHide[classification].push(tag);
      }
    });
  });

  // Generate styles to hide tags and items
  const hideTagsStyles = classifications.flatMap((classification) =>
    tagsToHide[classification].map((tag) => `.${classification} .campPage-trap-itemBrowser-tagGroup.${tag}`)
  ).join(',');

  const hideItemsStyles = itemSettings.hidden.map((id) => `.campPage-trap-itemBrowser-items .campPage-trap-itemBrowser-item[data-item-id="${id}"]`).join(',');

  // Add styles to hide tags and items
  addStyles(`${hideTagsStyles}, ${hideItemsStyles} { display: none; }`, 'inventory-lock-and-hide-hide-styles');
};

const hideItemsInTrapBrowser = () => {
  if (itemSettings?.hidden && itemSettings.hidden.length > 0) {
    const hideItemsStyles = itemSettings.hidden.map((id) => `.campPage-trap-itemBrowser-items .campPage-trap-itemBrowser-item[data-item-id="${id}"]`).join(',');

    // Add styles to hide tags and items
    addStyles(`${hideItemsStyles} { display: none; }`, 'inventory-lock-and-hide-hide-styles');
  }
};

const main = async () => {
  itemSettings = getSettings();
  mhItems = await getData('items');

  maybeLockOrHideItems();
  addLockAndHideControls();
};

/**
 * Initialize the module.
 */
let itemSettings;
const init = async () => {
  addStyles(styles, 'inventory-lock-and-hide');

  itemSettings = getSettings();

  main();
  onNavigation(onSetPage, {
    page: 'inventory',
    anyTab: true,
    anySubTab: true,
  });

  hideItemsInTrapBrowser();
  onEvent('mh-improved-toggle-inventory-lock', () => {
    toggleControls();
    hideItemsInTrapBrowser();
  });

  onRequest('users/gettrapcomponents.php', addHideStyles);
};

export default {
  id: 'inventory-lock-and-hide',
  name: 'Inventory - Lock and Hide',
  type: 'feature',
  default: true,
  description: 'Lock and hide items in your inventory. Will also hide items in the trap browser.',
  load: init,
};
