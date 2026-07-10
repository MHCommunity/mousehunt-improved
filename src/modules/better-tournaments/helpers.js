/**
 * Get a tournament ID from a tournament URL.
 *
 * @param {string} href Tournament URL.
 *
 * @return {string|null} Tournament ID.
 */
const getTournamentId = (href) => {
  if (! href) {
    return null;
  }

  try {
    return new URL(href, 'https://www.mousehuntgame.com/').searchParams.get('tournament_id');
  } catch {
    return null;
  }
};

/**
 * Restore a cached full tournament name after the game renders its short name.
 *
 * @param {HTMLElement} link  Tournament HUD link.
 * @param {Map}         names Full tournament names keyed by ID.
 *
 * @return {boolean} Whether a cached name was applied.
 */
const applyCachedTournamentName = (link, names) => {
  const tournamentId = getTournamentId(link?.href);
  const name = tournamentId ? names.get(tournamentId) : null;
  if (! name) {
    return false;
  }

  if (link.innerText !== name) {
    link.innerText = name;
  }

  return true;
};

/**
 * Convert a relative tournament time to minutes.
 *
 * @param {string} value Relative time such as "1 day 2 hours 3 minutes".
 *
 * @return {number|null} Duration in minutes, or null when no duration is present.
 */
const parseTournamentMinutes = (value) => {
  if (! value) {
    return null;
  }

  const unitMinutes = {
    day: 1440,
    hour: 60,
    minute: 1,
  };

  let minutes = 0;
  let hasDuration = false;

  for (const match of value.matchAll(/(\d+)\s*(days?|hours?|minutes?)/gi)) {
    hasDuration = true;
    minutes += Number.parseInt(match[1], 10) * unitMinutes[match[2].toLowerCase().replace(/s$/, '')];
  }

  return hasDuration ? minutes : null;
};

/**
 * Parse a formatted ordinal tournament rank.
 *
 * @param {string} value Rank such as "2314th" or "2,314th".
 *
 * @return {Object|null} Numeric rank and ordinal suffix.
 */
const parseTournamentRank = (value) => {
  const match = value?.trim().match(/^([\d,]+)(.*)$/);
  if (! match) {
    return null;
  }

  const rank = Number.parseInt(match[1].replaceAll(',', ''), 10);
  if (! Number.isFinite(rank)) {
    return null;
  }

  return {
    rank,
    suffix: match[2],
  };
};

/**
 * Calculate the meaningful localized dates for a listing row.
 *
 * Pending timers count down to the start, while active timers count down to
 * the end. Complete and deleted rows do not contain a relative countdown.
 *
 * @param {string} status           Tournament status.
 * @param {number} nowTime          Current timestamp.
 * @param {number} countdownMinutes Minutes represented by the timer.
 * @param {number} durationMinutes  Tournament duration.
 *
 * @return {Object|null} Listing dates.
 */
const getTournamentListingDates = (status, nowTime, countdownMinutes, durationMinutes) => {
  if (! Number.isFinite(countdownMinutes) || ! Number.isFinite(durationMinutes)) {
    return null;
  }

  const statusDate = new Date(nowTime + (countdownMinutes * 60000));

  if ('pending' === status) {
    return {
      statusDate,
      durationDate: new Date(statusDate.getTime() + (durationMinutes * 60000)),
    };
  }

  if ('active' === status) {
    return {
      statusDate,
      durationDate: new Date(statusDate.getTime() - (durationMinutes * 60000)),
    };
  }

  return null;
};

export { applyCachedTournamentName, getTournamentId, getTournamentListingDates, parseTournamentMinutes, parseTournamentRank };
