import {
  addStyles,
  cacheGet,
  cacheSet,
  getCurrentSubtab,
  getCurrentTab,
  getUserItems,
  makeElement,
  onEvent,
  onNavigation
} from '@utils';

import styles from './styles.css';

/**
 * Recipe families that should remain together.
 *
 * Groups are positioned alphabetically using their label. Items within each
 * group follow the order of the `items` array.
 *
 * Values should match an item's `data-produced-item` value.
 */
const recipeGroups = [
  {
    label: 'Dragon Slayer Cannon',
    items: [
      'draconic_geyser_chassis_crafting_item',
      'draconic_geyser_chassis_i_crafting_item',
      'geyser_draconic_weapon',
    ],
  },
  {
    label: 'S.S. Huntington',
    items: [
      'unchristened_ship_craft_item',
      'huntington_map_piece',
    ],
  },
];

const recipesMeConversion = {
  no: [
    'abominable_asiago_cheese_magic',
    'ancient_cheese_6_pieces',
    'ancient_cheese_potion',
    'cherry_potion',
    'corrupted_radioactive_blue_cheese_potion',
    'gnarled_cheese_potion',
    'greater_radioactive_blue_cheese_potion',
    'limelight_cheese_6',
    'radioactive_blue_cheese_potion',
    'runic_cheese_2_pieces',
    'runic_cheese_potion'
  ],
  maybe: [
    'ancient_string_cheese_potion',
    'crimson_cheese_magic_essence_recipe',
    'gauntlet_potion_2',
    'gauntlet_potion_3',
    'gauntlet_potion_4',
    'glowing_gruyere_cheese_5_pieces',
    'greater_wicked_gnarly_potion',
    'rain_cheese_potion',
    'vengeful_vanilla_stilton_magic_essence',
    'wicked_gnarly_potion',
    'wind_cheese_potion'
  ]
};

/**
 * Normalize text for sorting.
 *
 * @param {string} value The value to normalize.
 *
 * @return {string} The normalized value.
 */
const normalizeSortValue = (value) => {
  return `${value || ''}`
    .trim()
    .replaceAll(/\s+/g, ' ')
    .toLocaleLowerCase();
};

/**
 * Get the displayed name of a recipe.
 *
 * @param {HTMLElement} recipe The recipe element.
 *
 * @return {string} The recipe name.
 */
const getRecipeName = (recipe) => {
  const name = recipe.querySelector('.inventoryPage-item-content-name span, .inventoryPage-item-content-name');
  return name?.textContent?.trim() || '';
};

/**
 * Get all item types produced by a recipe.
 *
 * Some recipes may contain more than one comma-separated produced item.
 *
 * @param {HTMLElement} recipe The recipe element.
 *
 * @return {Array<string>} The produced item types.
 */
