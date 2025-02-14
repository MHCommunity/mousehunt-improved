# [Feature Flags](https://www.mousehuntgame.com/preferences.php?tab=mousehunt-improved-settings#mousehunt-improved-settings-advanced-override-flags)

Enable hidden features and other advanced options.

Add any of the following flags, comma-separated, to the feature flags option to enable them.

## Flags

|Flag|Description|
|---|---|
|`disable-requests`|Disables sending requests to the MouseHunt servers.|
|`social-noop`|Replaces `hg.classes.SocialLink` and `twttr` objects with noops.|
|`no-kingdom-link-replacement`|Makes the Kingdom link to go the forums, rather than the News page.|

### Module Flags

#### Better Mice

|Flag|Description|
|---|---|
|`better-mice-no-new-ar-widths`|Reverts the column widths of the attraction rate table to the old widths.|

#### Better Travel

|Flag|Description|
|---|---|
|`better-travel-no-reminder-champions-fire`|Disables the reminder about Champion's Fire.|
|`better-travel-no-reminder-wild-tonic`|Disables the reminder about Wild Tonic.|
|`better-travel-no-reminder-bottled-wind`|Disables the reminder about Bottled Wind.|
|`better-travel-no-reminder-condensed-creativity`|Disables the reminder about Condensed Creativity.|
|`better-travel-no-reminder-festive-spirit`|Disables the reminder about Festive Spirit.|

#### Better UI Userscript Integrations

|Userscript|Flag|Required Module|
|---|---|--|
|All|`no-userscript-styles`|[Better UI](./better-ui.md)|
|[Profile+](https://greasyfork.org/en/scripts/381389-mh-profile)|`userscript-styles-no-profile-plus-styles`|[Better UI](./better-ui.md)|
|[Favorite Setups](https://greasyfork.org/en/scripts/443164-mousehunt-favorite-setups)|`userscript-styles-no-favorite-setups-styles`|[Better UI](./better-ui.md)|
|[Journal Historian](https://greasyfork.org/en/scripts/454968-mousehunt-journal-historian)|`userscript-styles-no-journal-historian-styles`|[Better UI](./better-ui.md)|
|[LGS Duration Indicator & Warning](https://greasyfork.org/en/scripts/410966-mousehunt-lucky-golden-shield-duration-indicator-warning)|`userscript-styles-no-lgs-reminder-styles`|[Better UI](./better-ui.md)|
|[Location Catch Stats](https://greasyfork.org/en/scripts/381438-mousehunt-location-catch-stats)|`userscript-styles-no-tsitu-location-catch-stats-styles`|[Better UI](./better-ui.md)|
|[QoL Utilities](https://greasyfork.org/en/scripts/405334-mousehunt-qol-utilities)|`userscript-styles-no-tsitu-qol-styles`|[Better UI](./better-ui.md)|
|[Send Supplies Search Bar](https://greasyfork.org/en/scripts/396714-mousehunt-send-supplies-search-bar)|`userscript-styles-no-tsitu-supply-search-styles`|[Better UI](./better-ui.md)|
|[Hyperspeed Travel](https://greasyfork.org/en/scripts/448542-mousehunt-hyperspeed-travel)|`userscript-styles-no-hyperspeed-travel-styles`|[Better Travel](./better-travel.md)|

### Debug Logging

See [Debug Logging](./debug-logging.md) for configuration options.

#### Location HUDs

|Flag|Description|
|---|---|
|`location-hud-fiery-warpath-no-command-bar-stats`|Hides the remaining mice text when in Fiery Warpath.|

### Disable Modules

You can force-disable modules using the `no-<module-id>` feature flag. This is the same as having the module turned off in the options, but can also disable features that are not usually toggle-able.

|Flag|Module|
|---|---|
|`no-global-styles`|Disables added global styles. _Warning: This may cause issues with other modules._|
|`no-highlight-users`|Disables the added badge on MouseHunt Improved developer and contributor hunter profiles.|
|`no-links`|Disables the added links to the Support and Kingdom menus.|
|`no-update-migration`|Disables migrating settings from old options to new options on update. _Warning: This may cause issues with other modules._|
|`no-update-notifications`|Disables update notifications.|
