import { dataGet, dataSet, dbGet, dbGetAll, dbSet, doRequest, getUserItems } from '@utils';

import { buildForecasts } from './models';

const DATABASE = 'rank-up-forecaster';
const SCHEMA_VERSION = 1;
const MIN_SAMPLE_INTERVAL = 15 * 60 * 1000;
const TOTAL_TURNS_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

let totalTurnsRequest = null;

const RANKS = [
  { id: 'novice', name: 'Novice', wisdom: 0 },
  { id: 'recruit', name: 'Recruit', wisdom: 2000 },
  { id: 'apprentice', name: 'Apprentice', wisdom: 5000 },
  { id: 'initiate', name: 'Initiate', wisdom: 12500 },
  { id: 'journeyman', name: 'Journeyman', wisdom: 31250 },
  { id: 'master', name: 'Master', wisdom: 65440 },
  { id: 'grandmaster', name: 'Grandmaster', wisdom: 137813 },
  { id: 'legendary', name: 'Legendary', wisdom: 303188 },
  { id: 'hero', name: 'Hero', wisdom: 667013 },
  { id: 'knight', name: 'Knight', wisdom: 1467428 },
  { id: 'lord', name: 'Lord/Lady', wisdom: 3228341 },
  { id: 'baron', name: 'Baron', wisdom: 7102349 },
  { id: 'count', name: 'Count', wisdom: 15625168 },
  { id: 'duke', name: 'Duke/Duchess', wisdom: 34375370 },
  { id: 'grand-duke', name: 'Grand Duke/Grand Duchess', wisdom: 75625813 },
  { id: 'archduke', name: 'Archduke/Archduchess', wisdom: 166376789 },
  { id: 'viceroy', name: 'Viceroy', wisdom: 366028936 },
  { id: 'elder', name: 'Elder', wisdom: 805263659 },
  { id: 'sage', name: 'Sage', wisdom: 1771580048 },
  { id: 'fabled', name: 'Fabled', wisdom: 3897476106 },
];

