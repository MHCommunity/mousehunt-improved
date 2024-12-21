import {
  addHudStyles,
  addStyles,
  getCurrentLocation,
  getData,
  makeElement,
  makeMathButtons,
  onDialogShow,
  onEvent,
  onRequest
} from '@utils';

import styles from './styles.css';
import stylesGlobal from './global.css';

/**
 * Update the footer with the possible golems that can be made.
 */
const updateGolemFooter = () => {
  const footer = document.querySelector('.greatWinterHuntDialogView__inventoryFooter');
  if (! footer) {
    return;
  }

  const headsEl = footer.querySelector('.greatWinterHuntDialogView__footerItemQuantity[data-item-type="golem_part_head_stat_item"]');
  const torsoEl = footer.querySelector('.greatWinterHuntDialogView__footerItemQuantity[data-item-type="golem_part_torso_stat_item"]');
  const limbsEl = footer.querySelector('.greatWinterHuntDialogView__footerItemQuantity[data-item-type="golem_part_limb_stat_item"]');

  if (! headsEl && ! torsoEl && ! limbsEl) {
    return;
  }

  const heads = headsEl ? Number.parseInt(headsEl.textContent, 10) : 0;
  const torso = torsoEl ? Number.parseInt(torsoEl.textContent, 10) : 0;
  const limbs = limbsEl ? Number.parseInt(limbsEl.textContent, 10) : 0;

  const limbSet = Math.floor(limbs / 4);
  const possibleGolems = Math.min(heads, torso, limbSet);

  const existing = footer.querySelector('.greatWinterHuntDialogView__footerItem.possibleGolems');
  if (existing) {
    existing.remove();
  }

  const possibleWrapper = makeElement('div', ['greatWinterHuntDialogView__footerItem', 'mousehuntTooltipParent', 'possibleGolems']);

  const possibleImage = makeElement('div', ['greatWinterHuntDialogView__footerItemImage']);
  possibleImage.style.backgroundImage = 'url(https://i.mouse.rip/mh-improved/golem-thumb.png)';
  possibleWrapper.append(possibleImage);

  makeElement('div', ['greatWinterHuntDialogView__footerItemQuantity', 'quantity'], possibleGolems, possibleWrapper);

  const possibleTooltip = makeElement('div', ['mousehuntTooltip', 'tight', 'top', 'noEvents'], `You can make ${possibleGolems} golem${possibleGolems === 1 ? '' : 's'}`);
  makeElement('div', ['mousehuntTooltip-arrow'], null, possibleTooltip);
  possibleWrapper.append(possibleTooltip);

  // append as the 4th child
  footer.insertBefore(possibleWrapper, footer.children[3]);
};

/**
 * Get the fraction character for the limb count.
 *
 * @param {number} num The number of limbs.
 *
 * @return {string} The fraction.
 */
const getFraction = (num) => {
  switch (num) {
  case 1:
    return '¼';
  case 2:
    return '½';
  case 3:
    return '¾';
  default:
    return '';
  }
};

/**
 * Update the golem parts quantity.
 */
const updateGolemPartsQuantity = () => {
  const limbs = document.querySelector('.greatWinterHuntRecycleDialogView__itemQuantity.quantity[data-item-type="golem_part_limb_stat_item"]');
  if (! limbs) {
    return;
  }

  const original = limbs.getAttribute('original-quantity');
  if (original) {
    const footerLimbs = document.querySelector('.greatWinterHuntDialogView__footerItemQuantity.quantity[data-item-type="golem_part_limb_stat_item"]');
    limbs.textContent = footerLimbs ? footerLimbs.textContent : original;
  }

  const limbCount = Number.parseInt(limbs.textContent, 10);
  limbs.setAttribute('original-quantity', limbCount);

  // Make a text node that looks like (4¼)
  const limbSet = Math.floor(limbCount / 4);
  const limbSetFraction = getFraction(limbCount % 4);

  const newLimbsEl = makeElement('span', ['golemLimbsTotal'], limbCount);
  const newLimbsSetEl = makeElement('span', ['golemLimbsPossible'], `(${limbSet}${limbSetFraction})`);
  limbs.textContent = '';
  limbs.append(newLimbsEl, newLimbsSetEl);
};

/**
 * Update the golem travel count.
 */
const updateGolemTravelCount = async () => {
  const title = document.querySelector('.greatWinterHuntGolemManagerTabView__destinationHeader');
  if (! title) {
    return;
  }

  const name = title.querySelector('.greatWinterHuntGolemManagerTabView__destinationName');
  if (! name) {
    return;
  }

  const allEnvironments = await getData('environments');

  // Find the environment type by checking the name against the environment name.
  const currentEnvironment = allEnvironments.find((env) => env.name === name.textContent);
  if (! currentEnvironment) {
    return;
  }

  const golemCounts = getGolemCounts();
  const existing = title.querySelector('.greatWinterHuntGolemManagerTabView__destinationCount');
  if (existing) {
    existing.textContent = golemCounts[currentEnvironment.id] || 0;
    return;
  }

  const countEl = makeElement('span', ['greatWinterHuntGolemManagerTabView__destinationCount'], `(${golemCounts[currentEnvironment.id] || 0})`);
  name.append(countEl);
};

