import { getArForMouse, getCurrentLocation, getData, getSetting, lsGet, lsSet, make, makeMhButton, mapData, showTravelConfirmationNoDetails } from '@utils';

import { getMouseDataForMap } from './tab-sorted';

// Tuning for the plan. Rates are percentages.
const RATE_FLOOR = 5; // A setup only "counts" for a mouse at or above this rate.
const RATE_CAP = 33; // A mouse's contribution to a setup's score is capped here.
const GUARANTEED_RATE = 90; // Mice at or above this rate anywhere are guaranteed attractions, not plan material.
const DETAIL_ROWS_PER_MOUSE = 5; // MHCT rows shown per mouse in an expanded setup.
const MIN_HUNTS = 500; // MHCT rows with fewer recorded hunts are only used when a mouse has nothing better.
const INITIAL_ROWS = 30;
const FETCH_CONCURRENCY = 8;

const SORT_KEY = 'mh-improved-map-plan-sort';
const GUARANTEED_COLLAPSED_KEY = 'mh-improved-map-plan-guaranteed-collapsed';

const SORTS = {
  best: { label: 'Best overall', title: `Sum of attraction rates, with each mouse capped at ${RATE_CAP}% so one easy mouse doesn't dominate.` },
  raw: { label: 'Raw AR', title: "Plain sum of attraction rates, like tsitu's map tool." },
  mice: { label: 'Most mice', title: 'Setups covering the most remaining mice first.' },
  hunts: { label: 'Quickest to clear', title: 'Fewest expected hunts to catch everything listed for the setup.' },
};

// Same twisted-location aliases the MHCT popups use to find an environment.
const LOCATION_ALIASES = {
  'Twisted Garden': 'Living Garden',
  'Sand Crypts': 'Sand Dunes',
  'Cursed City': 'Lost City',
};

// In-memory rates for the map on screen, so re-rendering doesn't refetch anything.
let loadedRates = { mapId: null, rates: new Map() };

/**
 * Fetch the attraction rates for a list of mice, a few at a time.
 *
 * @param {Array}    mice       The mice to fetch rates for.
 * @param {Function} onProgress Called with (done, total) after each mouse.
 *
 * @return {Map} Rates keyed by the mouse's unique ID.
 */
const fetchRates = async (mice, onProgress) => {
  const rates = new Map();
  let next = 0;
  let done = 0;

  const worker = async () => {
    while (next < mice.length) {
      const mouse = mice[next++];

      let mouseRates = [];
      try {
        mouseRates = await getArForMouse(mouse.type ?? mouse.unique_id, 'mouse');
      } catch {
        mouseRates = [];
      }

      rates.set(mouse.unique_id, Array.isArray(mouseRates) ? mouseRates : []);
      done++;
      onProgress(done, mice.length);
    }
  };

  await Promise.all(Array.from({ length: Math.min(FETCH_CONCURRENCY, mice.length) }, worker));

  return rates;
};

/**
 * Expected number of hunts to attract every mouse in a setup at least once.
 *
 * Each hunt attracts at most one mouse, so the rates are mutually exclusive. This is
 * E[T] = sum over k of P(T > k), with P(T > k) = 1 - product(1 - (1 - p_i)^k).
 *
 * @param {Array} rates Attraction rates as fractions (0-1).
 *
 * @return {number} Expected hunts, ignoring catch rate.
 */
const expectedHuntsToClear = (rates) => {
  if (rates.length === 0) {
    return 0;
  }

  const missChance = rates.map(() => 1);
  let expected = 0;

  for (let hunt = 0; hunt < 10000; hunt++) {
    let allCaught = 1;
    for (const chance of missChance) {
      allCaught *= 1 - chance;
    }

    const notDone = 1 - allCaught;
    expected += notDone;

    if (notDone < 0.0001) {
      break;
    }

    for (const [index, rate] of rates.entries()) {
      missChance[index] *= 1 - rate;
    }
  }

  return expected;
};

/**
 * Pivot the per-mouse MHCT rates into per-setup rows and score them.
 *
 * @param {Array} mice         Uncaught mice on the map.
 * @param {Map}   ratesByMouse Rates keyed by mouse unique ID.
 * @param {Function} findEnvironment Resolves a location name to an environment.
 *
 * @return {Object} The plan model.
 */
