import {
  dataGet,
  dataSet,
  doRequest,
  makeElement,
  makeElementDraggable,
  parseNumber
} from '@utils';

import { getMouseStats, makeMouseList, makeStatsModal } from './stats';

const overallStatsKey = 'location-catch-stats-summary';
const locationStatsKey = 'location-catch-stats-summary-details';

/**
 * How long cached stats stay usable.
 *
 * These are stored with dataSet(), which never expires on its own. Catch counts change with every
 * hunt, so without a cutoff the modal keeps reporting whatever the numbers were the first time it
 * was opened — and the pinned current location, which always refetches, ends up contradicting the
 * totals shown directly above it.
 */
const statsCacheDuration = 30 * 60 * 1000;

/**
 * Check whether cached stats are recent enough to use.
 *
 * @param {Object} cached The cached entry, which carries the time it was written.
 *
 * @return {boolean} Whether the entry is still fresh.
 */
const isCacheFresh = (cached) => {
  return Boolean(cached?.updated) && (Date.now() - cached.updated) < statsCacheDuration;
};

/**
 * Environments that are counted under another location's category.
 */
const environmentNameMap = {
  'Twisted Garden': 'Living Garden',
  'Cursed City': 'Lost City',
  'Sand Crypts': 'Sand Dunes',
};

/**
 * Fetch the overall caught/total stats for every location and cache them.
 *
 * @return {Object|boolean} The summary data, or false if it couldn't be fetched.
 */
const fetchOverallStats = async () => {
  const data = await doRequest('managers/ajax/pages/page.php', {
    page_class: 'HunterProfile',
    'page_arguments[tab]': 'mice',
    'page_arguments[sub_tab]': 'location',
  });

  const subtabs = data?.page?.tabs?.mice?.subtabs || [];
  const locationTab = subtabs.find((subtab) => 'location' === subtab?.subtab_type) || subtabs[1];
  const categories = locationTab?.mouse_list?.categories;

  if (! categories || ! categories.length) {
    return false;
  }

  const summary = {
    updated: Date.now(),
    locations: categories.map((category) => ({
      name: category.name,
      type: category.type,
      caught: parseNumber(category.caught),
      total: parseNumber(category.total),
    })),
  };

  await dataSet(overallStatsKey, summary);

  return summary;
};

/**
 * Get the overall stats, from the cache unless a refresh is requested.
 *
 * @param {boolean} refresh Whether to force a refresh of the data.
 *
 * @return {Object|boolean} The summary data, or false if it couldn't be fetched.
 */
const getOverallStats = async (refresh = false) => {
  if (! refresh) {
    const cached = await dataGet(overallStatsKey);
    if (isCacheFresh(cached)) {
      return cached;
    }
  }

  return await fetchOverallStats();
};

/**
 * Fetch the detailed mouse stats for a location and cache them.
 *
 * @param {Object} location The location to fetch details for.
 *
 * @return {Object} The detailed stats for the location.
 */
const fetchLocationStats = async (location) => {
  const mice = await getMouseStats(location.type);

  const details = {
    updated: Date.now(),
    mice: mice.map((mouse) => ({
      name: mouse.name,
      type: mouse.type,
      image: mouse.image,
      crown: mouse.crown,
      num_catches: mouse.num_catches,
      num_misses: mouse.num_misses,
    })),
  };

  const allDetails = await dataGet(locationStatsKey, {});
  allDetails[location.type] = details;
  await dataSet(locationStatsKey, allDetails);

  return details;
};

/**
 * Render the detailed mouse list for a location.
 *
 * @param {Object}  location  The location the details belong to.
 * @param {Object}  details   The detailed stats for the location.
 * @param {Element} container The element to render into.
 */
const renderLocationStats = (location, details, container) => {
  container.replaceChildren();

  container.append(makeMouseList(details.mice));

  const meta = makeElement('div', 'mh-catch-stats-summary-detail-meta');
  makeElement('span', 'mh-catch-stats-summary-updated', `Updated ${new Date(details.updated).toLocaleString()}`, meta);

  const refresh = makeElement('a', 'mh-catch-stats-summary-refresh', 'Refresh');
  refresh.addEventListener('click', async (e) => {
    e.preventDefault();
    refresh.classList.add('mh-catch-stats-summary-loading');
    renderLocationStats(location, await fetchLocationStats(location), container);
  });

  meta.append(refresh);
  container.append(meta);
};

/**
 * Build the expandable element for a single location.
 *
 * @param {Object}  location  The location to build the markup for.
 * @param {boolean} skipCache Whether to always fetch fresh details on expand.
 *
 * @return {Element} The location element.
 */
