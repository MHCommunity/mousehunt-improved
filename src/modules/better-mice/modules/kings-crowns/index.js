import { addStyles, getData, getSetting, makeElement, onNavigation, saveSetting, waitForElement } from '@utils';

import styles from './styles.css';

const crownTiers = [
  { type: 'diamond', name: 'Diamond' },
  { type: 'platinum', name: 'Platinum' },
  { type: 'gold', name: 'Gold' },
  { type: 'silver', name: 'Silver' },
  { type: 'bronze', name: 'Bronze' },
];

const powerTypes = ['arcane', 'draconic', 'forgotten', 'hydro', 'law', 'physical', 'rift', 'shadow', 'tactical', 'multi', 'event'];

let miceData = null;
let powerTypeFilter = null;

/**
 * Get the power type for each mouse, keyed by mouse type.
 *
 * Event mice get their own group, otherwise it's the single power type the mouse is weakest to (using the strongest effectiveness it has), or 'multi' if there are several.
 *
 * @return {Promise<Object>} The power type for each mouse type.
 */
const getMousePowerTypes = async () => {
  if (miceData) {
    return miceData;
  }

  const mice = await getData('mice');
  if (!mice || !Array.isArray(mice)) {
    return {};
  }

  miceData = {};
  mice.forEach((mouse) => {
    if ('event' === mouse.group_id) {
      miceData[mouse.type] = 'event';
      return;
    }

    const strongest = ['veryEffective', 'effective', 'lessEffective'].map((tier) => mouse.weaknesses?.[tier]).find((types) => types?.length);
    if (!strongest) {
      return;
    }

    miceData[mouse.type] = 1 === strongest.length ? strongest[0] : 'multi';
  });

  return miceData;
};

/**
 * Get the icon for a power type.
 *
 * @param {string} type The power type.
 *
 * @return {string} The icon URL.
 */
const getPowerTypeIcon = (type) => {
  if ('event' === type) {
    return 'https://www.mousehuntgame.com/images/ui/hud/menu/special.png';
  }

  return `https://www.mousehuntgame.com/images/powertypes/${'multi' === type ? 'parental' : type}.png`;
};

/**
 * Get the mice in a crown group, not counting favourites.
 *
 * @param {Element} view The crowns view.
 * @param {string}  type The crown group type.
 *
 * @return {Element[]} The mice in the group.
 */
const getGroupMice = (view, type) => {
  return [...view.querySelectorAll(`.mouseCrownsView-group.${type} .mouseCrownsView-group-mouse:not(.empty)`)];
};

/**
 * Format a count as a percentage of the total.
 *
 * @param {number} count The count.
 * @param {number} total The total.
 *
 * @return {string} The percentage.
 */
const formatPercent = (count, total) => {
  return total ? `${((count / total) * 100).toFixed(1)}%` : '0%';
};

/**
 * Make a stat tile for the summary.
 *
 * @param {string} type  The crown type.
 * @param {string} label The label.
 * @param {number} count The count.
 * @param {number} total The total number of mice.
 *
 * @return {Element} The tile.
 */
const makeTile = (type, label, count, total) => {
  const tile = makeElement('div', ['mh-crown-summary-tile', `mh-crown-summary-tile-${type}`]);
  makeElement('div', ['mouseCrownsView-crown', type], '', tile);

  const text = makeElement('div', 'mh-crown-summary-text');
  makeElement('div', 'mh-crown-summary-count', count.toLocaleString(), text);
  makeElement('div', 'mh-crown-summary-label', label, text);
  makeElement('div', 'mh-crown-summary-percent', formatPercent(count, total), text);
  tile.append(text);

  return tile;
};

/**
 * Show only the mice of the selected power type.
 *
 * @param {Element} view The crowns view.
 */
