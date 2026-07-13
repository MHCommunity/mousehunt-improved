import Highcharts from 'highcharts';
import 'highcharts/modules/stock'; // eslint-disable-line import/no-unassigned-import, sort-imports

import {
  cacheGet,
  cacheSet,
  debuglog,
  getSetting,
  isDarkMode,
  makeElement
} from '@utils';

/**
 * Price history charts for the marketplace item view, using data from
 * Markethunt (https://markethunt.win) rendered with our bundled Highcharts.
 */

const apiDomain = 'api.markethunt.win';
const dayInMs = 24 * 60 * 60 * 1000;

let priceChart = null;
let stockChart = null;
let zoomLabelHidden = false;

/**
 * Convert a UTC ISO date string (YYYY-MM-DD) to milliseconds since epoch.
 *
 * @param {string} dateStr The date string.
 *
 * @return {number} Milliseconds since epoch.
 */
const utcDateToMillis = (dateStr) => {
  return new Date(`${dateStr}T00:00:00+00:00`).getTime();
};

/**
 * Fetch a path from the Markethunt API.
 *
 * @param {string} path The path to fetch, without the leading slash.
 *
 * @return {Promise<Object|null>} The parsed response, or null on failure.
 */
const fetchMarkethunt = async (path) => {
  try {
    const response = await fetch(`https://${apiDomain}/${path}?plugin_ver=mhi-${mhImprovedVersion}`);
    if (! response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    debuglog('better-marketplace', `Error fetching ${path} from Markethunt`, error);
    return null;
  }
};

/**
 * Get the list of game events to display as bands on the charts, cached for
 * a couple of days.
 *
 * @return {Promise<Array>} The events.
 */
const getEvents = async () => {
  const cached = await cacheGet('markethunt-events', null);
  if (cached) {
    return cached;
  }

  const events = await fetchMarkethunt('events');
  if (! events || ! Array.isArray(events)) {
    return [];
  }

  await cacheSet('markethunt-events', events, 2 * dayInMs);

  return events;
};

/**
 * Get the chart colors, based on the current theme.
 *
 * @return {Object} The colors.
 */
const getColors = () => {
  // Highcharts paints the chart itself, so this is one of the few things that can't be handled with
  // a '.mh-dark' rule. isDarkMode() only covers a third-party dark mode, so our own has to be
  // checked separately.
  const dark = getSetting('native-dark-mode', false) || isDarkMode();

  return {
    text: dark ? '#c7c7c7' : '#3d444b',
    faded: dark ? '#8f8f8f' : '#8a939c',
    grid: dark ? '#3a3a3a' : '#e4e8ec',
    price: dark ? '#f0a94b' : '#e08c1e',
    sb: dark ? '#a48ae8' : '#7b5cd6',
    volume: dark ? '#41556a' : '#bcd6e8',
    bid: dark ? '#4fc98c' : '#1f9d63',
    ask: dark ? '#f0716f' : '#dc4a4a',
    supply: dark ? '#6ca8ea' : '#2f80d8',
    eventBand: dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(47, 128, 216, 0.06)',
    crosshair: dark ? '#e0e0e0' : '#3d444b',
    tooltipBg: dark ? '#2a2a2a' : '#ffffff',
    buttonHover: dark ? '#3a3a3a' : '#eaf2f9',
    buttonSelect: dark ? '#4a4a4a' : '#d3e6f5',
  };
};

/**
 * Convert the Markethunt events to Highcharts plot bands.
 *
 * @param {Array}       events       The events.
 * @param {Object}      colors       The chart colors.
 * @param {number|null} minTimestamp The minimum chart timestamp.
 * @param {number|null} maxTimestamp The maximum chart timestamp.
 *
 * @return {Array} The plot bands.
 */
const toPlotBands = (events, colors, minTimestamp = null, maxTimestamp = null) => {
  const visibleEvents = events
    .map((event) => ({
      ...event,
      from: utcDateToMillis(event.start_date),
      to: utcDateToMillis(event.end_date),
    }))
    .filter((event) => {
      if (minTimestamp && event.to < minTimestamp) {
        return false;
      }

      if (maxTimestamp && event.from > maxTimestamp) {
        return false;
      }

      return true;
    });

  const showLabels = visibleEvents.length <= 12;

  return visibleEvents.map((event) => ({
    from: event.from,
    to: event.to,
    color: colors.eventBand,
    label: showLabels
      ? {
        text: event.short_name,
        rotation: 270,
        textAlign: 'right',
        x: 4,
        y: 5,
        style: {
          color: colors.faded,
          fontSize: '10px',
        },
      }
      : null,
  }));
};

/**
 * Build the options shared by both charts.
 *
 * @param {Object} colors The chart colors.
 *
 * @return {Object} The base chart options.
 */
const getBaseChartOptions = (colors) => {
  return {
    chart: {
      animation: { duration: 400 },
      backgroundColor: 'transparent',
      panning: {
        enabled: true,
        type: 'x',
      },
      spacing: [8, 5, 6, 0],
      style: { fontFamily: 'inherit' },
      zooming: {
        mouseWheel: {
          type: 'x',
        },
        pinchType: 'x',
      },
    },
    accessibility: { enabled: false },
    credits: { enabled: false },
    legend: {
      align: 'right',
      enabled: true,
      itemHiddenStyle: { color: colors.faded },
      itemHoverStyle: { color: colors.text },
      itemStyle: {
        color: colors.text,
        fontSize: '11px',
        fontWeight: 'normal',
      },
      padding: 0,
      verticalAlign: 'top',
      y: -24,
    },
    navigator: { enabled: false },
    plotOptions: {
      series: {
        animation: { duration: 600 },
        showInLegend: true,
        states: {
          inactive: {
            opacity: 1,
          },
        },
      },
    },
    rangeSelector: {
      buttonPosition: { y: 5 },
      buttonSpacing: 2,
      buttonTheme: {
        fill: 'none',
        r: 3,
        stroke: 'none',
        style: { color: colors.text },
        states: {
          hover: {
            fill: colors.buttonHover,
            style: { color: colors.text },
          },
          select: {
            fill: colors.buttonSelect,
            style: { color: colors.text, fontWeight: 'bold' },
          },
        },
      },
      inputEnabled: false,
      labelStyle: { color: colors.text },
      verticalAlign: 'top',
      x: -5.5,
    },
    // Stock charts already support x-axis panning/zooming. Disabling the
    // scrollbar avoids Highcharts rendering invalid negative-height SVG rects
    // when its internal border width is larger than a hidden 0px bar.
    scrollbar: {
      enabled: false,
    },
    tooltip: {
      animation: false,
      backgroundColor: colors.tooltipBg,
      borderColor: colors.grid,
      borderRadius: 6,
      headerFormat: '<span style="font-size: 11px; font-weight: bold">{point.key}</span><br/>',
      hideDelay: 0,
      shared: true,
      split: false,
      style: {
        color: colors.text,
        fontSize: '11px',
      },
    },
  };
};

/**
 * Build the shared x-axis options.
 *
 * @param {Array}  plotBands The event plot bands.
 * @param {Object} colors    The chart colors.
 * @param {number} minRange  The smallest useful zoom range.
 *
 * @return {Object} The x-axis options.
 */
const getXAxisOptions = (plotBands, colors, minRange = dayInMs) => {
  return {
    type: 'datetime',
    ordinal: false, // Show a continuous axis if dates are missing.
    plotBands,
    crosshair: {
      dashStyle: 'ShortDot',
      color: colors.crosshair,
    },
    dateTimeLabelFormats: {
      day: '%b %e',
      week: '%b %e, \'%y',
      month: '%b %Y',
      year: '%Y',
    },
    gridLineColor: colors.grid,
    labels: {
      style: {
        color: colors.text,
        fontSize: '10px',
      },
    },
    lineColor: colors.grid,
    minRange,
    tickColor: colors.grid,
    tickPixelInterval: 120,
  };
};

/**
 * Build the y-axis options for the volume/supply sub-axis at the bottom of
 * each chart.
 *
 * @return {Object} The y-axis options.
 */
const getSubAxisOptions = () => {
  return {
    alignTicks: false,
    allowDecimals: false,
    gridLineWidth: 0,
    height: '22%',
    labels: { enabled: false },
    min: 0,
    offset: 0,
    opposite: false,
    showFirstLabel: false,
    showLastLabel: true,
    tickPixelInterval: 35,
    top: '78%',
  };
};

/**
 * Build the hover state options that keep series from thickening on hover.
 *
 * @return {Object} The state options.
 */
const getLineHoverStates = () => {
  return {
    hover: {
      halo: false,
      lineWidthPlus: 0,
    },
  };
};

/**
 * Render the daily price history chart.
 *
 * @param {string|number} itemId     The item ID being shown.
 * @param {Element}       container  The element to render the chart into.
 * @param {Array}         marketData The daily market data.
 * @param {Array}         plotBands  The event plot bands.
 * @param {Object}        colors     The chart colors.
 *
 * @return {Object} The Highcharts chart instance.
 */
const renderPriceChart = (itemId, container, marketData, plotBands, colors) => {
  const dailyPrices = [];
  const dailyVolumes = [];
  const dailySbPrices = [];

  marketData.forEach((dataPoint) => {
    const date = utcDateToMillis(dataPoint.date);
    const price = Number(dataPoint.price);
    const volume = Number(dataPoint.volume);
    const sbPrice = Number(dataPoint.sb_price);

    dailyPrices.push([date, Number.isFinite(price) ? price : null]);
    dailyVolumes.push([date, Number.isFinite(volume) ? volume : null]);
    dailySbPrices.push([date, Number.isFinite(sbPrice) && sbPrice > 0 ? sbPrice : null]);
  });

  return Highcharts.stockChart(container, Highcharts.merge(getBaseChartOptions(colors), {
    plotOptions: {
      series: {
        dataGrouping: {
          // SUPER|brie+ has enough history that grouping keeps it readable.
          enabled: 114 === Number(itemId),
          units: [['day', [1]], ['week', [1]]],
          groupPixelWidth: 3,
        },
      },
    },
    rangeSelector: {
      buttons: [
        { type: 'month', count: 1, text: '1M' },
        { type: 'month', count: 3, text: '3M' },
        { type: 'month', count: 6, text: '6M' },
        { type: 'year', count: 1, text: '1Y' },
        { type: 'all', text: 'All' },
      ],
      selected: 3,
    },
    tooltip: { xDateFormat: '%b %e, %Y' },
    xAxis: getXAxisOptions(plotBands, colors, 7 * dayInMs),
    yAxis: [
      {
        alignTicks: false,
        startOnTick: false,
        endOnTick: false,
        crosshair: {
          dashStyle: 'ShortDot',
          color: colors.crosshair,
        },
        gridLineColor: colors.grid,
        labels: {
          /**
           * Format the gold axis labels.
           *
           * @return {string} The formatted label.
           */
          formatter() {
            return `${this.value.toLocaleString()}g`;
          },
          style: {
            color: colors.text,
            fontSize: '10px',
          },
          x: -8,
          y: 3,
        },
        opposite: false,
        showLastLabel: true,
      },
      {
        alignTicks: false,
        endOnTick: false,
        gridLineWidth: 0,
        startOnTick: false,
        visible: false,
        labels: {
          /**
           * Format the SB axis labels.
           *
           * @return {string} The formatted label.
           */
          formatter() {
            return `${this.value.toLocaleString()} SB`;
          },
          style: {
            color: colors.sb,
            fontSize: '10px',
          },
          x: 5,
          y: 3,
        },
        opposite: true,
        showLastLabel: true,
      },
      getSubAxisOptions(),
    ],
    series: [
      {
        color: colors.price,
        data: dailyPrices,
        dataGrouping: {
          approximation: 'average',
        },
        fillOpacity: 0.08,
        id: 'dailyPrice',
        lineWidth: 2,
        marker: { states: { hover: { lineWidth: 0 } } },
        name: 'Average price',
        states: getLineHoverStates(),
        tooltip: {
          /**
           * Format the price point tooltip.
           *
           * @return {string} The tooltip markup.
           */
          pointFormatter() {
            return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toLocaleString()}g</b><br/>`;
          },
        },
        type: 'area',
        yAxis: 0,
        zIndex: 1,
      },
      {
        borderWidth: 0,
        color: colors.volume,
        data: dailyVolumes,
        dataGrouping: {
          approximation: 'sum',
        },
        groupPadding: 0,
        name: 'Volume',
        pointPadding: 0,
        tooltip: {
          /**
           * Format the volume point tooltip.
           *
           * @return {string} The tooltip markup.
           */
          pointFormatter() {
            return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y ? this.y.toLocaleString() : 'n/a'}</b><br/>`;
          },
        },
        type: 'column',
        yAxis: 2,
        zIndex: 0,
      },
      {
        color: colors.sb,
        data: dailySbPrices,
        dataGrouping: {
          approximation: 'average',
        },
        events: {
          hide() {
            this.chart.yAxis[1].update({ visible: false }, false);
            this.chart.redraw();
          },
          show() {
            this.chart.yAxis[1].update({ visible: true }, false);
            this.chart.redraw();
          },
        },
        id: 'sbi',
        lineWidth: 1.5,
        marker: { states: { hover: { lineWidth: 0 } } },
        name: 'SB price',
        states: getLineHoverStates(),
        tooltip: {
          /**
           * Format the SB price point tooltip.
           *
           * @return {string} The tooltip markup.
           */
          pointFormatter() {
            let digits = 3;
            if (this.y >= 1000) {
              digits = 0;
            } else if (this.y >= 100) {
              digits = 1;
            } else if (this.y >= 10) {
              digits = 2;
            }

            return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })} SB</b><br/>`;
          },
        },
        visible: false,
        yAxis: 1,
        zIndex: 2,
      },
    ],
  }));
};

/**
 * Format a gold value point tooltip.
 *
 * @return {string} The tooltip markup.
 */
const goldPointFormatter = function () {
  return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toLocaleString(undefined, { maximumFractionDigits: 0 })}g</b><br/>`;
};

/**
 * Render the bid/ask/supply chart.
 *
 * @param {Element} container The element to render the chart into.
 * @param {Array}   stockData The stock data.
 * @param {Array}   plotBands The event plot bands.
 * @param {Object}  colors    The chart colors.
 *
 * @return {Object} The Highcharts chart instance.
 */
const renderStockChart = (container, stockData, plotBands, colors) => {
  const bidData = [];
  const askData = [];
  const supplyData = [];

  stockData.forEach((dataPoint) => {
    const bid = Number(dataPoint.bid);
    const ask = Number(dataPoint.ask);
    const supply = Number(dataPoint.supply);

    bidData.push([dataPoint.timestamp, Number.isFinite(bid) && bid > 0 ? bid : null]);
    askData.push([dataPoint.timestamp, Number.isFinite(ask) && ask > 0 ? ask : null]);
    supplyData.push([dataPoint.timestamp, Number.isFinite(supply) ? supply : null]);
  });

  return Highcharts.stockChart(container, Highcharts.merge(getBaseChartOptions(colors), {
    plotOptions: {
      series: {
        dataGrouping: {
          enabled: true,
          units: [['hour', [2, 4, 6]], ['day', [1]], ['week', [1]]],
          groupPixelWidth: 2,
          dateTimeLabelFormats: {
            hour: ['%b %e, %Y %H:%M UTC', '%b %e, %Y %H:%M UTC'],
            day: ['%b %e, %Y'],
          },
        },
      },
    },
    rangeSelector: {
      buttons: [
        { type: 'day', count: 7, text: '7D' },
        { type: 'month', count: 1, text: '1M' },
        { type: 'month', count: 3, text: '3M' },
        { type: 'month', count: 6, text: '6M' },
        { type: 'year', count: 1, text: '1Y' },
        { type: 'all', text: 'All' },
      ],
      selected: 1,
    },
    tooltip: { xDateFormat: '%b %e, %Y %H:%M UTC' },
    xAxis: getXAxisOptions(plotBands, colors),
    yAxis: [
      {
        alignTicks: false,
        endOnTick: false,
        gridLineColor: colors.grid,
        startOnTick: false,
        labels: {
          /**
           * Format the gold axis labels.
           *
           * @return {string} The formatted label.
           */
          formatter() {
            return `${this.value.toLocaleString()}g`;
          },
          style: {
            color: colors.text,
            fontSize: '10px',
          },
          x: -8,
          y: 3,
        },
        opposite: false,
        showLastLabel: true,
      },
      getSubAxisOptions(),
    ],
    series: [
      {
        color: colors.ask,
        data: askData,
        dataGrouping: {
          approximation: 'average',
        },
        id: 'ask',
        lineWidth: 1.5,
        marker: { states: { hover: { lineWidth: 0 } } },
        name: 'Ask (sellers)',
        states: getLineHoverStates(),
        tooltip: { pointFormatter: goldPointFormatter },
        yAxis: 0,
        zIndex: 1,
      },
      {
        color: colors.bid,
        data: bidData,
        dataGrouping: {
          approximation: 'average',
        },
        id: 'bid',
        lineWidth: 1.5,
        marker: { states: { hover: { lineWidth: 0 } } },
        name: 'Bid (buyers)',
        states: getLineHoverStates(),
        tooltip: { pointFormatter: goldPointFormatter },
        yAxis: 0,
        zIndex: 2,
      },
      {
        color: colors.supply,
        data: supplyData,
        dataGrouping: {
          approximation: 'average',
        },
        fillOpacity: 0.15,
        id: 'supply',
        lineWidth: 1.5,
        marker: { states: { hover: { lineWidth: 0 } } },
        name: 'Supply',
        states: getLineHoverStates(),
        tooltip: {
          /**
           * Format the supply point tooltip.
           *
           * @return {string} The tooltip markup.
           */
          pointFormatter() {
            return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${this.y.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b><br/>`;
          },
        },
        type: 'area',
        yAxis: 1,
        zIndex: 0,
      },
    ],
  }));
};

/**
 * Destroy any existing chart instances.
 */
const destroyCharts = () => {
  [priceChart, stockChart].forEach((chart) => {
    if (chart) {
      try {
        chart.destroy();
      } catch {
        // The chart's container is already gone; nothing to clean up.
      }
    }
  });

  priceChart = null;
  stockChart = null;
};

/**
 * Load and show the bid/ask chart for an item, rendering it once.
 *
 * @param {string|number} itemId The item ID.
 * @param {Element}       area   The chart area element.
 */
const showStockChart = async (itemId, area) => {
  const container = area.querySelector('.mhui-marketplace-chart-stock');
  if (! container || stockChart || area.dataset.stockLoading) {
    return;
  }

  area.dataset.stockLoading = 'true';
  makeElement('div', 'mhui-marketplace-chart-loading', 'Loading bid & ask history…', container);

  const [response, events] = await Promise.all([
    fetchMarkethunt(`items/${itemId}/stock`),
    getEvents(),
  ]);

  delete area.dataset.stockLoading;

  if (! area.isConnected) {
    return;
  }

  if (! response?.stock_data?.length) {
    container.textContent = 'No bid & ask history available for this item.';
    return;
  }

  const colors = getColors();
  stockChart = renderStockChart(
    container,
    response.stock_data,
    toPlotBands(events, colors, response.stock_data[0].timestamp, response.stock_data.at(-1).timestamp),
    colors
  );
};

/**
 * Add the price history chart to the marketplace item view. Called after the
 * game has rendered the item view.
 *
 * @param {string|number} itemId The item ID being shown.
 */
const addPriceChart = async (itemId) => {
  const item = document.querySelector('.marketplaceView-item[data-item-id]');
  const description = item?.querySelector(':scope > .marketplaceView-item-description');
  if (! item || ! description) {
    return;
  }

  const existing = item.querySelector('.mhui-marketplace-chart');
  if (existing) {
    if (existing.dataset.itemId === String(itemId)) {
      return;
    }

    existing.remove();
  }

  destroyCharts();

  if (! zoomLabelHidden) {
    // Hide the range selector's "Zoom" label; it can only be set globally.
    Highcharts.setOptions({ lang: { rangeSelectorZoom: '' } });
    zoomLabelHidden = true;
  }

  const area = makeElement('div', 'mhui-marketplace-chart');
  area.dataset.itemId = itemId;
  if (isDarkMode()) {
    area.classList.add('mhui-marketplace-chart-darkmode');
  }

  area.innerHTML = `<div class="mhui-marketplace-chart-toolbar">
    <div class="mhui-marketplace-chart-tabs">
      <a href="#" class="active" data-chart="price">Price history</a>
      <a href="#" data-chart="stock">Bid &amp; ask</a>
    </div>
    <a class="mhui-marketplace-chart-source" href="https://markethunt.win/index.php?item_id=${Number(itemId)}" target="_blank" rel="noopener noreferrer">View on Markethunt →</a>
  </div>
  <div class="mhui-marketplace-chart-charts">
    <div class="mhui-marketplace-chart-price"><div class="mhui-marketplace-chart-loading">Loading price history…</div></div>
    <div class="mhui-marketplace-chart-stock"></div>
  </div>`;

  const tabs = area.querySelectorAll('.mhui-marketplace-chart-tabs a');
  tabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();

      if (tab.classList.contains('active')) {
        return;
      }

      tabs.forEach((otherTab) => otherTab.classList.toggle('active', otherTab === tab));
      area.classList.toggle('mhui-marketplace-chart-show-stock', 'stock' === tab.dataset.chart);

      if ('stock' === tab.dataset.chart) {
        showStockChart(itemId, area);
      }
    });
  });

  description.before(area);

  const [response, events] = await Promise.all([
    fetchMarkethunt(`items/${itemId}`),
    getEvents(),
  ]);

  if (! area.isConnected || area.dataset.itemId !== String(itemId)) {
    return;
  }

  const priceContainer = area.querySelector('.mhui-marketplace-chart-price');
  if (! response?.market_data?.length) {
    priceContainer.textContent = 'No price history available for this item.';
    return;
  }

  const colors = getColors();
  priceChart = renderPriceChart(
    itemId,
    priceContainer,
    response.market_data,
    toPlotBands(
      events,
      colors,
      utcDateToMillis(response.market_data[0].date),
      utcDateToMillis(response.market_data.at(-1).date)
    ),
    colors
  );
};

export {
  addPriceChart
};
