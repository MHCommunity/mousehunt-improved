const areaHighlightingVrift = () => {
  if ('rift_valour' !== getCurrentLocation()) {
    return false;
  }

  let currentFloorState = (user.quests.QuestRiftValour.floor || 0) % 8;

  if (user.quests.QuestRiftValour.is_at_eclipse) {
    currentFloorState = 'eclipse';

    if (user.enviroment_atts.active_augmentations.tu) {
      currentFloorState = 'eclipse-uu';
    }
  } else if ('farming' === user.quests.QuestRiftValour.state) {
    currentFloorState = 'outside';
  }

  const floorCategory = document.querySelector(`.mouse-category-wrapper.mouse-category-vrift-${currentFloorState}`);
  if (! floorCategory) {
    return false;
  }

  floorCategory.classList.add('mouse-category-current-floor');

  return true;
};

const areaHighlightingFrox = () => {
  if ('fort_rox' !== getCurrentLocation()) {
    return false;
  }

  let mapArea = 'day';

  if (user.quests.QuestFortRox) {
    const phase = user.quests.QuestFortRox.current_phase || 'day';

    if ('day' === phase) {
      mapArea = 'day';
    } else if ('dawn' === phase) {
      mapArea = 'dawn';
    } else if ('night' === phase) {
      const stage = user.quests.QuestFortRox.current_stage || '';
      // this is where we return
      // first-light-utter-darkness, twilight-midnight-pitch, or night
      mapArea = 'night';
    }
  }

  const floorCategory = document.querySelector(`.mouse-category-wrapper.mouse-category-${mapArea}`);
  if (! floorCategory) {
    return false;
  }

  floorCategory.classList.add('mouse-category-current-floor');

  return true;
};

const areaHighlightingFloatingIslands = () => {
  console.log('areaHighlightingFloatingIslands'); // eslint-disable-line no-console
  if ('floating_islands' !== getCurrentLocation()) {
    return false;
  }

  const fiAtts = user?.quests?.QuestFloatingIslands?.hunting_site_atts || {};

  let islandType = '';
  if (fiAtts.is_high_tier_island) {
    islandType = 'hai';
  } else if (fiAtts.is_low_tier_island) {
    islandType = 'lai';
  } else if (fiAtts.is_vault_island) {
    islandType = 'sp';
  }

  const powerTypeMappings = {
    arcn: 'arcane',
    frgttn: 'forgotten',
    hdr: 'hydro',
    shdw: 'shadow',
    drcnc: 'draconic',
    law: 'law',
    phscl: 'physical',
    tctcl: 'tactical',
  };

  const islandPowerType = powerTypeMappings[fiAtts.island_power_type] || '';

  console.log(islandType, islandPowerType); // eslint-disable-line no-console

  const floorCategory = document.querySelector(`.mouse-category-wrapper.mouse-category-esp-${islandPowerType}`);
  if (! floorCategory) {
    return false;
  }

  floorCategory.classList.add('mouse-category-current-floor');

  const floorSubCategory = document.querySelector(`.mouse-category-wrapper.mouse-category-esp-${islandPowerType} .mouse-subcategory-${islandType}`);
  if (floorSubCategory) {
    floorSubCategory.classList.add('mouse-subcategory-current-floor');
  }

  return true;

  // mouse-category-esp-shadow
};

const getProfilePic = async () => {
  const userData = await doRequest('managers/ajax/pages/friends.php', {
    action: 'get_friends_by_snuids',
    'snuids[]': user.sn_user_id,
  });

  console.log(userData.friends[0].profile_pic); // eslint-disable-line no-console
  return userData?.friends?.[0]?.profile_pic || 'https://www.mousehuntgame.com//images/ui/friends/anonymous_user.png';
};

const addProfilePicToCurrentFloor = async () => {
  const existing = document.getElementById('mh-mapper-current-floor-profile-pic');
  if (existing) {
    return;
  }

  const profPic = await getProfilePic();

  const styleElement = document.createElement('style');
  styleElement.id = 'mh-mapper-current-floor-profile-pic';
  styleElement.innerHTML = `.mouse-category-wrapper.mouse-category-current-floor .mouse-category-header::after,
  .mouse-subcategory-wrapper.mouse-subcategory-current-floor .mouse-subcategory-header::after {
    background-image: url(${profPic});
  }`;
  document.body.appendChild(styleElement);
};

const doHighlighting = () => {
  const mapType = window.mhmapper.mapData.map_type;

  const existing = document.querySelector('.mouse-category-current-floor');
  if (existing) {
    existing.classList.remove('mouse-category-current-floor');
  }

  let added = false;
  switch (mapType) {
  case 'sky_palace':
    added = areaHighlightingFloatingIslands();
    break;
  case 'fort_rox':
    added = areaHighlightingFrox();
    break;
  case 'valour_rift':
    added = areaHighlightingVrift();
    break;
  default:
    break;
  }

  if (added) {
    addProfilePicToCurrentFloor();
  }

  highlightSelf();
};

const highlightSelf = () => {
  const self = document.querySelector(`.treasureMapView-hunter-wrapper[data-snuid="${user.sn_user_id}"] .treasureMapView-hunter-image-wrapper`);
  if (self) {
    self.classList.add('mapper-self');
  }
};

export default doHighlighting;