/**
 * Fire the golem switch event when a golem is clicked in the dialog.
 */
const updateGolemPopup = () => {
  setTimeout(() => {
    const golems = document.querySelectorAll('.greatWinterHuntGolemManagerDialogView__golem');
    if (golems) {
      golems.forEach((golem) => {
        golem.addEventListener('click', () => {
          eventRegistry.doEvent('golem-switch-in-dialog');
        });
      });
    }

    updateGolemTravelCount();
    updateGolemFooter();
    updateGolemPartsQuantity();
  }, 250);
};

/**
 * Make the golems dance when the progress bar is clicked.
 */
const golemDance = () => {
  const trigger = document.querySelector('.greatWinterHuntRewardTrackView__progress');
  if (! trigger) {
    return;
  }

  trigger.addEventListener('click', () => {
    const golems = document.querySelectorAll('.headsUpDisplayWinterHuntRegionView__golem .winterHuntGolemView');
    if (! golems) {
      return;
    }

    // Off set the animations so they don't all start at the same time.
    count = 0;
    golems.forEach((golem) => {
      setTimeout(() => {
        golem.classList.add('winterHuntGolemView--idleAnimation');
      }, 100 * count);
      count++;
    });
  });
};

/**
 * Helper function to get the current quest.
 *
 * @return {Object} The quest object.
 */
const getQuest = () => {
  if ('winter_hunt_grove' === getCurrentLocation()) {
    return user.quests.QuestCinnamonTreeGrove;
  } else if ('winter_hunt_workshop' === getCurrentLocation()) {
    return user.quests.QuestGolemWorkshop;
  } else if ('winter_hunt_fortress' === getCurrentLocation()) {
    return user.quests.QuestIceFortress;
  }

  return {};
};

/**
 * Show the current animated snow count.
 */
const expandAnimatedSnowCount = () => {
  const limbEl = document.querySelector('.headsUpDisplayWinterHuntRegionView__golemPartQuantity.quantity[data-item-type="animate_snow_stat_item"]');
  if (! limbEl) {
    return;
  }

  limbEl.textContent = getQuest()?.items?.animate_snow_stat_item.quantity_formatted || 0;
};

/**
 * Show the possible snowball showdown dust count.
 */
const showPossibleSnowballShowdownDustCount = () => {
  // 175 for each dust.
  const showdownItems = document.querySelector('.campHudSnowballShowdownView__itemsContainer');
  if (! showdownItems) {
    return;
  }

  const snowballEl = showdownItems.querySelector('.campHudSnowballShowdownView__snowball');
  const snowballQtyEl = snowballEl.querySelector('.campHudSnowballShowdownView__quantity');
  const snowballQty = snowballQtyEl ? Number.parseInt(snowballQtyEl.textContent.replaceAll(',', ''), 10) : 0;

  const dustEl = showdownItems.querySelector('.campHudSnowballShowdownView__dust');
  const currentDustQtyEl = dustEl.querySelector('.campHudSnowballShowdownView__quantity');
  const currentDustQty = currentDustQtyEl ? Number.parseInt(currentDustQtyEl.textContent.replaceAll(',', ''), 10) : 0;

  const possibleDustQty = Math.floor(snowballQty / 175);
  const snowballText = snowballQty - (possibleDustQty * 175);
  const dustText = currentDustQty + possibleDustQty;

  const possibleSnowballExists = showdownItems.querySelector('.campHudSnowballShowdownView__quantity.possibleSnowball');
  if (possibleSnowballExists) {
    possibleSnowballExists.textContent = snowballText;
  } else {
    const possibleSnowballWrapper = makeElement('div', 'campHudSnowballShowdownView__quantityContainer possibleAmount');
    makeElement('div', ['campHudSnowballShowdownView__quantity', 'possibleSnowball'], snowballText, possibleSnowballWrapper);
    snowballEl.append(possibleSnowballWrapper);
  }

  const possibleDustExists = showdownItems.querySelector('.campHudSnowballShowdownView__quantity.possibleDust');
  if (possibleDustExists) {
    possibleDustExists.textContent = dustText;
  } else {
    const dustWrapper = makeElement('div', 'campHudSnowballShowdownView__quantityContainer possibleAmount');
    makeElement('div', ['campHudSnowballShowdownView__quantity', 'possibleDust'], dustText, dustWrapper);
    dustEl.append(dustWrapper);
  }
};

/**
 * Get the golem counts for the current quest.
 *
 * @return {Object} The golem counts.
 */
