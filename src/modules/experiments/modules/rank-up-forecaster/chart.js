import Highcharts from 'highcharts';

import { shortNumber } from './format';

const DAY = 24 * 60 * 60 * 1000;

const MODEL_COLORS = [
  '#7d64c3',
  '#4f7fc3',
  '#3d9970',
  '#e08f26',
  '#c34f4f',
  '#a08a3c',
];

/**
 * Build the projection series for a forecast model, clipped to the horizon.
 *
 * @param {Object} model   The forecast model result.
 * @param {Object} anchor  The latest sample point, with x and y.
 * @param {number} horizon The maximum timestamp to draw to.
 * @param {number} target  The target wisdom value.
 * @param {number} index   The model's index, used for color.
 *
 * @return {Object|null} A Highcharts series config.
 */
const buildProjectionSeries = (model, anchor, horizon, target, index) => {
  if (! model.targetTimestamp || model.targetTimestamp <= anchor.x) {
    return null;
  }

  let endX = model.targetTimestamp;
  let endY = target;

  if (endX > horizon) {
    // Clip the projection line at the chart horizon.
    endY = anchor.y + ((target - anchor.y) * ((horizon - anchor.x) / (endX - anchor.x)));
    endX = horizon;
  }

  return {
    type: 'line',
    name: model.label,
    data: [
      [anchor.x, anchor.y],
      [endX, endY],
    ],
    color: MODEL_COLORS[index % MODEL_COLORS.length],
    dashStyle: 'ShortDash',
    lineWidth: 1.5,
    marker: { enabled: false },
    enableMouseTracking: false,
  };
};

/**
 * Render the wisdom history and forecast projections chart.
 *
 * @param {Element} container    The element to render the chart into.
 * @param {Object}  forecastData The result of getForecasts().
 *
 * @return {Object|null} The Highcharts chart instance.
 */
const renderForecastChart = (container, forecastData) => {
  const { samples, forecasts, consensus, targetRank } = forecastData;
  if (! container || samples.length < 2) {
    return null;
  }

  const isDarkMode = document.body.classList.contains('mh-dark');
  const textColor = isDarkMode ? '#c7c7c7' : '#4b3c2d';
  const gridColor = isDarkMode ? '#3a3a3a' : '#e7dcc6';

  const history = samples.map((sample) => [sample.timestamp, sample.wisdom]);
  const anchor = { x: history.at(-1)[0], y: history.at(-1)[1] };

  // Show projections out to a bit past the consensus ETA, but keep the
  // chart readable when a slow model predicts years out.
  const historySpan = anchor.x - history[0][0];
  const consensusSpan = consensus ? consensus.targetTimestamp - anchor.x : 0;
  const horizon = anchor.x + Math.min(
    Math.max(consensusSpan * 1.15, historySpan * 0.25, 7 * DAY),
    3 * 365 * DAY
  );

  const projectionSeries = forecasts
    .map((model, index) => buildProjectionSeries(model, anchor, horizon, targetRank.wisdom, index))
    .filter(Boolean);

  const reachesTarget = forecasts.some((model) => model.targetTimestamp && model.targetTimestamp <= horizon);

  return Highcharts.chart(container, {
    chart: {
      backgroundColor: 'transparent',
      height: 320,
      spacing: [10, 10, 5, 5],
      style: { fontFamily: 'inherit' },
    },
    title: { text: null },
    credits: { enabled: false },
    accessibility: { enabled: false },
    time: { useUTC: false },
    legend: {
      itemStyle: { color: textColor, fontSize: '11px', fontWeight: 'normal' },
      itemHoverStyle: { color: textColor },
    },
    xAxis: {
      type: 'datetime',
      max: horizon,
      lineColor: gridColor,
      tickColor: gridColor,
      labels: { style: { color: textColor, fontSize: '10px' } },
      plotLines: [{
        value: Date.now(),
        color: gridColor,
        width: 1,
        dashStyle: 'Dot',
        label: {
          text: 'Now',
          style: { color: textColor, fontSize: '9px' },
          rotation: 0,
          y: 12,
        },
      }],
    },
    yAxis: {
      title: { text: null },
      gridLineColor: gridColor,
      labels: {
        style: { color: textColor, fontSize: '10px' },
        /**
         * Shorten the wisdom axis labels.
         *
         * @return {string} The formatted label.
         */
        formatter() {
          return shortNumber(this.value);
        },
      },
      plotLines: reachesTarget
        ? [{
          value: targetRank.wisdom,
          color: isDarkMode ? '#8fb98f' : '#3d7a3d',
          width: 1.5,
          dashStyle: 'Dash',
          zIndex: 3,
          label: {
            text: targetRank.name,
            align: 'right',
            x: -4,
            style: { color: isDarkMode ? '#8fb98f' : '#3d7a3d', fontSize: '10px', fontWeight: 'bold' },
          },
        }]
        : [],
    },
    tooltip: {
      /**
       * Format the tooltip for history points.
       *
       * @return {string} The tooltip markup.
       */
      formatter() {
        return `<b>${Highcharts.dateFormat('%b %e, %Y %l:%M %p', this.x)}</b><br/>${Number(this.y).toLocaleString()} wisdom`;
      },
    },
    series: [
      {
        type: 'area',
        name: 'Wisdom',
        data: history,
        color: isDarkMode ? '#b6a8ef' : '#6e5aa8',
        fillOpacity: 0.12,
        lineWidth: 2,
        marker: { enabled: history.length <= 40, radius: 2.5 },
        zIndex: 2,
      },
      ...projectionSeries,
    ],
  });
};

export {
  renderForecastChart
};
