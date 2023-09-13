const makeUserTableLoading = (id, title, appendTo) => {
  const wrapper = makeElement('div', 'treasureMapView-block-title', title);
  wrapper.id = `hunters-loading-${id}-title`;
  appendTo.appendChild(wrapper);

  const loading = makeElement('div', 'treasureMapView-block');
  loading.id = `hunters-loading-${id}-block`;

  const loadingWwrapper = makeElement('div', 'treasureMapView-allyTable', '');
  const row = makeElement('div', 'treasureMapView-allyRow', '');
  makeElement('div', ['mousehuntPage-loading', 'active'], '', row);
  loadingWwrapper.appendChild(row);

  loading.appendChild(loadingWwrapper);
  appendTo.appendChild(loading);
};

const makeUserTable = (hunters, id, title, appendTo) => {
  const loadingTitle = document.getElementById(`hunters-loading-${id}-title`);
  const loadingBlock = document.getElementById(`hunters-loading-${id}-block`);
  if (loadingTitle) {
    loadingTitle.remove();
  }

  if (loadingBlock) {
    loadingBlock.remove();
  }

  const wrapper = makeElement('div', 'treasureMapView-block-title', title);
  wrapper.id = `hunters-${id}`;
  appendTo.appendChild(wrapper);

  const block = makeElement('div', 'treasureMapView-block');
  block.id = `hunters-${id}-block`;
  const blockContent = makeElement('div', 'treasureMapView-block-content');
  const table = makeElement('div', 'treasureMapView-allyTable');

  hunters.forEach((hunter) => {
    let actions = `<a href="supplytransfer.php?fid=${hunter.sn_user_id}"class="mousehuntActionButton tiny lightBlue"><span>Send<br>Supplies</span></a>`;
    if ('requests' === id) {
      const declineAction = `<a class="treasureMapDialogView-deleteInviteRequest reject-invite-request mh-mapper-invite-request-action" data-snuid="${hunter.sn_user_id}" data-snuid="100000830940163">X</a>`;
      const acceptAction = `<a href="#" class="treasureMapDialogView-continueButton mousehuntActionButton accept-invite-request mh-mapper-invite-request-action" data-snuid="${hunter.sn_user_id}"><span>Accept</span></a>`;
      actions = `${declineAction}${acceptAction}`;
    }

    const markup = `<div class="treasureMapView-allyCell favourite"></div>
      <div class="treasureMapView-allyCell image">
        <div class="treasureMapView-hunter">
          <div class="treasureMapView-hunter-image-wrapper">
            <img src="${hunter.profile_pic}" class="treasureMapView-hunter-image">
          </div>
        </div>
      </div>
      <div class="treasureMapView-allyCell name">
        <div class="treasureMapView-ally-name">
        <a href="https://www.mousehuntgame.com/profile.php?snuid=${hunter.sn_user_id}">${hunter.name}</a>
        </div>
        <a href="#" class="treasureMapView-ally-environment treasureMapView-travelButton" data-environment-id="${hunter.environment_id}">
        ${hunter.environment_name}
        </a>
      </div>
      <div class="treasureMapView-allyCell lastActive">
        <div class="treasureMapView-ally-lastActive online">
          ${hunter.last_active_formatted}
        </div>
      </div>
      <div class="treasureMapView-allyCell trap">
        <div class="treasureMapView-componentContainer">
          <div class="treasureMapView-componentThumb" style="background-image: url(${hunter.base_thumb});" title="${hunter.base_name}"></div>
          <div class="treasureMapView-componentThumb" style="background-image: url(${hunter.weapon_thumb});" title="${hunter.weapon_name}"></div>
          <div class="treasureMapView-componentThumb" style="background-image: url(${hunter.bait_thumb});" title="${hunter.bait_name}"></div>
          <div class="treasureMapView-componentThumb" style="background-image: url(${hunter.trinket_thumb});" title="${hunter.trinket_name}"></div>
        </div>
      </div>
      <div class="treasureMapView-allyCell actions">${actions}</div>`;

    makeElement('div', 'treasureMapView-allyRow', markup, table);
  });

  block.appendChild(table);
  blockContent.appendChild(block);
  appendTo.appendChild(block);

  if ('requests' === id) {
    const actionButtons = document.querySelectorAll('.mh-mapper-invite-request-action');
    actionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const snuid = parseInt(button.dataset.snuid, 10);

        if (button.classList.contains('accept-invite-request')) {
          hg.utils.TreasureMapUtil.acceptInviteRequests(window.mhmapper.mapData.map_id, [snuid], () => {}, () => {});
        } else {
          hg.utils.TreasureMapUtil.declineInviteRequests(window.mhmapper.mapData.map_id, [snuid], () => {}, () => {});
        }
      });
    });
  }
};

