import {
  addSubmenuItem,
  createPopup,
  doRequest,
  onRequest,
  removeSubmenuItem
} from '@utils';

const openMiniMap = async (mapId) => {
  const mapData = await doRequest('managers/ajax/users/treasuremap.php', {
    action: 'map_info',
    map_id: mapId,
  });

  const t = mapData.treasure_map;

  const mappedGoals = t.goals.mouse.map((m) => {
    return `<div class="mouse">
    <div class="unique_id">${m.unique_id}</div>
    <div class="model_type">${m.model_type}</div>
    <div class="type">${m.type}</div>
    <div class="name">${m.name}</div>
    <div class="small">${m.small}</div>
    <div class="large">${m.large}</div>
    <div class="group">${m.group}</div>
    <div class="sub_group">${m.sub_group}</div>
    <div class="is_landscape">${m.is_landscape}</div>
    <div class="environment_ids">${m.environment_ids.join(', ')}</div>
    </div>`;
  }).join('');

  const mappedHunters = t.hunters
    .map((h) => {
      return `<div class="hunter">
        <div class="name">${h.name}</div>
        <div class="user_id">${h.user_id}</div>
        <div class="sn_user_id">${h.sn_user_id}</div>
        <div class="profile_pic">${h.profile_pic}</div>
        <div class="environment_name">${h.environment_name}</div>
        <div class="environment_id">${h.environment_id}</div>
        <div class="environment_icon">${h.environment_icon}</div>
        <div class="is_online">${h.is_online}</div>
        <div class="last_active_formatted">${h.last_active_formatted}</div>
        <div class="base_name">${h.base_name}</div>
        <div class="base_thumb">${h.base_thumb}</div>
        <div class="weapon_name">${h.weapon_name}</div>
        <div class="weapon_thumb">${h.weapon_thumb}</div>
        <div class="bait_name">${h.bait_name}</div>
        <div class="bait_thumb">${h.bait_thumb}</div>
        <div class="trinket_name">${h.trinket_name}</div>
        <div class="trinket_thumb">${h.trinket_thumb}</div>
        <div class="is_active">${h.is_active}</div>
        <div class="display_order">${h.display_order}</div>
        <div class="captain">${h.captain}</div>
        <div class="upgrader">${h.upgrader}</div>
        </div>`;
    }).join('');

  const mappedEnvironments = t.environments.map((e) => {
    return `<div class="environment">
      ${e.name} (${e.type})
      <div class="thumb">${e.thumb}</div>
      <div class="header">${e.header}</div>
    </div>`;
  }).join('');

  createPopup({
    title: 'map',
    content: `<div class="mh-improved-map-helper-popup-content">
    <div class="row">
      <div class="title">
        map_id
      </div>
      <div class="value">
        ${t.map_id}
      </div>
    </div>
    <div class="row">
      <div class="title">
        map_class
      </div>
      <div class="value">
        ${t.map_class}
      </div>
    </div>
    <div class="row">
      <div class="title">
        map_type
      </div>
      <div class="value">
        ${t.map_type}
      </div>
    </div>
    <div class="row">
      <div class="title">
        invite_mode
      </div>
      <div class="value">
        ${t.invite_mode} (${t.invite_mode_names[t.invite_mode]} - ${t.invite_mode_descriptions[t.invite_mode]})
      </div>
    </div>
    <div class="row">
      <div class="title">
        is_listed
      </div>
      <div class="value">
        ${t.is_listed}
      </div>
    </div>
    <div class="row">
      <div class="title">
        name
      </div>
      <div class="value">
        ${t.name}
      </div>
    </div>
    <div class="row">
      <div class="title">
        thumb
      </div>
      <div class="value">
        ${t.thumb}
      </div>
    </div>
    <div class="row">
      <div class="title">
        quality
      </div>
      <div class="value">
        ${t.quality}
      </div>
    </div>
    <div class="row">
      <div class="title">
        is_upgraded
      </div>
      <div class="value">
        ${t.is_upgraded}
      </div>
    </div>
    <div class="row">
      <div class="title">
        is_complete
      </div>
      <div class="value">
        ${t.is_complete}
      </div>
    </div>
    <div class="row">
      <div class="title">
        is_owner
      </div>
      <div class="value">
        ${t.is_owner}
      </div>
    </div>
    <div class="row">
      <div class="title">
        num_active_hunters
      </div>
      <div class="value">
        ${t.num_active_hunters}
      </div>
    </div>
    <div class="row">
      <div class="title">
        viewing_user_is_on_map
      </div>
      <div class="value">
        ${t.viewing_user_is_on_map}
      </div>
    </div>
    <div class="row">
      <div class="title">
        min_title_name
      </div>
      <div class="value">
        ${t.min_title_name}
      </div>
    </div>
    <div class="row">
      <div class="title">
        min_title_wisdom
      </div>
      <div class="value">
        ${t.min_title_wisdom}
      </div>
    </div>
    <div class="row">
      <div class="title">
        max_hunters
      </div>
      <div class="value">
        ${t.max_hunters}
      </div>
    </div>
    <div class="row">
      <div class="title">
        invited_hunters
      </div>
      <div class="value">
        ${t.invited_hunters.join(', ')}
      </div>
    </div>
    <div class="row">
      <div class="title">
        invite_requests
      </div>
      <div class="value">
        ${t.invite_requests.join(', ')}
      </div>
    </div>
    <div class="row">
      <div class="title">
        goals.mouse
      </div>
      <div class="value">
        ${mappedGoals}
      </div>
    </div>
    <div class="row">
      <div class="title">
        hunters
      </div>
      <div class="value">
        ${mappedHunters}
      </div>
    </div>
    <div class="row">
      <div class="title">
        environments
      </div>
      <div class="value">
        ${mappedEnvironments}
      </div>
    </div>
    </div>`,
    className: 'mh-improved-map-helper-popup',
    show: true,
  });
};

const makeMenuItem = () => {
  removeSubmenuItem('mh-improved-map-helper');

  const mapId = user?.quests?.QuestRelicHunter?.default_map_id;
  if (! mapId) {
    return;
  }

  addSubmenuItem({
    id: 'mh-improved-map-helper',
    menu: 'camp',
    label: `<span class="title">${user?.quests?.QuestRelicHunter?.label}</span><span class="subtitle">${user?.quests?.QuestRelicHunter?.value}</span>`,
    icon: user?.quests?.QuestRelicHunter?.image || 'https://www.mousehuntgame.com/images/items/convertibles/large/bfca4a1c658e49903654d0a84f52c9fd.png',
    callback: () => {
      openMiniMap(mapId);
    },
  });
};

export default () => {
  makeMenuItem();
  onRequest(makeMenuItem);
};
