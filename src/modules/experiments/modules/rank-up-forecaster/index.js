import {
  addStyles,
  addSubmenuItem,
  createPopup,
  getSetting,
  onTravel,
  onTurn,
  saveSetting
} from '@utils';

import {
  RANKS,
  getForecasts,
  getLocationSummaries,
  getNextRank,
  getSamples,
  migrateLegacyData,
  recordSample
} from './data';

import { renderForecastChart } from './chart';

import { formatDate, formatDuration, formatNumber, shortNumber } from './format';

import styles from './styles.css';

const buildRankOptions = (targetRankId) => {
  const nextRank = getNextRank();
  const nextIndex = RANKS.findIndex((rank) => rank.id === nextRank.id);

  return RANKS
    .filter((rank, index) => index >= nextIndex || rank.id === 'fabled')
    .map((rank) => `<option value="${rank.id}" ${rank.id === targetRankId ? 'selected' : ''}>${rank.name}</option>`)
    .join('');
};

const buildHero = (forecastData) => {
  const { consensus, targetRank, currentWisdom, wisdomRemaining, progressPercent, samples } = forecastData;

  let headline;
  if (wisdomRemaining <= 0) {
    headline = `<div class="rank-up-forecaster-eta">
      <span class="rank-up-forecaster-eta-label">You've already reached</span>
      <strong class="rank-up-forecaster-eta-rank">${targetRank.name}</strong>
    </div>`;
  } else if (consensus) {
    headline = `<div class="rank-up-forecaster-eta">
      <span class="rank-up-forecaster-eta-label">You will rank up to</span>
      <strong class="rank-up-forecaster-eta-rank">${targetRank.name}</strong>
      <span class="rank-up-forecaster-eta-date">on ${formatDate(consensus.targetTimestamp)}</span>
      <span class="rank-up-forecaster-eta-sub">(about ${formatDuration(consensus.daysRemaining)} away)</span>
      ${consensus.confidence === 'low' ? '<span class="rank-up-forecaster-confidence-low">Rough estimate — not enough steady data yet</span>' : ''}
    </div>`;
  } else {
    headline = `<div class="rank-up-forecaster-eta">
      <span class="rank-up-forecaster-eta-label">Gathering data…</span>
      <strong class="rank-up-forecaster-eta-rank">Keep hunting</strong>
      <span class="rank-up-forecaster-eta-sub">Wisdom is sampled every ~30 minutes. Forecasts appear after a few samples (${samples.length} so far).</span>
    </div>`;
  }

  return `<div class="rank-up-forecaster-hero">
    ${headline}
    <div class="rank-up-forecaster-progress">
      <div class="rank-up-forecaster-progress-bar" title="${formatNumber(currentWisdom)} / ${formatNumber(targetRank.wisdom)} wisdom"><span style="width: ${progressPercent.toFixed(1)}%"></span></div>
      <div class="rank-up-forecaster-progress-meta">
        <span><strong>${formatNumber(progressPercent, progressPercent > 99 ? 1 : 0)}%</strong> to ${targetRank.name}</span>
        <span title="${formatNumber(wisdomRemaining)} wisdom">${formatNumber(wisdomRemaining)} wisdom remaining</span>
      </div>
    </div>
  </div>`;
};

const buildStatCards = (forecastData) => {
  const { consensus, forecasts, samples } = forecastData;
  const perHunt = forecasts.find((model) => model.id === 'per-hunt');

  const cards = [
    {
      label: 'Pace',
      value: consensus?.ratePerDay ? `${shortNumber(consensus.ratePerDay)} / day` : '-',
      title: consensus?.ratePerDay ? `${formatNumber(consensus.ratePerDay)} wisdom per day` : '',
    },
    {
      label: 'Wisdom per Hunt',
      value: perHunt ? formatNumber(perHunt.rate, perHunt.rate < 100 ? 1 : 0) : '-',
    },
    {
      label: 'Hunts Remaining',
      value: perHunt?.huntsRemaining ? `~${formatNumber(perHunt.huntsRemaining)}` : '-',
    },
    {
      label: 'Data Points',
      value: `${formatNumber(samples.length)} samples`,
    },
  ];

  return `<div class="rank-up-forecaster-stats">
    ${cards.map((card) => `<div ${card.title ? `title="${card.title}"` : ''}>
      <span>${card.label}</span>
      <strong>${card.value}</strong>
      ${card.sub ? `<em>${card.sub}</em>` : ''}
    </div>`).join('')}
  </div>`;
};

