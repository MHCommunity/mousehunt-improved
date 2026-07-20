import { addEvent, addStyles, doRequest, getSetting, makeElement, onEvent, onNavigation, onRequest, sessionGet, sessionSet } from '@utils';

import { applyCachedTournamentName, getTournamentId, getTournamentListingDates, parseTournamentMinutes, parseTournamentRank } from './helpers';
import settings from './settings';
import styles from './styles.css';

let scoreboardObserver = null;
let tournamentListObserver = null;
let tournamentHudObserver = null;
let observedTournamentHud = null;
const tournamentDataCache = new Map();
const tournamentNames = new Map();

const tournamentRowSelector = '.tournamentPage-tournamentRow.tournamentPage-tournamentData';
const tournamentDataCacheDuration = 5 * 60 * 1000;
const tournamentDataCacheKeyPrefix = 'better-tournaments-data';
const namesCacheKey = 'better-tournaments-names';

/**
 * Get tournament data, reusing recent and in-flight requests for the same
 * tournament.
 *
 * @param {string}  tournamentId Tournament ID.
 * @param {boolean} skipCache    Whether to refetch instead of reusing a cached response.
 *
 * @return {Promise<Object>} Tournament page response.
 */
const getTournamentData = async (tournamentId, skipCache = false) => {
  const cacheKey = `${tournamentDataCacheKeyPrefix}-${tournamentId}`;
  const cached = skipCache ? null : (tournamentDataCache.get(tournamentId) ?? sessionGet(cacheKey, null));
  if (cached?.expiry > Date.now()) {
    return cached.data ?? cached.request;
  }

  const request = doRequest('managers/ajax/pages/page.php', {
    page_class: 'Tournament',
    'page_arguments[tournament_id]': tournamentId,
  });

  tournamentDataCache.set(tournamentId, {
    expiry: Date.now() + tournamentDataCacheDuration,
    request,
  });

  try {
    const data = await request;
    if (!data?.page) {
      tournamentDataCache.delete(tournamentId);
      return data;
    }

    const cacheEntry = {
      expiry: Date.now() + tournamentDataCacheDuration,
      data: { page: data.page },
    };
    tournamentDataCache.set(tournamentId, cacheEntry);
    sessionSet(cacheKey, cacheEntry);

    return data;
  } catch (error) {
    tournamentDataCache.delete(tournamentId);
    throw error;
  }
};

/**
 * Remember a full tournament name, keeping it available across page loads.
 *
 * @param {string} tournamentId Tournament ID.
 * @param {string} name         Full tournament name.
 */
const cacheTournamentName = (tournamentId, name) => {
  if (!tournamentId || !name || tournamentNames.get(tournamentId) === name) {
    return;
  }

  tournamentNames.set(tournamentId, name);
  sessionSet(namesCacheKey, Object.fromEntries(tournamentNames));
};

/**
 * Cache the full tournament name from the HUD data the game already has, so
 * that the name can be restored without waiting on a request.
 */
const cacheTournamentNameFromUser = () => {
  const progress = user?.viewing_atts?.tournament;
  if (progress?.tournament_id && progress?.name) {
    cacheTournamentName(String(progress.tournament_id), progress.name);
  }
};

/**
 * Restore the full tournament name after the game renders its short name.
 */
const restoreTournamentName = () => {
  const activeTourney = document.querySelector('#tournamentStatusHud > a.name');
  const hud = activeTourney?.closest('#tournamentStatusHud');
  if (!activeTourney || !hud || hud.classList.contains('trainStationHUD')) {
    return;
  }

  cacheTournamentNameFromUser();
  applyCachedTournamentName(activeTourney, tournamentNames);
};

/**
 * Watch the tournament HUD because the game rewrites the name with its short
 * version on every HUD render, and those renders aren't tied to navigation.
 */