const makeLocationMarkup = (location, skipCache = false) => {
  const locationEl = makeElement('details', 'mh-catch-stats-summary-location');
  if (location.caught >= location.total) {
    locationEl.classList.add('mh-catch-stats-summary-location-complete');
  }

  const summary = document.createElement('summary');
  makeElement('span', 'mh-catch-stats-summary-location-name', location.name, summary);
  makeElement('span', 'mh-catch-stats-summary-location-count', `${location.caught} / ${location.total}`, summary);
  locationEl.append(summary);

  const body = makeElement('div', 'mh-catch-stats-summary-location-body');
  locationEl.append(body);

  // Fetch the details the first time the location is expanded.
  let hasLoaded = false;
  locationEl.addEventListener('toggle', async () => {
    if (! locationEl.open || hasLoaded) {
      return;
    }

    hasLoaded = true;
    makeElement('div', 'mh-catch-stats-summary-loading-text', 'Loading…', body);

    const allDetails = skipCache ? {} : await dataGet(locationStatsKey, {});
    const cached = allDetails[location.type];
    const details = isCacheFresh(cached) ? cached : await fetchLocationStats(location);
    renderLocationStats(location, details, body);
  });

  return locationEl;
};

/**
 * Render the summary into the modal body.
 *
 * @param {Object|boolean} stats The summary data.
 * @param {Element}        body  The modal body element.
 */
const renderSummary = (stats, body) => {
  body.replaceChildren();

  if (! stats || ! stats.locations) {
    makeElement('div', 'mh-catch-stats-summary-error', 'Could not load the location stats. Please try again.', body);
    return;
  }

  // Totals row: caught count, percent, progress bar, and locations complete.
  const meta = makeElement('div', 'mh-catch-stats-summary-meta');

  const totalCaught = stats.locations.reduce((sum, location) => sum + location.caught, 0);
  const totalMice = stats.locations.reduce((sum, location) => sum + location.total, 0);
  const percent = totalMice ? Math.round((totalCaught / totalMice) * 1000) / 10 : 0;
  const completeCount = stats.locations.filter((location) => location.caught >= location.total).length;

  const total = makeElement('div', 'mh-catch-stats-summary-total');
  makeElement('span', 'mh-catch-stats-summary-total-count', `${totalCaught.toLocaleString()} / ${totalMice.toLocaleString()} mice`, total);
  makeElement('span', 'mh-catch-stats-summary-total-percent', `${percent}%`, total);
  meta.append(total);

  const progress = makeElement('div', 'mh-catch-stats-summary-progress');
  const progressFill = makeElement('div', 'mh-catch-stats-summary-progress-fill');
  progressFill.style.width = `${percent}%`;
  progress.append(progressFill);
  meta.append(progress);

  makeElement('div', 'mh-catch-stats-summary-locations-complete', `${completeCount} of ${stats.locations.length} locations complete`, meta);

  body.append(meta);

  const locations = [...stats.locations].sort((a, b) => a.name.localeCompare(b.name));

  // Pin the current location to the top, always showing fresh stats.
  const currentName = environmentNameMap[user.environment_name] || user.environment_name;
  const current = locations.find((location) => location.name === currentName);
  if (current) {
    const currentEl = makeLocationMarkup(current, true);
    currentEl.classList.add('mh-catch-stats-summary-location-current');
    body.append(currentEl);
    currentEl.open = true;
  }

  const incomplete = locations.filter((location) => location !== current && location.caught < location.total);
  const complete = locations.filter((location) => location !== current && location.caught >= location.total);

  /**
   * Build a collapsible group of locations.
   *
   * @param {string}  title          The group title.
   * @param {Array}   groupLocations The locations in the group.
   * @param {boolean} open           Whether the group should start expanded.
   */
  const makeGroup = (title, groupLocations, open) => {
    const group = makeElement('details', 'mh-catch-stats-summary-group');
    group.open = open;

    makeElement('summary', 'mh-catch-stats-summary-group-title', `${title} (${groupLocations.length})`, group);

    groupLocations.forEach((location) => {
      group.append(makeLocationMarkup(location));
    });

    body.append(group);
  };

  makeGroup('Incomplete', incomplete, true);
  makeGroup('Complete', complete, false);

  // Last-updated and refresh row at the bottom.
  const updatedRow = makeElement('div', 'mh-catch-stats-summary-updated-row');
  makeElement('span', 'mh-catch-stats-summary-updated', `Updated ${new Date(stats.updated).toLocaleString()}`, updatedRow);

  const refresh = makeElement('a', 'mh-catch-stats-summary-refresh', 'Refresh');
  refresh.addEventListener('click', async (e) => {
    e.preventDefault();
    body.replaceChildren(makeElement('div', 'mh-catch-stats-summary-loading-text', 'Loading…'));
    renderSummary(await getOverallStats(true), body);
  });

  updatedRow.append(refresh);
  body.append(updatedRow);
};

/**
 * Show the summary modal.
 */
const showSummaryModal = async () => {
  const { wrapper, body } = makeStatsModal('mh-catch-stats-summary', 'Location Catch Stats');

  makeElement('div', 'mh-catch-stats-summary-loading-text', 'Loading…', body);

  document.body.append(wrapper);
  makeElementDraggable('#mh-catch-stats-summary', '#mh-catch-stats-summary .mh-catch-stats-header', 25, 25);

  renderSummary(await getOverallStats(), body);
};

export {
  showSummaryModal
};
