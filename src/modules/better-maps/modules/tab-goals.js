import {
  addMHCTData,
  debuglog,
  doRequest,
  makeElement,
  makeLink,
  sessionGet,
  sessionSet,
  showErrorMessage
} from '@utils';

import { addArToggle, removeArToggle } from './toggle-ar';
import addConsolationPrizes from './consolation-prizes';

const getLinkMarkup = (name) => {
  return makeLink('MHCT AR', `https://www.mhct.win/attractions.php?mouse=${name}`, true) +
    makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${name}_Mouse`) +
    makeLink('mhdb', `https://dbgames.info/mousehunt/mice/${name}_Mouse`);
};

/**
 * Add links to the mouse details on the map.
 */
const addMouseLinksToMap = async () => {
  const overlay = document.querySelector('#overlayPopup');
  if (! (overlay && overlay.classList.contains('treasureMapPopup'))) {
    return;
  }

  const mouseIcon = document.querySelectorAll('.treasureMapView-goals-group-goal');
  if (! mouseIcon || mouseIcon.length === 0) {
    return;
  }

  const mapViewClasses = document.querySelector('.treasureMapView');
  if (! mapViewClasses) {
    return;
  }

  let type = 'mouse';
  if (mapViewClasses.classList.value.includes('scavenger_hunt')) {
    type = 'item';
  }

  mouseIcon.forEach((mouse) => {
    let mouseType = mouse.classList.value
      .replace('treasureMapView-goals-group-goal', '')
      .replace(' mouse', '')
      .replace(' item', '')
      .replace(' complete', '')
      .replace('landscape', '')
      .replace('notAvailable', '')
      .replaceAll(' ', '')
      .trim();

    if ('item' === type) {
      mouseType = mouse.getAttribute('data-unique-id');
    }

    mouse.addEventListener('click', async () => {
      const title = document.querySelector('.treasureMapView-highlight-name');
      if (! title) {
        return;
      }

      title.classList.add('mh-ui-mouse-links-map-name');

      title.addEventListener('click', () => {
        if (type === 'item') {
          hg.views.ItemView.show(mouseType);
        } else if (type === 'mouse') {
          hg.views.MouseView.show(mouseType);
        }
      });

      title.setAttribute('data-mouse-id', mouseType);

      const existing = document.querySelector(`#mh-ui-mouse-links-map-${mouseType}-${type}`);
      if (existing) {
        return;
      }

      const div = makeElement('div', 'mh-ui-mouse-links-map');
      div.id = `mh-ui-mouse-links-map-${mouseType}-${type}`;
      div.innerHTML = getLinkMarkup(title.innerText);

      const envs = document.querySelector('.treasureMapView-highlight-environments');
      if (envs) {
        envs.parentNode.insertBefore(div, envs.nextSibling);
      }

      let appendMHCTto = document.querySelector('.treasureMapView-highlight-weaknessContainer');
      if (! appendMHCTto) {
        appendMHCTto = document.querySelector('.mh-ui-mouse-links-map');
      }

      const existingArs = document.querySelectorAll('.mh-ui-mouse-links-map-ars');
      if (existingArs && existingArs.length > 0) {
        existingArs.forEach((ar) => ar.remove());
      }

      const container = document.querySelector('.treasureMapView-highlight.goal.active');
      if (! container) {
        return;
      }

      const arsEl = makeElement('div', 'mh-ui-mouse-links-map-ars');
      arsEl.id = `mh-ui-mouse-links-map-ars-${mouseType}-${type}`;
      await addMHCTData({ unique_id: mouseType }, arsEl, type);

      // if there wasn't a change to theArsEl div, then don't add it.
      if (arsEl.innerHTML === '') {
        return;
      }

      container.classList.add('has-mhct-ars');

      container.append(arsEl);
    });
  });
};

