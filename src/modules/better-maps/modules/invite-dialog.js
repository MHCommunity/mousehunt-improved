import { makeElement, makeMhButton } from '@utils';

/** The game caps the invite dialog's selection at this many hunters; we send invites in batches of it. */
const DEFAULT_BATCH_SIZE = 12;
let batchSize = DEFAULT_BATCH_SIZE;

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
 * Send invites in batches when more hunters are selected than the game sends at once.
 */
const sendInvitesInBatches = () => {
  const mapUtil = hg?.utils?.TreasureMapUtil;
  const originalSendInvites = mapUtil?.sendInvites;
  if ('function' !== typeof originalSendInvites) {
    return;
  }

  /**
   * Send the invites, splitting a large selection into batches.
   *
   * @param {string}   mapId           The map ID.
   * @param {string[]} snuids          The hunters to invite.
   * @param {Function} successCallback Called with the merged responses once every batch is sent.
   * @param {Function} errorCallback   Called when a batch request fails.
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

    /**
     * Send one batch, then the next. A batch the server turns down doesn't stop the rest.
     *
     * @param {number} index The batch to send.
     */
    const sendBatch = (index) => {
      if (index >= batches.length) {
        if (merged.success && successCallback) {
          successCallback(merged);
        } else if (!merged.success && errorCallback) {
          errorCallback(lastError);
        }

        return;
      }

      originalSendInvites.call(
        this,
        mapId,
        batches[index],
        (data) => {
          if (data?.success) {
            Object.assign(merged, data, {
              success: true,
              user_interactions: { ...merged.user_interactions, ...data.user_interactions },
            });
          }

          sendBatch(index + 1);
        },
        (error) => {
          lastError = error;
          sendBatch(index + 1);
        }
      );
    };

    sendBatch(0);
  };
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
    const chosen = snuids.slice(0, batchSize);
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
      size: 'small',
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
 * Wrap the game's invite dialog view to lift the selection limit and add the quick-select buttons.
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
      const gameLimit = selector.getMaxSelectedUsers();
      if (gameLimit > 0) {
        batchSize = gameLimit;
      }

      selector.setMaxSelectedUsers(null);
      // The selected grid pads itself to this many slots: at least a full batch, then whole rows of four.
      selector.getMaxSelectedUsers = () => Math.max(batchSize, Math.ceil(selector.getNumSelectedUsers() / 4) * 4);

      const container = originalGetContent.apply(this, arguments);
      const element = container?.[0] ?? container;
      if (element instanceof Element) {
        addQuickSelectButtons(element, selector, selectionCallback);
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