const getGolemCounts = () => {
  const golemCounts = {};
  const destinations = getQuest()?.destinations || {};
  for (const region in destinations) {
    destinations[region].environments.forEach((env) => {
      golemCounts[env.type] = env.num_golem_visits;
    });
  }

  return golemCounts;
};

/**
 * Modify the advent calendar popup to allow for spoilers.
 */
const adventCalendarPopup = () => {
  const suffix = document.querySelector('#overlayPopup .suffix');
  if (! suffix) {
    return;
  }

  const existingToggle = document.querySelector('.toggle-advent-calendar-spoilers');
  if (existingToggle) {
    return;
  }

  const toggleBtn = makeElement('button', ['mousehuntActionButton', 'tiny', 'toggle-advent-calendar-spoilers']);
  makeElement('span', '', 'View unblurred calendar', toggleBtn);
  toggleBtn.setAttribute('data-enabled', 'false');

  toggleBtn.addEventListener('click', () => {
    const popup = document.querySelector('#overlayPopup');
    if (! popup) {
      return;
    }

    popup.classList.toggle('advent-calendar-spoilers');

    const enabled = toggleBtn.getAttribute('data-enabled');
    if ('true' === enabled) {
      toggleBtn.setAttribute('data-enabled', 'false');
      toggleBtn.querySelector('span').innerText = 'View unblurred calendar';
    } else {
      toggleBtn.setAttribute('data-enabled', 'true');
      toggleBtn.querySelector('span').innerText = 'Hide unblurred calendar';
    }
  });

  suffix.append(toggleBtn);
};

/**
 * Hide the advent calendar in the menu after December.
 *
 * @return {string} The CSS to hide the advent calendar.
 */
const maybeHideAdventCalendarInMenu = () => {
  // If it's not December, then hide the advent calendar in the menu.
  const now = new Date();
  if (now.getMonth() !== 11) {
    return '.mousehuntHeaderView-gameTabs .menuItem.adventCalendar { display: none; }';
  }

  return '';
};

const giftingPopup = () => {
  const giftContainer = document.querySelector('.giftContainer');
  if (! giftContainer) {
    return;
  }

  const gifts = giftContainer.querySelectorAll('.gift');
  if (! gifts) {
    return;
  }

  // Reorder the gifts alphabetically.
  const sorted = [...gifts].sort((a, b) => {
    const aName = a.querySelector('.name span')?.textContent || '';
    const bName = b.querySelector('.name span')?.textContent || '';

    return aName.localeCompare(bName);
  });

  // If the name has 'Skin' in it, then move it to the end.
  const skinGifts = sorted.filter((gift) => {
    const name = gift.querySelector('.name span')?.textContent || '';
    return name.includes('Skin') || name.includes('Chrome Celestial Jubokko Tree');
  });

  skinGifts.forEach((gift) => {
    const index = sorted.indexOf(gift);
    sorted.splice(index, 1);
    sorted.push(gift);
  });

  sorted.forEach((gift) => {
    giftContainer.append(gift);

    gift.addEventListener('click', () => {
      const maxQty = document.querySelector('.giftConfirmContainer .quantity')?.textContent || 1_000_000;
      const input = document.querySelector('#sendQuantity');
      if (input) {
        const inputWrapper = makeElement('div', 'mhui-supply-quick-quantity-wrapper');
        input.after(inputWrapper);

        input.value = 0;

        makeMathButtons([1, 5, 10, 50, 100], {
          appendTo: inputWrapper,
          input,
          maxQty,
          classNames: ['mhui-supply-quick-quantity', 'small'],
        });
      }
    });
  });
};

/**
 * Always active.
 */
const greatWinterHuntGlobal = () => {
  addStyles([stylesGlobal, maybeHideAdventCalendarInMenu()], 'location-hud-events-great-winter-hunt');
  onDialogShow('adventCalendarPopup', adventCalendarPopup);
  onDialogShow('winter_hunt_profile_tree_possible_gifts', giftingPopup);
};

/**
 * Only active at the event location.
 */
const greatWinterHuntLocation = () => {
  addHudStyles(styles);
  onDialogShow('greatWinterHuntDialog', updateGolemPopup);

  golemDance();
  expandAnimatedSnowCount();
  showPossibleSnowballShowdownDustCount();

  onRequest('purchases/itempurchase.php', () => {
    updateGolemPartsQuantity();

    setTimeout(updateGolemFooter, 250);
  });

  onRequest('*', () => {
    expandAnimatedSnowCount();
    showPossibleSnowballShowdownDustCount();
  });

  onEvent('golem-switch-in-dialog', () => {
    updateGolemTravelCount();
  });

  setTimeout(expandAnimatedSnowCount, 1000);
};

export {
  greatWinterHuntGlobal,
  greatWinterHuntLocation
};
