import { createPopup, doEvent, formatNumber } from '@utils';

/**
 * Fetch data recursively.
 *
 * @param {Array}    data          The data to fetch.
 * @param {Function} callbackToRun The callback function to run.
 *
 * @return {Promise<Array>} Resolves with the results.
 */
const recursiveFetch = async (data, callbackToRun) => {
  const results = [];
  for (const item of data) {
    results.push(await callbackToRun(item));
  }

  return results;
};

/**
 * Add a download button to the page.
 *
 * @param {Object}   opts                The options object.
 * @param {string}   opts.buttonSelector The selector for the button.
 * @param {Array}    opts.results        The results to download.
 * @param {string}   opts.filename       The filename to use.
 * @param {Function} opts.beforeDownload The function to run before downloading.
 * @param {Function} callback            The callback function to run.
 */
const addDownloadToButton = (opts, callback) => {
  let { buttonSelector, results, filename, beforeDownload } = opts;

  const exportButton = document.querySelector(buttonSelector);
  if (!exportButton) {
    return;
  }

  exportButton.classList.remove('disabled');

  // Assigned rather than added so fetching again doesn't stack up downloads.
  exportButton.onclick = () => {
    if (beforeDownload) {
      results = opts.beforeDownload();
    }

    callback(results, filename);
  };
};

/**
 * Add a JSON download to the button.
 *
 * @param {Object}   opts                The options object.
 * @param {string}   opts.buttonSelector The selector for the button.
 * @param {Array}    opts.results        The results to download.
 * @param {string}   opts.filename       The filename to use.
 * @param {Function} opts.beforeDownload The function to run before downloading.
 */