const applyPowerTypeFilter = (view) => {
  view.querySelectorAll('.mh-crown-power-type').forEach((button) => {
    button.classList.toggle('active', button.getAttribute('data-mh-filter') === powerTypeFilter);
  });

  view.classList.toggle('mh-crown-filtered', !!powerTypeFilter);

  view.querySelectorAll('.mouseCrownsView-group:not(.favourite):not(.mh-crown-summary)').forEach((group) => {
    let visible = 0;
    group.querySelectorAll('.mouseCrownsView-group-mouse').forEach((mouse) => {
      const matches = !powerTypeFilter || mouse.getAttribute('data-mh-power-type') === powerTypeFilter;
      mouse.classList.toggle('mh-crown-hidden', !matches);
      if (matches) {
        visible++;
      }
    });

    group.classList.toggle('mh-crown-hidden', visible === 0);
  });
};

/**
 * Add the power type icons and the power type filter.
 *
 * @param {Element}      view      The crowns view.
 * @param {Element|null} summary   The summary element to add the filter to, or null to skip the filter.
 * @param {boolean}      showIcons Whether to add the power type icons to the mice.
 */
const addPowerTypes = async (view, summary, showIcons) => {
  const mousePowerTypes = await getMousePowerTypes();
  if (!Object.keys(mousePowerTypes).length) {
    return;
  }

  view.querySelectorAll('.mouseCrownsView-group-mouse:not(.empty)').forEach((mouse) => {
    const powerType = mousePowerTypes[mouse.getAttribute('data-mouse-type')];
    if (!powerType) {
      return;
    }

    mouse.setAttribute('data-mh-power-type', powerType);
    if (!showIcons) {
      return;
    }

    const card = mouse.querySelector('.mouseCrownsView-group-mouse-padding');
    if (!card || card.querySelector('.mh-crown-power-type-icon')) {
      return;
    }

    const icon = makeElement('img', 'mh-crown-power-type-icon');
    icon.src = getPowerTypeIcon(powerType);
    icon.title = powerType;
    card.append(icon);
  });

  if (!summary) {
    return;
  }

  const silverPlus = new Set(['diamond', 'platinum', 'gold', 'silver']);
  const totals = {};
  const crowned = {};
  Object.values(mousePowerTypes).forEach((type) => {
    totals[type] = (totals[type] || 0) + 1;
  });

  view.querySelectorAll('.mouseCrownsView-group:not(.favourite) .mouseCrownsView-group-mouse[data-mh-power-type]').forEach((mouse) => {
    const group = mouse.closest('.mouseCrownsView-group');
    if (![...group.classList].some((c) => silverPlus.has(c))) {
      return;
    }

    const type = mouse.getAttribute('data-mh-power-type');
    crowned[type] = (crowned[type] || 0) + 1;
  });

  const wrapper = makeElement('div', 'mh-crown-power-types');
  makeElement('div', 'mh-crown-summary-heading', 'Silver crowns by power type', wrapper);

  const buttons = makeElement('div', 'mh-crown-power-types-buttons');
  powerTypes.forEach((type) => {
    if (!totals[type]) {
      return;
    }

    const button = makeElement('button', 'mh-crown-power-type');
    button.setAttribute('data-mh-filter', type);
    button.title = `Show only ${type} mice`;

    const icon = makeElement('img');
    icon.src = getPowerTypeIcon(type);
    button.append(icon);

    const count = crowned[type] || 0;
    makeElement('span', 'mh-crown-power-type-count', count.toLocaleString(), button);
    makeElement('span', 'mh-crown-power-type-total', `/${totals[type].toLocaleString()}`, button);
    if (count === totals[type]) {
      button.classList.add('complete');
    }

    button.addEventListener('click', (e) => {
      e.preventDefault();
      powerTypeFilter = powerTypeFilter === type ? null : type;
      applyPowerTypeFilter(view);
    });

    buttons.append(button);
  });

  wrapper.append(buttons);
  summary.append(wrapper);

  applyPowerTypeFilter(view);
};

/**
 * Add the crown summary.
 *
 * @param {Element} view       The crowns view.
 * @param {boolean} showTotals Whether to show the crown totals, otherwise the summary only holds the power types.
 *
 * @return {Promise<Element>} The summary element.
 */