const buildPlan = (mice, ratesByMouse, findEnvironment) => {
  const isEventLocation = (name) => {
    const environment = findEnvironment(name);
    return !environment || Boolean(environment.isEvent);
  };

  const setups = new Map();
  const guaranteed = [];
  const noData = [];
  const hard = [];
  const locationCounts = new Map();
  const mouseRows = new Map();

  for (const mouse of mice) {
    const allRows = (ratesByMouse.get(mouse.unique_id) || [])
      .map((row) => ({
        location: row.location,
        stage: row.stage || '',
        cheese: row.cheese,
        rate: row.rate / 100,
        hunts: row.total_hunts || 0,
      }))
      .filter((row) => row.rate > 0 && row.location && row.cheese);

    // Only fall back to event or unavailable locations when a mouse has nowhere else to go.
    const permanentRows = allRows.filter((row) => !isEventLocation(row.location));
    const rows = permanentRows.length > 0 ? permanentRows : allRows;

    if (rows.length === 0) {
      noData.push(mouse);
      continue;
    }

    const best = rows.reduce((top, row) => (row.rate > top.rate ? row : top));
    if (best.rate >= GUARANTEED_RATE) {
      guaranteed.push({ mouse, ...best });
      continue;
    }

    const viableRows = rows.filter((row) => row.rate >= RATE_FLOOR);
    if (viableRows.length === 0) {
      hard.push({ mouse, ...best });
      continue;
    }

    // Prefer well-sampled setups; fall back to thin data only when that's all there is.
    const trustedRows = viableRows.filter((row) => row.hunts >= MIN_HUNTS);
    const viable = trustedRows.length > 0 ? trustedRows : viableRows;

    locationCounts.set(mouse.unique_id, new Set(viable.map((row) => row.location)).size);
    mouseRows.set(
      mouse.unique_id,
      [...viable].sort((a, b) => b.rate - a.rate)
    );

    for (const row of viable) {
      const key = `${row.location}|${row.stage}|${row.cheese}`;
      if (!setups.has(key)) {
        setups.set(key, { key, location: row.location, stage: row.stage, cheese: row.cheese, mice: [] });
      }

      setups.get(key).mice.push({ mouse, rate: row.rate, hunts: row.hunts, rare: false });
    }
  }

  const list = [...setups.values()];
  for (const setup of list) {
    setup.mice.sort((a, b) => b.rate - a.rate);

    let raw = 0;
    let capped = 0;
    for (const entry of setup.mice) {
      entry.locationCount = locationCounts.get(entry.mouse.unique_id);
      entry.rare = 1 === entry.locationCount;
      raw += entry.rate;
      capped += Math.min(entry.rate, RATE_CAP);
    }

    setup.raw = raw;
    setup.capped = capped;
    setup.count = setup.mice.length;
    setup.hunts = expectedHuntsToClear(setup.mice.map((entry) => entry.rate / 100));
  }

  return { setups: list, guaranteed, noData, hard, mouseRows };
};

/**
 * Sort setups for the chosen view.
 *
 * @param {Array}  setups The setups.
 * @param {string} sort   The sort key.
 *
 * @return {Array} A sorted copy.
 */
const sortSetups = (setups, sort) => {
  const comparators = {
    best: (a, b) => b.capped - a.capped || b.count - a.count,
    raw: (a, b) => b.raw - a.raw || b.count - a.count,
    mice: (a, b) => b.count - a.count || a.hunts - b.hunts,
    hunts: (a, b) => a.hunts - b.hunts || b.count - a.count,
  };

  return [...setups].sort(comparators[sort] || comparators.best);
};

/**
 * Collapse setups at the same location with the same mice into the best-ranked one.
 *
 * Cheese and stage variants of a location usually attract the same map mice, so they'd
 * otherwise fill the top of the table with near-duplicates.
 *
 * @param {Array} sorted Setups, best first.
 *
 * @return {Array} Setups with an `alternatives` list of collapsed variants.
 */