const getProducedItemTypes = (recipe) => {
  const producedItems = recipe.getAttribute('data-produced-item');
  if (! producedItems) {
    return [];
  }

  return producedItems
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

/**
 * Get the configured group for a recipe.
 *
 * @param {HTMLElement} recipe The recipe element.
 *
 * @return {Object|null} The matching group.
 */
const getRecipeGroup = (recipe) => {
  const producedItems = getProducedItemTypes(recipe);

  return recipeGroups.find((group) => {
    return group.items.some((item) => producedItems.includes(item));
  }) || null;
};

/**
 * Get a recipe's position within its configured group.
 *
 * @param {HTMLElement} recipe The recipe element.
 * @param {Object}      group  The recipe group.
 *
 * @return {number} The recipe's group position.
 */
const getRecipeGroupPosition = (recipe, group) => {
  const producedItems = getProducedItemTypes(recipe);
  const positions = producedItems
    .map((item) => group.items.indexOf(item))
    .filter((position) => -1 !== position);

  return positions.length ? Math.min(...positions) : Number.MAX_SAFE_INTEGER;
};

/**
 * Build the values used to sort a recipe.
 *
 * Ungrouped recipes sort by their displayed name. Grouped recipes sort by the
 * group's label, keeping the group in the normal alphabetical list.
 *
 * @param {HTMLElement} recipe The recipe element.
 *
 * @return {Object} The sorting values.
 */
const getRecipeSortData = (recipe) => {
  const name = getRecipeName(recipe);
  const group = getRecipeGroup(recipe);

  return {
    name: normalizeSortValue(name),
    section: normalizeSortValue(group?.label || name),
    group,
    groupPosition: group ? getRecipeGroupPosition(recipe, group) : Number.MAX_SAFE_INTEGER,
  };
};

/**
 * Compare two recipe elements.
 *
 * @param {HTMLElement} recipeA The first recipe.
 * @param {HTMLElement} recipeB The second recipe.
 *
 * @return {number} The sort result.
 */
const compareRecipes = (recipeA, recipeB) => {
  const a = getRecipeSortData(recipeA);
  const b = getRecipeSortData(recipeB);

  const sectionComparison = a.section.localeCompare(b.section, undefined, {
    numeric: true,
    sensitivity: 'base',
  });

  if (0 !== sectionComparison) {
    return sectionComparison;
  }

  if (a.group && b.group && a.group === b.group) {
    const positionComparison = a.groupPosition - b.groupPosition;
    if (0 !== positionComparison) {
      return positionComparison;
    }
  }

  return a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

/**
 * Find a recipe group container by its tag.
 *
 * This avoids using CSS.escape() and handles any unusual tag values.
 *
 * @param {string} tag The recipe category tag.
 *
 * @return {HTMLElement|null} The matching container.
 */
const getRecipeContainer = (tag) => {
  const containers = document.querySelectorAll('.inventoryPage-tagContent-tagGroup');

  return [...containers].find((container) => {
    return container.getAttribute('data-tag') === tag;
  }) || null;
};

/**
 * Sort the recipes in a category.
 *
 * @param {string} tag The recipe category tag.
 */
const updateRecipesOnPage = (tag) => {
  if (! tag || 'recommended' === tag) {
    return;
  }

  const recipesContainer = getRecipeContainer(tag);
  if (! recipesContainer) {
    return;
  }

  const recipes = [...recipesContainer.querySelectorAll(':scope > .inventoryPage-item.recipe')];
  if (recipes.length < 2) {
    return;
  }

  recipes.sort(compareRecipes);

  const fragment = document.createDocumentFragment();
  recipes.forEach((recipe) => {
    fragment.append(recipe);
  });

  recipesContainer.append(fragment);
};

/**
 * Sort a category after MouseHunt has finished displaying it.
 *
 * @param {string} tag The recipe category tag.
 */
const scheduleRecipeUpdate = (tag) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      updateRecipesOnPage(tag);
    });
  });
};

/**
 * Clean up and sort the recipe book.
 */
const cleanUpRecipeBook = () => {
  const recipeBook = document.querySelector('.mousehuntHud-page-subTabContent.recipe');
  if (! recipeBook) {
    return;
  }

  // Re-add the 'All' tab.
  const allTab = recipeBook.querySelector('.inventoryPage-tagDirectory-tag.all.hidden');
  if (allTab) {
    allTab.classList.remove('hidden');
  }

  const tagLinks = recipeBook.querySelectorAll('a.inventoryPage-tagDirectory-tag');
  tagLinks.forEach((tagLink) => {
    const tag = tagLink.getAttribute('data-tag');
    if (! tag) {
      return;
    }

    tagLink.removeAttribute('onclick');

    // Navigation can run more than once, so avoid attaching duplicate handlers.
    if ('true' === tagLink.dataset.mhuiRecipeHandler) {
      return;
    }

    tagLink.dataset.mhuiRecipeHandler = 'true';
    tagLink.addEventListener('click', (event) => {
      event.preventDefault();
      app.pages.InventoryPage.showTagGroup(tagLink);
      scheduleRecipeUpdate(tag);
    });
  });

  // Sort the category that is already visible when the page opens.
  const activeGroup = recipeBook.querySelector('.inventoryPage-tagContent-tagGroup.active');
  if (activeGroup) {
    scheduleRecipeUpdate(activeGroup.getAttribute('data-tag'));
  }
};

/**
 * Show a warning when crafting a recipe that may not be worth it.
 *
 * @param {string} text The warning text.
 */
const showCraftWarning = (text) => {
  const confirm = document.querySelector('.mousehuntActionButton.inventoryPage-confirmPopup-suffix-button.confirm');
  if (! confirm) {
    return;
  }

  const existing = document.querySelector('.mhui-craft-warning-tooltip');
  if (existing) {
    existing.remove();
  }

  const tooltip = makeElement('div', 'mhui-craft-warning-tooltip', text);
  confirm.parentNode.append(tooltip);
};

/**
 * Warn the user when crafting a recipe that may not be worth it.
 *
 * @param {number} limit The limit of the number of times to check for the confirm button.
 */
