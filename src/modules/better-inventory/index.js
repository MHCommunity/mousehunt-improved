import { addUIStyles } from '../utils';
import styles from './styles.css';

const setOpenQuantityOnClick = (attempts = 0) => {
  const qty = document.querySelector('.itemView-action-convertForm');
  if (! qty) {
    if (attempts > 10) {
      return;
    }

    setTimeout(() => {
      setOpenQuantityOnClick(attempts + 1);
    }, 200);
    return;
  }

  qty.addEventListener('click', (e) => {
    if (e.target.tagName === 'DIV') {
      const textQty = e.target.innerText;
      const qtyArray = textQty.split(' ');
      let maxNum = qtyArray[qtyArray.length - 1];
      maxNum = maxNum.replace('Submit', '');
      maxNum = parseInt(maxNum);

      const input = document.querySelector('.itemView-action-convert-quantity');
      input.value = maxNum;
    }
  });
};

const fixPassingParcel = () => {
  const passingParcel = document.querySelector('.inventoryPage-item[data-item-type="passing_parcel_message_item"]');
  if (! passingParcel) {
    return;
  }

  const quantity = passingParcel.querySelector('.quantity');
  if (! quantity) {
    return;
  }

  const newMarkup = `<div class="inventoryPage-item full convertible " onclick="app.pages.InventoryPage.useItem(this); return false;" data-item-id="1281" data-item-type="passing_parcel_convertible" data-item-classification="convertible" data-name="Passing Parcel" data-display-order="0">
	<div class="inventoryPage-item-margin clear-block">
		<div class="inventoryPage-item-name">
      <a href="#" class="" onclick="hg.views.ItemView.show('passing_parcel_convertible'); return false;">
        <abbr title="Passing Parcel">Passing Parcel (collectible)</abbr>
      </a>
    </div>
    <a href="#" class="inventoryPage-item-larryLexicon" onclick="hg.views.ItemView.show('passing_parcel_convertible'); return false;">?</a>
    <div class="inventoryPage-item-imageContainer">
      <div class="itemImage"><a href="#" class="" onclick="hg.views.ItemView.show('passing_parcel_convertible'); return false;">
        <img src="https://www.mousehuntgame.com/images/items/message_items/5591e5c34f081715aaca4e95e97a3379.jpg?cv=2"></a>
          <div class="quantity">${quantity.innerText}</div>
        </div>
      </div>
      <div class="inventoryPage-item-contentContainer">
        <div class="inventoryPage-item-content-description">
          <div class="inventoryPage-item-content-description-text">
            This parcel is meant to be passed along to a friend! If a friend sends one to you, tear away a layer and see if there's something inside!
          </div>
          <div class="inventoryPage-item-content-action">
            <input type="button" id="passing-parcel-action" class="inventoryPage-item-button button" value="Pass Along">
          </div>
      </div>
    </div>
  </div>`;

  passingParcel.outerHTML = newMarkup;

  const passingParcelAction = document.querySelector('#passing-parcel-action');
  passingParcelAction.addEventListener('click', () => {
    window.location.href = 'https://www.mousehuntgame.com/supplytransfer.php?item_type=passing_parcel_message_item';
  });
};

const addOpenAlltoConvertible = () => {
  const form = document.querySelector('.convertible .itemView-action-convertForm');
  if (! form) {
    return;
  }

  if (form.getAttribute('data-open-all-added')) {
    return;
  }

  form.setAttribute('data-open-all-added', true);

  // get the innerHTML and split it on the input tag. then wrap the second match in a span so we can target it
  const formHTML = form.innerHTML;
  const formHTMLArray = formHTML.split(' /');
  // if we dont have a second match, just return
  if (! formHTMLArray[1]) {
    return;
  }

  const formHTMLArray2 = formHTMLArray[1].split('<a');
  if (! formHTMLArray2[1]) {
    return;
  }

  const quantity = formHTMLArray2[0].trim();

  const newFormHTML = `${formHTMLArray[0]}/ <span class="open-all">${quantity}</span><a${formHTMLArray2[1]}`;
  form.innerHTML = newFormHTML;

  const openAll = document.querySelector('.open-all');
  openAll.addEventListener('click', () => {
    const input = form.querySelector('.itemView-action-convert-quantity');
    if (! input) {
      return;
    }

    input.value = quantity;
  });
};

const addOpenAlltoConvertiblePage = () => {
  if ('item' !== getCurrentPage()) {
    return;
  }

  addOpenAlltoConvertible();
};