const addSummary = async (view, showTotals) => {
  view.querySelector('.mh-crown-summary')?.remove();

  const mice = await getData('mice');
  const crownedTotal = crownTiers.reduce((sum, tier) => sum + getGroupMice(view, tier.type).length, 0);
  const total = Array.isArray(mice) && mice.length ? mice.length : crownedTotal + getGroupMice(view, 'none').length;

  const summary = makeElement('div', ['mouseCrownsView-group', 'mh-crown-summary']);
  const header = makeElement('div', 'mouseCrownsView-group-header');
  makeElement('div', ['mouseCrownsView-crown', 'silver'], '', header);
  const name = makeElement('div', 'mouseCrownsView-group-header-name');
  makeElement('b', '', showTotals ? 'Crown Summary' : 'Power Types', name);
  makeElement('div', 'mouseCrownsView-group-header-subtitle', `${total.toLocaleString()} mice`, name);
  header.append(name);
  summary.append(header);

  const favourites = view.querySelector('.mouseCrownsView-group.favourite, .mouseCrownsView-group.favorites');
  if (favourites) {
    favourites.after(summary);
  } else {
    view.prepend(summary);
  }

  if (!showTotals) {
    return summary;
  }

  const tiles = makeElement('div', 'mh-crown-summary-tiles');

  let runningTotal = 0;
  crownTiers.forEach((tier) => {
    runningTotal += getGroupMice(view, tier.type).length;
    tiles.append(makeTile(tier.type, tier.name, runningTotal, total));
  });

  const uncrowned = Math.max(0, total - runningTotal);
  tiles.append(makeTile('none', 'Uncrowned', uncrowned, total));

  summary.append(tiles);

  return summary;
};

/**
 * Get the saved collapsed crown groups.
 *
 * @return {string[]} The collapsed group types.
 */
const getCollapsedGroups = () => {
  const collapsed = getSetting('better-mice.collapsed-crown-groups', []);
  return Array.isArray(collapsed) ? collapsed : [];
};

/**
 * Make the crown groups collapsible.
 *
 * @param {Element} view The crowns view.
 */
const addCollapsing = (view) => {
  const collapsed = new Set(getCollapsedGroups());

  view.querySelectorAll('.mouseCrownsView-group').forEach((group) => {
    const type = ['mh-crown-summary', ...crownTiers.map((t) => t.type), 'none', 'favourite', 'favorites'].find((t) => group.classList.contains(t));
    const header = group.querySelector('.mouseCrownsView-group-header');
    if (!type || !header) {
      return;
    }

    group.classList.add('mh-crown-collapsible');
    group.classList.toggle('mh-crown-collapsed', collapsed.has(type));

    if (header.getAttribute('data-mh-collapsible')) {
      return;
    }

    header.setAttribute('data-mh-collapsible', true);
    header.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) {
        return;
      }

      const isCollapsed = group.classList.toggle('mh-crown-collapsed');
      const saved = new Set(getCollapsedGroups());
      if (isCollapsed) {
        saved.add(type);
      } else {
        saved.delete(type);
      }

      saveSetting('better-mice.collapsed-crown-groups', [...saved]);
    });
  });
};

/**
 * Add the summary, collapsing, and power types to the King's Crowns view.
 *
 * @param {Element} container The element holding the crown groups, defaults to the profile's crowns view.
 */
const decorateKingsCrowns = async (container = null) => {
  const view = container || (await waitForElement('.mousehuntHud-page-tabContent.active .mouseCrownsView'));
  if (!view || !view.querySelector('.mouseCrownsView-group')) {
    return;
  }

  powerTypeFilter = null;

  const showSummary = getSetting('better-mice.show-crown-summary', true);
  const showPowerTypeSummary = getSetting('better-mice.show-crown-power-type-summary', true);
  const showPowerTypeIcons = getSetting('better-mice.show-crown-power-types', true);

  const summary = showSummary || showPowerTypeSummary ? await addSummary(view, showSummary) : null;
  if (showPowerTypeSummary || showPowerTypeIcons) {
    await addPowerTypes(view, showPowerTypeSummary ? summary : null, showPowerTypeIcons);
  }

  addCollapsing(view);
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-mice-kings-crowns');

  onNavigation(() => decorateKingsCrowns(), {
    page: 'hunterprofile',
    tab: 'kings_crowns',
    subtab: 'kings_crowns',
  });
};

export { decorateKingsCrowns };
