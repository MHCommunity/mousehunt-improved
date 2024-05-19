import { doRequest } from '@utils';
import { getData } from '@utils/data';

import { exportPopup, recursiveFetch } from './exporter';

let seenMice = [];

/**
 * Get the weight of a mouse.
 *
 * @param {string} weight The weight of the mouse.
 *
 * @return {number} The weight of the mouse in ounces.
 */
const getWeight = (weight) => {
  weight = weight.toString().replaceAll(',', '').trim();
  // the weight will either be a string like "3 oz.", "1 lb." or 1 lb. 5 oz". we want to convert it to a number of ounces
  const ozSplit = weight.split(' oz.');
  const lbSplit = weight.split(' lb.');

  let weightOz = 0;

  // If neither of the above splits worked, then the weight is in ounces.
  if (ozSplit.length === 1 && lbSplit.length === 1) {
    weightOz = Number.parseFloat(weight);
  }

  if (ozSplit.length > 1) {
    weightOz = Number.parseFloat(ozSplit[0].trim());
  } else if (lbSplit.length > 1) {
    const lb = Number.parseInt(lbSplit[0].trim(), 10);
    const oz = Number.parseFloat(lbSplit[1].trim());
    weightOz = (lb * 16) + oz;
  }

  return weightOz;
};

/**
 * Get the weight of a mouse formatted.
 *
 * @param {string} weight The weight of the mouse.
 *
 * @return {string} The weight of the mouse formatted.
 */
const getWeightFormatted = (weight) => {
  const weightOz = getWeight(weight);

  const weightLbs = Math.floor(weightOz / 16);
  const weightOzRemainder = weightOz % 16;

  if (weightLbs > 0) {
    return `${weightLbs.toLocaleString()} lb. ${weightOzRemainder} oz.`;
  }

  return `${weightOzRemainder} oz.`;
};

/**
 * Get the data for a region.
 *
 * @param {Object} region The region to get the data for.
 *
 * @return {Promise<object>} The data for the region.
 */
const getDataForRegion = async (region) => {
  const regionEl = document.querySelector(`.item-wrapper[data-region="${region.id}"]`);
  if (regionEl) {
    regionEl.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }

  const miceCaughtEl = regionEl.querySelector('.mice-caught');
  const totalCatchesEl = regionEl.querySelector('.total-catches');
  const totalWeightEl = regionEl.querySelector('.total-weight');

  miceCaughtEl.textContent = '…';
  totalCatchesEl.textContent = '…';
  totalWeightEl.textContent = '…';

  let action;
  let view;

  if ('group' === exportType) {
    action = 'get_group';
    view = 'ViewMouseListGroups';
  } else {
    action = 'get_environment';
    view = 'ViewMouseListEnvironments';
  }

  const miceData = await doRequest('managers/ajax/mice/mouse_list.php', {
    action,
    category: region.id,
    user_id: user.user_id,
    display_mode: 'stats',
    view,
  });

  // concat the miceData.mouse_list_category.subgroups array
  const mice = miceData?.mouse_list_category?.subgroups?.reduce((acc, cur) => {
    return [...acc, ...cur.mice];
  }, []);

  const weights = [];
  let totalCatches = 0;
  let totalWeight = 0;

  let regionSubtract = 0;

  // convert the weights to numbers
  mice.forEach((mouse) => {
    if ('region' === exportType && seenMice.includes(mouse.type)) {
      regionSubtract++;
      return;
    }

    seenMice.push(mouse.type);

    mouse.num_catches = Number.parseInt(mouse.num_catches.toString().replace(',', ''), 10);

    const avgWeight = getWeight(mouse.avg_weight);

    totalCatches += mouse.num_catches;
    totalWeight += avgWeight * mouse.num_catches;

    const mouseWeight = {
      name: mouse.name,
      type: mouse.type,
      crown: mouse.crown,
      catches: mouse.num_catches,
      misses: mouse.num_misses,
      avgWeight,
      avgWeightFormatted: getWeightFormatted(mouse.avg_weight),
      heaviest: getWeight(mouse.heaviest_catch),
      heaviestFormatted: getWeightFormatted(mouse.heaviest_catch),
    };

    weights.push(mouseWeight);

    miceCaughtEl.textContent = `${miceData.mouse_list_category.caught}/${miceData.mouse_list_category.total}`;
    const totalCatchesFormatted = totalCatches.toLocaleString();
    totalCatchesEl.textContent = totalCatchesFormatted;

    // convert the total weight to lbs and oz
    const totalWeightLbs = Math.floor(totalWeight / 16);
    const totalWeightOz = totalWeight % 16;

    const totalWeightLbsFormatted = totalWeightLbs.toLocaleString();

    totalWeightEl.textContent = totalWeightLbs > 0 ? `${totalWeightLbsFormatted} lb. ${totalWeightOz} oz` : `${totalWeightOz} oz`;
  });

  // resolve the promise with the data
  return {
    category: region.id,
    regionName: region.name,
    caughtMice: miceData.mouse_list_category.caught - regionSubtract,
    uniqueMice: miceData.mouse_list_category.total - regionSubtract,
    totalCatches,
    totalWeight,
    items: weights,
  };
};

