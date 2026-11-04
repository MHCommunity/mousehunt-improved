import { doRequest, makeElement, makeMhButton, sleep } from '@utils';

/** The game caps the invite dialog's selection at this many hunters; we send invites in batches of it. */
const DEFAULT_BATCH_SIZE = 12;
let batchSize = DEFAULT_BATCH_SIZE;

/** How many hunters can be selected at once, five batches. */
const MAX_SELECTED = 60;

/** How long to wait between batches, as the server turns down invites sent too quickly. */
const BATCH_DELAY = 1500;

/** How long to wait before retrying a batch the server turned down. */
const RETRY_DELAYS = [3000, 6000];

/** The open invite dialog's content, for showing the batches and send progress. */
let dialogContent = null;

/**
 * Split a list into batches.
 *
 * @param {Array}  items The list.
 * @param {number} size  The batch size.
 *
 * @return {Array[]} The batches.
 */
const chunk = (items, size) => {
  const batches = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }

  return batches;
};

/**
 * Shuffle a copy of a list.
 *
 * @param {Array} items The list.
 *
 * @return {Array} The shuffled copy.
 */
const shuffle = (items) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }

  return shuffled;
};

/**
 * Send one batch of invites, retrying when the server turns it down.
 *
 * @param {string}   mapId  The map ID.
 * @param {string[]} snuids The hunters to invite.
 *
 * @return {Promise<Object|false>} The response, or false if every attempt failed.
 */
const sendBatch = async (mapId, snuids) => {
  const params = { action: 'send_invites', map_id: mapId };
  snuids.forEach((snuid, index) => {
    params[`snuids[${index}]`] = snuid;
  });

  let response = false;
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAYS[attempt - 1]);
    }

    response = await doRequest('managers/ajax/users/treasuremap_v2.php', params, true);
    if (response?.success) {
      return response;
    }
  }

  return response;
};

/**
 * Send invites in batches when more hunters are selected than the game sends at once.
 */
const sendInvitesInBatches = () => {
  const mapUtil = hg?.utils?.TreasureMapUtil;
  const originalSendInvites = mapUtil?.sendInvites;
  if ('function' !== typeof originalSendInvites) {
    return;
  }

  /**
   * Send the invites, splitting a large selection into batches sent a little apart.
   *
   * @param {string}   mapId           The map ID.
   * @param {string[]} snuids          The hunters to invite.
   * @param {Function} successCallback Called with the merged responses once every batch is sent.
   * @param {Function} errorCallback   Called when every batch failed.
   *
   * @return {*} Whatever the game returns for a single send.
   */
  mapUtil.sendInvites = function (mapId, snuids, successCallback, errorCallback) {
    if (!Array.isArray(snuids) || snuids.length <= batchSize) {
      return originalSendInvites.call(this, mapId, snuids, successCallback, errorCallback);
    }

    const batches = chunk(snuids, batchSize);
    const merged = { success: false, user_interactions: {} };
    let lastError = null;

    (async () => {
      for (const [index, batch] of batches.entries()) {
        if (index > 0) {
          await sleep(BATCH_DELAY);
        }

        showBatchStatus(index, 'sending');
        const data = await sendBatch(mapId, batch);
        showBatchStatus(index, data?.success ? 'sent' : 'failed');
        if (data?.success) {
          eventRegistry.doEvent('ajax_response', data);
          Object.assign(merged, data, {
            success: true,
            user_interactions: { ...merged.user_interactions, ...data.user_interactions },
          });
        } else {
          lastError = data || null;
        }
      }

      if (merged.success) {
        if (merged.treasure_map) {
          eventRegistry.doEvent('treasure_map_update', merged.treasure_map);
        }

        successCallback?.(merged);
      } else {
        // Let the hunter try again.
        dialogContent?.querySelector('.treasureMapDialogView-continueButton')?.classList.remove('busy');
        errorCallback?.(lastError);
      }
    })();
  };
};

/**
 * Show how a batch is going on its label in the selected hunters list.
 *
 * @param {number} index  The batch.
 * @param {string} status The status: sending, sent, or failed.
 */
const showBatchStatus = (index, status) => {
  const label = dialogContent?.querySelectorAll('.mh-ui-invite-batch-label')[index];
  if (!label) {
    return;
  }

  const text = { sending: 'sending…', sent: 'sent', failed: 'not sent' }[status];
  label.textContent = `Invite ${index + 1} · ${text}`;
  label.dataset.status = status;
};

/**
 * Split the selected hunters into the invites they'll be sent in, and say how many on the submit button.
 *
 * @param {Element} list The selected hunters list.
 */
