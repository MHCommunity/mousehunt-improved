// import { addUIStyles } from './utils';

const testing = () => {
  window.mhutils = {
    addStyles,
    onAjaxRequest,
    onOverlayChange,
    onPageChange,
    onTrapChange,
    onEvent,
    onTravel,
    getCurrentPage,
    getCurrentTab,
    getCurrentSubTab,
    isOverlayVisible,
    getCurrentOverlay,
    getCurrentLocation,
    isLoggedIn,
    getSetting,
    saveSetting,
    addSettingsTab,
    addSetting,
    doRequest,
    isLegacyHUD,
    userHasItem,
    getUserItems,
    getUserSetupDetails,
    addSubmenuItem,
    addItemToGameInfoBar,
    createPopup,
    createImagePopup,
    createMapPopup,
    createWelcomePopup,
    createLarryPopup,
    createPaperPopup,
    showHornMessage,
    makeElementDraggable,
    makeElement,
    createChoicePopup,
    createFavoriteButton,
    wait,
    clog,
    debug,
  };
};

const trackEvents = () => {
  const events = [
    'ajax_response ',
    'camp_quest_hud_view_initialize',
    'user_interaction_update',
    'js_dialog_hide',
    'js_dialog_show',
    'set_page',
    'set_tab',
    'set_inset_tab',
    'treasure_map_update',
    'user_inventory_update',
    'user_recipe_update',
    'user_inventory_use_convertible',
  ];

  events.forEach((event) => {
    eventRegistry.addEventListener(event, () => {
      // console.log(event, e);
    });
  });
};

const main = async () => {
  trackEvents();
  testing();
};

export default main;
