import {
  addMHCTData,
  debuglog,
  doRequest,
  isAppleOS,
  makeElement,
  makeLink,
  sessionGet,
  sessionSet,
  showErrorMessage
} from '@utils';

import { addArToggle, removeArToggle } from './toggle-ar';
import addConsolationPrizes from './consolation-prizes';

/**
 * Get the link markup for a mouse.
 *
 * @param {string} name      The mouse name.
 * @param {string} mouseType The mouse type.
 *
 * @return {string} The link markup.
 */
const getLinkMarkup = (name, mouseType) => {
  name = name.replaceAll(' ', '_');

  const nameMouse = `${name}_Mouse`.replaceAll('_Mouse_Mouse', '_Mouse');

  return makeLink('MHCT AR', `https://api.mouse.rip/mhct-redirect/${mouseType}`) +
    makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${encodeURIComponent(nameMouse.replaceAll(' ', '_'))}`, true);
};

/**
 * Get the link markup for an item.
 *
 * @param {string} name The item name.
 *
 * @return {string} The link markup.
 */
const getItemLinkMarkup = (name) => {
  name = name.replace(' ', '_');
  return makeLink('MHCT DR', `https://api.mouse.rip/mhct-redirect-item/${name}`, true) +
    makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${encodeURIComponent(name.replaceAll(' ', '_'))}`, true);
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

      if ('mouse' === type) {
        const div = makeElement('div', 'mh-ui-mouse-links-map');
        div.id = `mh-ui-mouse-links-map-${mouseType}-${type}`;
        div.innerHTML = getLinkMarkup(title.innerText, mouseType);

        const envs = document.querySelector('.treasureMapView-highlight-environments');
        if (envs) {
          envs.parentNode.insertBefore(div, envs.nextSibling);
        }
      } else if ('item' === type) {
        const div = makeElement('div', 'mh-ui-mouse-links-map');
        div.id = `mh-ui-mouse-links-map-${mouseType}-${type}`;
        div.innerHTML = getItemLinkMarkup(mouseType);

        const desc = document.querySelector('.treasureMapView-highlight-description');
        if (desc) {
          desc.prepend(div);
        }
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

/**
 * Add classes to the groups based on completion status.
 *
 * @param {Object} mapData The map data.
 */
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

    const toggleGroup = makeElement('div', 'mh-ui-goals-group-toggle');
    const isStartingToggled = sessionGet('better-maps-groups-toggled', []);

    const expand = () => {
      toggleGroup.setAttribute('data-toggled', 'false');
      toggleGroup.setAttribute('title', `Collapse (Hold ${isAppleOS() ? '⌘ Command' : 'Ctrl'} to toggle all)`);
      toggleGroup.classList.remove('collapsed');
      toggleGroup.classList.add('expanded');
      group.classList.remove('mh-ui-goals-group-collapsed');
      group.classList.add('mh-ui-goals-group-expanded');
    };

    const collapse = () => {
      toggleGroup.setAttribute('data-toggled', 'true');
      toggleGroup.setAttribute('title', `Expand (Hold ${isAppleOS() ? '⌘ Command' : 'Ctrl'} to toggle all)`);
      toggleGroup.classList.remove('expanded');
      toggleGroup.classList.add('collapsed');
      group.classList.remove('mh-ui-goals-group-expanded');
      group.classList.add('mh-ui-goals-group-collapsed');
    };

    if (isStartingToggled.includes(hunter.sn_user_id)) {
      collapse();
    } else {
      expand();
    }

    toggleGroup.addEventListener('click', (event) => {
      const toggled = toggleGroup.getAttribute('data-toggled');
      const currentSessionToggled = sessionGet('better-maps-groups-toggled', []);
      if (currentSessionToggled.includes(hunter.sn_user_id)) {
        currentSessionToggled.splice(currentSessionToggled.indexOf(hunter.sn_user_id), 1);
      } else {
        currentSessionToggled.push(hunter.sn_user_id);
      }
      sessionSet('better-maps-groups-toggled', currentSessionToggled);

      if ('true' === toggled) {
        expand();
      } else {
        collapse();
      }

      // if the user is holding down command/ctrl, toggle all groups.
      if (event.ctrlKey || event.metaKey) {
        const allGroups = document.querySelectorAll('.treasureMapView-goals-groups');
        allGroups.forEach((g) => {
          // find the toggle and if its not the same as the current one, click it.
          const toggle = g.querySelector('.mh-ui-goals-group-toggle');
          if (toggle && toggle !== toggleGroup) {
            const isThisOneToggled = toggle.getAttribute('data-toggled');
            if (isThisOneToggled === toggled) {
              toggle.click();
            }
          }
        });
      }
    });

    replacementTitle.append(toggleGroup);

    if (title) {
      title.replaceWith(replacementTitle);
    }
  });
};

/**
 * Move the leave map button to the actions group.
 */
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

/**
 * Add a quick invite field to the map sidebar.
 *
 * @param {Object} mapData The map data.
 */
const addQuickInvite = async (mapData) => {
  const sidebar = document.querySelector('.treasureMapView-rightBlock.treasureMapView-goalSidebar');
  if (! sidebar) {
    return;
  }

  const existing = document.querySelector('.mh-ui-quick-invite');
  if (existing) {
    existing.remove();
  }

  // Check if we're the current map owner.
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

  /**
   * Handle an error when inviting a hunter.
   *
   * @param {string} message The error message.
   *
   * @return {boolean} False.
   */
  const inviteError = (message) => {
    debuglog('better-maps', `Invite error: ${message}`);

    inviteInput.disabled = false;

    inviteButton.classList.remove('disabled');
    spinner.classList.add('hidden');

    showErrorMessage({
      message,
      append: inviteWrapper
    });

    return false;
  };

  /**
   * Handle the invite action.
   *
   * @return {boolean} False.
   */
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
        const maps = getFriendData?.friend.user_interactions?.actions?.send_map_invite?.maps;
        const canAccept = maps.length > 0 && maps[0]?.is_allowed;

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

    const invited = await doRequest('managers/ajax/users/treasuremap_v2.php', {
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

/**
 * Add a sidebar toggle.
 */
const addSidebarToggle = async () => {
  const mapView = document.querySelector('.treasureMapView');
  if (! mapView) {
    return;
  }

  const rightBlock = mapView.querySelector('.treasureMapView-rightBlock');
  if (! rightBlock) {
    return;
  }

  const leftBlock = mapView.querySelector('.treasureMapView-leftBlock');
  if (! leftBlock) {
    return;
  }

  const existing = mapView.querySelector('.mh-ui-goals-sidebar-toggle');
  if (existing) {
    return;
  }

  const toggle = makeElement('a', 'mh-ui-goals-sidebar-toggle');

  const open = () => {
    toggle.classList.remove('closed');
    toggle.classList.add('open');
    toggle.setAttribute('data-state', 'open');
    toggle.setAttribute('title', 'Hide Sidebar');

    mapView.classList.remove('mh-ui-goals-sidebar-toggled');
    rightBlock.classList.remove('hidden');
    leftBlock.classList.remove('full-width');
  };

  const close = () => {
    toggle.classList.remove('open');
    toggle.classList.add('closed');
    toggle.setAttribute('data-state', 'closed');
    toggle.setAttribute('title', 'Show Sidebar');

    mapView.classList.add('mh-ui-goals-sidebar-toggled');
    rightBlock.classList.add('hidden');
    leftBlock.classList.add('full-width');
  };

  const isStartingToggled = sessionGet('better-maps-sidebar-toggled', false);
  if ('open' === isStartingToggled) {
    close();
  } else {
    open();
  }

  toggle.addEventListener('click', () => {
    const isToggled = toggle.getAttribute('data-state');

    sessionSet('better-maps-sidebar-toggled', isToggled);

    if ('open' === isToggled) {
      close();
    } else {
      open();
    }
  });

  leftBlock.append(toggle);
};

const addPreviewClass = async () => {
  const mapView = document.querySelector('.treasureMapView');
  if (! mapView) {
    return;
  }

  const previewClass = mapView.querySelector('.treasureMapView-previewBar');
  if (! previewClass) {
    return;
  }

  mapView.classList.add('mh-ui-map-preview');
};

const moveAuras = async () => {
  const mapView = document.querySelector('.treasureMapView');
  if (! mapView) {
    return;
  }

  const mapName = mapView.querySelector('.treasureMapView-mapName');
  if (! mapName) {
    return;
  }

  const auras = mapView.querySelectorAll('.treasureMapView-mapMenu-auraIconContainer');
  if (! auras) {
    return;
  }

  // wrap the mapname text in a span and append the auras to it inside of a different div
  const mapNameText = mapName.innerText;
  mapName.innerHTML = '';
  const mapNameWrapper = makeElement('span', 'mh-ui-map-name');
  mapNameWrapper.innerText = mapNameText;
  mapName.append(mapNameWrapper);
  const aurasWrapper = makeElement('div', 'mh-ui-map-name-auras');
  for (const aura of auras) {
    aurasWrapper.append(aura.parentNode);
  }

  mapName.append(aurasWrapper);
};

const addMapSolverLinks = async (mapData) => {
  const mapFooter = document.querySelector('.treasureMapView-mapLeaveContainer');
  const mice = mapData?.goals?.mouse;

  if (! mapFooter || ! Array.isArray(mice) || ! mice.length) {
    return;
  }

  const mouseNames = mice.map((mouse) => mouse.name).join('/');
  const newlineMouseNames = mouseNames.replaceAll('/', '\n');

  const wrapper = makeElement('div', 'mh-ui-map-solver-links');

  const createSolverButton = (text, className, onClick) => {
    const button = makeElement('button', [className, 'mousehuntActionButton', 'tiny']);
    makeElement('span', `${className}-text`, text, button);
    button.addEventListener('click', (e) => {
      e.preventDefault();
      onClick();
    });
    return button;
  };

  const mhctButton = createSolverButton('MHCT Map Solver', 'mh-ui-map-solver-mhct-link', () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://mhct.win/maphelper.php';
    form.target = '_mhct-map-solver';

    const textarea = document.createElement('textarea');
    textarea.name = 'mice';
    textarea.value = newlineMouseNames;
    form.append(textarea);

    document.body.append(form);
    form.submit();
    form.remove();
  });

  const tsituButton = createSolverButton('Tsitu\'s Map Solver', 'mh-ui-map-solver-tsitu-link', () => {
    const url = `https://tsitu.github.io/MH-Tools/map.html?mice=${encodeURIComponent(mouseNames)}`;
    window.open(url, '_tsitu-map-solver');
  });

  wrapper.append(mhctButton, tsituButton);
  mapFooter.append(wrapper);
  mapFooter.classList.add('mh-ui-map-solver-links-container');
};

/**
 * Fire the actions when the goals tab is shown.
 *
 * @param {Object} mapData The map data.
 */
const showGoalsTab = async (mapData) => {
  addArToggle();
  addMouseLinksToMap();
  addConsolationPrizes();
  addClassesToGroups(mapData);
  moveLeaveButton();
  addQuickInvite(mapData);
  addSidebarToggle();
  addPreviewClass();
  moveAuras();
  addMapSolverLinks(mapData);
};

/**
 * Fire the actions when the goals tab is hidden.
 */
const hideGoalsTab = () => {
  removeArToggle();
};

export {
  showGoalsTab,
  hideGoalsTab
};