const modifySmashableTooltip = async () => {
  if ('crafting' !== getCurrentTab() || 'hammer' !== getCurrentSubtab()) { // eslint-disable-line no-undef
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

    item.addEventListener('mouseenter', async () => {
      if (item.getAttribute('data-new-tooltip') === 'newTooltip') {
        return;
      }

      item.setAttribute('data-new-tooltip', 'newTooltip');

      if (producedItem.includes(',')) {
        producedItem = producedItem.split(',');
      } else {
        producedItem = [producedItem];
      }

      const itemType = item.getAttribute('data-item-type');
      producedItem.push(itemType);

      const itemData = await getUserItems(producedItem); // eslint-disable-line no-undef
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
          const quantityInt = parseInt(quantity);
          if (quantityInt >= 1000000) {
            quantity = `${Math.floor(quantityInt / 100000) / 10}m`;
          } else if (quantityInt >= 1000) {
            quantity = `${Math.floor(quantityInt / 100) / 10}k`;
          }
        }

        // const itemTooltip = makeElement('div', 'new-tooltip-item');
        makeElement('div', ['new-tooltip-item', 'inventoryPage-item'], `
        <div class="inventoryPage-item-margin clear-block">
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
        // makeElement('div', 'tooltip-title', `<b>${name}</b>`, itemTooltip);
        // makeElement('div', 'tooltip-image', `<img src="${thumb}">`, itemTooltip);
        // tooltipWrapper.appendChild(itemTooltip);
      });

      tooltip.parentNode.insertBefore(tooltipWrapper, tooltip.nextSibling);
    });
  });
};

const moveRecipe = (type, recipesContainer) => {
  const recipeEl = document.querySelector(`.inventoryPage-item.recipe[data-produced-item="${type}"]`);
  if (recipeEl) {
    // move it to the bottom of the list
    recipeEl.classList.add('reordered');
    recipesContainer.appendChild(recipeEl);
  }
};

const updateRecipesOnPage = async (type) => {
  const recipes = {
    base: {
      living_grove_base_recipe: 'living_grove_base',
      polluted_base_rebuild: 'polluted_base',
      soiled_base_rebuild_recipe: 'soiled_base',
      tribal_base: 'tribal_base',
      tiki_base: 'tiki_base',
    },
    collectible: {
      admirals_ship_journal_theme_recipe: 'admirals_ship_journal_theme_collectible',
      bristle_woods_rift_journal_theme_recipe: 'bristle_woods_rift_journal_theme_collectible',
      burroughs_rift_journal_theme_recipe: 'burroughs_rift_journal_theme_collectible',
      chrome_journal_theme_recipe: 'chrome_journal_theme_collectible',
      gnawnian_games_journal_theme_recipe: 'gnawnian_games_theme_collectible',
      labyrinth_journal_theme_recipe: 'labyrinth_journal_theme_collectible',
      lightning_slayer_journal_theme_recipe: 'lightning_slayer_journal_theme_collectible',
      living_garden_theme_recipe: 'living_garden_theme_collectible',
      moussu_picchu_journal_theme_recipe: 'moussu_picchu_journal_theme_collectible',
      polluted_theme_recipe: 'completed_polluted_journal_theme_collectible',
      queso_journal_theme_recipe: 'queso_canyon_theme_collectible',
      regal_theme_recipe: 'completed_regal_theme_collectible',
      relic_hunter_journal_theme_recipe: 'relic_hunter_journal_theme_collectible',
    },
    crafting_item: {
      geyser_draconic_chassis_recipe: 'draconic_geyser_chassis_crafting_item',
      geyser_draconic_chassis_i_recipe: 'draconic_geyser_chassis_i_crafting_item',
      masters_seal: 'masters_seal_craft_item',
      christened_ship: 'huntington_map_piece',
      s_s__huntington_ii: 'huntington_map_piece',
    },
    map_piece: {
      unchristened_ship: 'unchristened_ship_craft_item',
      balacks_lantern: 'balack_lantern_map_piece',
      ocean_navigation_kit: 'ocean_navigation_map_piece',
      zzt_key_1: 'zzt_key',
      repaired_oculus_recipe: 'high_altitude_license_stat_item',
    },
    weapon: {
      chrome_floating_arcane_upgraded_recipe: 'chrome_floating_arcane_upgraded_weapon',
      chrome_monstrobot_recipe: 'chrome_monstrobot_weapon',
      chrome_oasis_water_node_recipe: 'chrome_oasis_water_node_weapon',
      chrome_phantasmic_oasis_recipe: 'chrome_phantasmic_oasis_weapon',
      chrome_school_of_sharks_recipe: 'chrome_school_of_sharks_weapon',
      chrome_sphynx_recipe: 'chrome_sphynx_weapon',
      chrome_storm_wrought_ballista_recipe: 'chrome_storm_wrought_ballista_weapon',
      chrome_temporal_turbine_recipe: 'chrome_temporal_turbine_weapon',
      chrome_thought_obliterator_recipe: 'chrome_floating_forgotten_upgraded_weapon',
      clockapult_of_winter_past: 'clockapult_of_winter_past_weapon',
      geyser_draconic_weapon_recipe: 'geyser_draconic_weapon',
      fluffy_deathbot_weapon: 'fluffy_deathbot_weapon',
      grungy_deathbot_weapon: 'grungy_deathbot_weapon',
      icy_rhinobot: 'icy_rhinobot_weapon',
      ninja_ambush_weapon: 'ninja_ambush_weapon',
      regrown_thorned_venus_mouse_trap: 'throned_venus_mouse_trap_weapon',
      acronym_recipe: 'acronym_weapon',
      ambush_trap_rebuild: 'ambush_weapon',
      rebuild_celestial_dissonance_recipe: 'celestial_dissonance_weapon',
      rebuild_chrome_storm_wrought_ballista_recipe: 'chrome_storm_wrought_ballista_weapon',
      clockapult_of_time_rebuild: 'clockapult_of_time_weapon',
      rebuild_crystal_tower_recipe: 'crystal_tower_weapon',
      digby_drillbot: 'digby_drillbot_weapon',
      dragon_ballista_rebuild: 'dragonvine_ballista_weapon',
      endless_labyrinth_trap_rebuild_recipe: 'endless_labyrinth_weapon',
      event_horizon_recipe: 'event_horizon_weapon',
      harpoon_gun: 'harpoon_gun_weapon',
      rebuild_high_tension_recipe: 'high_tension_spring_weapon',
      ice_blaster_trap_rebuild: 'ice_blaster_weapon',
      wolfsbane_rebuild_recipe: 'wolfsbane_weapon',
      mouse_deathbot: 'mouse_deathbot_weapon',
      net_cannon: 'net_cannon_weapon',
      oasis_water_node_recipe: 'oasis_water_node_weapon',
      obelisk_of_slumber: 'obelisk_of_slumber_weapon',
      rebuild_phantasmic_oasis_recipe: 'phantasmic_oasis_weapon',
      rhinobot_rebuild: 'rhinobot_weapon',
      sandstorm_monstrobot_recipe: 'sandstormbot_weapon',
      rebuild_upgraded_rune_shark_weapon_recipe: 'upgraded_rune_shark_weapon',
      scum_scrubber_trap_rebuild_recipe: 'scum_scrubber_weapon',
      soul_catcher_rebuild: 'hween_2011_weapon',
      sphynx_weapon_recipe: 'sphynx_weapon',
      steam_laser_mk_i_rebuild: 'steam_laser_mk_i_weapon',
      storm_wrought_ballista_recipe: 'storm_wrought_ballista_weapon',
      temporal_turbine_recipe: 'temporal_turbine',
      zugzwangs_last_move: 'zugzwangs_last_move_weapon',
      rebuild_floating_arcane_upgraded_recipe: 'floating_arcane_upgraded_weapon',
      rebuild_thought_obliterator_recipe: 'floating_forgotten_upgraded_weapon',
      venus_mouse_trap: 'venus_mouse_trap_weapon',
    }
  };

  if (! recipes[type]) {
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
  if (recipesModifying.length < 1) {
    return;
  }

  const itemTypes = recipesModifying.map((recipe) => {
    return recipes[type][recipe];
  }).filter((itemType) => {
    return itemType;
  });

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

// loop trhou

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
  confirm.parentNode.appendChild(tooltip);
};

const warnOnBadCrafts = () => {
  const confirm = document.querySelector('.mousehuntActionButton.inventoryPage-confirmPopup-suffix-button.confirm');
  if (! confirm) {
    setTimeout(warnOnBadCrafts, 100);
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
      console.log(item.getAttribute('data-item-type'));
      if (item.getAttribute('data-item-type') === 'super_brie_cheese') {
        hasSB = true;
      }
    });

    if (! hasSB) {
      return;
    }
  }

  // No me.
  // 1D
  // CCC
  // TI Cheese
  // UE/USE
  // Vanilla

  // Maybe ME, check prices.
  // ASC
  // DewThief
  // Duskhade
  // GSC
  // T2-T4
  // Wicked Gnarly

  // No ME.
  const no = [
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
    'runic_cheese_potion',
  ];

  const maybe = [
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
    'wind_cheese_potion',
  ];

  if (no.includes(recipe)) {
    showCraftWarning('This is not worth crafting using Magic Essence');
  } else if (maybe.includes(recipe)) {
    showCraftWarning('Check the price of SUPER|brie+ before using Magic Essence');
  }
};

const main = () => {
  onOverlayChange({ item: { show: setOpenQuantityOnClick } });
  if ('item' === getCurrentPage()) {
    setOpenQuantityOnClick();
  }

  fixPassingParcel();
  addOpenAlltoConvertiblePage();
  modifySmashableTooltip();
};

export default function inventoryHelper() {
  addUIStyles(styles);

  main();
  onPageChange({ change: main });
  onEvent('js_dialog_show', addOpenAlltoConvertible);
  onEvent('js_dialog_show', warnOnBadCrafts);

  onNavigation(cleanUpRecipeBook,
    {
      page: 'inventory',
      tab: 'crafting',
      subtab: 'recipe',
    }
  );
}
