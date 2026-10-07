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
 * Get the power type that counts toward each mouse's power type mastery, keyed by mouse type.
 *
 * @return {Promise<Object>} The power type for each mouse type.
 */
const getMousePowerTypes = async () => {
  if (miceData) {
    return miceData;
  }

  const mastery = await getData('mice-powertype-mastery');
  if (!mastery || typeof mastery !== 'object' || Array.isArray(mastery)) {
    return {};
  }

  miceData = {};
  Object.entries(mastery).forEach(([powerType, mice]) => {
    if (!Array.isArray(mice)) {
      return;
    }

    mice.forEach((mouseType) => {
      miceData[mouseType] = powerType;
    });
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

    // Profile+ reads the group's class attribute as its key, so use an attribute instead.
    group.toggleAttribute('data-mh-crown-hidden', visible === 0);
  });

  view.querySelectorAll('.mh-crown-nav-item').forEach((item) => {
    const group = view.querySelector(`.mouseCrownsView-group.${item.getAttribute('data-mh-crown-target')}`);
    item.classList.toggle('mh-crown-hidden', !group || group.hasAttribute('data-mh-crown-hidden'));
  });
};

/**
 * Add the power type mastery icons and the power type filter.
 *
 * @param {Element} view    The crowns view.
 * @param {Element} summary The summary element to add the filter to.
 */
const addPowerTypes = async (view, summary) => {
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

    const card = mouse.querySelector('.mouseCrownsView-group-mouse-padding');
    if (!card || card.querySelector('.mh-crown-power-type-icon')) {
      return;
    }

    const icon = makeElement('img', 'mh-crown-power-type-icon');
    icon.src = getPowerTypeIcon(powerType);
    icon.title = powerType;
    card.append(icon);
  });

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
  makeElement('div', 'mh-crown-summary-heading', 'Power type mastery', wrapper);

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
  const mice = await getData('mice');
  const crownedTotal = crownTiers.reduce((sum, tier) => sum + getGroupMice(view, tier.type).length, 0);
  const total = Array.isArray(mice) && mice.length ? mice.length : crownedTotal + getGroupMice(view, 'none').length;

  const summary = makeElement('div', ['mouseCrownsView-group', 'mh-crown-summary']);
  const header = makeElement('div', 'mouseCrownsView-group-header');
  makeElement('div', ['mouseCrownsView-crown', 'silver'], '', header);
  const name = makeElement('div', 'mouseCrownsView-group-header-name');
  makeElement('b', '', showTotals ? 'Crown Summary' : 'Power Type Mastery', name);
  makeElement('div', 'mouseCrownsView-group-header-subtitle', `${total.toLocaleString()} mice`, name);
  header.append(name);
  summary.append(header);

  // Removed here rather than up front, so overlapping calls can't each add one while waiting for the data.
  view.querySelector('.mh-crown-summary')?.remove();

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
 * Collapse or expand a crown group, and save it.
 *
 * @param {Element} group     The crown group.
 * @param {string}  type      The crown group type.
 * @param {boolean} collapsed Whether the group should be collapsed.
 */
const setGroupCollapsed = (group, type, collapsed) => {
  group.toggleAttribute('data-mh-crown-collapsed', collapsed);

  const saved = new Set(getCollapsedGroups());
  if (collapsed) {
    saved.add(type);
  } else {
    saved.delete(type);
  }

  saveSetting('better-mice.collapsed-crown-groups', [...saved]);
};

/**
 * Make the crown groups collapsible.
 *
 * The state lives in data attributes rather than classes, as Profile+ uses the group's class attribute
 * as a key and hides every group it doesn't recognize.
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

    group.setAttribute('data-mh-crown-collapsible', '');
    group.toggleAttribute('data-mh-crown-collapsed', collapsed.has(type));

    if (header.getAttribute('data-mh-collapsible')) {
      return;
    }

    header.setAttribute('data-mh-collapsible', true);
    header.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) {
        return;
      }

      setGroupCollapsed(group, type, !group.hasAttribute('data-mh-crown-collapsed'));
    });
  });
};

/**
 * Add a floating bar beside the crowns to jump to each crown group.
 *
 * @param {Element} view The crowns view.
 */
