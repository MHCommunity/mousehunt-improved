import {
  addStyles,
  debuglog,
  doRequest,
  makeElement,
  makeMhButton,
  onDialogShow,
  onRequest,
  sessionGet,
  sessionSet,
  sleep,
  waitForElement
} from '@utils';

import styles from './styles.css';

const airshipPartTypes = ['hull', 'sail', 'balloon'];
const airshipPartsCacheKey = 'fi-airship-parts';

/**
 * Cache the equippable airship cosmetic parts from a workshop response.
 *
 * @param {Object} airshipParts The `airship_parts` data from a get_workshop response.
 *
 * @return {Object|null} The cached parts, keyed by part type, or null.
 */
const cacheAirshipParts = (airshipParts) => {
  debuglog('airship-randomizer', 'Caching airship parts', airshipParts);
  if (! airshipParts) {
    return null;
  }

  const parts = {};
  for (const partType of airshipPartTypes) {
    parts[partType] = (airshipParts[partType]?.items || [])
      .filter((item) => item?.can_equip && item?.type)
      .map((item) => item.type);
  }

  sessionSet(airshipPartsCacheKey, parts);

  return parts;
};

/**
 * Get the equippable airship parts, from the cache or by fetching the workshop.
 *
 * @return {Promise<Object|null>} The parts, keyed by part type, or null.
 */
const getAirshipParts = async () => {
  const cached = sessionGet(airshipPartsCacheKey, null);
  if (cached) {
    return cached;
  }

  const response = await doRequest('managers/ajax/environment/floating_islands.php', {
    action: 'get_workshop',
  });

  return cacheAirshipParts(response?.airship_parts);
};

/**
 * Equip a single airship part, going through the workshop view when the
 * dialog is open so the game updates the dirigible preview, and falling back
 * to a direct request otherwise.
 *
 * @param {string} partType The part type being equipped (hull, sail, balloon).
 * @param {string} itemType The item type to equip.
 */
/**
 * Get the parts tab that's currently active in the workshop.
 *
 * @return {string|null} The active part type, or null.
 */
const getActivePartsTab = () => {
  const activeTab = document.querySelector('.floatingIslandsWorkshop-tab.customize .active[data-parts]');
  return activeTab ? activeTab.getAttribute('data-parts') : null;
};

const equipAirshipPart = async (partType, itemType) => {
  const view = hg?.views?.FloatingIslandsWorkshopView;
  const inWorkshop = !! document.querySelector('.floatingIslandsWorkshop-tab.customize');

  if (inWorkshop && view?.equipCosmeticItem) {
    // The active tab has its part buttons rendered, so preview the choice
    // there before equipping it.
    if (getActivePartsTab() === partType && view.previewCosmeticItem) {
      const previewButton = document.querySelector(`.floatingIslandsWorkshop-part-state.default a[data-category="${partType}"][data-type="${itemType}"]`);
      if (previewButton) {
        view.previewCosmeticItem(previewButton);
        await sleep(300);
      }
    }

    // Equip through the view so the game updates the airship and parts list.
    // Inactive tabs don't have their buttons rendered, so hand the view an
    // element carrying the data attributes it reads.
    const equipButton = document.querySelector(`.floatingIslandsWorkshop-part-state.previewed a[data-category="${partType}"][data-type="${itemType}"]`);
    let trigger = equipButton;
    if (! trigger) {
      trigger = makeElement('a');
      trigger.setAttribute('data-category', partType);
      trigger.setAttribute('data-type', itemType);
    }

    view.equipCosmeticItem(trigger);

    // The view equips asynchronously, so give it a beat before the next part.
    await sleep(300);
    return;
  }

  await doRequest('managers/ajax/environment/floating_islands.php', {
    action: 'equip_airship_cosmetic_item',
    type: itemType,
  });
};

/**
 * Equip a random equippable hull, sail, and balloon.
 */
const randomizeAirship = async () => {
  const parts = await getAirshipParts();
  if (! parts) {
    return;
  }

  const inWorkshop = !! document.querySelector('.floatingIslandsWorkshop-tab.customize');

  for (const partType of airshipPartTypes) {
    const options = parts[partType] || [];
    if (! options.length) {
      continue;
    }

    const choice = options[Math.floor(Math.random() * options.length)];
    await equipAirshipPart(partType, choice);
  }

  // Outside the workshop dialog we've just started an island, so wait a
  // second for the airship to fly in and then briefly highlight it. In the
  // workshop, the dirigible preview already shows the change.
  if (! inWorkshop) {
    setTimeout(() => {
      const airship = document.querySelector('.floatingIslandsHUD-airshipContainer .floatingIslandsAirship');
      if (! airship) {
        return;
      }

      airship.classList.add('highlight');
      setTimeout(() => airship.classList.remove('highlight'), 1000);
    }, 1000);
  }
};

/**
 * Add the randomize button to the workshop's customize tab.
 */
const addAirshipRandomizerButton = async () => {
  const customizeTab = await waitForElement('.floatingIslandsWorkshop-tab.customize', { maxAttempts: 5, delay: 200 });
  if (! customizeTab || customizeTab.querySelector('.mh-improved-airship-randomizer')) {
    return;
  }

  makeMhButton({
    text: 'Randomize',
    size: 'tiny',
    className: 'mh-improved-airship-randomizer',
    title: 'Equip a random hull, sail, and balloon',
    appendTo: customizeTab,
    /**
     * Randomize the airship, disabling the button while it runs.
     *
     * @param {Event} event The click event.
     */
    callback: async (event) => {
      const button = event.currentTarget;
      if (button.classList.contains('disabled')) {
        return;
      }

      button.classList.add('disabled');
      await randomizeAirship();
      button.classList.remove('disabled');
    },
  });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'airship-randomizer');

  onDialogShow('floatingIslandsWorkshop', addAirshipRandomizerButton);

  onRequest('environment/floating_islands.php', (response, data) => {
    if (response?.workshop?.airship_parts) {
      cacheAirshipParts(response.workshop.airship_parts);
    }

    // Equip a random look for every island.
    if ('launch' === data?.action) {
      randomizeAirship();
    }
  }, true);
};

/**
 * Module definition.
 */
export default {
  id: 'experiments.airship-randomizer',
  name: 'Floating Islands: Airship Randomizer',
  default: false,
  description: 'Equip a random airship hull, sail, and balloon each time you start an island, plus a "Randomize" button in the airship customization workshop.',
  load: init,
};