const buildModelRows = (forecasts) => {
  if (! forecasts.length) {
    return '<tr><td colspan="4">Need at least two saved samples to forecast.</td></tr>';
  }

  return forecasts.map((forecast) => {
    const rate = forecast.kind === 'wisdom-per-hunt'
      ? `${formatNumber(forecast.rate, 1)} / hunt`
      : `${formatNumber(forecast.rate)} / day`;

    return `<tr>
      <td><span class="rank-up-forecaster-model-label" title="${forecast.description || ''}">${forecast.label}</span></td>
      <td>${rate}</td>
      <td>${formatDuration(forecast.daysRemaining)}</td>
      <td>${formatDate(forecast.targetTimestamp)}</td>
    </tr>`;
  }).join('');
};

const buildLocationRows = (locations) => {
  if (! locations.length) {
    return '<tr><td colspan="4">No location data yet. Wisdom gains are attributed to a location once you hunt there across two samples.</td></tr>';
  }

  return locations.slice(0, 15).map((summary) => {
    const wisdomPerHunt = summary.hunts ? summary.wisdomGained / summary.hunts : null;

    return `<tr>
      <td>${summary.location?.name || '-'}</td>
      <td>${formatNumber(summary.wisdomGained)}</td>
      <td>${formatNumber(summary.hunts)}</td>
      <td>${formatNumber(wisdomPerHunt, 1)}</td>
    </tr>`;
  }).join('');
};

const buildHistoryRows = (samples) => {
  if (! samples.length) {
    return '<tr><td colspan="4">No samples saved yet.</td></tr>';
  }

  return samples.slice(-15).reverse().map((sample, index, shown) => {
    const previous = shown[index + 1] || null;
    const wisdomGain = previous ? sample.wisdom - previous.wisdom : null;

    return `<tr>
      <td>${formatDate(sample.timestamp, true)}</td>
      <td>${formatNumber(sample.wisdom)}</td>
      <td>${wisdomGain === null ? '-' : `+${formatNumber(wisdomGain)}`}</td>
      <td>${sample.location?.name || '-'}</td>
    </tr>`;
  }).join('');
};

const buildDetailsPanel = ({ title, headings, rows, footnote = '', open = false }) => {
  return `<details class="rank-up-forecaster-panel" ${open ? 'open' : ''}>
    <summary>
      <span class="rank-up-forecaster-panel-title">${title}</span>
    </summary>
    <div class="rank-up-forecaster-panel-body">
      <div class="rank-up-forecaster-table-wrap">
        <table>
          <thead>
            <tr>${headings.map((heading) => `<th>${heading}</th>`).join('')}</tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${footnote ? `<div class="rank-up-forecaster-footnote">${footnote}</div>` : ''}
    </div>
  </details>`;
};

const buildPopupMarkup = ({ forecastData, samples, locations, targetRankId }) => {
  return `<div class="rank-up-forecaster">
    ${buildHero(forecastData)}
    ${buildStatCards(forecastData)}

    <div class="rank-up-forecaster-toolbar">
      <div class="rank-up-forecaster-actions">
        <label for="rank-up-forecaster-target">Forecast rank</label>
        <select id="rank-up-forecaster-target">${buildRankOptions(targetRankId)}</select>
      </div>
      <button type="button" class="mousehuntActionButton tiny" id="rank-up-forecaster-refresh"><span>Refresh samples</span></button>
    </div>

    ${samples.length >= 2 ? `<section class="rank-up-forecaster-panel rank-up-forecaster-chart-panel">
      <div class="rank-up-forecaster-panel-heading">
        <div>
          <h3>Forecast chart</h3>
          <p>Recent wisdom history with projection lines for each forecast model.</p>
        </div>
      </div>
      <div class="rank-up-forecaster-chart" id="rank-up-forecaster-chart"></div>
    </section>` : ''}

    ${buildDetailsPanel({
    title: 'Forecast models',
    subtitle: 'Compare each estimate used for the headline ETA',
    headings: ['Model', 'Rate', 'Time Left', 'ETA'],
    rows: buildModelRows(forecastData.forecasts),
    footnote: 'The headline estimate is the median of these models. Hover a model name for how it works.',
    open: true,
  })}

    ${buildDetailsPanel({
    title: 'Wisdom by location',
    subtitle: 'Where your tracked wisdom gains have come from recently',
    headings: ['Location', 'Wisdom', 'Hunts', 'Wisdom/Hunt'],
    rows: buildLocationRows(locations),
  })}

    ${buildDetailsPanel({
    title: 'Recent samples',
    subtitle: 'The latest stored snapshots used to build the forecast',
    headings: ['Date', 'Wisdom', 'Gain', 'Location'],
    rows: buildHistoryRows(samples),
  })}
  </div>`;
};