const addClassesToGroups = (mapData) => {
  const groups = document.querySelectorAll('.treasureMapView-goals-groups');
  groups.forEach((group) => {
    const title = group.querySelector('.treasureMapView-block-content-heading');
    if (! title) {
      return;
    }

    if (title.classList.contains('mh-ui-goals-group-completed-title')) {
      return;
    }

    const completed = title.innerText.includes(' found these mice:') || title.innerText.includes(' found this mouse:');
    group.classList.add('mh-ui-goals-group', completed ? 'completed' : 'incomplete');

    let countText = '';
    const count = group.querySelector('.treasureMapView-block-content-heading-count');
    if (count) {
      group.setAttribute('data-mouse-count', count.innerText.replace('(', '').replace(')', ''));
      countText = count.innerText;
    }

    if (! completed) {
      return;
    }
    // get the hunter name by removing the count and the 'found these mice' text
    const hunterName = title.innerText
      .replace(countText, '')
      .replace(' found these mice:', '')
      .replace(' found this mouse:', '')
      .trim();

    // find the hunter in the list of hunters but looking at mapData.hunters and finding the matching name
    let hunter = mapData.hunters.find((h) => h.name.trim() === hunterName);
    if (! hunter) {
      // match the hunter using the image url
      const image = group.querySelector('.treasureMapView-block-content-heading-image');
      if (! image) {
        return;
      }

      // get the style property of the image and get the url from it
      const url = image.getAttribute('style')
        .replace('background-image:url(', '')
        .replace('background-image: url(', '')
        .replace(');', '');

      hunter = mapData.hunters.find((h) => h.profile_pic === url);
    }

    // Finally, fallback to trying to match the hunter name to the user's name in case of weirdness idk.
    if (! hunter && (hunterName === `${user.firstname} ${user.lastname}` || hunterName === `${user.firstname}${user.lastname}`)) {
      hunter = {
        name: `${user.firstname} ${user.lastname}`,
        sn_user_id: user.sn_user_id,
      };
    }

    if (! hunter) {
      return;
    }

    const image = group.querySelector('.treasureMapView-block-content-heading-image');
    if (! image) {
      image.title = `Go to ${hunter.name}'s profile`;
      image.classList.add('mh-ui-goals-group-completed-image');

      image.addEventListener('click', () => {
        hg.utils.PageUtil.showHunterProfile(hunter.sn_user_id);
      });
    }

    const replacementTitle = makeElement('div', 'treasureMapView-block-content-heading');

    if (image) {
      replacementTitle.append(image);
    }

    const nameLink = makeElement('a', 'mh-ui-goals-group-completed-title', hunter.name);
    nameLink.setAttribute('data-snuid', hunter.sn_user_id);
    nameLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (hg?.utils?.PageUtil?.showHunterProfile) {
        hg.utils.PageUtil.showHunterProfile(hunter.sn_user_id);
      }
    });
    replacementTitle.append(nameLink);

    makeElement('span', 'mh-ui-goals-group-completed-text', ' found these mice:', replacementTitle);
    if (count) {
      replacementTitle.append(count);
    }

    title.replaceWith(replacementTitle);
  });
};

const moveLeaveButton = async () => {
  const leaveButton = document.querySelector('.treasureMapView-mapLeaveContainer .treasureMapView-leaveMapButton');
  if (! leaveButton) {
    return;
  }

  const actions = document.querySelector('.treasureMapView-mapMenu-group-actions');
  if (! actions) {
    return;
  }

  const existing = document.querySelector('.mh-ui-leave-map-button');
  if (existing) {
    return;
  }

  const clone = leaveButton.cloneNode(true);
  clone.classList.add('mh-ui-leave-map-button');
  clone.classList.remove('lightBlue');

  clone.addEventListener('click', () => {
    // click the original button.
    leaveButton.click();
  });

  actions.insertBefore(clone, actions.firstChild);
};