const collapseVariants = (sorted) => {
  const seen = new Map();
  const collapsed = [];

  for (const setup of sorted) {
    const key = `${setup.location}|${setup.mice
      .map((entry) => entry.mouse.unique_id)
      .sort()
      .join(',')}`;
    const primary = seen.get(key);
    if (primary) {
      primary.alternatives.push(setup);
      continue;
    }

    const copy = { ...setup, alternatives: [] };
    seen.set(key, copy);
    collapsed.push(copy);
  }

  return collapsed;
};

/**
 * Format a rate for display.
 *
 * @param {number} rate The rate as a percentage.
 *
 * @return {string} The formatted rate.
 */
const formatRate = (rate) => `${(Math.round(rate * 10) / 10).toFixed(1)}%`;

/**
 * Format an expected hunt count for display.
 *
 * @param {number} hunts The expected hunts.
 *
 * @return {string} The formatted count.
 */
const formatHunts = (hunts) => {
  if (hunts < 10) {
    return `~${Math.max(1, Math.round(hunts))} hunts`;
  }

  return `~${Math.round(hunts / 5) * 5} hunts`;
};

/**
 * Build the lookup from an MHCT location name to an environment.
 *
 * @return {Function} Resolves a location name to an environment or null.
 */
const makeEnvironmentFinder = async () => {
  const environments = (await getData('environments')) || [];
  const eventEnvironments = (await getData('environments-events')) || [];

  const cache = new Map();

  return (name) => {
    if (cache.has(name)) {
      return cache.get(name);
    }

    const lookup = LOCATION_ALIASES[name] || name;
    let environment = environments.find((env) => env.name === lookup) || null;

    // Event locations (Ronza's, the Winter Hunt areas, ...) are marked so the plan can
    // leave them out for mice that can be found somewhere permanent.
    if (!environment) {
      const eventEnvironment = eventEnvironments.find((env) => env.name === name);
      environment = eventEnvironment ? { ...eventEnvironment, isEvent: true } : null;
    }

    cache.set(name, environment);
    return environment;
  };
};

/**
 * Make a mouse chip.
 *
 * @param {Object} entry Mouse entry with mouse, rate, and optional hunts.
 *
 * @return {HTMLElement} The chip.
 */
const makeMouseChip = (entry) => {
  const chip = make('span', 'plan-mouse');
  chip.setAttribute('data-mouse-id', entry.mouse.unique_id);

  const details = [`${entry.mouse.name}: ${formatRate(entry.rate)}`];
  if (entry.hunts && entry.hunts < MIN_HUNTS) {
    chip.classList.add('plan-mouse-low-data');
    details.push(`only ${entry.hunts} hunts recorded on MHCT`);
  }

  if (entry.rare) {
    details.push('only found in this location');
  }

  chip.title = details.join(' · ');

  make('span', 'plan-mouse-name', entry.mouse.name, chip);
  make('span', 'plan-mouse-rate', formatRate(entry.rate), chip);

  return chip;
};

/**
 * Make a travel button for an environment, unless we couldn't resolve it or are already there.
 *
 * @param {Object|null} environment The environment.
 *
 * @return {HTMLElement} The button or an empty placeholder.
 */
const makeTravelButton = (environment) => {
  if (!environment || environment.id === getCurrentLocation()) {
    return make('span', 'plan-travel-placeholder');
  }

  return makeMhButton({
    text: 'Travel',
    title: `Travel to ${environment.name}`,
    className: 'plan-travel',
    callback: (event) => {
      event.stopPropagation();
      showTravelConfirmationNoDetails(environment);
    },
  });
};

/**
 * Make the title cell for a setup: location, stage, cheese, and collapsed variants.
 *
 * @param {Object}      setup       The setup.
 * @param {Object|null} environment The resolved environment.
 *
 * @return {HTMLElement} The cell.
 */
const makeSetupTitle = (setup, environment) => {
  const title = make('div', 'plan-setup-title');

  const line = make('div', 'plan-setup-line', '', title);
  const location = make('span', 'plan-setup-location', setup.location, line);
  if (!environment) {
    location.title = 'Location not currently available';
    title.classList.add('plan-setup-title-unknown');
  }

  if (setup.stage) {
    make('span', 'plan-setup-stage', setup.stage, line);
  }

  make('span', 'plan-setup-cheese', setup.cheese, line);

  if (setup.alternatives?.length) {
    const names = setup.alternatives.map((alt) => [alt.stage, alt.cheese].filter(Boolean).join(' '));
    const shown = names.slice(0, 3);
    const more = names.length - shown.length;
    const alternatives = make('div', 'plan-setup-alternatives', `or ${shown.join(', ')}${more > 0 ? ` +${more} more` : ''}`, title);
    alternatives.title = `Other setups here that attract the same mice: ${names.join(', ')}`;
  }

  return title;
};

