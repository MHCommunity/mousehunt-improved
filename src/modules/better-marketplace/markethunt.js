import { makeCollapsible, makeElement, waitForElement } from '@utils';

/**
 * Add a collapse toggle to the chart the Markethunt userscript adds to item views.
 *
 * @param {Function} [isCurrent] Whether the marketplace view session is still current.
 */
const makeMarkethuntChartCollapsible = async (isCurrent) => {
  // The userscript adds its chart after fetching data, so it can show up late.
  const chartArea = await waitForElement('.marketplaceView-item > #chartArea', { maxAttempts: 30 });
  if (!chartArea || (isCurrent && !isCurrent())) {
    return;
  }

  if (chartArea.previousElementSibling?.classList.contains('mhui-markethunt-chart-header')) {
    return;
  }

  const header = makeElement('div', 'mhui-markethunt-chart-header');
  makeElement('span', 'mhui-markethunt-chart-title', 'Markethunt chart', header);

  chartArea.before(header);

  // Keep our price chart above the Markethunt one.
  const priceChart = chartArea.parentElement.querySelector(':scope > .mhui-marketplace-chart');
  if (priceChart) {
    header.before(priceChart);
  }

  makeCollapsible({
    key: 'marketplace.markethunt-chart',
    section: chartArea,
    header,
    apply: (collapsed) => {
      chartArea.classList.toggle('mhui-markethunt-chart-collapsed', collapsed);
      header.classList.toggle('collapsed', collapsed);
    },
    onToggle: (collapsed) => {
      if (!collapsed) {
        // Let the userscript's Highcharts reflow if it rendered while hidden.
        window.dispatchEvent(new Event('resize'));
      }
    },
  });
};

export { makeMarkethuntChartCollapsible };