const addQuickInvite = async (mapData) => {
  const sidebar = document.querySelector('.treasureMapView-rightBlock.treasureMapView-goalSidebar');
  if (! sidebar) {
    return;
  }

  const existing = document.querySelector('.mh-ui-quick-invite');
  if (existing) {
    existing.remove();
  }

  // Check if we're the curent map owner.
  if (! mapData?.is_owner) {
    return;
  }

  const mapId = mapData?.map_id;
  if (! mapId) {
    return;
  }

  const inviteWrapper = makeElement('div', 'mh-ui-quick-invite-wrapper');

  const inviteInput = makeElement('input', 'mh-ui-quick-invite-input');
  inviteInput.type = 'number';
  inviteInput.placeholder = 'Hunter ID';
  inviteWrapper.append(inviteInput);

  const inviteButton = makeElement('div', ['mousehuntActionButton', 'tiny', 'mh-ui-quick-invite']);
  makeElement('span', '', 'Invite', inviteButton);

  const indicators = makeElement('div', 'mh-ui-quick-invite-indicators');
  const spinner = makeElement('div', ['mh-ui-quick-invite-indicator', 'mh-ui-quick-invite-spinner', 'hidden']);
  const success = makeElement('div', ['mh-ui-quick-invite-indicator', 'mh-ui-quick-invite-success', 'hidden']);

  indicators.append(spinner);
  indicators.append(success);

  inviteWrapper.append(indicators);

  const inviteError = (message) => {
    debuglog('better-maps', `Invite error: ${message}`);

    inviteInput.disabled = false;

    inviteButton.classList.remove('disabled');
    spinner.classList.add('hidden');

    showErrorMessage(message, inviteWrapper);

    return false;
  };

  const inviteAction = async () => {
    if (inviteButton.classList.contains('disabled')) {
      return;
    }

    // Set the input to disabled, add a disabled class to the button, and and add a loading spinner.
    inviteInput.disabled = true;
    inviteButton.classList.add('disabled');
    spinner.classList.remove('hidden');

    const hunterId = Number.parseInt(inviteInput.value, 10);

    if (! hunterId) {
      return inviteError('Invalid hunter ID');
    }

    // Check if the hunter is already on the map.
    if (mapData?.hunters?.find((h) => (h.sn_user_id === hunterId) && h.is_active)) {
      return inviteError('Hunter is already on the map');
    }

    debuglog('better-maps', `Inviting hunter ${hunterId} to map ${mapId}`);

    let snuid;

    const friendData = sessionGet('cache-maps-hunter-data', {});

    if (friendData && friendData[hunterId]) {
      debuglog('better-maps', `Using cached friend data for ${hunterId}`);

      snuid = friendData[hunterId];
    } else {
      debuglog('better-maps', `Fetching friend data for ${hunterId}`);

      const getFriendData = await doRequest('managers/ajax/pages/friends.php', {
        action: 'community_search_by_id',
        user_id: hunterId,
      });

      if (getFriendData?.success && getFriendData?.friend?.sn_user_id) {
        snuid = getFriendData?.friend?.sn_user_id;
        const canAccept = getFriendData?.friend.user_interactions?.actions?.send_map_invite.maps[0]?.is_allowed;

        friendData[hunterId] = {
          snuid: snuid || false,
          canAccept: canAccept || false,
        };

        // Only cache the data if they can accept invites, otherwise we'll want to fetch their data again.
        if (canAccept) {
          sessionSet('cache-maps-hunter-data', friendData);
        }
      } else {
        return inviteError('Could not find hunter');
      }
    }

    debuglog('better-maps', `Inviting hunter ${hunterId} with snuid ${snuid} to map ${mapId}`);

    const invited = await doRequest('managers/ajax/users/treasuremap.php', {
      action: 'send_invites',
      map_id: mapId,
      'snuids[]': snuid,
    });

    if (invited && invited?.success) {
      debuglog('better-maps', `Successfully invited hunter ${hunterId} to map ${mapId}`);

      inviteInput.value = '';

      inviteInput.disabled = false;

      inviteButton.classList.remove('disabled');
      spinner.classList.add('hidden');
      success.classList.remove('hidden');

      setTimeout(() => {
        success.classList.add('hidden');
      }, 2000);
    } else {
      return inviteError('Error inviting hunter');
    }

    debuglog('better-maps', '.');
  };

  inviteButton.addEventListener('click', inviteAction);
  inviteInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      inviteAction();
    }
  });

  inviteWrapper.append(inviteButton);

  // append as first child
  sidebar.insertBefore(inviteWrapper, sidebar.firstChild);
};

const showGoalsTab = async (mapData) => {
  addArToggle();
  addMouseLinksToMap();

  addConsolationPrizes();

  addClassesToGroups(mapData);

  moveLeaveButton();

  addQuickInvite(mapData);
};

const hideGoalsTab = () => {
  removeArToggle();
};

export {
  showGoalsTab,
  hideGoalsTab
};