/**
 * Format a hunt count with thousands separators.
 *
 * @param {number} count The count.
 *
 * @return {string} The formatted count.
 */
const formatCount = (count) => Number(count || 0).toLocaleString();

/**
 * Make the expanded details for a setup: a table per mouse of where it can be caught,
 * with the bait, stage, rate, and sample size for each option.
 *
 * @param {Object}   options                 Options.
 * @param {Object}   options.setup           The setup.
 * @param {Array}    options.mice            Mice entries listed for it.
 * @param {Map}      options.mouseRows       Viable rows per mouse, best first.
 * @param {Function} options.findEnvironment Environment finder.
 *
 * @return {HTMLElement} The details panel.
 */
const makeSetupDetails = ({ setup, mice, mouseRows, findEnvironment }) => {
  const details = make('div', 'plan-setup-details');

  // Only show the stage column when at least one listed row has a stage.
  const perMouse = mice.map((entry) => {
    const allRows = mouseRows.get(entry.mouse.unique_id) || [];
    return { entry, rows: allRows.slice(0, DETAIL_ROWS_PER_MOUSE), hidden: Math.max(0, allRows.length - DETAIL_ROWS_PER_MOUSE) };
  });
  const hasStages = perMouse.some(({ rows }) => rows.some((row) => row.stage));
  const columns = ['Mouse', 'Location', ...(hasStages ? ['Stage'] : []), 'Bait', 'Rate', 'Samples'];

  const table = make('table', 'plan-detail-table', '', details);
  const head = make('thead', '', '', table);
  const headRow = make('tr', '', '', head);
  for (const label of columns) {
    make('th', `plan-detail-col-${label.toLowerCase()}`, label, headRow);
  }

  const body = make('tbody', '', '', table);
  for (const { entry, rows, hidden } of perMouse) {
    rows.forEach((row, index) => {
      const isHere = row.location === setup.location && row.stage === setup.stage && row.cheese === setup.cheese;
      const tr = make('tr', ['plan-detail-row', 0 === index ? 'plan-detail-row-first' : '', isHere ? 'plan-detail-row-here' : ''], '', body);

      const mouseCell = make('td', 'plan-detail-col-mouse', '', tr);
      if (0 === index) {
        if (entry.mouse.small) {
          const image = make('img', 'plan-detail-mouse-image', '', mouseCell);
          image.src = entry.mouse.small;
          image.alt = '';
        }

        const name = make('a', 'plan-detail-mouse-name', entry.mouse.name, mouseCell);
        name.href = `https://api.mouse.rip/mhct-redirect/${entry.mouse.unique_id}`;
        name.target = '_blank';
        name.title = 'View on MHCT';
      }

      const locationCell = make('td', 'plan-detail-col-location', '', tr);
      const environment = findEnvironment(row.location);
      if (environment && !isHere) {
        const link = make('a', 'plan-detail-travel-link', row.location, locationCell);
        link.title = `Travel to ${environment.name}`;
        link.addEventListener('click', (event) => {
          event.stopPropagation();
          showTravelConfirmationNoDetails(environment);
        });
      } else {
        make('span', isHere ? 'plan-detail-here' : '', row.location, locationCell);
      }

      if (hasStages) {
        make('td', 'plan-detail-col-stage', row.stage || '—', tr);
      }

      make('td', 'plan-detail-col-bait', row.cheese || '—', tr);
      make('td', 'plan-detail-col-rate', formatRate(row.rate), tr);
      const samples = make('td', ['plan-detail-col-samples', row.hunts < MIN_HUNTS ? 'plan-detail-thin' : ''], formatCount(row.hunts), tr);
      if (row.hunts < MIN_HUNTS) {
        samples.title = `Fewer than ${formatCount(MIN_HUNTS)} hunts recorded, treat with caution`;
      }
    });

    if (hidden > 0) {
      const tr = make('tr', 'plan-detail-row-more', '', body);
      make('td', '', '', tr);
      const cell = make('td', 'plan-detail-muted', `+${hidden} more ${1 === hidden ? 'setup' : 'setups'} on MHCT`, tr);
      cell.colSpan = columns.length - 1;
    }
  }

  return details;
};

