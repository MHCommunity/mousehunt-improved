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

import recipesMeConversion from '@data/magic-essence-potions.json';
import recipesToReorder from '@data/crafting-recipe-mapping.json';

/**
 * Clean up the recipe book.
 */
const cleanUpRecipeBook = () => {
  // Re-add the 'All' tab.
  const allTab = document.querySelector('.inventoryPage-tagDirectory-tag.all.hidden');
  if (allTab) {
    allTab.classList.remove('hidden');
  }

  // get all the inventoryPage-tagDirectory-tag links and attach new onclick events to them
  const tagLinks = document.querySelectorAll('.mousehuntHud-page-subTabContent.recipe a.inventoryPage-tagDirectory-tag');
  tagLinks.forEach((tagLink) => {
    // get the data-tag attribute
    const tag = tagLink.getAttribute('data-tag');

    // remove the old onclick event
    tagLink.removeAttribute('onclick');

    // Add the new onclick event
    tagLink.addEventListener('click', (e) => {
      // showTagGroup(e.target);
      app.pages.InventoryPage.showTagGroup(e.target);

      // Update the recipes on the page.
      const hasBeenUpdated = tagLink.classList.contains('updated');
      if (! hasBeenUpdated) {
        updateRecipesOnPage(tag);
        tagLink.classList.add('updated');
      }
    });
  });
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
      setTimeout(() => {
        warnOnBadCrafts(limit + 1);
      }, 250);
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
            <div class="itemImage"><img src="${thumb}">
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
 * Move the recipe to the bottom of the list.
 *
 * @param {string}      type             The type of recipe.
 * @param {HTMLElement} recipesContainer The container for the recipes.
 */
const moveRecipe = (type, recipesContainer) => {
  const recipeEl = document.querySelector(`.inventoryPage-item.recipe[data-produced-item="${type}"]`);
  if (recipeEl) {
    // move it to the bottom of the list
    recipeEl.classList.add('reordered');
    recipesContainer.append(recipeEl);
  }
};

/**
 * Update the recipes on the page.
 *
 * @param {string} type The type of recipe.
 */
const updateRecipesOnPage = async (type) => {
  if (! recipesToReorder[type] || 'recommended' === type) {
    return;
  }

  const recipesContainer = document.querySelector(`.inventoryPage-tagContent-tagGroup[data-tag="${type}"]`);
  if (! recipesContainer) {
    return;
  }

  const recipesModifying = [];

  const knownRecipes = document.querySelectorAll('.inventoryPage-tagContent-tagGroup.active .inventoryPage-item.recipe.known');
  knownRecipes.forEach((recipe) => {
    const recipeId = recipe.getAttribute('data-item-type');
    recipesModifying.push(recipeId);
  });

  // if there are no recipes to modify, then we can stop here.
  if (recipesModifying.length === 0) {
    return;
  }

  const itemTypes = recipesModifying.map((recipe) => {
    return recipesToReorder[type][recipe];
  }).filter(Boolean);

  // if we're on the crafting items tab, then also check for dragon slayer cannon and then we can remove all the dragon slayer cannon recipes.
  if (type === 'crafting_item') {
    itemTypes.push('geyser_draconic_weapon');
  }

  const ownedItems = await getUserItems(itemTypes);
  ownedItems.forEach((item) => {
    if (! item.quantity || item.quantity < 1) {
      return;
    }

    if ('geyser_draconic_weapon' === item.type) {
      // if we have the dragon slayer cannon, then we can remove all the dragon slayer cannon recipes.
      moveRecipe('draconic_geyser_chassis_crafting_item', recipesContainer);
      moveRecipe('draconic_geyser_chassis_i_crafting_item', recipesContainer);
    } else {
      moveRecipe(item.type, recipesContainer);
    }
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
