import { addStyles, doRequest, getSetting, makeElement, onTurn, saveSetting } from '@utils';

import { registerTrapSelectorDecorator } from '../../trap-selector-runtime';

import styles from './styles.css';

const MODE_SETTING = 'better-trap-selector.supply-runway-mode';
const MINUTES_PER_HUNT = 15;

const CLASSIFICATIONS = {
  bait: {
    quantityKey: 'bait_quantity',
    itemIdKey: 'bait_item_id',
    armedLabel: 'This cheese',
    allLabel: 'All cheese',
    noun: 'cheese',
  },
  trinket: {
    quantityKey: 'trinket_quantity',
    itemIdKey: 'trinket_item_id',
    armedLabel: 'This charm',
    allLabel: 'All charms',
    noun: 'charms',
  },
};

// The owned items for each classification, from the trap selector's own component requests.
const componentCache = {};
const pendingFetches = {};

/**
 * Store the components from a trap component response.
 *
 * @param {Array} components The components from the response.
 */
const cacheComponents = (components = []) => {
  const grouped = {};
  for (const component of Object.values(components)) {
    if (!CLASSIFICATIONS[component?.classification]) {
      continue;
    }

    grouped[component.classification] ||= [];
    grouped[component.classification].push(component);
  }

  Object.assign(componentCache, grouped);
};

/**
 * Get the owned items for a classification, fetching them if the trap selector hasn't.
 *
 * @param {string} classification The item classification.
 *
 * @return {Promise<Array>} The owned items.
 */
const getComponents = async (classification) => {
  if (componentCache[classification]) {
    return componentCache[classification];
  }

  pendingFetches[classification] ||= doRequest('managers/ajax/users/gettrapcomponents.php', { classification }).then((response) => {
    cacheComponents(response?.components);
    delete pendingFetches[classification];
    return componentCache[classification] || [];
  });

  return pendingFetches[classification];
};

/**
 * Format a number of hunts as how long they'd last sounding every horn.
 *
 * @param {number} hunts The number of hunts.
 *
 * @return {string} The duration, using the two largest units.
 */
const formatDuration = (hunts) => {
  const units = [
    ['year', 365 * 24 * 60],
    ['day', 24 * 60],
    ['hour', 60],
    ['minute', 1],
  ];

  let remaining = hunts * MINUTES_PER_HUNT;
  const values = units.map(([name, size]) => {
    const value = Math.floor(remaining / size);
    remaining -= value * size;
    return { name, value };
  });

  const first = values.findIndex(({ value }) => value > 0);
  if (-1 === first) {
    return 'less than a minute';
  }

  return values
    .slice(first, first + 2)
    .filter(({ value }) => value > 0)
    .map(({ name, value }) => `${value.toLocaleString()} ${name}${1 === value ? '' : 's'}`)
    .join(', ');
};

/**
 * Get the classification of the open item browser.
 *
 * @return {string|null} The classification, if it's one we handle.
 */
const getOpenClassification = () => {
  const browser = document.querySelector('.campPage-trap-itemBrowser');
  return Object.keys(CLASSIFICATIONS).find((classification) => browser?.classList.contains(classification)) || null;
};

/**
 * Add or update the supply estimate under the armed item.
 */
const renderRunway = async () => {
  const classification = getOpenClassification();
  const header = document.querySelector('.trapSelectorView__itemBrowserHeader');

  const existing = header?.querySelector('.mh-supply-runway');
  if (!classification || !header) {
    existing?.remove();
    return;
  }

  const config = CLASSIFICATIONS[classification];
  const mode = 'all' === getSetting(MODE_SETTING, 'armed') ? 'all' : 'armed';

  const armedQuantity = Number.parseInt(user[config.quantityKey], 10) || 0;

  let quantity = armedQuantity;
  if ('all' === mode) {
    const components = await getComponents(classification);

    // The cached counts are from when the trap selector loaded, so use the live count for what's armed.
    quantity = components.reduce((total, item) => {
      if (`${item.item_id}` === `${user[config.itemIdKey]}`) {
        return total + armedQuantity;
      }

      return total + (Number.parseInt(item.quantity, 10) || 0);
    }, 0);
  }

  // The browser may have switched while the components loaded.
  if (classification !== getOpenClassification() || !header.isConnected) {
    return;
  }

  const runway = makeElement('div', ['mh-supply-runway', `mh-supply-runway-${classification}`]);

  const toggle = makeElement('div', 'mh-supply-runway-toggle');
  for (const [value, label] of [
    ['armed', config.armedLabel],
    ['all', config.allLabel],
  ]) {
    const option = makeElement('button', 'mh-supply-runway-option');
    option.type = 'button';
    option.textContent = label;
    option.classList.toggle('mh-supply-runway-option-active', value === mode);
    option.addEventListener('click', () => {
      if (value === mode) {
        return;
      }

      saveSetting(MODE_SETTING, value);
      renderRunway();
    });

    toggle.append(option);
  }

  runway.append(toggle);

  const text = makeElement('div', 'mh-supply-runway-text');
  if (quantity > 0) {
    const duration = makeElement('span', 'mh-supply-runway-duration');
    duration.textContent = `Lasts ${formatDuration(quantity)}`;

    const detail = makeElement('span', 'mh-supply-runway-detail');
    detail.textContent = `${quantity.toLocaleString()} hunts, sounding every horn`;

    text.append(duration, detail);
  } else {
    text.textContent = 'armed' === mode ? 'Nothing armed' : `No ${config.noun}`;
  }

  runway.append(text);

  const current = header.querySelector('.mh-supply-runway');
  if (current) {
    current.replaceWith(runway);
  } else {
    header.append(runway);
  }
};

/**
 * Initialize the feature.
 */
const init = () => {
  addStyles(styles, 'better-trap-selector-supply-runway');

  registerTrapSelectorDecorator('controls', 'supply-runway', ({ type, data }) => {
    if ('components' === type) {
      cacheComponents(data?.components);
    }

    if (['blueprint', 'components', 'trap-change'].includes(type)) {
      return renderRunway();
    }

    return null;
  });

  onTurn(() => {
    if (document.querySelector('.mh-supply-runway')) {
      renderRunway();
    }
  });
};

export default init;