const warnOnBadCrafts = (limit = 0) => {
  const confirm = document.querySelector('.mousehuntActionButton.inventoryPage-confirmPopup-suffix-button.confirm');
  if (! confirm) {
    if (limit <= 3) {
      setTimeout(warnOnBadCrafts, 250, limit + 1);
    }

    return;
  }

  const type = confirm.getAttribute('data-confirm-type');
  if (! type) {
    return;
  }

  if (! ('recipe' === type || 'potion' === type)) {
    return;
  }

  const popup = document.querySelector('.inventoryPage-confirmPopup');
  if (! popup) {
    return;
  }

  const recipe = popup.getAttribute('data-item-type');
  if (! recipe) {
    return;
  }

  if ('potion' === type) {
    // if its a potion, then check to make sure we're using the sb recipe
    const consumed = document.querySelectorAll('.inventoryPage-confirmPopup-itemRow-quantity[data-source="consumed"]');
    // make sure sb is one of the consumed items
    let hasSB = false;
    consumed.forEach((item) => {
      if (item.getAttribute('data-item-type') === 'super_brie_cheese') {
        hasSB = true;
      }
    });

    if (! hasSB) {
      return;
    }
  }

  if (recipesMeConversion.no.includes(recipe)) {
    showCraftWarning('This is not worth crafting using Magic Essence.');
  } else if (recipesMeConversion.maybe.includes(recipe)) {
    showCraftWarning('Check the price of SUPER|brie+ before using Magic Essence.');
  }
};

/**
 * Modify the smashable tooltip.
 */
const modifySmashableTooltip = async () => {
  if ('crafting' !== getCurrentTab() || 'hammer' !== getCurrentSubtab()) {
    return;
  }

  const items = document.querySelectorAll('.inventoryPage-item');
  if (! items) {
    return;
  }

  items.forEach(async (item) => {
    const tooltip = item.querySelector('.tooltip');
    if (! tooltip) {
      return;
    }

    // get the data for the data-produced-item attribute
    let producedItem = item.getAttribute('data-produced-item');
    if (! producedItem) {
      return;
    }

    item.addEventListener('mouseleave', () => {
      item.classList.remove('new-tooltip-loading');
    });

    item.addEventListener('mouseenter', async () => {
      if (item.getAttribute('data-new-tooltip') === 'newTooltip') {
        return;
      }

      item.setAttribute('data-new-tooltip', 'newTooltip');

      producedItem = producedItem.includes(',') ? producedItem.split(',') : [producedItem];

      const itemType = item.getAttribute('data-item-type');
      producedItem.push(itemType);

      item.classList.add('new-tooltip-loading');

      let itemData = await cacheGet(`smashable-${producedItem.join('-')}`);
      if (! itemData) {
        itemData = await getUserItems(producedItem);
        cacheSet(`smashable-${producedItem.join('-')}`, itemData, 6 * 30 * 24 * 60 * 60 * 1000); // Cache for 6 months.
      }

      if (! itemData || ! itemData[0]) {
        return;
      }

      // get the formatted_parts attribute from the itemData array where the type matches the itemType
      const formattedParts = itemData.find((itemDataItem) => itemDataItem.type === itemType).formatted_parts;
      if (! formattedParts) {
        return;
      }

      const tooltipWrapper = makeElement('div', ['newTooltip', 'tooltip']);

      itemData.forEach((itemDataItem) => {
        // get the data in formattedParts where the type matches the itemDataItem.type
        const formattedPart = formattedParts.find((formattedPartItem) => formattedPartItem.type === itemDataItem.type);
        if (! formattedPart) {
          return;
        }

        const name = formattedPart.name;
        const thumb = formattedPart.thumbnail_transparent || itemDataItem.thumbnail;
        let quantity = formattedPart.quantity;

        if ('gold_stat_item' === itemDataItem.type) {
          // convert to k or m
          const quantityInt = Number.parseInt(quantity);
          quantity = quantityInt >= 1000000 ? `${Math.floor(quantityInt / 100000) / 10}m` : quantity.toLocaleString();
        }

        makeElement('div', ['new-tooltip-item', 'inventoryPage-item'], `
        <div class="inventoryPage-item-margin clear-block hidden">
          <div class="inventoryPage-item-imageContainer">
            <div class="itemImage"><img src="${thumb}" alt="${name}" title="${name}" /></div>
              <div class="quantity">${quantity}</div>
            </div>
          </div>
          <div class="inventoryPage-item-content-nameContainer">
            <div class="inventoryPage-item-content-name">
              <span>${name}</span>
            </div>
          </div>
        </div>`, tooltipWrapper);
      });

      tooltip.parentNode.insertBefore(tooltipWrapper, tooltip.nextSibling);

      item.classList.remove('new-tooltip-loading');
    });
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-inventory-recipes');

  onNavigation(cleanUpRecipeBook, {
    page: 'inventory',
    tab: 'crafting',
    subtab: 'recipe',
  });

  onNavigation(modifySmashableTooltip, {
    page: 'inventory',
    tab: 'crafting',
    subtab: 'hammer',
  });

  onEvent('js_dialog_show', warnOnBadCrafts);

  modifySmashableTooltip();
};