/**
 * Make a setup row: a header line with the location and numbers, then the mice.
 *
 * @param {Object}   options                 Options.
 * @param {Object}   options.setup           The setup.
 * @param {Array}    options.mice            Mice entries to list for it.
 * @param {number}   options.raw             Raw AR sum to display.
 * @param {number}   options.hunts           Expected hunts to display.
 * @param {Object}   options.environment     Resolved environment.
 * @param {string}   options.currentLocation The user's current environment ID.
 * @param {Map}      options.mouseRows       Viable rows per mouse, for the details panel.
 * @param {Function} options.findEnvironment Environment finder.
 *
 * @return {HTMLElement} The row.
 */
const makeSetupRow = ({ setup, mice, raw, hunts, environment, currentLocation, mouseRows, findEnvironment }) => {
  const row = make('div', 'plan-setup');
  if (environment && environment.id === currentLocation) {
    row.classList.add('plan-setup-current');
    row.title = 'Your current location';
  }

  const icon = make('div', 'plan-setup-icon', '', row);
  if (environment?.image) {
    const image = make('img', '', '', icon);
    image.src = environment.image;
    image.alt = '';
  }

  const content = make('div', 'plan-setup-body', '', row);
  const head = make('div', 'plan-setup-head', '', content);
  head.append(makeSetupTitle(setup, environment));

  const stats = make('div', 'plan-setup-stats', '', head);
  const arStat = make('span', 'plan-stat plan-stat-ar', formatRate(raw), stats);
  arStat.title = 'Chance a hunt here attracts one of these mice';
  make('span', 'plan-stat', `${mice.length} ${1 === mice.length ? 'mouse' : 'mice'}`, stats);
  const huntsStat = make('span', 'plan-stat plan-stat-hunts', formatHunts(hunts), stats);
  huntsStat.title = 'Expected hunts to attract every listed mouse at least once (ignores catch rate)';

  head.append(makeTravelButton(environment));

  make('span', 'plan-setup-caret', '', head);

  const chips = make('div', 'plan-setup-mice', '', content);
  for (const entry of mice) {
    chips.append(makeMouseChip(entry));
  }

  // Click anywhere else on the row to expand the details. Built on first open.
  let details = null;
  row.addEventListener('click', (event) => {
    if (event.target.closest('.plan-travel, a, button')) {
      return;
    }

    if (!details) {
      details = makeSetupDetails({ setup, mice, mouseRows, findEnvironment });
      row.append(details);
    }

    row.classList.toggle('plan-setup-open');
  });

  return row;
};

/**
 * Make a strip of plain mouse chips with a label.
 *
 * @param {string}   label   The label.
 * @param {Array}    entries Mouse entries.
 * @param {string}   className Extra class for the strip.
 *
 * @return {HTMLElement} The strip.
 */
const makeMouseStrip = (label, entries, className = '') => {
  const strip = make('div', ['plan-strip', className]);
  make('div', 'plan-strip-label', label, strip);

  const chips = make('div', 'plan-strip-mice', '', strip);
  for (const entry of entries) {
    chips.append(makeMouseChip(entry));
  }

  return strip;
};

/**
 * Render the guaranteed attraction strip. Click it to collapse; the state is remembered.
 *
 * @param {Array}    guaranteed      Guaranteed attraction entries.
 * @param {Function} findEnvironment Environment finder.
 *
 * @return {HTMLElement} The strip.
 */
