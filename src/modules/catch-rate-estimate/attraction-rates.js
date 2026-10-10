import { debuglog, getArForMouse, getData, getFlag } from '@utils';

import { getStage } from '@utils/shared/stages';

// Where attraction rates come from: 'data' for the api's MH-Tools-based file, or 'live' for MHCT.
// The `cre-live-attraction-rates` flag switches to live.
const defaultAttractionRateSource = 'data';

let itemTypesById = null;

/**
 * Get an item's type from its ID.
 *
 * @param {number|string} id The item ID.
 *
 * @return {Promise<string|null>} The item type.
 */
const getItemType = async (id) => {
  if (!id) {
    return null;
  }

  if (!itemTypesById) {
    const items = await getData('items');
    itemTypesById = new Map((Array.isArray(items) ? items : []).map((item) => [Number(item.id), item.type]));
  }

  return itemTypesById.get(Number(id)) ?? null;
};

/**
 * Get the attraction rate source.
 *
 * @return {string} Either 'data' or 'live'.
 */
const getAttractionRateSource = () => {
  return getFlag('cre-live-attraction-rates') ? 'live' : defaultAttractionRateSource;
};

/**
 * Get attraction rates from the api's location-keyed data.
 *
 * @param {Array}  mice  Mice to get rates for.
 * @param {Object} stage The current stage.
 *
 * @return {Promise<Map<string, number>>} Mouse type to rate.
 */
const getDataRates = async (mice, stage) => {
  const rates = new Map();
  if (null === stage.data) {
    return rates;
  }

  const locationRates = (await getData('mice-attraction-rates-by-location'))?.[stage.dataEnvironment];
  if (!locationRates) {
    return rates;
  }

  // Locations without stages in the data use '-' even when we detect one.
  const stageRates = locationRates[stage.data] ?? (Object.keys(locationRates).length === 1 ? locationRates['-'] : null);
  const cheeseRates = stageRates?.[await getItemType(user.bait_item_id)];
  if (!cheeseRates) {
    return rates;
  }

  const charmRates = cheeseRates[await getItemType(user.trinket_item_id)] ?? cheeseRates['-'];
  if (!charmRates) {
    return rates;
  }

  for (const mouse of mice) {
    if (mouse.type in charmRates) {
      rates.set(mouse.type, charmRates[mouse.type]);
    }
  }

  return rates;
};

/**
 * Normalize a cheese name so MHCT's names ("Gouda", "SUPER|brie+") match the game's.
 *
 * @param {string} name The cheese name.
 *
 * @return {string} The normalized name.
 */
const normalizeCheeseName = (name) => {
  return `${name || ''}`
    .toLowerCase()
    .replaceAll(/\bcheese\b/g, '')
    .replaceAll(/[^\da-z]/g, '');
};

/**
 * Get attraction rates from MHCT.
 *
 * @param {Array}  mice  Mice to get rates for.
 * @param {Object} stage The current stage.
 *
 * @return {Promise<Map<string, number>>} Mouse type to rate.
 */
const getLiveRates = async (mice, stage) => {
  const rates = new Map();
  if (null === stage.live) {
    return rates;
  }

  const cheese = normalizeCheeseName(user.bait_name);
  const stages = Array.isArray(stage.live) ? stage.live : [stage.live ?? null];

  await Promise.all(
    mice.map(async (mouse) => {
      const mouseRates = await getArForMouse(mouse.type, 'mouse');
      if (!Array.isArray(mouseRates)) {
        return;
      }

      const matching = mouseRates.filter((rate) => {
        return rate.location === stage.liveLocation && stages.includes(rate.stage ?? null) && normalizeCheeseName(rate.cheese) === cheese;
      });

      if (matching.length === 0) {
        return;
      }

      // Stages MHCT records as objects come back as one row per part, so average the parts.
      let rate = matching.reduce((total, row) => total + row.rate / 100, 0) / matching.length;
      // MHCT spreads floor-specific mice across all 7 floor types in a range.
      if (stage.liveFloorMice?.has(mouse.type)) {
        rate *= 7;
      }

      rates.set(mouse.type, rate);
    })
  );

  return rates;
};

/**
 * Split out a boss that the rates combine with the stage's other mice.
 *
 * @param {Map<string, number>} rates Mouse type to rate.
 * @param {Object|null}         boss  The stage's boss.
 * @param {Array}               mice  The mice that can be attracted.
 *
 * @return {Map<string, number>} The rates for the boss's current state.
 */
const applyBossState = (rates, boss, mice) => {
  // A guaranteed boss is the only mouse attracted, whatever the rates say.
  if (boss?.isActive && 1 === boss.share && mice.some((mouse) => mouse.type === boss.type)) {
    return new Map([[boss.type, 1]]);
  }

  if (!boss || !rates.has(boss.type)) {
    return rates;
  }

  if (!boss.isActive) {
    rates.delete(boss.type);
    return rates;
  }

  if (null === boss.share) {
    return rates;
  }

  // The boss takes its share, and the other mice split the rest in proportion.
  const othersTotal = [...rates].reduce((total, [type, rate]) => (type === boss.type ? total : total + rate), 0);
  if (othersTotal <= 0) {
    return rates;
  }

  return new Map([...rates].map(([type, rate]) => [type, type === boss.type ? boss.share : (rate / othersTotal) * (1 - boss.share)]));
};

/**
 * Get the attraction rate for each mouse, as a share of the mice that can be attracted.
 *
 * Rates are normalized across the given mice that have a rate, so they add up to 100%.
 *
 * @param {Array} mice Mice to get rates for, with a `type`.
 *
 * @return {Promise<Map<string, number>>} Mouse type to attraction rate (0-1). Mice without a rate are left out.
 */
const getAttractionRates = async (mice) => {
  const stage = getStage();
  const source = getAttractionRateSource();

  let rates = new Map();
  try {
    rates = 'live' === source ? await getLiveRates(mice, stage) : await getDataRates(mice, stage);
    // The data is missing some stage and cheese combinations that MHCT has.
    if ('data' === source && rates.size === 0) {
      rates = await getLiveRates(mice, stage);
    }

    rates = applyBossState(rates, stage.boss, mice);
  } catch (error) {
    debuglog('cre', 'Error getting attraction rates', error);
  }

  debuglog('cre', 'Attraction rates', { source, stage, rates: Object.fromEntries(rates) });

  const total = [...rates.values()].reduce((sum, rate) => sum + rate, 0);
  if (total <= 0) {
    return new Map();
  }

  return new Map([...rates].map(([type, rate]) => [type, rate / total]));
};

export { getAttractionRates };