/**
 * Process the weights of the results.
 *
 * @param {Array<object>} results The results to process.
 */
const processWeights = (results) => {
  seenMice = [];

  const totalUniqueMiceEl = document.querySelector('.export-items-footer .mice-caught');
  const totalCatchesEl = document.querySelector('.export-items-footer .total-catches');
  const totalWeightEl = document.querySelector('.export-items-footer .total-weight');

  if (! totalUniqueMiceEl || ! totalCatchesEl || ! totalWeightEl) {
    return;
  }

  // reduce the results to get the totals
  const totals = results.reduce((acc, { caughtMice, uniqueMice, totalCatches, totalWeight }) => {
    acc.caughtMice += caughtMice;
    acc.uniqueMice += uniqueMice;
    acc.totalCatches += totalCatches;
    acc.totalWeight += totalWeight;
    return acc;
  }, {
    caughtMice: 0,
    uniqueMice: 0,
    totalCatches: 0,
    totalWeight: 0,
  });

  totalUniqueMiceEl.textContent = `${totals.caughtMice}/${totals.uniqueMice}`;
  totalCatchesEl.textContent = totals.totalCatches.toLocaleString();

  totalWeightEl.textContent = getWeightFormatted(totals.totalWeight);
};

let groups = [];
let regions = [];

/**
 * Show the export popup for the mice data.
 */
const exportMicePopup = () => {
  let itemTypes;
  let title;

  if ('group' === exportType) {
    title = 'Group';
    itemTypes = groups;
  } else if ('region' === exportType) {
    title = 'Region';
    itemTypes = regions;
  } else {
    title = 'Location';
    itemTypes = environments;
  }

  let itemsMarkup = '';
  itemTypes.forEach((region) => {
    itemsMarkup += `<div class="item-wrapper" data-region="${region.id}">
      <div class="region-name">${region.name}</div>
      <div class="mice-caught">0/0</div>
      <div class="total-catches">0</div>
      <div class="total-weight">0</div>
  </div>`;
  });

  exportPopup({
    type: `mouse-stats_${exportType}`,
    text: `Mouse Stats by ${exportType === 'group' ? 'Group' : 'Region'}`,
    headerMarkup: `<div class="region-name">Group</div>
      <div class="mice-caught">Unique Mice</div>
      <div class="total-catches">Total Catches</div>
      <div class="total-weight">Total Weight</div>`,
    itemsMarkup,
    footerMarkup: `<div class="region-name">Total</div>
      <div class="mice-caught">0/0</div>
      <div class="total-catches">0</div>
      <div class="total-weight">0</div>`,
    fetch: () => recursiveFetch(itemTypes, getDataForRegion),
    afterFetch: processWeights,
    download: {
      headers: [
        title,
        'Name',
        'Type',
        'Crown',
        'Catches',
        'Misses',
        'Avg. Weight (oz)',
        'Avg. Weight',
        'Heaviest (oz)',
        'Heaviest',
      ],
      reduceResults: true,
    },
  });
};

let exportType;

/**
 * Export the mice data.
 *
 * @param {string} type The type of data to export.
 */
const exportMice = async (type) => {
  exportType = type;

  regions = await getData('mice-regions');
  groups = await getData('mice-groups');
  environments = await getData('environments');

  exportMicePopup();
};

export default exportMice;