const makeGuaranteed = (guaranteed, findEnvironment) => {
  const strip = make('div', 'plan-strip plan-guaranteed');
  strip.classList.toggle('plan-guaranteed-collapsed', lsGet(GUARANTEED_COLLAPSED_KEY, false));

  const label = make('div', 'plan-strip-label plan-guaranteed-toggle', '', strip);
  make('span', 'plan-guaranteed-caret', '', label);
  make('span', '', `Guaranteed attraction (${guaranteed.length})`, label);

  strip.addEventListener('click', (event) => {
    if (event.target.closest('.plan-travel, a, button')) {
      return;
    }

    const collapsed = strip.classList.toggle('plan-guaranteed-collapsed');
    lsSet(GUARANTEED_COLLAPSED_KEY, collapsed);
  });

  const list = make('div', 'plan-guaranteed-list', '', strip);
  for (const grab of guaranteed.sort((a, b) => a.mouse.name.localeCompare(b.mouse.name))) {
    const item = make('div', 'plan-guaranteed-item', '', list);
    item.append(makeMouseChip(grab));

    const where = [grab.location, grab.stage, grab.cheese].filter(Boolean).join(' · ');
    make('span', 'plan-guaranteed-where', where, item);

    item.append(makeTravelButton(findEnvironment(grab.location)));
  }

  return strip;
};

/**
 * Render the plan into the container.
 *
 * @param {HTMLElement} container The plan container.
 * @param {Array}       mice      Uncaught mice.
 * @param {Map}         rates     Rates keyed by mouse unique ID.
 * @param {Function}    findEnvironment Environment finder.
 */
const renderPlan = (container, mice, rates, findEnvironment) => {
  const sort = lsGet(SORT_KEY, 'best');
  const currentLocation = getCurrentLocation();

  const plan = buildPlan(mice, rates, findEnvironment);

  const rerender = () => renderPlan(container, mice, rates, findEnvironment);

  container.replaceChildren();

  // Header.
  const header = make('div', 'plan-header', '', container);

  const controls = make('div', 'plan-controls', '', header);

  const sortLabel = make('label', 'plan-sort', 'Sort ', controls);
  const select = make('select', 'plan-sort-select', '', sortLabel);
  for (const [key, { label, title }] of Object.entries(SORTS)) {
    const option = make('option', '', label, select);
    option.value = key;
    option.title = title;
    option.selected = key === sort;
  }

  select.title = SORTS[sort]?.title || '';
  select.addEventListener('change', () => {
    lsSet(SORT_KEY, select.value);
    rerender();
  });

  // Notices.
  if (plan.guaranteed.length > 0) {
    container.append(makeGuaranteed(plan.guaranteed, findEnvironment));
  }

  if (plan.hard.length > 0) {
    const strip = makeMouseStrip('No setup above ' + RATE_FLOOR + '%', plan.hard, 'plan-hard');
    strip.querySelector('.plan-strip-label').title = 'Best known rate shown. These need a dedicated trip, or the map closer.';
    container.append(strip);
  }

  if (plan.noData.length > 0) {
    const entries = plan.noData.map((mouse) => ({ mouse, rate: 0 }));
    const strip = makeMouseStrip('No MHCT data', entries, 'plan-no-data');
    strip.querySelectorAll('.plan-mouse-rate').forEach((rate) => rate.remove());
    container.append(strip);
  }

  const body = make('div', 'plan-body', '', container);

  if (plan.setups.length === 0) {
    make('div', 'plan-empty', 'Nothing to plan — every remaining mouse is a guaranteed attraction or has no data.', body);
    return;
  }

  const sorted = collapseVariants(sortSetups(plan.setups, sort));

  // What's catchable without travelling.
  const here = sorted.filter((setup) => findEnvironment(setup.location)?.id === currentLocation).slice(0, 3);
  if (here.length > 0) {
    make('div', 'plan-section-title', 'At your location', body);
    const hereList = make('div', 'plan-setups plan-here', '', body);
    for (const setup of here) {
      hereList.append(
        makeSetupRow({
          setup,
          mice: setup.mice,
          raw: setup.raw,
          hunts: setup.hunts,
          environment: findEnvironment(setup.location),
          currentLocation,
          mouseRows: plan.mouseRows,
          findEnvironment,
        })
      );
    }

    make('div', 'plan-section-title', 'All setups', body);
  }

  const list = make('div', 'plan-setups', '', body);

  const renderRows = (limit) => {
    list.replaceChildren();
    for (const setup of sorted.slice(0, limit)) {
      list.append(
        makeSetupRow({
          setup,
          mice: setup.mice,
          raw: setup.raw,
          hunts: setup.hunts,
          environment: findEnvironment(setup.location),
          currentLocation,
          mouseRows: plan.mouseRows,
          findEnvironment,
        })
      );
    }
  };

  renderRows(INITIAL_ROWS);

  if (sorted.length > INITIAL_ROWS) {
    const more = makeMhButton({
      text: `Show all ${sorted.length} setups`,
      className: 'plan-show-all',
      callback: () => {
        renderRows(sorted.length);
        more.remove();
      },
    });
    body.append(more);
  }
};