const observeTournamentHud = () => {
  const hud = document.querySelector('#tournamentStatusHud');
  if (hud === observedTournamentHud) {
    restoreTournamentName();
    return;
  }

  tournamentHudObserver?.disconnect();
  tournamentHudObserver = null;
  observedTournamentHud = hud;

  if (!hud) {
    return;
  }

  restoreTournamentName();

  // The game builds a fresh HUD when you join a tournament and rebuilds it again when one
  // flips from pending to active, and neither path fires tournament_status_change. This is
  // the only signal that the HUD was replaced, so the hover panels have to be rebuilt here
  // too — otherwise they stay empty until a full page reload. A rebuild is also exactly
  // when the cached is_active state goes stale, so refetch rather than reuse it.
  updateTournamentHud(true);

  // Restoring the name is a no-op once the name already matches, so writing it
  // back from the observer can't retrigger the observer indefinitely.
  tournamentHudObserver = new MutationObserver(restoreTournamentName);
  tournamentHudObserver.observe(hud, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

/**
 * Update the tournament HUD.
 *
 * The cached response holds the tournament's is_active state, which goes stale the moment a
 * tournament starts, so callers that know the state just changed should skip the cache.
 *
 * @param {boolean} skipCache Whether to refetch rather than reuse a cached response.
 */
const updateTournamentHud = async (skipCache = false) => {
  const activeTourney = document.querySelector('#tournamentStatusHud > a.name');
  if (!activeTourney) {
    return;
  }

  const hud = activeTourney.closest('#tournamentStatusHud');
  if (!hud || hud.classList.contains('trainStationHUD')) {
    return;
  }

  const tourneyId = getTournamentId(activeTourney.href);
  if (!tourneyId) {
    return;
  }

  // If the game has just rendered its short name, restore the cached full name
  // synchronously while the rest of the tournament data refreshes.
  applyCachedTournamentName(activeTourney, tournamentNames);

  const tourneyData = await getTournamentData(tourneyId, skipCache);

  if (!tourneyData?.page) {
    return;
  }

  if (tourneyData.page.name) {
    cacheTournamentName(tourneyId, tourneyData.page.name);
  }

  // The request can finish after the game has replaced the HUD or moved the
  // player into a different tournament. Never update that newer HUD with stale data.
  const currentTourney = document.querySelector('#tournamentStatusHud > a.name');
  if (currentTourney !== activeTourney || !activeTourney.isConnected || getTournamentId(currentTourney?.href) !== tourneyId) {
    return;
  }

  applyCachedTournamentName(activeTourney, tournamentNames);

  if (tourneyData.page?.is_active) {
    const rank = hud.querySelector(':scope > .rank');
    const scoreboardRows = tourneyData.page.scoreboard?.rows ?? [];
    if (rank && scoreboardRows.length) {
      rank.querySelector(':scope > .scoreHover')?.remove();
      const scoreHover = makeElement('div', 'scoreHover');

      scoreboardRows.forEach((scoreboard) => {
        const scoreRow = makeElement('div', 'scoreRow');

        makeElement('div', 'scoreRank', scoreboard.rank, scoreRow);

        const teamWrapper = makeElement('a', 'teamWrapper');
        teamWrapper.href = `https://www.mousehuntgame.com/team.php?team_id=${scoreboard.team_id}`;

        const icon = makeElement('div', 'scoreIcon');

        (scoreboard.emblem?.layers ?? []).forEach((layer, index) => {
          const iconLayer = makeElement('div', `scoreIconLayer${index + 1}`);
          iconLayer.style.backgroundImage = `url(${layer.image})`;
          icon.append(iconLayer);
        });

        teamWrapper.append(icon);

        makeElement('div', 'scoreName', scoreboard.name, teamWrapper);

        scoreRow.append(teamWrapper);

        makeElement('div', 'scorePoints', scoreboard.points, scoreRow);

        scoreHover.append(scoreRow);
      });

      rank.append(scoreHover);
    }

    const points = hud.querySelector(':scope > .score');
    const mouseGroups = tourneyData.page.mouse_groups ?? [];
    if (points && mouseGroups.length) {
      points.querySelector(':scope > .pointsHover')?.remove();
      const pointsHover = makeElement('div', 'pointsHover');

      [...mouseGroups].reverse().forEach((mouseGroup) => {
        const pointsRow = makeElement('div', 'pointsRow');

        makeElement('div', 'pointsTotal', mouseGroup.name, pointsRow);

        const groupMice = makeElement('div', 'pointsMice');

        mouseGroup.mice.forEach((mouse) => {
          const mouseWrapper = makeElement('div', 'pointsMouseWrapper');

          const mouseIcon = makeElement('img', 'pointsMouseIcon');
          mouseIcon.src = mouse.thumb;

          mouseWrapper.append(mouseIcon);

          makeElement('div', 'pointsMouseName', mouse.name, mouseWrapper);

          groupMice.append(mouseWrapper);
        });

        pointsRow.append(groupMice);
        pointsHover.append(pointsRow);
      });

      points.append(pointsHover);
    }
  } else {
    const members = hud.querySelector(':scope > a.teamMembers');
    const tournamentMembers = tourneyData.page.members ?? [];
    if (members && tournamentMembers.length) {
      members.querySelector(':scope > .memberHover')?.remove();
      const memberHover = makeElement('div', 'memberHover');

      tournamentMembers.forEach((member) => {
        const memberRow = makeElement('div', 'memberRow');

        if (member.is_empty) {
          makeElement('div', 'memberEmpty', 'Empty', memberRow);
          memberRow.classList.add('empty');
        } else {
          const image = makeElement('img', 'memberImage');
          image.src = member.profile_pic ?? 'https://www.mousehuntgame.com//images/ui/friends/anonymous_user.png';
          memberRow.append(image);

          makeElement('div', 'memberName', member.name ?? '', memberRow);
        }

        memberHover.append(memberRow);
      });

      members.append(memberHover);
    }
  }
};

/**
 * Update the tournament list.
 */
const updateTournamentList = () => {
  const tournamentRows = document.querySelectorAll(tournamentRowSelector);
  if (!tournamentRows.length) {
    return;
  }

  const now = new Date();
  const nowTime = now.getTime();

  const dateOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  tournamentRows.forEach((row) => {
    const valueColumns = row.querySelectorAll(':scope > .tournamentPage-tournament-column.value');
    const statusColumn = valueColumns[0];
    const durationColumn = valueColumns[1];
    if (!statusColumn || !durationColumn) {
      return;
    }

    // Make repeated navigation/list refresh callbacks idempotent and parse only
    // the relative time supplied by the game.
    statusColumn.querySelector(':scope > .tournament-normal-time')?.remove();
    durationColumn.querySelector(':scope > .tournament-normal-time')?.remove();

    // The game exposes a row's status as a CSS class, not a data attribute.
    // Active rows count down to the end; everything else that still has a
    // countdown (signed up / upcoming) counts down to the start.
    const status = row.classList.contains('active') ? 'active' : 'pending';

    const countdownMinutes = parseTournamentMinutes(row.dataset.timer ?? statusColumn.textContent);
    const durationHours = Number.parseFloat(row.dataset.duration);
    const durationMinutes = Number.isFinite(durationHours) ? durationHours * 60 : parseTournamentMinutes(durationColumn.textContent);
    const dates = getTournamentListingDates(status, nowTime, countdownMinutes, durationMinutes);
    if (!dates) {
      return;
    }

    const inlineOrHover = getSetting('better-tournaments.time-inline', true) ? 'tournament-time-display-inline' : 'tournament-time-display-hover';

    const statusDateClass = 'pending' === status ? 'tournament-begins-date' : 'tournament-end-date';
    const statusDateEl = makeElement('div', ['tournament-normal-time', statusDateClass, inlineOrHover], dates.statusDate.toLocaleString('en-US', dateOptions));
    statusColumn.append(statusDateEl);

    if (dates.durationDate) {
      const durationDateClass = 'pending' === status ? 'tournament-end-date' : 'tournament-begins-date';
      const durationDateEl = makeElement('div', ['tournament-normal-time', durationDateClass, inlineOrHover], dates.durationDate.toLocaleString('en-US', dateOptions));
      durationColumn.append(durationDateEl);
    }
  });
};

/**
 * Watch tournament listings because individual tabs can render after the
 * initial page navigation and replace their rows without another navigation.
 */
const observeTournamentList = () => {
  tournamentListObserver?.disconnect();
  tournamentListObserver = null;

  const listing = document.querySelector('.tournamentPage-viewState.listing');
  if (!listing) {
    return;
  }

  updateTournamentList();

  tournamentListObserver = new MutationObserver((mutations) => {
    const hasNewRows = mutations.some((mutation) => {
      return [...mutation.addedNodes].some((node) => {
        return node.matches?.(tournamentRowSelector) || node.querySelector?.(tournamentRowSelector);
      });
    });

    if (hasNewRows) {
      updateTournamentList();
    }
  });
  tournamentListObserver.observe(listing, {
    childList: true,
    subtree: true,
  });
};

/**
 * Update the scoreboard.
 */
const updateScoreboard = () => {
  const getRanks = document.querySelectorAll('.scoreboardTableView .tournament-team-rank:not(.updated)');
  getRanks.forEach((rank) => {
    const parsedRank = parseTournamentRank(rank.innerText);
    if (!parsedRank) {
      return;
    }

    rank.classList.add('updated');

    if (parsedRank.rank <= 25) {
      rank.classList.add('rank-first-page');
    }

    rank.setAttribute('data-rank', parsedRank.rank);
    rank.setAttribute('data-rank-page', Math.ceil(parsedRank.rank / 25));

    rank.innerText = parsedRank.rank.toLocaleString('en-US') + parsedRank.suffix;
  });
};

/**
 * Watch the scoreboard because the game can replace cached pages
 * without making another request.
 */
const observeScoreboard = () => {
  scoreboardObserver?.disconnect();
  scoreboardObserver = null;

  const scoreboards = document.querySelectorAll('.scoreboardTableView');
  if (!scoreboards.length) {
    return;
  }

  updateScoreboard();
  scoreboardObserver = new MutationObserver(updateScoreboard);
  scoreboards.forEach((scoreboard) => {
    scoreboardObserver.observe(scoreboard, {
      childList: true,
      subtree: true,
    });
  });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'better-tournaments');

  Object.entries(sessionGet(namesCacheKey, {}) || {}).forEach(([tournamentId, name]) => {
    tournamentNames.set(tournamentId, name);
  });

  observeTournamentHud();
  setTimeout(updateTournamentHud, 1000);

  // The game re-renders the tournament HUD from its own unweighted 'ajax_response'
  // listener. Listeners of the same weight fire in an arbitrary order, so restoring
  // the name needs a heavier weight to reliably land after the game's render.
  addEvent('ajax_response', observeTournamentHud, {
    weight: 1000,
    id: 'mh-improved-better-tournaments-restore-name',
  });

  // Joining, leaving or claiming changes the tournament's state, so don't reuse the
  // cached response here either.
  onEvent('tournament_status_change', () => updateTournamentHud(true));
  onNavigation(observeTournamentHud);
  onNavigation(observeTournamentList, {
    page: 'tournament',
  });

  onNavigation(observeScoreboard, {
    page: 'scoreboards',
  });

  onRequest('users/tournament.php', (_response, request) => {
    if ('get_tournament_listing' === request?.action) {
      setTimeout(observeTournamentList);
    }
  });

  onRequest('pages/scoreboards.php', () => setTimeout(updateScoreboard));
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-tournaments',
  name: 'Better Tournaments',
  type: 'locations-maps-travel',
  default: true,
  description: 'Update the Tournaments UI to show information on hover and make various small interface tweaks.',
  load: init,
  settings,
};
