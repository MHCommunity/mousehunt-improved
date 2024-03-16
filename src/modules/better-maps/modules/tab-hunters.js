import { makeElement, mapper } from '@utils';

const makeUserTableLoading = (id, title, appendTo) => {
  const wrapper = makeElement('div', 'treasureMapView-block-title', title);
  wrapper.id = `hunters-loading-${id}-title`;
  appendTo.append(wrapper);

  const loading = makeElement('div', 'treasureMapView-block');
  loading.id = `hunters-loading-${id}-block`;

  const loadingWrapper = makeElement('div', 'treasureMapView-allyTable', '');
  const row = makeElement('div', 'treasureMapView-allyRow', '');
  makeElement('div', ['mousehuntPage-loading', 'active'], '', row);
  loadingWrapper.append(row);

  loading.append(loadingWrapper);
  appendTo.append(loading);
};

const makeUserTable = async (hunters, id, title, appendTo) => {
  const loadingTitle = document.querySelector(`#hunters-loading-${id}-title`);
  const loadingBlock = document.querySelector(`#hunters-loading-${id}-block`);
  if (loadingTitle) {
    loadingTitle.remove();
  }

  if (loadingBlock) {
    loadingBlock.remove();
  }

  const existing = document.querySelector(`#hunters-${id}`);
  if (existing) {
    return;
  }

  const wrapper = makeElement('div', ['mh-ui-custom-map-block', 'treasureMapView-block-title'], title.replace('#count#', hunters.length));
  wrapper.id = `hunters-${id}`;
  appendTo.append(wrapper);

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
      <div class="treasureMapView-allyCell image" data-snuid="${hunter.sn_user_id}">
        <div class="treasureMapView-hunter" data-snuid="${hunter.sn_user_id}">
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
        <div class="treasureMapView-ally-lastActive ${hunter.is_online ? 'online' : ''}">
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

  block.append(table);
  blockContent.append(block);
  appendTo.append(block);

  if ('requests' === id) {
    const actionButtons = document.querySelectorAll('.mh-mapper-invite-request-action');
    actionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const snuid = Number.parseInt(button.dataset.snuid, 10);

        if (button.classList.contains('accept-invite-request')) {
          hg.utils.TreasureMapUtil.acceptInviteRequests(mapper('mapData').map_id, [snuid], () => {}, () => {});
        } else {
          hg.utils.TreasureMapUtil.declineInviteRequests(mapper('mapData').map_id, [snuid], () => {}, () => {});
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
  for (const batch_ of batches) {
    const batch = await getUserData(batch_);
    hunters.push(...batch);
  }

  return hunters;
};

const getUserData = async (userId) => {
  return new Promise((resolve) => {
    hg.utils.User.getUserData(
      userId,
      [
        'bait_name',
        'bait_thumb',
        'base_name',
        'base_thumb',
        'environment_id',
        'environment_name',
        'is_online',
        'last_active_formatted',
        'trinket_name',
        'trinket_thumb',
        'weapon_name',
        'weapon_thumb',
      ],
      (resp) => {
        resolve(resp);
      }
    );
  });
};

const removeEmptyHunterSlotsFromList = async () => {
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
};

const getLeftHunters = (mapData) => {
  const huntersLeft = [];
  mapData.hunters.forEach((hunter) => {
    if (! hunter.is_active) {
      huntersLeft.push(hunter);
    }
  });

  return huntersLeft;
};

const modifyButtons = () => {
  const buttons = [
    {
      selector: '.mh-ui-find-hunters-block .treasureMapAlliesView-showInviteButton',
      text: 'Invite Friends',
    },
    {
      selector: '.mh-ui-find-hunters-block .treasureMapAlliesView-showInviteTeamButton',
      text: 'Invite Team',
    },
    {
      selector: '.mh-ui-map-settings-block .treasureMapView-inviteModeButton',
      text: 'Change Settings',
    },
    {
      selector: '.mh-ui-share-block .treasureMapView-copyShareLinkButton',
      text: 'Copy',
    },
  ];

  buttons.forEach((button) => {
    const el = document.querySelector(button.selector);
    if (el) {
      el.classList.add('tiny');
      const text = el.querySelector('span');
      if (text) {
        text.textContent = button.text;
      }
    }
  });
};

const fixPluralInvites = () => {
  const invitesEl = document.querySelector('.treasureMapView-numInvitesSent');
  if (invitesEl && invitesEl.textContent === '1 invites sent.') {
    invitesEl.innerHTML = invitesEl.innerHTML.replace('invites', 'invite');
  }
};

const showHuntersTab = async (mapData) => {
  modifyButtons();
  removeEmptyHunterSlotsFromList();
  fixPluralInvites();

  const leftBlock = document.querySelector('.treasureMapView-leftBlock');
  if (! leftBlock) {
    return;
  }

  const huntersLeft = getLeftHunters(mapData);
  if (huntersLeft.length) {
    makeUserTable(huntersLeft, 'left', `Hunters that have left map (${huntersLeft.length || 0})`, leftBlock);
  }

  if (mapData.invited_hunters.length) {
    makeUserTableLoading('invited', `Invited hunters (${mapData.invited_hunters.length || 0})`, leftBlock);
    const invitedData = await getInvitedHunterData(mapData.invited_hunters);
    makeUserTable(invitedData, 'invited', 'Invited hunters (#count#)', leftBlock);
  }

  if (mapData.invite_requests?.length > 0) {
    makeUserTableLoading('requests', `Invite Requests (${mapData.invite_requests.length || 0})`, leftBlock);
    const requestData = await getInvitedHunterData(mapData.invite_requests);
    makeUserTable(requestData, 'requests', 'Invite Requests (#count)', leftBlock);
  }
};

export {
  showHuntersTab
};