/**
 * Build the plan tab contents for the current map.
 */
const processPlanTabClick = async () => {
  const currentMapData = mapData();
  if (!currentMapData?.goals) {
    return;
  }

  const activeTab = document.querySelector('.treasureMapRootView-subTab.active');
  if (activeTab) {
    activeTab.classList.remove('active');
  }

  const planTab = document.querySelector('.treasureMapRootView-subTab.plan-map-tab');
  if (planTab) {
    planTab.classList.add('active');
  }

  const mapContainer = document.querySelector('.treasureMapView .treasureMapView-blockWrapper');
  if (!mapContainer) {
    return;
  }

  // Hide the native blocks and any sorted view, then take over the space.
  for (const selector of ['.treasureMapView-leftBlock', '.treasureMapView-rightBlock']) {
    const block = mapContainer.querySelector(selector);
    if (block) {
      block.style.display = 'none';
    }
  }

  document.querySelector('#sorted-mice-container')?.remove();
  document.querySelector('#map-plan-container')?.remove();

  const container = make('div', '');
  container.id = 'map-plan-container';
  mapContainer.append(container);

  const loading = make('div', 'plan-loading', '', container);
  make('div', 'mousehuntPage-loading active', '', loading);
  const progress = make('div', 'plan-loading-text', 'Loading attraction rates…', loading);

  const { unsortedMice: mice } = getMouseDataForMap(currentMapData);

  const findEnvironment = await makeEnvironmentFinder();

  let rates = loadedRates.rates;
  if (`${loadedRates.mapId}` !== `${currentMapData.map_id}`) {
    rates = await fetchRates(mice, (done, total) => {
      progress.textContent = `Loading attraction rates… ${done} / ${total}`;
    });
    loadedRates = { mapId: currentMapData.map_id, rates };
  }

  // The user may have moved on while the rates were loading.
  if (!container.isConnected) {
    return;
  }

  renderPlan(container, mice, rates, findEnvironment);
};

/**
 * Add the plan tab next to the sorted tab.
 *
 * @return {boolean} Whether the tab was added.
 */
const addPlanMapTab = () => {
  if (!getSetting('better-maps.plan-tab', false)) {
    return false;
  }

  const mapTabs = document.querySelector('.treasureMapRootView-subTabContainer');
  if (!mapTabs || mapTabs.querySelector('.plan-map-tab')) {
    return false;
  }

  // Only mouse maps have attraction rates to plan around.
  const currentMapData = mapData();
  if (currentMapData?.is_scavenger_hunt || !currentMapData?.goals?.mouse?.length) {
    return false;
  }

  const planTab = make('a', 'treasureMapRootView-subTab plan-map-tab', 'Plan');
  planTab.setAttribute('data-type', 'plan');
  planTab.title = 'Where to hunt for the most remaining mice';

  const divider = make('div', 'treasureMapRootView-subTab-spacer');

  const sortedSpacer = mapTabs.querySelector('.sorted-map-tab + .treasureMapRootView-subTab-spacer');
  if (sortedSpacer) {
    sortedSpacer.after(planTab, divider);
  } else {
    mapTabs.prepend(planTab, divider);
  }

  return true;
};

/**
 * Show the plan tab.
 */
const showPlanTab = () => {
  processPlanTabClick();
};

/**
 * Hide the plan tab.
 */
const hidePlanTab = () => {
  document.querySelector('#map-plan-container')?.remove();
  document.querySelector('.treasureMapRootView-subTab.plan-map-tab')?.classList.remove('active');
};

export { addPlanMapTab, hidePlanTab, showPlanTab };