const addJsonDownloadToButton = (opts) => {
  addDownloadToButton(opts, (results, filename) => {
    const data = JSON.stringify({
      type: opts.type,
      generated: new Date().toISOString(),
      data: results,
    });

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${filename}.json`;
    link.href = url;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
};

/**
 * Escape a value for a CSV cell.
 *
 * @param {*} value The value.
 *
 * @return {string} The quoted cell.
 */
const csvCell = (value) => {
  if (null === value || undefined === value) {
    value = '';
  } else if (Array.isArray(value)) {
    value = value.join(',');
  } else if ('object' === typeof value) {
    value = JSON.stringify(value);
  }

  return `"${String(value).replaceAll('"', '""')}"`;
};

/**
 * Add a CSV download to the button.
 *
 * @param {Object}   opts                The options object.
 * @param {string}   opts.buttonSelector The selector for the button.
 * @param {Array}    opts.results        The results to download.
 * @param {string}   opts.filename       The filename to use.
 * @param {Array}    opts.headers        The headers for the CSV.
 * @param {Function} opts.reduceResults  The function to reduce the results.
 */
const addCsvDownloadToButton = (opts) => {
  addDownloadToButton(opts, (results, filename) => {
    // reduce the results if needed
    if (opts.reduceResults) {
      results = resultReducer(results);
    }

    let csv = results
      .map((row) => {
        return Object.values(row).map(csvCell).join(',');
      })
      .join('\n');

    if (opts.headers) {
      csv = `${opts.headers.map(csvCell).join(',')}\n${csv}`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${filename}.csv`;
    link.href = url;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
};

/**
 * Get the formatted date.
 *
 * @return {string} The formatted date.
 */
const getFormattedDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Add download buttons to the page.
 *
 * @param {Object}   opts               The options object.
 * @param {string}   opts.type          The type of data.
 * @param {Array}    opts.results       The results to download.
 * @param {Array}    opts.headers       The headers for the CSV.
 * @param {Function} opts.reduceResults The function to reduce the results.
 */
const addDownloadButtons = (opts) => {
  const { type, results, headers, reduceResults } = opts;

  const filename = `${type}-${getFormattedDate()}`;
  const buttonSelector = `#export-${type}`;

  addJsonDownloadToButton({
    buttonSelector,
    type,
    results,
    filename,
  });

  addCsvDownloadToButton({
    buttonSelector: `${buttonSelector}-csv`,
    results,
    filename,
    headers,
    reduceResults,
  });
};

const addCopyButton = ({ type, results }) => {
  const copyButton = document.querySelector(`#copy-${type}`);
  if (!copyButton) {
    return;
  }

  const copyText = copyButton.querySelector('span');
  if (!copyText) {
    return;
  }

  copyButton.classList.remove('disabled');

  copyButton.onclick = () => {
    copyButton.classList.add('disabled');
    const formattedResults = results.join('\n');

    navigator.clipboard
      .writeText(formattedResults)
      .then(() => {
        copyButton.classList.remove('disabled');
        copyText.textContent = 'Copied!';
        setTimeout(() => {
          copyText.textContent = 'Copy Data';
        }, 2000);
      })
      .catch(() => {
        copyButton.classList.remove('disabled');
        copyText.textContent = 'Copy Failed';
        setTimeout(() => {
          copyText.textContent = 'Copy Data';
        }, 2000);
      });
  };
};

/**
 * Reduce the results.
 *
 * @param {Array} results The results to reduce.
 *
 * @return {Array} The reduced results.
 */
const resultReducer = (results) => {
  return results.reduce((acc, { category, items }) => {
    items.forEach((data) => {
      acc.push({
        region: category,
        ...data,
      });
    });

    return acc;
  }, []);
};

/**
 * Update the total items count.
 *
 * @param {Array} results The results to process.
 */
const updateSingleTotalEl = (results) => {
  const totalItemsEl = document.querySelector('.export-items-footer .total-items');
  if (!totalItemsEl) {
    return;
  }

  // reduce the results to get the totals
  const totalItems = results.reduce((acc, { items }) => {
    return acc + items.length;
  }, 0);

  totalItemsEl.textContent = formatNumber(totalItems);
};

/**
 * Show the export popup.
 *
 * @param {Object}   opts                       The options object.
 * @param {string}   opts.type                  The type of data.
 * @param {string}   opts.text                  The text to display.
 * @param {string}   opts.headerMarkup          The header markup.
 * @param {string}   opts.itemsMarkup           The items markup.
 * @param {string}   opts.footerMarkup          The footer markup.
 * @param {Function} opts.fetch                 The fetch function.
 * @param {Function} opts.afterFetch            Function to run after fetching.
 * @param {Function} opts.download              Function to download the data.
 * @param {Function} opts.updateSingleTotal     The update single total function.
 * @param {boolean}  opts.dataIsAvailable       If the data is available.
 * @param {boolean}  opts.copyInsteadOfDownload Shows a copy button instead of download buttons.
 * @param {string}   opts.extraText             Extra text to display below the buttons.
 */
const exportPopup = ({
  type,
  text,
  headerMarkup,
  itemsMarkup,
  footerMarkup,
  fetch,
  afterFetch,
  download,
  updateSingleTotal,
  dataIsAvailable,
  copyInsteadOfDownload = false,
  extraText = '',
}) => {
  createPopup({
    title: `Export ${text}`,
    className: 'mh-improved-export-data',
    content: `
    <div class="export-wrapper ${type}">
      <div class="export-items-header item-wrapper ${headerMarkup ? '' : 'hidden'}">
        ${headerMarkup || ''}
      </div>
      <div class="export-items-wrapper ${itemsMarkup ? '' : 'hidden'}">
        ${itemsMarkup || ''}
      </div>
      <div class="export-items-footer item-wrapper ${footerMarkup ? '' : 'hidden'}">
        ${footerMarkup || ''}
      </div>
      <div class="actions-wrapper">
        <div class="mousehuntActionButton tiny lightBlue" id="export-back">
          <span>Back</span>
        </div>
        <div class="mousehuntActionButton tiny fetch-data ${dataIsAvailable ? 'hidden' : ''}" id="fetch-${type}">
          <span>Fetch ${text}</span>
        </div>
        <div class="mousehuntActionButton copy-data ${dataIsAvailable ? '' : 'disabled'} ${copyInsteadOfDownload ? '' : 'hidden'}" id="copy-${type}">
          <span>Copy Data</span>
        </div>
        <div class="mousehuntActionButton tiny ${dataIsAvailable ? '' : 'disabled'} ${copyInsteadOfDownload ? 'hidden' : ''} export-json" id="export-${type}">
          <span>Export as JSON</span>
        </div>
        <div class="mousehuntActionButton tiny ${dataIsAvailable ? '' : 'disabled'} ${copyInsteadOfDownload ? 'hidden' : ''} export-csv" id="export-${type}-csv">
          <span>Export as CSV</span>
        </div>
      </div>
    </div>
    ${extraText ? `<div class="extra-text">${extraText}</div>` : ''}`,
  });

  const exportBackButton = document.querySelector('#export-back');
  if (!exportBackButton) {
    return;
  }

  exportBackButton.addEventListener('click', () => {
    doEvent('show-export-data');
  });

  const fetchButton = document.querySelector(`#fetch-${type}`);
  if (!fetchButton) {
    return;
  }

  fetchButton.addEventListener('click', () => {
    fetchButton.classList.add('disabled');

    fetch()
      .then((results) => {
        if (afterFetch) {
          afterFetch(results);
        }

        if (updateSingleTotal) {
          updateSingleTotalEl(results);
        }

        addDownloadButtons({
          results,
          type,
          ...download,
        });

        addCopyButton({
          type,
          results,
        });
      })
      .catch((error) => {
        console.error(`Error exporting ${type}:`, error); // eslint-disable-line no-console
      })
      .finally(() => {
        fetchButton.classList.remove('disabled');
      });
  });

  if (dataIsAvailable) {
    fetchButton.click();
  }
};

export { recursiveFetch, addDownloadButtons, exportPopup };
