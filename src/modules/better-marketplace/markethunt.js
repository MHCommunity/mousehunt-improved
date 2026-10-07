import { getSetting, makeElement, saveSetting, waitForElement } from '@utils';

const collapsedSettingKey = 'better-marketplace.markethunt-chart-collapsed';

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

  const toggle = makeElement('a', 'mhui-marketplace-chart-toggle');
  toggle.href = '#';
  toggle.setAttribute('role', 'button');
  header.append(toggle);

  const setCollapsed = (collapsed) => {
    chartArea.classList.toggle('mhui-markethunt-chart-collapsed', collapsed);
    header.classList.toggle('collapsed', collapsed);
    toggle.classList.toggle('collapsed', collapsed);
    toggle.classList.toggle('expanded', !collapsed);

    const label = collapsed ? 'Expand chart' : 'Minimize chart';
    toggle.setAttribute('title', label);
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('aria-expanded', String(!collapsed));
  };

  const toggleCollapsed = () => {
    const collapsed = !chartArea.classList.contains('mhui-markethunt-chart-collapsed');
    saveSetting(collapsedSettingKey, collapsed);
    setCollapsed(collapsed);

    if (!collapsed) {
      // Let the userscript's Highcharts reflow if it rendered while hidden.
      window.dispatchEvent(new Event('resize'));
    }
  };

  header.addEventListener('click', (event) => {
    event.preventDefault();
    toggleCollapsed();
  });

  chartArea.before(header);
  setCollapsed(getSetting(collapsedSettingKey, false));
};

export { makeMarkethuntChartCollapsible };
