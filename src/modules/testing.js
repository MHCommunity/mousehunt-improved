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
