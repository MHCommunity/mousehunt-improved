import {
  addStyles,
  debuglog,
  doRequest,
  makeElement,
  onEvent,
  sessionGet,
  sessionSet,
  sleep
} from '@utils';

import styles from './raffle.css';

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

const getSavedSentBallots = () => {
  return sessionGet('sent-ballots', []);
};

const getSavedSentBallot = (id) => {
  const savedSentBallots = getSavedSentBallots();
  return savedSentBallots.includes(id);
};

const saveSentBallot = (id) => {
  const savedSentBallots = getSavedSentBallots();
  savedSentBallots.push(id);

  sessionSet('sent-ballots', savedSentBallots);
};

const sendBallot = async (ballot) => {
  debuglog('beta-features-raffle', `Returning ballot for ${ballot.name} (${ballot.id})…`);

  const button = document.querySelector(`.sendBallot[data-sender="${ballot.id}"]`);
  if (! button) {
    debuglog('beta-features-raffle', `Could not find button for ${ballot.name} (${ballot.id})`);
    return { status: 'error', proceed: false };
  }

  const buttonParent = button.parentElement.parentElement;
  if (buttonParent) {
    const id = buttonParent.getAttribute('data-id');

    if (id) {
      if (getSavedSentBallot(id)) {
        debuglog('beta-features-raffle', `Already returned ballot for ${ballot.name} (${ballot.id})`);
        return { status: 'skipped', proceed: true };
      }

      saveSentBallot(id);
    }
  }

  const response = await doRequest('managers/ajax/users/givefriendballot.php', {
    snuid: ballot.id,
  });

  if (response.error && ! response.error.includes('You have already entered ')) {
    debuglog('beta-features-raffle', `Error returning ballot for ${ballot.name}: ${response.error}`);
    return { status: 'error', proceed: false };
  }

  debuglog('beta-features-raffle', `Returned ballot for ${ballot.name} (${ballot.id})`);

  button.classList.add('disabled');
  button.setAttribute('disabled', true);

  await sleep(250);

  return { status: 'done', proceed: true };
};

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

    debuglog('beta-features-raffle', `Returning ${ballotsToSend.length} ballots…`, ballotsToSend);

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

const replaceInboxMethods = () => {
  const _inboxOpen = messenger.UI.notification.showTab;
  messenger.UI.notification.showTab = (tab) => {
    const toReturn = _inboxOpen(tab);
    if (tab === 'daily_draw') {
      returnRaffles();
    }

    return toReturn;
  };

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

const main = () => {
  addStyles(styles, 'beta-features-raffle');

  replaceInboxMethods();
};

export default main;
