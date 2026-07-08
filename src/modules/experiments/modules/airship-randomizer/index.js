import {
  addStyles,
  debuglog,
  doRequest,
  makeElement,
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
 * Get the parts tab that's currently active in the workshop.
 *
 * @return {string|null} The active part type, or null.
 */
const getActivePartsTab = () => {
  const activeTab = document.querySelector('.floatingIslandsWorkshop-tab.customize .active[data-parts]');
  return activeTab ? activeTab.getAttribute('data-parts') : null;
};

/**
 * Equip a single airship part, going through the workshop view when the
 * dialog is open so the game updates the dirigible preview, and falling back
 * to a direct request otherwise.
 *
 * @param {string} partType The part type being equipped (hull, sail, balloon).
 * @param {string} itemType The item type to equip.
 */
const equipAirshipPart = async (partType, itemType) => {
  const view = hg?.views?.FloatingIslandsWorkshopView;
  const inWorkshop = !! document.querySelector('.floatingIslandsWorkshop-tab.customize');

  if (inWorkshop && view?.equipCosmeticItem) {
    if (getActivePartsTab() === partType && view.previewCosmeticItem) {
      const previewButton = document.querySelector(`.floatingIslandsWorkshop-part-state.default a[data-category="${partType}"][data-type="${itemType}"]`);
      if (previewButton) {
        view.previewCosmeticItem(previewButton);
        await sleep(300);
      }
    }

    const equipButton = document.querySelector(`.floatingIslandsWorkshop-part-state.previewed a[data-category="${partType}"][data-type="${itemType}"]`);
    let trigger = equipButton;
    if (! trigger) {
      trigger = makeElement('a');
      trigger.setAttribute('data-category', partType);
      trigger.setAttribute('data-type', itemType);
    }

    view.equipCosmeticItem(trigger);

    await sleep(300);
    return;
  }

  await doRequest('managers/ajax/environment/floating_islands.php', {
    action: 'equip_airship_cosmetic_item',
    type: itemType,
  });
};

/**
 * Equip a random equippable item for a single part type.
 *
 * @param {string} partType The part type to randomize (hull, sail, balloon).
 */
const randomizeAirshipPart = async (partType) => {
  const parts = await getAirshipParts();
  if (! parts) {
    return;
  }

  const options = parts[partType] || [];
  if (! options.length) {
    return;
  }

  const choice = options[Math.floor(Math.random() * options.length)];
  await equipAirshipPart(partType, choice);
};

/**
 * Equip a random equippable hull, sail, and balloon.
 */
const randomizeAirship = async () => {
  const inWorkshop = !! document.querySelector('.floatingIslandsWorkshop-tab.customize');

  for (const partType of airshipPartTypes) {
    await randomizeAirshipPart(partType);
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
 * Make a randomize button styled like the game's "Stabilize airship" label.
 *
 * @param {Object}   options          The button options.
 * @param {string}   options.text     The button text.
 * @param {string}   options.title    The button title attribute.
 * @param {Function} options.callback Called when the button is clicked.
 *
 * @return {HTMLElement} The button element.
 */
const makeRandomizeButton = ({ text, title, callback }) => {
  const button = makeElement('a', 'mh-improved-airship-randomizer-button');
  button.href = '#';
  button.title = title;

  const icon = makeElement('img', 'mh-improved-airship-randomizer-icon');
  icon.src = 'https://i.mouse.rip/mh-improved/journal-random.png';
  icon.alt = '';
  button.append(icon);

  button.append(document.createTextNode(text));

  button.addEventListener('click', async (event) => {
    event.preventDefault();

    if (button.classList.contains('busy')) {
      return;
    }

    button.classList.add('busy');
    await callback();
    button.classList.remove('busy');
  });

  return button;
};

/**
 * Add the randomize buttons to the workshop's customize tab.
 */
const addAirshipRandomizerButtons = async () => {
  const customizeTab = await waitForElement('.floatingIslandsWorkshop-tab.customize', { maxAttempts: 5, delay: 200 });
  if (! customizeTab || customizeTab.querySelector('.mh-improved-airship-randomizer')) {
    return;
  }

  const wrapper = makeElement('div', 'mh-improved-airship-randomizer');

  wrapper.append(makeRandomizeButton({
    text: 'Randomize',
    title: 'Equip a random part for the selected slot',
    /**
     * Randomize the part type that's selected in the workshop.
     */
    callback: async () => {
      await randomizeAirshipPart(getActivePartsTab() || 'balloon');
    },
  }));

  wrapper.append(makeRandomizeButton({
    text: 'Randomize all',
    title: 'Equip a random hull, sail, and balloon',
    /**
     * Randomize every part type.
     */
    callback: randomizeAirship,
  }));

  customizeTab.append(wrapper);
};

let hoverPreviewTimeout = null;
let hoverPreviewPart = null;

/**
 * Cancel any pending hover preview and revert an active one, restoring the
 * equipped airship in the dirigible preview.
 */
const clearHoverPreview = () => {
  clearTimeout(hoverPreviewTimeout);

  const previewedPart = document.querySelector('.floatingIslandsWorkshop-part.previewed');
  if (! previewedPart) {
    return;
  }

  previewedPart.classList.remove('previewed');
  previewedPart.classList.add('default');

  hg?.views?.FloatingIslandsWorkshopView?.hideCosmeticPreview?.();
};

/**
 * Preview a part when hovering over it, debounced so quickly moving across
 * the list only previews the part the cursor settles on.
 */
const addHoverPreview = async () => {
  const container = await waitForElement('.floatingIslandsWorkshop-container', { maxAttempts: 5, delay: 200 });
  if (! container || container.getAttribute('data-mh-improved-hover-preview')) {
    return;
  }

  container.setAttribute('data-mh-improved-hover-preview', 'true');

  container.addEventListener('mouseover', (event) => {
    const part = event.target.closest('.floatingIslandsWorkshop-part');

    // Moving between elements inside the same part shouldn't restart the delay.
    if (part && part === hoverPreviewPart) {
      return;
    }

    // Left the previous part, so revert its preview to the equipped airship.
    clearHoverPreview();
    hoverPreviewPart = part;

    if (! part || part.classList.contains('previewed') || part.classList.contains('active')) {
      return;
    }

    const previewButton = part.querySelector('.floatingIslandsWorkshop-part-state.default a[data-category][data-type]');
    if (! previewButton) {
      return;
    }

    hoverPreviewTimeout = setTimeout(() => {
      // Skip if the part got previewed or equipped while we were waiting.
      if (! previewButton.isConnected || ! part.classList.contains('default')) {
        return;
      }

      hg?.views?.FloatingIslandsWorkshopView?.previewCosmeticItem?.(previewButton);
    }, 350);
  });

  container.addEventListener('mouseleave', () => {
    clearHoverPreview();
    hoverPreviewPart = null;
  });
};

/**
 * Make clicking anywhere on the "Stabilize airship" label toggle the checkbox
 * and the airship animation, rather than just clicks on the checkbox.
 */
const fixStabilizerLabel = async () => {
  await waitForElement('.floatingIslandsWorkshop-stabilizer label', { maxAttempts: 5, delay: 200 });

  const labels = document.querySelectorAll('.floatingIslandsWorkshop-stabilizer label');
  labels.forEach((label) => {
    if (label.getAttribute('data-mh-improved-stabilizer')) {
      return;
    }

    label.setAttribute('data-mh-improved-stabilizer', 'true');

    // Remove the game's inline handler so the toggle doesn't fire twice.
    label.removeAttribute('onclick');

    label.addEventListener('click', (event) => {
      event.preventDefault();

      if (label.classList.contains('busy')) {
        return;
      }

      const checkbox = label.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = ! checkbox.checked;
      }

      // Passing the label lets the game show its busy spinner on it while the
      // toggle request runs.
      hg?.views?.FloatingIslandsWorkshopView?.toggleAirshipAnimation?.(label);
    });
  });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'airship-randomizer');

  onDialogShow('floatingIslandsWorkshop', () => {
    addAirshipRandomizerButtons();
    fixStabilizerLabel();
    addHoverPreview();
  });

  onRequest('environment/floating_islands.php', (response, data) => {
    if (response?.workshop?.airship_parts) {
      cacheAirshipParts(response.workshop.airship_parts);
    }

    // Equip a random look for every island.
    if (
      'launch' === data?.action ||
      'launch_vault' === data?.action
    ) {
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
  description: 'Equip a random airship hull, sail, and balloon each time you start an island, plus "Randomize" and "Randomize all" buttons in the airship customization workshop.',
  load: init,
};