const hydratePopup = (targetRankId, forecastData) => {
  const select = document.querySelector('#rank-up-forecaster-target');
  if (select) {
    select.addEventListener('change', () => {
      saveSetting('rank-up-forecaster.target-rank', select.value);
      showForecasterPopup(select.value, false);
    });
  }

  const refresh = document.querySelector('#rank-up-forecaster-refresh');
  if (refresh) {
    refresh.addEventListener('click', () => showForecasterPopup(targetRankId, true));
  }

  const chartContainer = document.querySelector('#rank-up-forecaster-chart');
  if (chartContainer) {
    renderForecastChart(chartContainer, forecastData);
  }
};

const getSavedTargetRank = () => {
  const saved = getSetting('rank-up-forecaster.target-rank', null);
  if (! saved) {
    return null;
  }

  // If the hunter has ranked past their saved target, fall back to the next rank.
  const nextIndex = RANKS.findIndex((rank) => rank.id === getNextRank().id);
  const savedIndex = RANKS.findIndex((rank) => rank.id === saved);

  return savedIndex >= nextIndex ? saved : null;
};

const showForecasterPopup = async (targetRankId = null, refresh = true) => {
  const target = targetRankId || getSavedTargetRank() || getNextRank().id;
  if (refresh) {
    await recordSample('manual');
  }

  const forecastData = await getForecasts(target);
  const samples = await getSamples();
  const locations = await getLocationSummaries();

  createPopup({
    title: 'Rank-Up Forecaster',
    className: 'mh-improved-rank-up-forecaster',
    content: buildPopupMarkup({
      forecastData,
      samples,
      locations,
      targetRankId: target,
    }),
  });

  hydratePopup(target, forecastData);
};

const addStatBarListener = () => {
  const legacyPointsLabel = [...document.querySelectorAll('.hudstatlabel')]
    .find((label) => ['points', 'rank'].includes(label.textContent.trim().toLowerCase()));
  const statRows = [
    document.querySelector('.mousehuntHud-userStat-row.points'),
    document.querySelector('.mousehuntHud-userStat-row.title'),
    legacyPointsLabel,
  ].filter(Boolean);

  statRows.forEach((row) => {
    if (row.dataset.rankUpForecasterListener) {
      return;
    }

    row.dataset.rankUpForecasterListener = 'true';
    row.classList.add('rank-up-forecaster-trigger');
    row.addEventListener('click', () => showForecasterPopup());
  });
};

const addMenuItem = () => {
  addSubmenuItem({
    id: 'rank-up-forecaster',
    menu: 'kingdom',
    label: 'Rank-Up Forecaster',
    icon: 'https://www.mousehuntgame.com/images/items/stats/transparent_thumb/cf1dfc99fde5f6fdcfe935e345f126db.png',
    class: 'rank-up-forecaster-submenu-item',
    callback: () => showForecasterPopup(),
  });
};

const init = async () => {
  addStyles(styles, 'rank-up-prediction');

  await migrateLegacyData();
  await recordSample('load');

  onTurn(() => recordSample('hunt'));
  onTravel(null, { callback: () => recordSample('travel') });

  addStatBarListener();
  addMenuItem();
};

export default {
  id: 'rank-up-forecaster',
  name: 'Rank-Up Forecaster',
  description: 'Record wisdom history and forecast rank-ups.',
  load: init,
};