const addNav = (view) => {
  view.querySelector('.mh-crown-nav')?.remove();

  const nav = makeElement('div', 'mh-crown-nav');
  const inner = makeElement('div', 'mh-crown-nav-inner');

  const types = [
    { type: 'favourite', crown: 'favourite', label: 'favourite mice' },
    { type: 'favorites', crown: 'favourite', label: 'favourite mice' },
    ...crownTiers.map((tier) => ({ ...tier, label: `${tier.name} crowns` })),
    { type: 'none', label: 'uncrowned mice' },
  ];
  types.forEach(({ type, crown = type, label }) => {
    const group = view.querySelector(`.mouseCrownsView-group.${type}`);
    if (!group) {
      return;
    }

    const item = makeElement('button', 'mh-crown-nav-item');
    item.setAttribute('data-mh-crown-target', type);
    item.setAttribute('aria-label', `Jump to ${label}`);

    makeElement('div', ['mouseCrownsView-crown', crown], '', item);
    makeElement('span', ['PreferencesPage__blackTooltipText', 'mh-crown-nav-tooltip'], `Jump to ${label}`, item);

    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (group.hasAttribute('data-mh-crown-collapsed')) {
        setGroupCollapsed(group, type, false);
      }

      group.scrollIntoView({ behavior: 'smooth' });
    });

    inner.append(item);
  });

  if (!inner.children.length) {
    return;
  }

  nav.append(inner);
  view.classList.add('mh-crown-has-nav');
  view.prepend(nav);
};

/**
 * Check the page for the MH: Profile+ userscript, as it decorates King's Crowns itself.
 *
 * @return {boolean} Whether Profile+ is on the page.
 */
const hasProfilePlus = () => {
  return !!document.querySelector(
    '#ws-profile-plus-styles, .mouseCrownsView .toolBar #copyCrownsButton, .mouseCrownsView-group-header.community, .mouseCrownsView-group-header.powerCrown'
  );
};

let hasScheduledProfilePlusCheck = false;

/**
 * Check if Profile+ is running.
 *
 * Profile+ can load after us, so this also uses what was found on a previous page load, and
 * re-checks once the page has settled. If that changes, it's picked up on the next reload.
 *
 * @return {boolean} Whether Profile+ is running.
 */
const isProfilePlusActive = () => {
  const saved = getSetting('better-mice.profile-plus-detected', false);
  const found = hasProfilePlus();

  if (!hasScheduledProfilePlusCheck) {
    hasScheduledProfilePlusCheck = true;

    const recheck = () => {
      setTimeout(() => {
        const detected = hasProfilePlus();
        if (detected !== getSetting('better-mice.profile-plus-detected', false)) {
          saveSetting('better-mice.profile-plus-detected', detected);
        }
      }, 5000);
    };

    if ('complete' === document.readyState) {
      recheck();
    } else {
      window.addEventListener('load', recheck, { once: true });
    }
  }

  return saved || found;
};

let stylesAdded = false;

/**
 * Add the summary, collapsing, power types, and section nav to the King's Crowns view.
 *
 * @param {Element} container The element holding the crown groups, defaults to the profile's crowns view.
 */
const decorateKingsCrowns = async (container = null) => {
  const view = container || (await waitForElement('.mousehuntHud-page-tabContent.active .mouseCrownsView'));
  if (!view || !view.querySelector('.mouseCrownsView-group')) {
    return;
  }

  const showSummary = getSetting('better-mice.show-crown-summary', true);
  const showPowerTypeMastery = getSetting('better-mice.show-crown-power-type-mastery', false);
  const showNav = getSetting('better-mice.show-crown-nav', false);
  if ((!showSummary && !showPowerTypeMastery && !showNav) || isProfilePlusActive()) {
    return;
  }

  if (!stylesAdded) {
    addStyles(styles, 'better-mice-kings-crowns');
    stylesAdded = true;
  }

  powerTypeFilter = null;

  if (showNav) {
    addNav(view);
  }

  if (showSummary || showPowerTypeMastery) {
    const summary = await addSummary(view, showSummary);
    if (showPowerTypeMastery) {
      await addPowerTypes(view, summary);
    }
  }

  addCollapsing(view);
};

/**
 * Initialize the module.
 */
export default async () => {
  onNavigation(() => decorateKingsCrowns(), {
    page: 'hunterprofile',
    tab: 'kings_crowns',
    subtab: 'kings_crowns',
  });
};

export { decorateKingsCrowns };