const normalizeTitle = (title = '') => {
  return title
    .toLowerCase()
    .replaceAll('/', ' ')
    .replaceAll('lady', 'lord')
    .replaceAll('journeywoman', 'journeyman')
    .replaceAll('duchess', 'duke')
    .replaceAll('grand duchess', 'grand duke')
    .replaceAll('archduchess', 'archduke')
    .replaceAll(/[^\sa-z-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replace('grand-duke', 'grand-duke')
    .trim();
};

const getCurrentRank = () => {
  const id = normalizeTitle(user?.title_name || 'novice');
  return RANKS.find((rank) => rank.id === id) || RANKS[0];
};

const getNextRank = () => {
  const currentRank = getCurrentRank();
  const index = RANKS.findIndex((rank) => rank.id === currentRank.id);
  return RANKS[Math.min(index + 1, RANKS.length - 1)];
};

const getRankById = (id) => {
  return RANKS.find((rank) => rank.id === id) || getNextRank();
};

const getWisdomSetting = async (key) => {
  return await dataGet(`wisdom-stat-${key}`);
};

const saveWisdomSetting = (key, value) => {
  dataSet(`wisdom-stat-${key}`, value);
};

const getWisdom = async (forceUpdate = false) => {
  if (!forceUpdate) {
    const cachedWisdom = await getWisdomSetting('value');
    const lastUpdated = await getWisdomSetting('last-updated');

    if (cachedWisdom && lastUpdated && Date.now() - lastUpdated < 2 * 24 * 60 * 60 * 1000) {
      return Number.parseInt(cachedWisdom, 10);
    }
  }

  const wisdom = await getUserItems(['wisdom_stat_item'], true);
  const value = Number.parseInt(wisdom[0]?.quantity || 0, 10);

  saveWisdomSetting('value', value);
  saveWisdomSetting('last-updated', Date.now());

  return value;
};

const getTotalTurns = async () => {
  const turns = user?.num_total_turns || user?.num_total_horn_calls || user?.num_hunts || null;
  const currentTurns = Number.parseInt(turns?.toString().replaceAll(',', '') || 0, 10) || null;
  if (currentTurns) {
    return currentTurns;
  }

  const [cachedTurns, lastChecked] = await Promise.all([dataGet('rank-up-forecaster-total-turns'), dataGet('rank-up-forecaster-total-turns-last-checked')]);
  const parsedCachedTurns = Number.parseInt(cachedTurns, 10) || null;

  if (lastChecked && Date.now() - lastChecked < TOTAL_TURNS_REFRESH_INTERVAL) {
    return parsedCachedTurns;
  }

  if (totalTurnsRequest) {
    return await totalTurnsRequest;
  }

  totalTurnsRequest = (async () => {
    // Record the attempt first so a failed lookup is still retried no more
    // than once per day.
    await dataSet('rank-up-forecaster-total-turns-last-checked', Date.now());

    try {
      const response = await doRequest('managers/ajax/users/userData.php', {
        'sn_user_ids[]': user?.sn_user_id,
        'fields[]': 'num_total_turns',
      });
      const fetchedTurns = Number.parseInt(response?.user_data?.[user?.sn_user_id]?.num_total_turns || 0, 10) || null;

      if (fetchedTurns) {
        await dataSet('rank-up-forecaster-total-turns', fetchedTurns);
      }

      return fetchedTurns || parsedCachedTurns;
    } catch {
      return parsedCachedTurns;
    } finally {
      totalTurnsRequest = null;
    }
  })();

  return await totalTurnsRequest;
};

const getLocationData = () => {
  return {
    id: user?.environment_id || null,
    slug: user?.environment_type || '',
    name: user?.environment_name || '',
  };
};

const getTitleData = () => {
  const rank = getCurrentRank();
  return {
    id: rank.id,
    name: user?.title_name || rank.name,
    percent: Number.parseFloat(user?.title_percent_accurate || user?.title_percent || 0),
  };
};

const unwrapRecords = (records) => {
  return records.map((record) => record?.data || record).filter(Boolean);
};

const getRecordsByType = async (type) => {
  const records = unwrapRecords(await dbGetAll(DATABASE));
  return records.filter((record) => record.type === type);
};

const sortSamples = (samples) => {
  return samples.sort((a, b) => a.timestamp - b.timestamp);
};

const getSamples = async () => {
  return sortSamples(await getRecordsByType('wisdom-sample'));
};

const getLatestSample = async () => {
  const samples = await getSamples();
  return samples.at(-1) || null;
};

const getMeta = async () => {
  const meta = await dbGet(DATABASE, 'meta');
  return meta?.data || {};
};

const setMeta = async (meta) => {
  const existing = await getMeta();
  await dbSet(DATABASE, {
    ...existing,
    ...meta,
    id: 'meta',
    type: 'meta',
    schemaVersion: SCHEMA_VERSION,
    updatedAt: Date.now(),
  });
};

const hasLegacyData = () => {
  return Boolean(localStorage.getItem('Chro-forecaster-time') || localStorage.getItem('Chro-forecaster-all-area') || localStorage.getItem('Chro-forecaster-current-area'));
};

const safeParse = (value, fallback = null) => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const migrateLegacyData = async () => {
  const meta = await getMeta();
  if (meta.legacyMigratedAt || !hasLegacyData()) {
    return false;
  }

  const importedAt = Date.now();
  const legacySamples = safeParse(localStorage.getItem('Chro-forecaster-time'), []);
  for (const row of legacySamples) {
    const timestamp = new Date(row[0]).getTime();
    const wisdom = Number.parseInt(row[1], 10);
    if (!timestamp || !Number.isFinite(wisdom)) {
      continue;
    }

    await dbSet(DATABASE, {
      id: `sample:${timestamp}`,
      type: 'wisdom-sample',
      schemaVersion: SCHEMA_VERSION,
      source: 'legacy-migration',
      timestamp,
      recordedAt: importedAt,
      wisdom,
      totalTurns: null,
      title: null,
      location: null,
    });
  }

  const legacyLocations = safeParse(localStorage.getItem('Chro-forecaster-all-area'), []);
  for (const row of legacyLocations) {
    const locationName = row[0] || '';
    const wisdomGained = Number.parseInt(row[1], 10);
    const hunts = Number.parseInt(row[2], 10);
    if (!locationName || !Number.isFinite(wisdomGained) || !Number.isFinite(hunts)) {
      continue;
    }

    await dbSet(DATABASE, {
      id: `legacy-location-summary:${locationName.toLowerCase().replaceAll(/[^\da-z]+/g, '-')}`,
      type: 'legacy-location-summary',
      schemaVersion: SCHEMA_VERSION,
      source: 'legacy-migration',
      importedAt,
      location: {
        id: null,
        slug: '',
        name: locationName,
      },
      wisdomGained,
      hunts,
    });
  }

  const currentArea = safeParse(localStorage.getItem('Chro-forecaster-current-area'), null);
  if (currentArea) {
    await dbSet(DATABASE, {
      id: 'legacy-current-location-baseline',
      type: 'legacy-current-location-baseline',
      schemaVersion: SCHEMA_VERSION,
      source: 'legacy-migration',
      importedAt,
      location: {
        id: null,
        slug: '',
        name: currentArea[0] || '',
      },
      wisdom: Number.parseInt(currentArea[1], 10) || null,
      totalTurns: Number.parseInt(currentArea[2], 10) || null,
    });
  }

  await setMeta({ legacyMigratedAt: importedAt });
  return true;
};

const sameLocation = (a, b) => {
  if (!a || !b) {
    return false;
  }

  return (a.id && b.id && a.id === b.id) || (a.slug && b.slug && a.slug === b.slug) || a.name === b.name;
};

const saveLocationSegment = async (previous, sample) => {
  if (!previous || !sample || !sameLocation(previous.location, sample.location)) {
    return;
  }

  if (!previous.totalTurns || !sample.totalTurns || sample.totalTurns <= previous.totalTurns) {
    return;
  }

  if (sample.wisdom < previous.wisdom) {
    return;
  }

  await dbSet(DATABASE, {
    id: `location-session:${previous.timestamp}:${sample.timestamp}`,
    type: 'location-session',
    schemaVersion: SCHEMA_VERSION,
    source: sample.source,
    startedAt: previous.timestamp,
    endedAt: sample.timestamp,
    location: sample.location,
    startingWisdom: previous.wisdom,
    endingWisdom: sample.wisdom,
    wisdomGained: sample.wisdom - previous.wisdom,
    startingTurns: previous.totalTurns,
    endingTurns: sample.totalTurns,
    hunts: sample.totalTurns - previous.totalTurns,
    sampleIds: [previous.id, sample.id],
  });
};

const recordSample = async (source = 'automatic', options = {}) => {
  const { forceWisdomUpdate = false, totalTurns = null } = options;
  const now = Date.now();
  const latest = await getLatestSample();

  if (latest && now - latest.timestamp < MIN_SAMPLE_INTERVAL) {
    return {
      saved: false,
      reason: 'interval',
      sample: latest,
      nextSampleAt: latest.timestamp + MIN_SAMPLE_INTERVAL,
    };
  }

  const wisdom = await getWisdom(forceWisdomUpdate);
  if (!wisdom) {
    return {
      saved: false,
      reason: 'wisdom',
      sample: latest,
    };
  }

  // This returns immediately from the daily cache for ordinary samples and
  // only makes a userData.php request once the cache is a day old.
  const refreshedTotalTurns = await getTotalTurns();
  const recordedTotalTurns = Math.max(totalTurns || 0, refreshedTotalTurns || 0, latest?.totalTurns || 0) || null;

  const sample = {
    id: `sample:${now}`,
    type: 'wisdom-sample',
    schemaVersion: SCHEMA_VERSION,
    source,
    timestamp: now,
    recordedAt: now,
    wisdom,
    // The hunt response does not include a lifetime hunt count. Refresh the
    // server value at most daily, then use locally tracked hunt totals between
    // refreshes.
    totalTurns: recordedTotalTurns,
    title: getTitleData(),
    location: getLocationData(),
  };

  await dbSet(DATABASE, sample);
  await saveLocationSegment(latest, sample);
  await setMeta({ lastSampleAt: now });

  return {
    saved: true,
    sample,
  };
};

const getForecasts = async (targetRankId = null) => {
  const samples = await getSamples();
  const latest = samples.at(-1) || null;
  const targetRank = getRankById(targetRankId);
  const currentRank = getCurrentRank();

  if (!latest) {
    return {
      targetRank,
      currentRank,
      currentWisdom: 0,
      wisdomRemaining: targetRank.wisdom,
      progressPercent: 0,
      forecasts: [],
      consensus: null,
      samples,
    };
  }

  const wisdomRemaining = Math.max(0, targetRank.wisdom - latest.wisdom);
  const { models, consensus } = buildForecasts(samples, wisdomRemaining);

  // Progress from the current rank's threshold toward the target rank.
  const baseWisdom = Math.min(currentRank.wisdom, targetRank.wisdom);
  const span = targetRank.wisdom - baseWisdom;
  const progressPercent = span > 0 ? Math.min(100, Math.max(0, ((latest.wisdom - baseWisdom) / span) * 100)) : 100;

  return {
    targetRank,
    currentRank,
    currentWisdom: latest.wisdom,
    wisdomRemaining,
    progressPercent,
    forecasts: models,
    consensus,
    samples,
  };
};

const getLocationSegments = async () => {
  return unwrapRecords(await dbGetAll(DATABASE))
    .filter((record) => ['location-session', 'legacy-location-summary'].includes(record.type))
    .sort((a, b) => (b.endedAt || b.importedAt || 0) - (a.endedAt || a.importedAt || 0));
};

const getLocationSummaries = async () => {
  const segments = await getLocationSegments();
  const summaries = new Map();

  segments.forEach((segment) => {
    const locationName = segment.location?.name || 'Unknown';
    const existing = summaries.get(locationName) || {
      location: segment.location || { name: locationName },
      wisdomGained: 0,
      hunts: 0,
      segments: 0,
      lastSeenAt: 0,
    };

    existing.wisdomGained += segment.wisdomGained || 0;
    existing.hunts += segment.hunts || 0;
    existing.segments++;
    existing.lastSeenAt = Math.max(existing.lastSeenAt, segment.endedAt || segment.importedAt || 0);
    summaries.set(locationName, existing);
  });

  return [...summaries.values()].sort((a, b) => b.lastSeenAt - a.lastSeenAt);
};

export {
  DATABASE,
  MIN_SAMPLE_INTERVAL,
  RANKS,
  getCurrentRank,
  getForecasts,
  getLatestSample,
  getLocationSegments,
  getLocationSummaries,
  getNextRank,
  getRankById,
  getSamples,
  migrateLegacyData,
  recordSample,
};