const showBatches = (list) => {
  list.querySelectorAll('.mh-ui-invite-batch-label').forEach((label) => label.remove());

  const slots = [...list.querySelectorAll('.treasureMapDialogView-userSelector-selectedUser')];
  const selected = slots.filter((slot) => !slot.classList.contains('empty')).length;
  const batches = Math.ceil(selected / batchSize);

  const label = dialogContent?.querySelector('.treasureMapDialogView-continueButton span');
  if (label) {
    label.dataset.mhOriginalLabel ??= label.textContent;
    label.textContent = batches > 1 ? `Send ${batches} Invites` : label.dataset.mhOriginalLabel;
  }

  const title = list.parentElement?.querySelector('.treasureMapDialogView-userSelector-selectedUserList-title');
  if (title) {
    title.textContent = `Selected: ${selected}/${MAX_SELECTED}`;
  }

  dialogContent?.querySelectorAll('.mh-ui-invite-quick-select-button').forEach((button) => {
    button.classList.toggle('disabled', selected >= MAX_SELECTED);
  });

  if (batches < 2) {
    return;
  }

  for (let index = 0; index < slots.length; index += batchSize) {
    slots[index].before(makeElement('div', 'mh-ui-invite-batch-label', `Invite ${index / batchSize + 1}`));
  }
};

/**
 * Keep the selected hunters split into batches as the game redraws them.
 *
 * @param {Element} container The dialog content.
 */
const watchSelectedHunters = (container) => {
  const list = container.querySelector('.treasureMapDialogView-userSelector-selectedUserList-content');
  if (!list) {
    return;
  }

  const observer = new MutationObserver(() => {
    observer.disconnect();
    showBatches(list);
    observer.observe(list, { childList: true });
  });

  observer.observe(list, { childList: true });
};

/**
 * Get the hunters the dialog lists as available and not yet selected.
 *
 * @param {Object}  selector  The game's user selector.
 * @param {Element} container The dialog content.
 *
 * @return {string[]} The hunters' snuids.
 */
const getAvailableHunters = (selector, container) => {
  const selected = new Set(selector.getSelectedUsers());
  const snuids = new Set();

  container.querySelectorAll('.userSelectorView-user[data-snuid]').forEach((row) => {
    const snuid = row.dataset.snuid;
    const groups = selector.getUserGroupsBySnUserId(snuid) || [];
    if (groups.includes('default') && !groups.includes('mismatch') && !selected.has(snuid)) {
      snuids.add(snuid);
    }
  });

  return [...snuids];
};

/**
 * Get the snuids of friends the game currently lists as online.
 *
 * @return {Promise<Set<string>>} The snuids.
 */
const getOnlineFriends = () => {
  return new Promise((resolve) => {
    const online = new Set();
    const finish = () => resolve(online);

    try {
      // The game keys the locations by type, with a list of the friends online in each.
      hg.utils.User.getFriendsInEnvironments((environments) => {
        for (const environment of Object.values(environments || {})) {
          for (const friend of Object.values(environment?.friends || {})) {
            if (friend?.sn_user_id) {
              online.add(String(friend.sn_user_id));
            }
          }
        }

        finish();
      }, finish);
    } catch {
      finish();
    }
  });
};

/**
 * Get hunters in the current location, those online right now first.
 *
 * @param {string[]} snuids The hunters to choose from.
 *
 * @return {Promise<string[]>} The nearby hunters.
 */
const getActiveNearbyHunters = async (snuids) => {
  const environmentId = user?.environment_id;
  if (!environmentId || 0 === snuids.length) {
    return [];
  }

  const hunters = await new Promise((resolve) => {
    hg.utils.User.getUserData(
      snuids,
      ['environment_id'],
      (data) => resolve(data || []),
      () => resolve([])
    );
  });

  const nearby = hunters.filter((hunter) => String(hunter?.environment_id) === String(environmentId)).map((hunter) => String(hunter.sn_user_id));
  if (0 === nearby.length) {
    return [];
  }

  const online = await getOnlineFriends();

  return [...shuffle(nearby.filter((snuid) => online.has(snuid))), ...shuffle(nearby.filter((snuid) => !online.has(snuid)))];
};

/**
 * Add the quick-select buttons to the invite dialog.
 *
 * @param {Element}  container         The dialog content.
 * @param {Object}   selector          The game's user selector.
 * @param {Function} selectionCallback The game's selection callback, which refreshes the selected hunters.
 */
