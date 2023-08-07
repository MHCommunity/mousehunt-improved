// import { addUIStyles } from './utils';

const testing = () => {
  const functions = {
    addStyles,
    onAjaxRequest,
    onOverlayChange,
    onOverlayClose,
    getDialogMapping,
    onDialogShow,
    onDialogHide,
    onPageChange,
    onTrapChange,
    onEvent,
    onTravel,
    onNavigation,
    getCurrentPage,
    getCurrentTab,
    getCurrentSubtab,
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
    addMouseripLink,
    addItemToGameInfoBar,
    createPopup,
    createImagePopup,
    createMapPopup,
    createWelcomePopup,
    createLarryPopup,
    createPaperPopup,
    showHornMessage,
    toggleHornDom,
    showHuntersHornMessage,
    dismissHuntersHornMessage,
    makeElementDraggable,
    makeElement,
    makeButton,
    createChoicePopup,
    createFavoriteButton,
    wait,
    clog,
    debug,
    enableDebugMode,
    run,
    isDarkMode,
    matchesCurrentPage,
  };

  // create the window.mhutils object if it doesnt exist, otherwise merge the functions into it
  window.mhutils = window.mhutils ? { ...window.mhutils, ...functions } : functions;
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
};

export default main;
