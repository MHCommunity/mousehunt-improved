# [Debug logging](https://www.mousehuntgame.com/preferences.php?tab=mousehunt-improved-settings#mousehunt-improved-settings-advanced-debug)

Enables debug logging for various parts of MouseHunt.

## Options

- Log module debug messages
- Log module loading
- Log data caching and retrieval
- Log update migration
- Log IDs of opening and closing dialogs/popups
- Log page, tab, and subtab navigations
- Log remote requests and responses
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