const addQuickSelectButtons = (container, selector, selectionCallback) => {
  const actions = container.querySelector('.treasureMapUserSelectorView-actions');
  if (!actions || actions.querySelector('.mh-ui-invite-quick-select')) {
    return;
  }

  /**
   * Add hunters to the selection.
   *
   * @param {string[]} snuids The hunters to add.
   */
  const select = (snuids) => {
    const room = MAX_SELECTED - selector.getNumSelectedUsers();
    const chosen = snuids.slice(0, Math.min(batchSize, room));
    if (0 === chosen.length) {
      return;
    }

    selector.setSelectedUsers([...selector.getSelectedUsers(), ...chosen]);
    selector.show();
    if (selectionCallback) {
      selectionCallback();
    }
  };

  /**
   * Make a button that picks hunters while showing a busy state.
   *
   * @param {string}   text The button text.
   * @param {Function} pick Returns the hunters to add, from the available ones.
   *
   * @return {Element} The button.
   */
  const makeButton = (text, pick) => {
    return makeMhButton({
      text,
      size: '',
      className: 'mh-ui-invite-quick-select-button',
      callback: async (event) => {
        event.preventDefault();
        const button = event.currentTarget;
        if (button.classList.contains('busy')) {
          return;
        }

        button.classList.add('busy');
        try {
          select(await pick(getAvailableHunters(selector, container)));
        } finally {
          button.classList.remove('busy');
        }
      },
    });
  };

  const wrapper = makeElement('div', 'mh-ui-invite-quick-select');
  wrapper.append(
    makeButton('Select random friends', (available) => shuffle(available)),
    makeButton('Select active nearby', (available) => getActiveNearbyHunters(available))
  );

  actions.append(wrapper);
};

/**
 * Wrap the game's invite dialog view to raise the selection limit and add the quick-select buttons.
 */
const enhanceInviteDialog = () => {
  const OriginalView = hg?.views?.TreasureMapUserSelectorView;
  if ('function' !== typeof OriginalView) {
    return;
  }

  /**
   * Make the invite dialog view.
   *
   * @param {...*} args The game's arguments.
   *
   * @return {Object} The view.
   */
  const TreasureMapUserSelectorView = function (...args) {
    const view = new OriginalView(...args);
    let isInviteDialog = false;
    let limitRaised = false;
    let selectionCallback = null;

    // The invite dialog is the one that offers the favourite friends checkbox; the approve requests dialog keeps its limit.
    const originalSetShowFavouriteFriends = view.setShowFavouriteFriends;
    view.setShowFavouriteFriends = function (value) {
      isInviteDialog = Boolean(value);
      return originalSetShowFavouriteFriends.apply(this, arguments);
    };

    // Catch the selection callback the view hands its selector so our buttons can refresh the selected hunters the same way.
    const originalGetUserSelector = view.getUserSelector;
    view.getUserSelector = function () {
      const OriginalSelector = hg.views.UserSelectorView;
      hg.views.UserSelectorView = function (...selectorArgs) {
        const selector = new OriginalSelector(...selectorArgs);
        const originalSetSelectionCallback = selector.setSelectionCallback;
        selector.setSelectionCallback = function (callback) {
          selectionCallback = callback;
          return originalSetSelectionCallback.apply(this, arguments);
        };

        return selector;
      };

      try {
        return originalGetUserSelector.apply(this, arguments);
      } finally {
        hg.views.UserSelectorView = OriginalSelector;
      }
    };

    const originalGetContent = view.getContent;
    view.getContent = function () {
      if (!isInviteDialog) {
        return originalGetContent.apply(this, arguments);
      }

      const selector = view.getUserSelector();
      if (!limitRaised) {
        limitRaised = true;
        const gameLimit = selector.getMaxSelectedUsers();
        if (gameLimit > 0) {
          batchSize = gameLimit;
        }

        selector.setMaxSelectedUsers(MAX_SELECTED);
        // The selected grid pads itself to this many slots: enough to fill the last batch.
        selector.getMaxSelectedUsers = () => Math.max(batchSize, Math.ceil(selector.getNumSelectedUsers() / batchSize) * batchSize);
      }

      const container = originalGetContent.apply(this, arguments);
      const element = container?.[0] ?? container;
      if (element instanceof Element) {
        dialogContent = element;
        addQuickSelectButtons(element, selector, selectionCallback);
        watchSelectedHunters(element);
      }

      return container;
    };

    return view;
  };

  Object.assign(TreasureMapUserSelectorView, OriginalView);
  TreasureMapUserSelectorView.prototype = OriginalView.prototype;
  hg.views.TreasureMapUserSelectorView = TreasureMapUserSelectorView;
};

/**
 * Initialize the invite dialog enhancements.
 */
export default async () => {
  enhanceInviteDialog();
  sendInvitesInBatches();
};
