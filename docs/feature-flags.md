# [Feature Flags](https://www.mousehuntgame.com/preferences.php?tab=mousehunt-improved-settings#mousehunt-improved-settings-advanced-override-flags)

Enable hidden features and other advanced options.

Add any of the following flags, comma-separated, to the feature flags option to enable them.

You can also temporarily enable any flag for a single page load with the `?flag=<flag>` [URL query parameter](#url-query-parameters).

## Flags

|Flag|Description|
|---|---|
|`disable-requests`|Disables sending requests to the MouseHunt servers.|
|`fake-fabled`|Enables the modules locked to Fabled rank and replaces the progress bar with the Max Title text.|
|`infinite-super-brie`|Replaces the SUPER\|brie+ quantity in the menu with an infinity symbol (∞).|
|`legacy-hud`|Treats the HUD as the legacy HUD for styling purposes.|
|`no-kingdom-link-replacement`|Makes the Kingdom link to go the forums, rather than the News page.|
|`settings-table-of-contents`|Adds a table of contents to the top of the settings page.|
|`social-noop` (or `twitter`)|Replaces `hg.classes.SocialLink` and `twttr` objects with noops.|

### Module Flags

#### Better Journal

|Flag|Description|
|---|---|
|`better-journal-icons-minimal`|Shows icons only for select loot items in the journal.|
|`show-lucky-icon`|Shows the luck stat icon after "lucky" text in journal entries.|

#### Better Maps

|Flag|Description|
|---|---|
|`better-maps-no-solver-links`|Hides the map solver links on the Goals tab.|
|`better-maps-show-inactive-community-maps`|Shows old and inactive maps in the Community Maps listing.|

#### Better Marketplace

|Flag|Description|
|---|---|
|`better-marketplace-no-value-column`|Hides the estimated value column when browsing.|
|`better-marketplace-no-highlight-last-viewed`|Stops highlighting and scrolling to the last item you viewed.|

#### Better Quests

|Flag|Description|
|---|---|
|`better-quests-no-m400-helper`|Removes the "Travel to next step" button from the M400 assignments.|

#### Better Shops

|Flag|Description|
|---|---|
|`better-shops-hide-max-owned`|Hides items you own as many of as you can.|

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
|`no-travel-menu-hiding`|Disables the travel dropdown menu hiding styles.|
|`better-travel-no-travel-window`|Removes the Travel Window from the Travel menu.|
|`better-travel-no-travel-window-environment-icon`|Stops the environment icon from opening the Travel Window.|

#### Better Tournaments

|Flag|Description|
|---|---|
|`better-tournaments-time-on-hover`|Shows local tournament times on hover instead of inline.|

#### Catch Rate & Minluck

|Flag|Description|
|---|---|
|`catch-rate-estimate-more-refresh`|Refreshes the estimates after more requests, rather than just trap changes.|
|`cre-show-trap-highlight`|Shows a catch rate indicator above the trap view.|

#### Image Upscaling & Transparency

|Flag|Description|
|---|---|
|`no-image-upscaling-journal-themes`|Skips loading the upscaled journal theme images.|

#### Better UI Userscript Integrations

|Userscript|Flag|Required Module|
|---|---|--|
|All|`no-userscript-styles`|[Better UI](./better-ui.md)|
|Any Trap Any Skin|`userscript-styles-no-any-trap-any-skin-styles`|[Better UI](./better-ui.md)|
|[Favorite Setups](https://greasyfork.org/en/scripts/443164-mousehunt-favorite-setups)|`userscript-styles-no-favorite-setups-styles`|[Better UI](./better-ui.md)|
|[Journal Historian](https://greasyfork.org/en/scripts/454968-mousehunt-journal-historian)|`userscript-styles-no-journal-historian-styles`|[Better UI](./better-ui.md)|
|[LGS Duration Indicator & Warning](https://greasyfork.org/en/scripts/410966-mousehunt-lucky-golden-shield-duration-indicator-warning)|`userscript-styles-no-lgs-reminder-styles`|[Better UI](./better-ui.md)|
|[Location Catch Stats](https://greasyfork.org/en/scripts/381438-mousehunt-location-catch-stats)|`userscript-styles-no-tsitu-location-catch-stats-styles`|[Better UI](./better-ui.md)|
|[Profile+](https://greasyfork.org/en/scripts/381389-mh-profile)|`userscript-styles-no-profile-plus-styles`|[Better UI](./better-ui.md)|
|[QoL Utilities](https://greasyfork.org/en/scripts/405334-mousehunt-qol-utilities)|`userscript-styles-no-tsitu-qol-styles`|[Better UI](./better-ui.md)|
|[Send Supplies Search Bar](https://greasyfork.org/en/scripts/396714-mousehunt-send-supplies-search-bar)|`userscript-styles-no-tsitu-supply-search-styles`|[Better UI](./better-ui.md)|
|Spring Egg Hunt Helper|`userscript-styles-no-spring-egg-hunt-helper-styles`|[Better UI](./better-ui.md)|
|[Tsitu's Autoloader](https://github.com/tsitu/MH-Tools)|`userscript-styles-no-tsitu-autoloader-styles`|[Better UI](./better-ui.md)|
|[Rank-Up Forecaster](https://greasyfork.org/en/scripts/428461-mh-rank-up-forecaster-v2-0)|`userscript-styles-no-rankup-forecaster`|[Rank-Up Forecaster](./rank-up-forecaster.md)|

### Debug Logging

See [Debug Logging](./debug-logging.md) for configuration options.

### Favorite Setups

|Flag|Description|
|---|---|
|`favorite-setups-limit-location-favorites`|Limits the number of location favorites to 3 per location.|

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

### Load Modules

You can force a module to load using the `load-<module-id>` feature flag, regardless of whether it's enabled in the options. Combined with the `?flag=` query parameter, this is useful for temporarily trying out a module without changing your settings, e.g. `?flag=load-lgs-reminder`.

### Enable Deprecated Modules

Some modules have been deprecated and are no longer available in the settings unless they are already enabled. You can show them in the settings by enabling the `show-deprecated-modules` feature flag.

## URL Query Parameters

Add these query parameters to the MouseHunt URL to temporarily change behavior for that page load. These are not persisted and only apply to the current page.

| Parameter | Description |
| --- | --- |
| `?safe-mode` | Loads with default settings. Useful for troubleshooting issues caused by settings. Your current settings are not overwritten and will be restored on the next normal page load. |
| `?no-custom-styles` | Skips loading any custom CSS added via the [Custom Styles](./custom-styles.md) module. |
| `?no-image-upscaling` | Disables [Image Upscaling & Transparency](./image-upscaling-and-transparency.md) for the current page load. |
| `?flag=<flag>` | Temporarily enables one or more feature flags for the current page load without saving them to your settings. Separate multiple flags with commas, e.g. `?flag=legacy-hud,no-links`. |

Multiple parameters can be combined, e.g., `https://www.mousehuntgame.com/?safe-mode&no-custom-styles`.
