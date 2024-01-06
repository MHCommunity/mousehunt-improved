import { createPopup } from '@utils';

const recursiveFetch = (data, callbackToRun) => {
  return data.reduce((promiseChain, item) => {
    return promiseChain.then((chainResults) => {
      return new Promise((resolve) => {
        // eslint-disable-next-line promise/catch-or-return
        callbackToRun(item).then((currentResult) => {
          chainResults.push(currentResult);
          resolve(chainResults);
        });
      });
    });
  }, Promise.resolve([]));
};

const addDownloadToButton = (opts, callback) => {
  let { buttonSelector, results, filename, beforeDownload } = opts;

  const exportButton = document.querySelector(buttonSelector);
  exportButton.classList.remove('disabled');

  // download the file when the export button is clicked
  exportButton.addEventListener('click', () => {
    if (beforeDownload) {
      results = opts.beforeDownload();
    }

    callback(results, filename);
  });
};

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

    // cleanup
    URL.revokeObjectURL(url);
  });
};

const addCsvDownloadToButton = (opts) => {
  addDownloadToButton(opts, (results, filename) => {
    // reduce the results if needed
    if (opts.reduceResults) {
      results = resultReducer(results);
    }

    let csv = results.map((row) => {
      return Object.values(row).map((value) => `"${value}"`).join(',');
    }).join('\n');

    if (opts.headers) {
      csv = `${opts.headers.join(',')}\n${csv}`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${filename}.csv`;
    link.href = url;
    link.click();

    // cleanup
    URL.revokeObjectURL(url);
  });
};

const getFormattedDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

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
    reduceResults
  });
};

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

const updateSingleTotalEl = (results) => {
  const totalItemsEl = document.querySelector('.export-items-footer .total-items');
  if (! totalItemsEl) {
    return;
  }

  // reduce the results to get the totals
  const totalItems = results.reduce((acc, { items }) => {
    return acc + items.length;
  }, 0);

  totalItemsEl.textContent = totalItems.toLocaleString();
};

const exportPopup = (opts) => {
  const {
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
  } = opts;

  createPopup({
    title: `Export ${text}`,
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
        <div class="mousehuntActionButton tiny ${dataIsAvailable ? '' : 'disabled'} export-json" id="export-${type}">
          <span>Export as JSON</span>
        </div>
        <div class="mousehuntActionButton tiny ${dataIsAvailable ? '' : 'disabled'} export-csv" id="export-${type}-csv">
          <span>Export as CSV</span>
        </div>
      </div>
    </div>`
  });

  const exportBackButton = document.querySelector('#export-back');
  if (! exportBackButton) {
    return;
  }

  exportBackButton.addEventListener('click', () => {
    eventRegistry.doEvent('show-export-data');
  });

  const fetchButton = document.querySelector(`#fetch-${type}`);
  if (! fetchButton) {
    return;
  }

  fetchButton.addEventListener('click', () => {
    fetchButton.classList.add('disabled');

    // eslint-disable-next-line promise/catch-or-return
    fetch().then((results) => {
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

      fetchButton.classList.remove('disabled');
    });
  });

  if (dataIsAvailable) {
    fetchButton.click();
  }
};

export {
  recursiveFetch,
  addDownloadButtons,
  exportPopup
};
