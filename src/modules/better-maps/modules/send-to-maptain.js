import { doRequest, getSetting, getUserItems, makeElement, makeMhButton } from '@utils';

const ITEM_TYPE = 'super_brie_cheese';
const CONFIRM_TIMEOUT = 4000;

/**
 * Get how much SUPER|brie+ the user has.
 *
 * @return {Promise<number>} The quantity owned.
 */
const getSuperBrieQuantity = async () => {
  try {
    const items = await getUserItems([ITEM_TYPE], true);
    return Number.parseInt(items?.[0]?.quantity || 0, 10) || 0;
  } catch {
    return 0;
  }
};

/**
 * Add a quick "send SUPER|brie+ to the Maptain" field to the map sidebar, under the quick invite.
 *
 * @param {Object} mapData The map data.
 */
const addSendToMaptain = async (mapData) => {
  if (!getSetting('better-maps.send-to-maptain', true)) {
    return;
  }

  const sidebar = document.querySelector('.treasureMapView-rightBlock.treasureMapView-goalSidebar');
  if (!sidebar) {
    return;
  }

  sidebar.querySelector('.mh-ui-send-to-maptain-wrapper')?.remove();

  if (!mapData?.viewing_user_is_on_map || mapData.is_complete || mapData.can_claim_reward) {
    return;
  }

  const maptain = (mapData.hunters || []).find((hunter) => hunter.captain);
  if (!maptain?.sn_user_id) {
    return;
  }

  if (mapData.is_owner || `${maptain.sn_user_id}` === `${user.sn_user_id}`) {
    return;
  }

  let owned = await getSuperBrieQuantity();

  // The tab may have re-rendered while the inventory loaded.
  if (!sidebar.isConnected || sidebar.querySelector('.mh-ui-send-to-maptain-wrapper')) {
    return;
  }

  const wrapper = makeElement('div', 'mh-ui-send-to-maptain-wrapper');

  const input = makeElement('input', 'mh-ui-send-to-maptain-input');
  input.type = 'number';
  input.min = 1;
  input.placeholder = 'SUPER|brie+';
  wrapper.append(input);

  const indicators = makeElement('div', 'mh-ui-send-to-maptain-indicators');
  const spinner = makeElement('div', ['mh-ui-send-to-maptain-indicator', 'mh-ui-send-to-maptain-spinner', 'hidden']);
  const success = makeElement('div', ['mh-ui-send-to-maptain-indicator', 'mh-ui-send-to-maptain-success', 'hidden']);
  indicators.append(spinner, success);
  wrapper.append(indicators);

  const status = makeElement('div', 'mh-ui-send-to-maptain-status');

  /**
   * Show the default status line, or a message in its place.
   *
   * @param {string}  message The message to show, or empty for the default.
   * @param {boolean} isError Whether the message is an error.
   */
  const setStatus = (message = '', isError = false) => {
    status.textContent = message || `To ${maptain.name} · You have ${owned.toLocaleString()}`;
    status.classList.toggle('mh-ui-send-to-maptain-status-error', isError);
  };

  let confirming = false;
  let confirmTimeout = null;

  /**
   * Put the button back to its resting state.
   */
  const resetButton = () => {
    confirming = false;
    clearTimeout(confirmTimeout);
    sendButton.querySelector('span').textContent = 'Send';
  };

  /**
   * Handle the send action.
   */
  const sendAction = async () => {
    if (sendButton.classList.contains('disabled')) {
      return;
    }

    const amount = Number.parseInt(input.value, 10);
    if (!amount || amount < 1) {
      setStatus('Enter how many to send', true);
      input.focus();
      return;
    }

    if (amount > owned) {
      setStatus(`You only have ${owned.toLocaleString()}`, true);
      return;
    }

    // Sending can't be undone, so the first click asks for a second one.
    if (!confirming) {
      confirming = true;
      sendButton.querySelector('span').textContent = 'Sure?';
      setStatus(`Send ${amount.toLocaleString()} to ${maptain.name}?`);
      confirmTimeout = setTimeout(() => {
        resetButton();
        setStatus();
      }, CONFIRM_TIMEOUT);
      return;
    }

    resetButton();
    input.disabled = true;
    sendButton.classList.add('disabled');
    spinner.classList.remove('hidden');

    const response = await doRequest('managers/ajax/users/supplytransfer.php', {
      item: ITEM_TYPE,
      item_quantity: amount,
      receiver: maptain.sn_user_id,
    });

    spinner.classList.add('hidden');

    if (response?.success) {
      owned -= amount;
      input.value = '';
      success.classList.remove('hidden');
      setTimeout(() => success.classList.add('hidden'), 2000);
      setStatus();
    } else {
      setStatus(response?.message || 'Could not send', true);
    }

    input.disabled = owned <= 0;
    sendButton.classList.toggle('disabled', owned <= 0);
  };

  const sendButton = makeMhButton({
    text: 'Send',
    className: ['mh-ui-send-to-maptain', 'lightBlue'],
    title: `Send SUPER|brie+ to ${maptain.name}`,
    callback: sendAction,
    appendTo: wrapper,
  });

  wrapper.append(status);
  setStatus(owned > 0 ? '' : 'You have no SUPER|brie+');

  if (owned <= 0) {
    input.disabled = true;
    sendButton.classList.add('disabled');
  }

  input.addEventListener('input', () => {
    resetButton();
    setStatus();
  });

  input.addEventListener('keyup', (e) => {
    if ('Enter' === e.key) {
      sendAction();
    }
  });

  // Sit under the quick invite when there is one.
  const invite = sidebar.querySelector('.mh-ui-quick-invite-wrapper');
  if (invite) {
    invite.after(wrapper);
  } else {
    sidebar.prepend(wrapper);
  }
};

export default addSendToMaptain;
