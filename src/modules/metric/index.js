import { onDialogShow, onRequest } from '@utils';

// eslint-disable-next-line jsdoc/require-returns
/**
 * Convert imperial to metric.
 *
 * @param {string} text The text to convert.
 *
 * @return {string} The converted text.
 */
const imperialToMetric = (text) => {
  const lb = text.match(/(\d+? )lb./i);
  const oz = text.match(/(\d+? )oz./i);
  if (! (lb || oz)) {
    return text;
  }

  // Convert the lb. and oz. values to metric.
  const lbValue = lb ? lb[1] : 0;
  const ozValue = oz ? oz[1] : 0;
  const totalWeight = Number.parseInt(lbValue) + (Number.parseInt(ozValue) / 16);
  const totalWeightMetric = (Math.round((totalWeight * 0.45359237) * 100) / 100).toString();

  // Replace the lb. and oz. values with the metric values.
  return text.replace(/(\d+? lb.\s)?(\d+? oz.)/i, totalWeightMetric + ' kg. ');
};

/**
 * Convert the imperial units to metric units in the dialog.
 */
const convertInDialog = () => {
  const mouseViewWeights = document.querySelectorAll('.mouseView-statsContainer .mouseView-statsContainer-block-padding table tbody tr');
  if (mouseViewWeights.length) {
    // Loop through and get the first td of the element. If it's "Avg. Weight:" or "Heaviest:", then we want to convert the second td.
    mouseViewWeights.forEach((row) => {
      const firstCell = row.querySelector('td');
      const secondCell = firstCell.nextSibling;
      if (firstCell.innerText === 'Avg. Weight:' || firstCell.innerText === 'Heaviest:') {
        const converted = imperialToMetric(secondCell.innerText);
        if (converted) {
          secondCell.innerText = converted;
        }
      }
    });
  }
};

/**
 * Convert the imperial units to metric units on the page.
 */
const replaceInJournal = () => {
  const entries = document.querySelectorAll('.journal .entry .journalbody .journaltext');
  if (! entries.length) {
    return;
  }

  entries.forEach((entry) => {
    const converted = imperialToMetric(entry.innerHTML);
    if (converted) {
      entry.innerHTML = converted;
    }
  });
};

/**
 * Convert the imperial units to metric units on the page.
 */
const replaceOnMousePage = () => {
  // Check for the mouse page stats.
  const mouseWeightsStats = document.querySelectorAll('.mouseListView-categoryContent-subgroupContainer .mouseListView-categoryContent-subgroup-mouse-stats');
  if (! mouseWeightsStats.length) {
    return;
  }

  mouseWeightsStats.forEach((stat) => {
    // Check to see if it has the 'average_weight' or 'heaviest_catch' class, and if so, convert the text.
    if (stat.classList.contains('average_weight') || stat.classList.contains('heaviest_catch')) {
      const converted = imperialToMetric(stat.innerText);
      if (converted) {
        stat.innerText = converted;
      }
    }
  });
};

/**
 * Convert the imperial units to metric units on the page.
 */
const convertOnPage = () => {
  replaceOnMousePage();
  replaceInJournal();
};

/**
 * Initialize the module.
 */
const init = async () => {
  onDialogShow('all', convertInDialog);

  onRequest('*', convertOnPage);
  convertOnPage();
};

/**
 * Initialize the module.
 */
export default {
  id: 'metric',
  name: 'Metric Units',
  type: 'feature',
  default: false,
  description: 'Use metric units instead of imperial units.',
  load: init,
};
