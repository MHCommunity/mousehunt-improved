# [Debug logging](https://www.mousehuntgame.com/preferences.php?tab=mousehunt-improved-settings#mousehunt-improved-settings-advanced-debug)

Enables debug logging for various parts of MouseHunt.

## Options

- **Log data caching activity**: Logs data requests to [api.mouse.rip](https://api.mouse.rip).
- **Log events**
- **Log all events**
- **Log IDs of opening and closing dialogs/popups**
- **Log module debug messages**
- **Log module loading**
- **Log page, tab, and subtab navigation**
- **Log remote requests and responses**
- **Set Sentry to debug mode**
- **Prevent hover popups from closing**: Prevents the Better Mice, Better Item, and Hover Profile popups from closing when the mouse leaves the popup.
- **Disable caching**,
- [Log events](#logging-events) - refer to the [feature flags](./feature-flags.md) for more conf

### Logging events

Events that are logged can be configured using [feature flags](./feature-flags.md).

|Flag|Description|
|---|---|
|`debug-events-<event-name>`|Log a specific event.|
|`debug-events-no-<event-name>`|Skip logging a specific event.|
|`debug-events-only-<event-name>`|Only log a specific event.|

By default, the following events are logged:

- `camp_page_arm_item`
- `camp_page_toggle_blueprint`
- `camp_page_update_item_array`
- `camp_quest_hud_view_initialize`
- `checkout_cart_update`
- `info_arrow_hide`
- `info_arrow_show`
- `spring_hunt_claim_hidden_egg`
- `tournament_status_change`
- `treasure_map_update_favourite_friends`
- `treasure_map_update_sent_requests`
- `treasure_map_update`
- `user_interaction_update`
- `user_inventory_update`
- `user_inventory_use_convertible`
- `user_recipe_update`
- `user_relationship`
- `user_trap_update`
