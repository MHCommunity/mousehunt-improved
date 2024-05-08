import {
  addStyles,
  debuglog,
  doRequest,
  getSetting,
  makeElement,
  onEvent,
  sessionGet,
  sessionSet,
  sleep
} from '@utils';

import styles from './raffle.css';

/**
 * Get ballots to send.
 *
 * @return {Array} The ballots to send.
 */
const getBallotsToSend = () => {
  const ballotsToSend = [];
  const ballots = document.querySelectorAll('.message.notification.ballot');

  if (! ballots.length) {
    return ballotsToSend;
  }

  ballots.forEach((ballot) => {
    if (ballot.classList.contains('done') || ballot.classList.contains('skipped')) {
      return;
    }

    const name = ballot.querySelector('.messageText a');
    const action = ballot.querySelector('.sendBallot');
    if (! action || ! name) {
      return;
    }

    ballotsToSend.push({
      id: action.getAttribute('data-sender'),
      name: name.innerText ? name.innerText.trim() : '',
      element: ballot,
    });
  });

  return ballotsToSend;
};

/**
 * Get the cached sent ballots.
 *
 * @return {Array} The cached sent ballots.
 */
const getSavedSentBallots = () => {
  return sessionGet('sent-ballots', []);
};

/**
 * Get the saved sent ballot.
 *
 * @param {string} id The ballot ID.
 *
 * @return {boolean} The saved sent ballot.
 */
const getSavedSentBallot = (id) => {
  const savedSentBallots = getSavedSentBallots();
  return savedSentBallots.includes(id);
};

/**
 * Save a sent ballot.
 *
 * @param {string} id The ballot ID.
 */
const saveSentBallot = (id) => {
  const savedSentBallots = getSavedSentBallots();
  savedSentBallots.push(id);

  sessionSet('sent-ballots', savedSentBallots);
};

/**
 * Send a ballot.
 *
 * @param {Object} ballot The ballot to send.
 *
 * @return {Object} The send ballot response.
 */
const sendBallot = async (ballot) => {
  debuglog('feature-flags-raffle', `Returning ballot for ${ballot.name} (${ballot.id})…`);

  const button = document.querySelector(`.sendBallot[data-sender="${ballot.id}"]`);
  if (! button) {
    debuglog('feature-flags-raffle', `Could not find button for ${ballot.name} (${ballot.id})`);
    return { status: 'error', proceed: false };
  }

  const buttonParent = button.parentElement.parentElement;
  if (buttonParent) {
    const id = buttonParent.getAttribute('data-id');

    if (id) {
      if (getSavedSentBallot(id)) {
        debuglog('feature-flags-raffle', `Already returned ballot for ${ballot.name} (${ballot.id})`);
        return { status: 'skipped', proceed: true };
      }

      saveSentBallot(id);
    }
  }

  let response;
  try {
    response = await doRequest('managers/ajax/users/givefriendballot.php', {
      snuid: ballot.id,
    });
  } catch (error) {
    debuglog('feature-flags-raffle', `Error returning ballot for ${ballot.name}: ${error}`);

    await sleep(1000);

    return { status: 'error', proceed: true };
  }

  if (response?.error && ! response?.error?.includes('You have already entered ')) {
    debuglog('feature-flags-raffle', `Error returning ballot for ${ballot.name}: ${response.error}`);
    return { status: 'error', proceed: false };
  }

  debuglog('feature-flags-raffle', `Returned ballot for ${ballot.name} (${ballot.id})`);

  button.classList.add('disabled');
  button.setAttribute('disabled', true);

  await sleep(250);

  return { status: 'done', proceed: true };
};

/**
 * Return raffles.
 */
const returnRaffles = async () => {
  const drawTab = document.querySelector('.notificationMessageList .tab.active[data-tab="daily_draw"]');
  if (! drawTab) {
    return;
  }

  const existing = document.querySelector('.mh-return-raffles.message');
  if (existing) {
    existing.remove();
  }

  const messageWrapper = makeElement('div', ['mh-return-raffles', 'message']);
  const actionsWrapper = makeElement('div', ['actions']);

  const returnButton = makeElement('input', ['mh-return-raffles-button', 'sendBallot']);
  returnButton.setAttribute('type', 'button');
  returnButton.setAttribute('value', 'Return Raffles');

  const statusEl = makeElement('div', ['status']);

  let isReturning = false;
  returnButton.addEventListener('click', async () => {
    if (isReturning) {
      returnButton.value = 'Return Raffles';
      statusEl.innerText = 'Stopped returning ballots.';
      setTimeout(() => {
        statusEl.innerText = '';
      }, 1000);

      isReturning = false;

      return;
    }

    isReturning = true;

    returnButton.value = 'Stop Returning';
    statusEl.innerText = 'Returning ballots…';

    const ballotsToSend = getBallotsToSend();
    if (! ballotsToSend.length) {
      return;
    }

    debuglog('feature-flags-raffle', `Returning ${ballotsToSend.length} ballots…`, ballotsToSend);

    const tab = document.querySelector('.notificationMessageList .tab.active[data-tab="daily_draw"]');
    if (! tab) {
      return;
    }

    for (const ballot of ballotsToSend) {
      if (! isReturning) {
        break;
      }

      ballot.element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });

      statusEl.innerText = `Returning ballot for ${ballot.name}…`;
      ballot.element.classList.add('hover');

      const { status, proceed } = await sendBallot(ballot, tab);

      if ('skipped' === status) {
        statusEl.innerText = `Already returned ballot for ${ballot.name}!`;
      }

      ballot.element.classList.remove('hover');

      if (! proceed) {
        statusEl.innerText = 'Ballots returned!';
        break;
      }

      ballot.element.classList.add(status);
    }

    if (! isReturning) {
      return;
    }

    isReturning = false;
    returnButton.value = 'Return Raffles';
    statusEl.innerText = 'Ballots returned!';
    setTimeout(() => {
      statusEl.innerText = '';
    }, 1000);
  });

  actionsWrapper.append(returnButton);
  actionsWrapper.append(statusEl);
  messageWrapper.append(actionsWrapper);

  drawTab.insertBefore(messageWrapper, drawTab.firstChild);
};

let _inboxOpen;
/**
 * Replace inbox methods.
 */
const replaceInboxMethods = () => {
  if ('undefined' === typeof messenger || ! messenger?.UI?.notification?.showTab) {
    return;
  }

  if (_inboxOpen) {
    return;
  }

  _inboxOpen = messenger.UI.notification.showTab;
  messenger.UI.notification.showTab = (tab) => {
    const toReturn = _inboxOpen(tab);
    if (tab === 'daily_draw') {
      returnRaffles();
    }

    return toReturn;
  };

  if (! messenger?.UI?.notification?.togglePopup) {
    return;
  }

  const _inboxPopup = messenger.UI.notification.togglePopup;
  messenger.UI.notification.togglePopup = (e) => {
    const toReturn = _inboxPopup(e);
    onEvent('ajax_response', () => {
      setTimeout(() => {
        const activeTab = document.querySelector('.notificationHeader .tab.active');
        if (activeTab && activeTab.getAttribute('data-tab') === 'daily_draw') {
          returnRaffles();
        }
      }, 100);
    }, true);

    return toReturn;
  };
};

/**
 * Initialize the module.
 */
export default async () => {
  if (getSetting('hide-daily-draw', false)) {
    return;
  }

  addStyles(styles, 'feature-flags-raffle');

  replaceInboxMethods();
};