const getInvitedHunterData = async (invited) => {
  if (invited.length === 0) {
    return [];
  }

  // if its less than or equal to 12, then we can do them all at once
  if (invited.length <= 12) {
    const hunters = await getUserData(invited);
    return hunters;
  }

  // otherwise we need to do them in batches of 12
  const batches = [];
  for (let i = 0; i < invited.length; i += 12) {
    batches.push(invited.slice(i, i + 12));
  }

  const hunters = [];
  for (let i = 0; i < batches.length; i += 1) {
    const batch = await getUserData(batches[i]);
    hunters.push(...batch);
  }

  return hunters;
};

const getUserData = async (userId) => {
  return new Promise((resolve) => {
    hg.utils.User.getUserData(userId, ['bait_name', 'bait_thumb', 'base_name', 'base_thumb', 'environment_id', 'environment_name', 'is_online', 'last_active_formatted', 'trinket_name', 'trinket_thumb', 'weapon_name', 'weapon_thumb'], (resp) => {
      resolve(resp);
    });
  });
};

const showHuntersTab = async () => {
  const emptySlots = document.querySelectorAll('.treasureMapView-allyCell.name');
  if (emptySlots.length) {
    let shouldRemove = false;
    emptySlots.forEach((slot) => {
      if ((slot.textContent === 'The map owner can invite more hunters.') || (slot.textContent === 'Click to invite a friend.')) {
        if (shouldRemove) {
          shouldRemove.parentNode.remove();
        }

        slot.parentNode.classList.add('hunters-last-slot');
        shouldRemove = slot;
      }
    });
  }

  const leftBlock = document.querySelector('.treasureMapView-leftBlock');
  if (! leftBlock) {
    return;
  }

  const huntersLeft = [];
  mhmapper.mapData.hunters.forEach((hunter) => {
    if (! hunter.is_active) {
      huntersLeft.push(hunter);
    }
  });

  if (huntersLeft.length) {
    makeUserTable(huntersLeft, 'left', `Hunters that have left map (${huntersLeft.length})`, leftBlock);
  }

  if (mhmapper.mapData.invited_hunters.length) {
    makeUserTableLoading('invited', `Invited hunters (${mhmapper.mapData.invited_hunters.length})`, leftBlock);
    const invitedHunters = await getInvitedHunterData(mhmapper.mapData.invited_hunters, leftBlock);
    makeUserTable(invitedHunters, 'invited', `Invited hunters (${invitedHunters.length})`, leftBlock);
  }

  if (mhmapper.mapData.invite_requests.length) {
    makeUserTableLoading('requests', `Hunters requesting invite (${mhmapper.mapData.invite_requests.length})`, leftBlock);
    const invitedHunters = await getInvitedHunterData(mhmapper.mapData.invite_requests, leftBlock);
    makeUserTable(invitedHunters, 'requests', `Hunters requesting invite (${invitedHunters.length})`, leftBlock);
  }
};

const maybeProcessHuntersTab = () => {
  // Only do the hunters tab changes if its an active map.
  // const isActiveMap = window.user.quests.QuestRelicHunter.maps.find((m) => m.map_id === map.map_id);
  // if (! isActiveMap) {
  //   return;
  // }

  const huntersTab = document.querySelector('.treasureMapRootView-subTab[data-type="manage_allies"]');
  if (! huntersTab) {
    return;
  }

  huntersTab.addEventListener('click', showHuntersTab);
};

const main = () => {
  maybeProcessHuntersTab();
  eventRegistry.addEventListener('map_data_loaded', (mapData) => {
    maybeProcessHuntersTab(mapData);
  });
};

export default main;
