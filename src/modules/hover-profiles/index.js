import {
  addStyles,
  doRequest,
  getSetting,
  makeElement,
  onJournalEntriesProcessed,
  sessionGet,
  sessionSet
} from '@utils';

import styles from './styles.css';

const SHOW_DELAY_MS = 160;
const HIDE_DELAY_MS = 240;

const isString = (v) => typeof v === 'string' && v.length > 0;

const clean = (s) => String(s || '').trim().replace(/^#+/, '');

const parseSnuidFromHref = (href) => {
  if (! href) {
    return null;
  }

  const u = new URL(href, location.origin);
  const snuid = u.searchParams.get('snuid');
  if (snuid) {
    return clean(snuid);
  }
  if (u.pathname.endsWith('/p.php')) {
    const pid = u.searchParams.get('id');
    if (pid) {
      return { pid: clean(pid) };
    }
  }

  return null;
};

const parseSnuidFromOnclick = (el) => {
  const h = String(el?.getAttribute?.('onclick') || '');
  const m = h.match(/show\(["']([\w:-]+)["']\)/);
  return m && m[1] ? clean(m[1]) : null;
};

const resolveSnuid = async (el) => {
  const d = el.getAttribute('data-snuid');
  if (isString(d)) {
    return clean(d);
  }

  if (el.href) {
    const parsed = parseSnuidFromHref(el.href);
    if (isString(parsed)) {
      return parsed;
    }
    if (parsed && parsed.pid) {
      try {
        const res = await doRequest('managers/ajax/pages/friends.php', {
          action: 'community_search_by_id',
          user_id: parsed.pid
        });
        const sn = res?.friend?.sn_user_id;
        if (isString(sn)) {
          return clean(sn);
        }
      } catch {
        debug('hover-profiles', 'Failed to resolve snuid');
      }
    }
  }

  const fromOnclick = parseSnuidFromOnclick(el);
  if (isString(fromOnclick)) {
    return clean(fromOnclick);
  }

  return null;
};

const getFriendDataBySnuids = (snuids) =>
  new Promise((resolve) => {
    try {
      app.pages.FriendsPage.getFriendDataBySnuids(snuids, (data) => resolve(data || []));
    } catch {
      resolve([]);
    }
  });

const renderFriend = (payload) => {
  try {
    if (payload && payload.length) {
      const isStranger = !! payload[0]?.user_interactions?.relationship?.is_stranger;
      const tpl = isStranger ? 'PageFriends_request_row' : 'PageFriends_view_friend_row';
      return hg.utils.TemplateUtil.render(tpl, payload[0]);
    }
    const placeholder = hg.pages.FriendsPage().getPlaceholderData();
    return hg.utils.TemplateUtil.render('PageFriends_view_friend_row', placeholder);
  } catch {
    return '<div class="friend-data-wrapper-loading">Unable to render profile.</div>';
  }
};

// Single reusable panel with original classes
let panel = null;
let anchor = null;
let showTimer = 0;
let hideTimer = 0;

// Hover state flags
let overAnchor = false; // pointer over anchor link
let overPanel = false; // pointer over .friend-data-wrapper
let overSendBtn = false; // pointer over Send Supplies button inside panel
let overQuickSend = false; // pointer over .quickSendWrapper

const ensurePanel = () => {
  if (panel && panel.isConnected) {
    return panel;
  }

  const p = makeElement('div', 'friend-data-wrapper');
  p.id = 'friend-data-wrapper';
  p.setAttribute('role', 'dialog');
  p.setAttribute('aria-live', 'polite');
  p.tabIndex = -1;
  p.innerHTML = '<div class="friend-data-wrapper-loading">Loading...</div>';

  // Track pointer state over the panel
  p.addEventListener('mouseenter', () => {
    overPanel = true;
    clearTimeout(hideTimer);
  });
  p.addEventListener('mouseleave', () => {
    overPanel = false;
    scheduleHide();
  });

  document.body.append(p);
  panel = p;

  // Dismiss on outside click or Escape
  document.addEventListener('click', (e) => {
    if (! panel) {
      return;
    }
    if (panel.contains(e.target)) {
      return;
    }
    if (anchor && anchor.contains && anchor.contains(e.target)) {
      return;
    }
    hide();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hide();
    }
  });

  // Reposition on scroll or resize
  window.addEventListener('scroll', reposition, true);
  window.addEventListener('resize', reposition, true);

  // Global delegated listeners to track Quick Send hover
  // Use capture so we see events even if stopped elsewhere
  document.addEventListener('mouseover', (ev) => {
    const el = ev.target instanceof Element ? ev.target : null;
    if (! el) {
      return;
    }

    // If pointer moves into any Quick Send wrapper, hold the profile open
    if (el.closest('.quickSendWrapper')) {
      overQuickSend = true;
      clearTimeout(hideTimer);
    }

    // If pointer moves into the Send Supplies button inside the profile panel
    if (panel && panel.contains(el) && el.closest('.userInteractionButtonsView-button.sendSupplies')) {
      overSendBtn = true;
      clearTimeout(hideTimer);
    }
  }, true);

  document.addEventListener('mouseout', (ev) => {
    const el = ev.target instanceof Element ? ev.target : null;
    if (! el) {
      return;
    }
    const to = ev.relatedTarget instanceof Element ? ev.relatedTarget : null;

    if (el.closest('.quickSendWrapper') && ! (to && to.closest('.quickSendWrapper'))) {
      overQuickSend = false;
      scheduleHide();
    }
    if (panel && panel.contains(el) && el.closest('.userInteractionButtonsView-button.sendSupplies')) {
      const stillInsideBtn = !! (to && panel.contains(to) && to.closest('.userInteractionButtonsView-button.sendSupplies'));
      if (! stillInsideBtn) {
        overSendBtn = false;
        scheduleHide();
      }
    }
  }, true);

  return p;
};

const scheduleShow = (fn) => {
  clearTimeout(showTimer);
  showTimer = setTimeout(fn, SHOW_DELAY_MS);
};

const scheduleHide = () => {
  if (getSetting('debug.hover-profiles', false)) {
    return;
  }

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    // Keep open if any related hover is active
    if (! overAnchor && ! overPanel && ! overSendBtn && ! overQuickSend) {
      hide();
    }
  }, HIDE_DELAY_MS);
};

const hide = () => {
  clearTimeout(showTimer);
  clearTimeout(hideTimer);
  overSendBtn = false;
  overQuickSend = false;
  if (panel) {
    panel.style.opacity = '0';
    panel.style.pointerEvents = 'none';
    panel.innerHTML = '';
  }
  anchor = null;
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const reposition = () => {
  if (! panel || ! anchor) {
    return;
  }

  panel.style.top = '0px';
  panel.style.left = '-9999px';
  panel.style.pointerEvents = 'auto';

  const rect = anchor.getBoundingClientRect();
  const ph = panel.offsetHeight || 280;
  const pw = panel.offsetWidth || 360;

  const viewportH = document.documentElement.clientHeight;
  const viewportW = document.documentElement.clientWidth;

  const aboveTop = rect.top + window.scrollY - ph - 10;
  const belowTop = rect.bottom + window.scrollY + 10;
  const preferAbove = rect.top > ph + 20;
  const top = preferAbove ? aboveTop : belowTop;

  let left = rect.left + window.scrollX + (rect.width / 2) - (pw / 2);
  left = clamp(left, window.scrollX + 8, window.scrollX + viewportW - pw - 8);

  panel.style.top = `${top}px`;
  panel.style.left = `${left}px`;

  const r = panel.getBoundingClientRect();
  if (! preferAbove && r.bottom > viewportH - 8) {
    panel.style.top = `${aboveTop}px`;
  }

  panel.style.opacity = '1';
};

const showForAnchor = async (a) => {
  anchor = a;
  const p = ensurePanel();
  p.innerHTML = '<div class="friend-data-wrapper-loading">Loading...</div>';
  p.style.pointerEvents = 'auto';
  reposition();
  p.focus({ preventScroll: true });

  const snuid = await resolveSnuid(a);
  if (! snuid || snuid === user.sn_user_id) {
    hide();
    return;
  }

  const cached = sessionGet(`mh-improved-mh-improved-cache-friend-${snuid}`);
  if (cached) {
    p.innerHTML = renderFriend(cached);
    wireSendButtonHover();
    reposition();
    return;
  }

  const data = await getFriendDataBySnuids([snuid]);
  if (! anchor || ! anchor.isConnected) {
    return;
  }
  if (data && data.length) {
    sessionSet(`mh-improved-mh-improved-cache-friend-${snuid}`, data);
  }
  p.innerHTML = renderFriend(data);
  wireSendButtonHover();
  reposition();
};

// Ensure we hold the panel open when hovering the Send Supplies button in the panel
const wireSendButtonHover = () => {
  if (! panel) {
    return;
  }
  const sendBtn = panel.querySelector('.userInteractionButtonsView-button.sendSupplies');
  if (! sendBtn) {
    return;
  }

  sendBtn.addEventListener('mouseenter', () => {
    overSendBtn = true;
    clearTimeout(hideTimer);
  });
  sendBtn.addEventListener('mouseleave', () => {
    overSendBtn = false;
    scheduleHide();
  });
};

// Selectors consistent with original usage
const SELECTORS = [
  'a[href*="/hunterprofile.php"]',
  'a[href*="/profile.php"]',
  'a[href*="/p.php?id="]',
  '.notificationMessageList .messageText a[href*="/p.php"]',
  '.treasureMapView-scoreboard-table a[href*="/profile.php"]',
  'tr.teamPage-memberRow-identity a[href*="/profile.php"]'
];

const seen = new WeakSet();

const bindListeners = () => {
  document.querySelectorAll(SELECTORS.join(',')).forEach((link) => {
    // console.log('hover-profiles', 'Binding to link', link);
    if (seen.has(link)) {
      return;
    }

    seen.add(link);

    if (
      link.classList.contains('friendsPage-friendRow-image') ||
      link.classList.contains('mousehuntHud-shield')
    ) {
      return;
    }

    link.addEventListener('mouseenter', () => {
      overAnchor = true;
      scheduleShow(() => showForAnchor(link));
    });

    link.addEventListener('mouseleave', () => {
      overAnchor = false;
      scheduleHide();
    });

    link.addEventListener('focus', () => {
      overAnchor = true;
      scheduleShow(() => showForAnchor(link));
    });

    link.addEventListener('blur', () => {
      overAnchor = false;
      scheduleHide();
    });
  });
};

const init = () => {
  addStyles(styles, 'hover-profiles');

  // onRequest('*', () => setTimeout(bindListeners, 250));
  onJournalEntriesProcessed(bindListeners);
};

export default {
  id: 'hover-profiles',
  name: 'Hover Profiles',
  type: 'feature',
  default: true,
  description: 'Hover over a name to see a mini profile popup.',
  load: init
};
