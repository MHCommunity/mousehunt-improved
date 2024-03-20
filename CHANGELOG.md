# Changelog

## Version 0.36.0

### New Features

- Adds "Hide News Ticker" module
- Adds a number of new settings to various modules
- Adds a handful of new experimental features

### Better Gifts

- Minor style updates

### Better Inventory

- Fixes the recipe results tooltip not showing quickly & not caching the data
- Fixes recipe results tooltip not showing on page navigation, only on refresh
- Minor style updates

### Better Item View

- Adds a "Show Drop Rates" setting
- Minor style updates

### Better Journal

- Updates Journal replacement logic to happen more efficiently, quickly, and consistently
- Fixes issues with replacements happening multiple times
- Adds more styles for journal entries
- Adds a setting for "Show Gold and Points icons"
- Adds a setting for "Unique Loot Colors"
- Adds unique loot color for Snowball charms
- Minor style updates

### Better Maps

- Minor style updates
- Fix AR data not being cached

### Better Marketplace

- Adds a setting to show price history charts on category pages

### Better Mice

- Adds a "Show Attraction Rates" setting, Minor style updates
- Updates mice Group and Subgroup to be on two lines in Mouse popup
- Minor style updates

### Better Shops

- Adds a "Hide max quantity owned" setting,
- Adds a "Show quantity & max buttons" for buy amount
- Adds ability to hit enter while typing in an input field instead of clicking the buy button. Hitting enter a second time will confirm it.

### Better UI

- Fixes delete button being hidden in inbox
- Updates game settings styles
- Adds styles for the Tsuitu's autoloader
- Minor style updates

### Custom Horn

- Adds Spring Egg Hunt horn as an option

### Custom HUD

- Adds two more options for the Custom HUD background

### Experiments

- Adds new experiment: Iceberg progress stats always visible
- Adds new experiment: New settings styles
- Adds new experiment: New settings styles (columns)
- Adds new experiment: Scoreboard search on Hunter Profiles
- Adds new experiment: Show mice details on hover in journal
- Shortens Location HUD toggle button text

### Favorite Setups

- Fixes bugs with favorite setups showing
- Saves location when saving setup
- Suggests setups for a location

### Fixes

- Fixes tab heights

### Hover Profiles

- Adds loading display
- Fixes issues with multiple requests happening to fetch data

### Image Upscaling

- Updates processing logic to be more efficient and less memory intensive

### Inventory - Only Open Multiple

- Fixes issue with Open button being available when it shouldn't be

### Journal Changer

- Fixes theme being randomized more than once per day

### Location HUDs: Bountiful Beanstalk

- Updates the inventory and loot multiplier panels to be save their toggle state
- Makes the giant more visible during chase
- Adds slight animations
- Minor style updates

### Location HUDs: Event Location

- Adds Spring Egg Hunt styles

### Location HUDs: Folklore Forest Region

- Minor style updates

### Location HUDs: Iceberg

- Adds ability to scroll the map
- Adds setting for always showing the progress tooltip
- Adds floating animation to the Iceberg in the HUD
- Minor style updates

### Location HUDs: Labyrinth

- Adds easter egg when clicking on the current tile or another tile
- Updates gem scrambling animation
- Fixes the lantern reminder animating on every horn, instead of just once
- Minor style updates

### Location HUDs: Living Garden Region

- Adds ability to click to equip cursebreaking charms in Cursed City
- Minor style updates

### Location HUDs: Toxic Spill

- Minor style updates

### Lucky Golden Shield Duration & Reminder

- Fixes expiry time being off by a number of hours

### Show Auras

- Fixed duplication of icons, Style updates
- Hides Jetstream aura to make the display less cluttered

## Version 0.35.6

- Fixes error when getting AR data on sorted tab

## Version 0.35.5

- Fixes error when getting cached AR data _again_

## Version 0.35.4

- Fixes setting migration overwriting settings

## Version 0.35.3

- Fixes error when getting cached AR data

## Version 0.35.2

- Fixes Better Journal styles regression
- Adds "Convert weeks and months to days" setting to Lucky Golden Shield Reminder to match the display on mobile
- Fixes Lucky Golden Shield Reminder not correctly showing the correct time remaining and instead being off by a few hours
- Removes `items-marketplace-hidden.json` and instead fetches it from api.mouse.rip
- Removes `m400-locations.json` and instead fetches it from api.mouse.rip
- Removes `relic-hunter-hints.json` and instead fetches it from api.mouse.rip
- Excludes Error Reporting functionality from the Userscript build
- Removes onboarding tutorial
- Fixes Lucky Golden Shield alignment

## Version 0.35.1

- Fixes issue with settings not correct reading the new value

## Version 0.35.0

### Added

- Adds Gilded Birthday and Party Size Gilded Birthday maps to the Sorted tab in Better Maps
- Adds Birthday (Year 16) as an option for Custom Shield
- Adds Beta Features to the settings page
- Adds Show Auras in Trap Selector beta feature
- Adds Larry's Links beta feature
- Adds a `location-hud-toggle` flag that shows an icon in the top menu that will toggle the current Location HUD on and off
- Adds a `favorite-setups-toggle` flag that shows an icon in the top menu that will toggle the Favorite Setups on and off
- Adds a "Show toggle icon in top menu" setting to Journal Privacy to be able to toggle it on and off
- Adds Favorite Setups and toggling Inventory Lock and Hide to Keyboard Shortcuts

### Changed

- Updates Birthday event HUD styles, adds higher quality images, adds a fun room hover animation, the ability to drag the vending machine hat around, and ability to change the vending machine can color, and fixes the reminder date text alignment
- Removes the Birthday even shield unless it is selected in Custom Shield
- Updates Gnawnia Express Station Location HUD styles
- Updates Hover Profile to be more stable and correctly display itself
- Updates Fixes module to make event backgrounds still show on narrow screens
- Updates Custom Shield to handle previewing shields correctly and interacting with LGS Reminder
- Updates Hide Footer to be able to be toggled without a refresh
- Updates Inline Wiki to be able to be toggled without a refresh
- Updates Hide Sidebar to be able to be toggled without a refresh
- Updates Hide Sidebar to be enabled by default
- Updates Hide Share Buttons to be enabled by default
- Updates Import / Export Settings to be able to drag in an exported file to import it, format it, or reset back to default, and various other style updates
- Updates Better UI styles
- Updates Better Item View styles
- Updates Better Journal styles
- Updates Better Maps styles
- Updates Better Shops styles
- Updates various other styles
- Removes the local event environment data files and instead fetch them remotely
- Removes the `disable-mh-improved-tooltips` flag
- Updates Dark Mode styles with a variety of changes and improvements
- Updates the Valour Rift Location Dashboard to show Umbra run state
- Updates Inventory Lock and Hide to be able to Alt+Click to lock/unlock items and Shift+Alt+Click to hide/show items.

### Fixed

- Fixes power type filter not showing in Quick Filter and Sort
- Fixes LGS Reminder alignment _again_
- Fixes Better Journal replacements not applying in some cases
- Fixes Favorite Setups not correctly showing
- Fixes Favorite Setups setups being lost when toggling the module
- Fixes Inventory Lock and Hide not correctly applying
- Fixes Inventory Lock and Hide settings being lost when toggling the module
- Fixes Custom Shields not correctly applying without a refresh
- Fixes Userscript styles in Better UI not correctly applying
- Fixes various issues related to King's Crowns
- Fixes issues with Inventory Lock and Hide interface and styles
- Fixes trap selector Keyboard Shortcuts not working
- Fixes other minor bugs and style issues

## Version 0.34.0

### Added

- Adds Birthday maps to Better Maps sorted tab
- Adds Larger Codices feature
- Adds quantity display in trap selector for SSDB Toothlet Counter & Printing Press Paper Counter
- Adds new storage mechanism for cached data & sub-settings

### Changed

- Updates userscript styles, adds flags to toggle each individually
- Removes old event locations from Favorite locations
- Makes pirate airship bob up and down in FI

### Fixed

- Fixes LGS Reminder alignment
- Fixes CRE not refreshing
- Fixes Custom CSS not applying
- Fixes Custom Backgrounds not applying
- Fixes Better Gifts gift order not applying
- Fixes Better Travel location favorites not saving

## Version 0.33.0

### Added

- Adds "SSDB Toothlet Counter" feature module
- Adds "Printing Press Paper Counter" feature module
- Adds `fi-draggable-airship` beta feature

### Changed

- Updates Better UI userscript styles to be toggleable with flags
- Updates Floating Islands Location HUD to add a slight bob animation to pirate airships
- Updates Better Journal loot list to also show convertibles as a list

### Fixed

- Fixes Custom CSS not applying
- Fixes Custom Backgrounds not applying
- Fixes Floating Islands Location HUD not applying when taking off from launchpad
- Fixes Better Gifts gift order not applying
- Fixes Better Travel location favorites not saving

## Version 0.32.0

### Added

- Adds "Larger Skin Images" feature module
- Adds "Journal styles" setting in Better Journal
- Adds "Journal text replacements" setting in Better Journal
- Adds "Show loot icons" setting in Better Journal
- Adds "Show loot icons (minimal)" setting in Better Journal
- Adds "Show loot as list" setting in Better Journal
- Adds Codex category to Ultimate Checkmark
- Added Rare Mousoleum Treasure Chest, Rare Bounty Reward, Bounty Reward, Empyrean Treasure Trove, High Altitude Treasure Trove, and Low Altitude Treasure Trove to Ultimate Checkmark treasure chests.
- Adds custom styles for Labyrinth location entries in Better Journal
- Adds subtle animation and background styles to Ultimate Charm entries in Better Journal
- Adds "Hide Codices" feature module
- Adds ability to hit Enter in Quick Send Supplies after filling in amount
- Adds subtle background animation to Valentine's bonus mice catches in Better Journal
- Adds "Use smaller images" setting in Better Marketplace
- Adds sorting by location or Drop Rate for Scavenger maps in Better Maps
- Adds Jetstream countdown to Floating Islands Location HUD

### Changed

- Updates Delayed Tooltips to be use a different method with less conflicts
- Updates position and alignment of lgs-reminder element
- Updates hiding of minluck button for trap image view
- Updates max-height for Travel Menu in Better Travel
- Updates Journal Theme Changer to use less requests
- Updates travel settings key in Better Travel (will reset Travel Window settings)
- Updates docs in GitHub
- Updates position of word count entry in folklore-forest.css
- Updates Image Upscaling & Transparency styles
- Updates Favorite Setups button and image sizing
- Updates background color of inventory bag item image in floating islands HUD
- Updates module names and descriptions
- Updates settings titles and descriptions
- Updates settings styles
- Updates Better Gifts buttons & styles
- Updates vrift styles/sim link
- Updates loading error message and makes it dismissable
- Updates Location Dashboard refresh to only travel to locations in the dashboard
- Updates LNY map height
- Updates Lucky Golden Shield reminder to tick in tune with the horn countdown
- Updates module settings to show/hide when enabling or disabling a module
- Updates Relic Hunter hints
- Updates Favorite setups component picker to have a 'Use currently equipped' button

### Fixed

- Fixes Better UI to work with new layout
- Fixes Quick Filter and Sort to work with new layout
- Fixes Favorite Setups to work with new layout
- Fixes Prestige Base stats to work with new layout
- Fixes Floating Islands Location HUD changes disappearing
- Fixes Location HUDs not updating when actions are taken
- Fixes Ultimate Checkmark showing duplicate categories
- Fixes Journal replacements not always applying
- Fixes animation issue in hover-profiles
- Fixes issue with sentry sending user hashes
- Fixes Custom Backgrounds and Inventory locking not applying on page change

### Removed

- Removes usage stats
- Removes remote optional ultimate checkmark syncing
- Removes `journal-icons`, `journal-icons-all`, and `journal-list` feature flags (moved to options)
- Removes larger skin images from Better UI (moved to own module)

## Version 0.31.5

- Moves new LGS Reminder style to an option
- Fixes LGS Reminder alignment
- Fixes spacebar not working while in Fiery Warpath
- Adds dragging/scrolling to the lantern height map on the HUD
- Updates reward image size/position in LNY reward popup
- Adds ability to dismiss Taunting charm warning in Whisker Woods Rift Location HUD
- Adds ability to reorder Favorite Setups
- Fixes minor journal entry styles

## Version 0.31.4

- Adds Lunar New Year maps to the Sorted map tab of Better Maps
- Adds `journal-list` feature flag to display journal loot in a list
- Updates `journal-icons-all` to use transparent images
- Removes the 99 item limit when sending paid gifts to friends
- Adds a warning in Whisker Woods Rift when you have high rage or LLC equipped but not a Taunting charm
- Updates the LGS reminder display to be more like the display on Hunter Profiles
- Adds Event Location styles for Lunar New Year, including the ability to drag or scroll the lantern height map
- Updates Living Garden Location HUD to Garden, City, Desert markers on ingredients
- Updates Cursed City Location HUD to show curse name & necessary charm without having to hover
- Fixes a potential error happening when toggling quill visiblity in Table of Contents
- Updates Better Journal styles to not break for certain entries or mess up the formatting of event entries
- Fixes Catch Rate Estimator wrapping mice names to a new line
- Fixes broken tooltips inside of Hover Profiles
- Fix item classification not showing for item views
- Removes shadow on Larry when hovering over him on an item view due to a weird rendering issue
- Fixes Inbox arrow showing a line between the arrow and the text
- Fixes Journal Changer trying to change to unowned journals
- Updates Better Journal to not rewrite LNY entries
- Updates Better Journal to rewrite the extra Slayer entry to be one line
- Fixes a grammar mistake in purchase complete journal entries
- Updates Better Gifts styles to look a bit nicer for the gift selector
- Fixes button postion on news posts in the Inbox
- Fixes image displays in news posts, adds fun hover state to them
- Fixes display issues with Bristle Woods Rift Location HUD
- Minor other style updates and fixes to various modules
- Fixes Better Quests showing the wrong number of required Library Points for M400 Bait Assignment
- Updates Favorite Setups to arm bait last when equipping a setup
- Updates Relic Hunter hint display to use the proper article before an environment name

## Version 0.31.3

- Fixes Custom Styles not applying in the correct order

## Version 0.31.2

- Fixes default state for Wisdom in Stat Bar
- Removes 'Module Template' from module list

## Version 0.31.1

- Fixes journal icons always showing

## Version 0.31.0

### Added

- Adds Wisdom in Stat Bar feature
- Adds Journal Changer feature
- Adds Mousoleum Location HUD
- Adds Laboratory Location HUD
- Adds minigame to Fiery Warpath HUD, first click on the streak display to activate and then click in the HUD to launch missiles
- Adds a power type indicator to Favorite Setups
- Adds `journal-icons` and `journal-icons-all` beta testing features
- Adds Better UI styles for tsitu's Location Catch stats script
- Adds Gnawnia Rift Location HUD styles
- Adds more custom entry styling to Better Journal
- Adds a Blueprint option to Custom HUD
- Adds a quick spin animation to the player icon when clicking (or shift-clicking) on it in Valour Rift Location HUD
- Adds a better link to the sim popup in Valour Rift Location HUD

### Changed

- Alphabetizes item list for Quick Send Supplies and Pinned Send Supplies settings
- Updates the size of the title shield slightly
- Updates Better Quests to not show the Quest tab if not Lord/Lady
- Updates Favorite Setups edit/delete buttons to be more consistent
- Updates Better King's Reward to honk the horn after successfully submitting the puzzle
- Updates Better Journal's entry rewriting to save entries in IndexDB to avoid rewriting the same entry multiple times
- Updates Bristle Woods Rift Location HUD styles
- Updates Valour Rift Location HUD styles
- Updates Image Upscaling to look nicer in more places
- Updates most modules to take effect immediately when settings are changed, rather than requiring a page refresh
- Updated error reporting to be more helpful
- Minor style updates to Better UI and other modules

### Fixed

- Fixes Better Gifts not sending or claiming all gifts
- Fixes Favorite Setups trying to generate a name on first save
- Fixes LGS reminder alignment and styles
- Fixes Iceberg Location HUD Hidden Depths length
- Fixes Burroughs Rift Location HUD mist showing wrong color at 6
- Fixes Hide Daily Reward Popup not correctly hiding the popup _finally_
- Fixes Better UI style conflicts with Profile+
- Fixes Location HUD cheese selectors showing after traveling away
- Fixes Floating Islands Location Dashboard not correctly showing the correct tiles
- Fixes Sunken City Location HUD zone name size
- Fixes User Highlighting not showing after the data has been cached
- Removes the shadow from the HUD when using the blueprint background
- Fixes Gnawnia Rift not showing cheese quantities in tooltips
- Fixes too tall Theme Preview popup
- Fixes various minor bugs and style issues

## Version 0.30.5

- Fixes locked inventory items not correctly locking

## Version 0.30.4

- Fixes Catch Rate Estimator not showing
- Updates Valour Rift Location HUD styles

## Version 0.30.3

- Fixes Favorite Setups title randomize button not showing
- Fixes trap math window cutting off text

## Version 0.30.2

- Fixes Favorite Setups throwing errors
- Adds a 'Randomize' button to the title when editing a setup in Favorite Setups, which will automatically generate a title for you
- Fixes Inventory Lock and Hide only show lock buttons on collectibles page, rather than all but collectibles page
- Fixes Hover Profiles not correctly reading cached data
- Fixes mice ARs not correctly reading cached data
- Fixes Folklore Forest visibility toggles not correctly checking available upgrades
- Fixes potential memory leak in tab handlers
- Adds a 'Blueprint' option to Custom HUD
- Updates rank progress bar to blend with Custom HUD background
- Updates style of Better Inventory display for when Full Width is disabled
- Fixes styling conflict between Inventory Lock and Hide and MouseHunt QoL Utilities userscript
- Fixes Burroughs Rift Location HUD not correctly updating when honking horn
- Fixes Better Journal making bonus loot journal entries look terrible
- Updates Better Shops styles
- Updates Better UI styles
- Updates Favorite Setups styles
- Updates Valour Rift Location HUD styles
- Updates Quick Send Supplies styles
- Fixes Quick Send Supplies not showing on results for friend search
- Fixes LGS reminder positioning

## Version 0.30.1

- Fixes issue with custom backgrounds not being applied

## Version 0.30.0

### Added

- Adds Inventory Lock and Hide feature
- Adds a new Design section to the settings page
- Adds Custom Background feature, allowing you to choose from an event background, different colors, or gradients
- Adds Custom HUD Background feature, allowing you to replace the blue marble background with a different color
- Adds Custom Horn feature, allowing you to replace the default horn with an event horn or a color
- Adds a `disable-mh-improved-tooltips` feature flag to disable the added tooltips on Mouse views and Item views
- Adds experimental `ultimate-checkmark-sync` feature flag to sync Ultimate Checkmark data via a server
- Adds 'Environment icon opens Travel Window' option to Better Travel
- Adds an M400 Helper option to Better Quests to enable/disable the helper
- Adds categories to the help/settings for Keyboard Shortcuts
- Adds 'Go to Wiki' to Keyboard Shortcuts
- Adds 'Open Travel Window' to Keyboard Shortcuts
- Adds 'Travel to previous location' to Keyboard Shortcuts
- Adds 'Show larger images' option for Better Inventory
- Adds confirmation to Location Dashboard refresh before traveling
- Adds Seasonal Garden Location HUD styles

### Changed

- Updates 'Clear Cache' button to also remove cached sessionStorage data
- Updates clover icon to be more aligned and fade out in lucky catch journal entries
- Updates Moussu Picchu Location HUD styles
- Updates Table of Contents Location HUD styles
- Updates Folklore Forest region Location HUD styles
- Updates Whisker Woods Rift Location HUD styles
- Updates Table of Contents writing journal entry
- Updates Better Inventory styles to make images slightly bigger, add Riftstalker Set labels, and more
- Renames `twitter` feature flag to `social-noop`
- Disables M400 Helper travel button when in the correct location
- Simplifies text of M400 tasks to mostly fit on one line
- Updates Better Journal with some Whisker Woods Rift journal entry styles
- Updates Custom Shield to not remove event shields when set to the default shield
- Updates Keyboard Shortcuts to not process shortcuts when a King's Reward is active
- Updates the journal theme selector preview to match the journal
- Updates Larry Freebie journal entry color on dark mode
- FLRT Helper now defaults to all items if unable to fetch the tradable items data
- Updates Relic Hunter indicator on Travel map view to correctly show
- Updates colors used in many modules to be more consistent

### Fixed

- Fixes Valour Rift Location Dashboard reporting incorrect values for upgrades
- Fixes Minluck and Wisdom values not showing on Mouse View popups for Better Mice
- Fixes module loading when using the `no-<module>` feature flags
- Fixes Better Gifts correctly getting the amount of claimable actions
- Fixes some functionality not correctly working when changing pages
- Fixes display issues with Better Inventory when set to half width
- Fixes Folklore Forest visibility toggles for Silver and Golden Quill upgrades
- Fixes display of Favorited mice on the King's Crowns tab
- Reverts changes made to the shield in the stat bar
- Fixes Paste Hunter ID not correctly associating the snuid of the hunter, causing some tabs to load the wrong data
- Fixes settings not correctly showing that they saved or showing the refresh reminder message
- Updates Ultimate Checkmark to cache data for 5 minutes, allowing for faster loading of the page
- Updates user highlighting to cache data to avoid unnecessary requests
- Fixes M400 Helper not correctly processing S.S. Huntington IV correctly
- Fixes cheese selectors for Location HUDs not correctly displaying
- Fixes Custom Shield not correctly removing last saved shield when changing the setting
- Fixes Keyboard Shortcuts not checking default values for conflicting shortcuts
- Fixes Riftstalker Set text being black text on a black background for item tooltips
- Fixes the bait warning covering tooltips for Labyrinth Location HUD
- Fixes the 'Shuffle Doors' button not being clickable on the right side of the Labyrinth Location HUD
- Fixes Balack's Cove Location HUD not correctly showing the correct phase
- Fixes font size in Whisker Woods Rift tooltips
- Fixes incorrect chess piece count in Zugzwang's Tower Location HUD

## Version 0.28.1

- Fixes alignment of Relic Hunter icon/highlight on travel pages
- Fixes Accept All button returning gifts instead of accepting them in Better Gifts
- Fixes sorting not always showing on the mouse stats page for Better Mice
- Fixes incorrect icon in Floating Islands Location Dashboard entry
- Adds "Export Mice by Location" to Data Exporters
- Fixes typo of 'enerchi' in Furoma Rift Location Dashboard
- Fixes Siphon always showing 0 in Valour Rift Location Dashboard
- Replaces the Mouse Image popup with the normal Mouse popup on the King's Crowns display
- Fixes issues with Bottled Wind and Boss Countdowns in Floating Islands Location HUD
- Adds more styles in Better Maps
- Improves hover styles on King's Crown view in Better Mice
- Fixes hallway information showing above doors in Labyrinth Location HUD
- Improves styles for Labyrinth Location HUD
- Adds more styles for Bountiful Beanstalk Location HUD
- Fixes image display for Favorite Setups beta feature
- Adds help tooltips to Item and Mouse views with information about data and link to MHCT
- Adds `journal-icons` feature flag to display icons next to some loot items in journal entries

## Version 0.28.0

- Fixes invalid colors defined in HG CSS that causes certain elements to not appear correctly
- Fixes Larry's football challenge shield not correctly showing golden version
- Updates Travel Window to be fixed position
- Adds more global button styles
- Updates script loading process to prevent flickering while script loads
- Cleans up event location styles
- Fixes the width of the mice for the kings crown tab
- Updates consolation confirmation styles
- Removes close after sending option for Better Gifts
- Adds better handling to the location refresh travel checks
- Fixes environment errors when using Travel Window in event regions
- Fixes duplicate sunken city charm being displayed
- Adds beta Favorite Setups feature
- Adds Hide Daily Reward Popup feature
- Cleans up update notifications
- Fixes message item interactions not working correctly in the inventory
- Updates Delayed Tooltips to default to not being enabled.
- Fixes typos and cleans up language for settings and descriptions
- Updates settings to look fancy and slick
- Updates Kingdom menu to go to the News page rather than the Forum.
- Removes shadow on empty HUD icons
- Adds Clear Cache button to settings
- Add MH Improved icon to top menu
- Adds Location Dashboard refresh functionality
- Update cache keys
- Updates Delayed Tooltips to temporary disable while the Shift key is held down
- Adds smooth scrolling to Data Exporters display
- Adds Weekly & Friends scoreboard rankings to Data Exporters
- Adds Favorite Setups userscript export to Data Exporters
- Adds Daily Draw winner journal entry styles
- Adds Quick Invite field to Better Maps
- Removes most data files, updated to now fetch them from api.mouse.rip instead
- Updates color of Stuck Snowball journal entry
- Updates widths of MHCT item view table
- Adds a 'Default (low resolution)' option to Custom Shield to allow going back to the actual default shield
- Adds onboarding to guide users to the settings page
- Adds version and loaded modules to the `app.mhui` object.
- When loaded, a `mh-improved-loaded` event is fired through the `eventRegistry`.
- Don't show 'Arm Now' button anywhere but the inventory"
- Upscales more UI images and journal entry images
- Updates Travel Window to only show available locations
- Adds Mountain Location HUD styles

## Version 0.27.3

- Fixes not all scoreboards being available in data exporters

## Version 0.27.2

- Fixes return tradables button text
- Expands width of the Gifts menu item

## Version 0.27.1

- Fixes bug with travel window

## Version 0.27.0

- Adds Catch Rate Estimator feature.
- Adds FLRT helper feature.
- Adds a travel window.
- Adds more images upscaled images with transparency, including all bases.
- Hides the advent calendar in the menu if it's not December.
- Hides "Group: " prefix on mouseviews.
- Fixes image upscaling borders/sizes.
- Updates dark mode styles.
- Adds map refresh functionality.
- Fixes dark mode styles in Better Shops.
- Fixes margin and adds hover transition for GWH golem location images.
- Adds golem destination count to golems.
- Adds New Year's maps to sorted maps.
- Adds snowball showdown calculations when hovering over the HUD element.
- Updates user highlighting, adds a fancy profile for lead dev.
- Fixes a typo in custom shield settings.
- Modifies AR rate breakdowns and separates them with styles.
- Updates map styles for maps with 10 hunters.
- Aligns King's Reward text better, adds a hover state to the refresh button.
- Adds a full stop to more journal entries.
- Aligns more journal entry images.
- Adds "Arm Now" buttons to all charms in the inventory.
- Adds a Festive Spirit reminder.
- Fixes an issue with tooltips on profile pages.
- Adds wiki/MHCT links to marketplace items.
- Adds more styles for better UI.
- Removes the powertype filter from bases, allows toggling active filters.
- Updates environments to include the article, order, and a 2nd image.
- Adds more focus/active styles for elements with hover states.
- Makes the page loading indicator sit on top of the content, rather than a whole white screen
- Vertically aligns the 'Get More' button in the top menu
- Hides the 'My Profile' link in the top menu bar
- Updates padding, font-size, and border for hunter ID search input
- Adds a change in opacity when hovering over the title progress bar in the stat bar
- Repositions the shield/title in the stat bar to make the shield bigger
- Adds subtle shadow to profile image in hud stats bar
- Aligns marble background to top so that it doesn't jump when changing pages
- Adds more GWH style tweaks
- Fixes marketplace inbox alignment
- Adds start of Better Maps helper beta feature
- Removes shield z-index
- Fixes Open All But One button

## Version 0.26.1

- Adds 1,975 more images to the Image Upscaling list, bringing the total to 4,926 images!
- Fixes clearing keyboard shortcuts not saving
- Fixes passing parcel message item opening passing parcel collectible item view
- Fixes paste hunter id always going to own profile
- Fixes issues with ctrl key in keyboard shortcuts
- Fixes map corkboard styles in dark mode

## Version 0.26.0

- Adds debugging flags
- Removes update notifications in inbox
- Updates Paste Hunter ID to strip out non-numeric characters, so you can paste a string like 'Hunter ID: 1234567' and it will still work
- Clean up keyboard shortcuts list
- Fixes Better Gifts "Accept All" button not working
- Fixes the tooltip location of droid progress in golem workshop
- Adds commas to numbers on the scoreboard and when hovering over your rank on the scoreboard it will show what page that is
- Updates keyboard shortcuts to be customizable
- Updates Better Journal to not apply changes to the Stuck Snowball journal entry
- Fixes size of bait and outline in Marketplace for Image Upscaling
- Adds fancy journal styles for title changes entries
- Attempts to fix Better King's Reward not starting the puzzle for you
- Updates Image Upscaling to not run upscaling multiple times at once
- Adds minor GWH size/positioning changes
- Updates the GWH warning to be more visible
- Hiues the text and update the color for the completed golem progress track
- When clicking on the golem rewards quest progress bar your golems will now dance!
- Add more styles for Better Item View
- Adds more styles for Better Shops
- Adds more styles for Better Tournaments
- Adds more styles for Better Maps
- Adds more styles for Better UI
- Fixes inbox close button positioning
- Adds Festive Spirit to Travel Reminders in Better Travel
- Adds Location Favorites to Better Travel
- Adds Back to Previous Location to Better Travel
- Fixes armed item quantity display in dark mode
- Adds styles for tsitu's mapping userscript
- Adds minor styles for Journal Historian userscript
- Adds a banner above journal on new major updates
- Updates King's Calibrator text changes to only run when needed
- Adds more dark mode tweaks, fixes, and changes
- Fixes background color of Hover profiles not showing
- Fixes 'Open all but one' functionality
- Fixes the display of checkmarks on map screens
- Correctly shows online status for extra hunter views in better maps
- Add a setting for better inventory to toggle between full and half width
- Removes blank flash while loading, organize modules into a module loader file
- Adds GWH horn to the custom event horn beta feature
- Fixes typo in cheese names in GWH maps
- Fixes map group categories for GWH maps

## Version 0.25.2

- Fixes update notification colors for dark mode
- Removes snowball showdown changes
- Fixes dark mode styles for glazy mouse
- Updates camp armed items to be the correct bg size
- Fixes golem scarf position on golem preview window
- Fixes golem overlapping destination tab
- Moves ← → part buttons to the side to account for the golem
- Fixes golem overlapping text on golem loot popup
- Fixes golem loot popup being right at the top of the page
- Only shows correct type of gifts in the gift switcher
- Fixes scroll overflow on gift switcher
- Sets the sidebar gift scroll to only be full height when Taller Windows is enabled

## Version 0.25.1

- Removes input updates from text → number, as it broke the marketplace buy/sell functionality when clicking on amounts
- Fixes droid button colors in Golem Workshop
- Fixes Snowball Showdown not being playable
- Fixes images being scaled incorrectly on inventory pages
- Fixes LGS reminder defaulting to enabled
- Fixes text color for Glazy mouse catches when in dark mode
- Show update notifications for last minor version when the current version is a patch version

## Version 0.25.0

- Updates Image Upscaling to use a new algorithm with better performance and memory usage.
- Updates Better Gifts to not cause errors or miss sending/accepting the total number of gifts.
- Adds Great Winter Hunt styles.
- Adds feature flag for event horns.
- Adds Naughty and Nice maps to the sorted tab.
- Adds event locations to the Better Travel quick travel dropdown.
- Adds a 'Delayed Tooltips' feature to delay the display of tooltips.
- Adds a 'Show Spoiler' button to the Advent Calendar.
- Adds Bountiful Beanstalk HUD styles.
- Adds Foreward Farm HUD styles.
- Adds Table of Contents HUD styles.
- Adds Prologue Pond HUD styles, including animations for the boat and scattered chum.
- Adds options to hide/show boat upgrades in Prologue Pond.
- Adds new styles for the King's Calibrator
- Increases size of the input field in convertible item views.
- Updates Adblock to include a few more ads.
- Updates Gilded Charm journal entry styles.
- Updates Folklore Forest journal entry styles.
- Updates the Inbox styles.
- Fixes Metric Units breaking links in journal entries.
- Updates the equipped weapon display in shops.
- Fixes AR and Mouse display issues on Wanted Posters.
- Fixes weapon and base stats in shops and item views.
- Updates the Relic Hunter text in journal entries.
- Moves larger skin images to Better UI.
- Adds an option to Better Marketplace to default to searching all items
- Updates Update Notifications to not be added to inbox if the update was over a week old.
- Fixes additional CC loot journal entry in Folklore Forest.
- Fixes extra display of "•" in journal entries.
- Updates a number of miscellaneous journal entry styles.
- Fixes spacing of success message for Quick Send Supplies.
- Updates marketplace search dropdown to not have borders on the images.
- Updates gift inbox footer "You can send/receive X gifts today" to be two lines.
- Updates the inbox styling and order of menu.
- Makes close buttons more consistent across the site.
- Updates completed map reward styles.
- Adds styling for the MHCT success message to make it less distracting.
- Fixes the arrow color in the inbox when hovering over odd rows.

## Version 0.24.1

- Fixes update notification changelog link
- Bumps AR cache keys to refresh values

## Version 0.24.0

- Adds LGS Duration & Reminder feature
- Adds Metric units feature
- Adds a travel button to the Relic Hunter hint on the map view
- Adds Relic Hunter indicators to the map and simple travel page
- Adds localized tournament times
- Fixes open all but one buttons
- Adds wisdom to mouse views
- Removes empty weakness containers on mice views
- Fixes item view popup showing on all items
- Adds minlucks to mouse page
- Removes crafted image border
- Loads modules async
- Resplits better ui and better inventory options into standalone modules
- Splits required module into separate modules, set to alwaysLoad
- Moves journal privacy back to standalone module
- Moves dev to module folder
- Reorders location dashboard setting
- Adds changelog.md
- Adds debug functionality with a flag
- Removes sample migrated userscript
- Updates styles
- Add docblocks
- Fixes spelling and grammar a bit
- Removes console logs
- Fixes undef error
- Adds minluck generation and data
- Updates mouse image hovers in journal
- Cleans up advanced settings
- Adds error page styling
- Loads error styles from general styles file, improve layout
- Fixes footer height weirdness when no footer is enabled
- Adds body class helpers to utils, add to no footer
- Fixes journal setting styles
- Makes the m400 travel button cursor a pointer
- Cleans up main loading file, adds error message if failed to load, blank page while loading
- Adds setting styles
- Fixes size of raffle inbox new message
- Moves copy ID button to better UI setting
- Adds addMhuiSetting helper
- Adds update notifications
- Adds more styling for item views
- Adds inbox styling
- Adds gift buttons to main gift view, improve styling
- Don't show full stop after team name in hover profile
- Fixes alignment of friend request and accepted buttons in the inbox
- Makes it so the background of the page will always be the same color, rather than switching to white on narrow screens
- Adds better error displays & debugging information
- Updates mouse image hover styles in journal

## Version 0.23.0

- Re-enable halloween cheese arm buttons
- Allow flags to disable required module parts

## Version 0.22.3

- Fixes issues with gift button selecting
- When a King's Reward is available, clicks the claim button to start it
- Fixes selected friends height in gift popup
- Adds more styles

## Version 0.22.2

- Fix frequent gifters not selecting all the friends
- Fix taller windows breaking the map preview

## Version 0.22.1

- Fixes "Select Frequent Gifters" crashing the page
- Fixes default spacing of 15y badge
- Fixes map completion space before the period in journal entries
- Fixes spacing for list of gifts on the gift popup
- Improves sizing of Verified Developer & MH Improved badges on profile pages
- Increases the size of the years played shield and number on profiles
- Increases amount of size for team name on profiles to prevent wrapping some that aren't that long
- Adds styles for collection pages to increase the size of the images
- Moves dark mode support styles to the Better UI module

## Version 0.22.0

- Updates README
- Move Gift Buttons to Better Gifts
- Removes top margin from Larry's Gift claim page
- Fixes daily reward hover scaling
- Fixes Larry's Gift background color
- Sets min-height and width for hunter images on the map
- Removes broken links to mhdb
- Updates keyboard shortcuts to ignore key presses when ctrl is pressed
- Fixes corkboard colors for darkmode
- Fixes map title width blocking elements
- Fixes popup journal spacing
- Removes border from itemview action
- Adds more item view and inventory tweaks
- Fixes the collectibles tab text clipping
- Adds mouse hover transformations
- Updates gift buttons styles
- Adds a 'select frequent gifters' button
- Fixes no sidebar styles
- Adds crowns to mouse stats page
- Add setting for disabling paste hunter ID
- Enable rankup forecaster import/export buttons by default in feature flags
- Moves 'Only open multiple' to Better Inventory
- Adds settings for Better Inventory
- Adds open all but one button functionality
- Fixes Location Catch Stats loading
- Move Catch Stats to Location Catch Stats
- Move King's Reward to Better King's Reward
- Fixes error in checking for gift sending
- Makes cookbook base journal entries behave like other potion entries
- Adds more entries to list of ones needing periods
- Adds halloween to location hud settings toggle
- Adds Halloween styles
- Shortens unstable charm journal text
- Updates journal replacements with halloween changes

## Version 0.21.0

- Fixed map AR errors
- Fixed title shield alignment
- Removed border from upscaled halloween items in book
- Fixed inactive aura transparency

## Version 0.20.0

- Added Halloween map support
- Updated Custom Shield modules to have more options, be more flexible, and make the rank - shields look better
- Added 'No daily reward popup' feature
- Added custom CSS overrides
- Added feature flag overrides
- Added export/import feature for settings
- Added more dark mode styles
- shrink trap stats font size a bit
- Updated the change and reset password forms not wrap text that doesn't need to wrap
- Added new hover animations for FI enemy and airship
- Added a slight zoom to kings crowns hover, fix width
- Fixed price being set incorrectly on the first click of the Best price in the Marketplace
- Made the recommended laby door less bright
- Fixed hover profiles not working in some instances when journal replacements were done

## Version 0.19.0

- Upscale the golden shield image in the header :tada:
- Fixed FI boss progress countdown not showing on island start
- Updated settings page font sizes
- Fixed incorrect display of scoreboard and forum icons in the main navigation
- Updated manifest to explicitly ask for host permissions
- Removed unused background script and omnibox code
- Fixed 'mice can drop' z-index in FI
- Slightly delayed BW activate click from reminder
- Updated the font size in the FI tooltip for completed wardens
- Updated BW reminder to have an image and an activate button
- Updated travel reminders to have images and activate/deactivate buttons
- Updated keyboard shortcuts to not run if ctrl/cmd is pressed
- Added keyboard shortcut: S for Shops
- Updates the better travel alphabetized list width and border
- Hides the label for gold and points on the friends page and expands the width of the map title
- Updated scroll shop to only show one of each type of queso map
- Updated button to correctly use 'DR' instead of 'AR' for scavenger maps
- Fixed 'Show AR' button not working on scav maps
- Added RQCGT map support in the sorted tab
- Updated styles for specific maps
- Added custom shield coloring
- Added indicator of MH Improved developers, contributors, and supporters on their profile pages

## Version 0.18.4

- Adds Location HUD toggle for Zugzwang's Tower

## Version 0.18.3

- Removes event cheeses from the marketplace simplified search exclusion list
- Adds a setting to the gift buttons to toggle whether or not to auto-close the popup
- Adds more darkmode styles
- Adds some emojis to the secret easter egg

## Version 0.18.2

- Fixes travel page not defaulting to simple travel
- Adds export settings button
- Adds user highlighting feature
- Fixes duplicate King's Crowns tab appearing on Hunter Profiles
- Makes the settings page look better

## Version 0.18.1

- Fixes undefined setting error

## Version 0.18.0

- Don't show attraction rates on the mouse popup if there aren't any
- Don't show drop rates on the mouse popup if there aren't any
- Updates font size for MHCT links
- Make the 'you own' in shops look nicer and more clear
- Fixes alignment of kings crown mice
- Fixes issues with better travel settings & correctly defaulting to the tab
- Switches to using helper method to grab settings to ensure they're prefix correctly
- Bumps mh-utils version
- Shrinks puzzle input font size a bit
- Upscales storm cell image
- Fixes the 'send 1 free gifts' typo
- Styles the gift of the day
- Adds a 'select random friends' button for gift sending
- Don't make multiple leave buttons for the M400 helper
- Simplifies travel location option
- Adds general map support and styles cleanup
- Clones the leave map button so it's at the top as well
- Adds error message if no ARs are found on mousepopup, link to MHCT
- Removes broken MHCT link
- Uses the same _mhct target for mhct links to reuse window
- Updates name of localstorage keys to be consistent
- Adds export/import buttons to rankup forecast userscript
- Repositions current floor marker for maps
- Removes weird inventory action button spacing
- Moves away from onPageChange to onNavigate for performance
- Limits the warn on bad crafts overlay checker to not fire constantly
- Adds a slight delay to keyboard shortcuts to attempt to prevent keyboard shortcut mashing and crashing the page
- Fixes charm shortcut key
- Fixes TEM crown styles
- Caches AR values in session storage if there was an error retrieving them or they were empty
- Cleans up and rewriting of AR caching, use of map type, etc
- Supports scavenger maps in generic sorted page
- Removes extra padding in map mouse data dropdown
- Cleans up mice crowns display
- Adds keyboard shortcuts help popup, add more shortcuts
- Switch to listening for the paste shortcut for hunter ID quick navigation
- Adds daily reward and King's Reward styles
- Updates Map subcategory header styles

## Version 0.17.1

- Fixes keyboard shortcuts firing always, even in input fields

## Version 0.17.0

- Adds keyboard shortcuts feature
- Fixes gift buttons setting alignment
- Adds more map styles
- Highlights paragon shrines on sky map
- Allows skipping 'bad' gifts in gift return buttons
- Reverts mapping full height tweak

## Version 0.16.4

- Updates M400 helper
- Underlines quest smash link
- Moves message indicator dot
- Fixes passing parcel display
- Fixes hover profile name color
- Adds BW reminder to Floating Island island start
- Fixes plural invites text
- Makes gift item icon look nicer on gift selector
- Fixes map heights
- Fixes quick send supplies trying to use null thumbnail
- Don't show HUD setting toggles for areas without new HUDs
- Cleans up TEM mice display
- Adds windmill styles
- Aligns quick travel icons
- Adds full stop to unstable charm journal entries
- Fixes TEM power type alignment
- Shows full catch/miss number on mouse view popup
- Makes current iceberg zone show as bold
- Unhides invite manage link on maps

## Version 0.16.3

- Update to new settings markup

## Version 0.16.2

- Adds simple camp toggle to footer
- Fixes Hunters tab showing way too many blocks
- Fixes dark mode styles for map shop
- Fixes journal privacy + hover profiles conflict due to size
- Adds commas to cheese selector numbers
- Makes map goal container full height

## Version 0.16.1

- Adds delete inbox delete button styling
- Fixes consolation prize display
- Fixes header in readme
- Bump up points icon a tiny bit
- Removes opacity on Kings Cart extra costs

## Version 0.16.0

- Adds major mapping improvements
- Fixes Floating Islands fuel quantity button state
- Adds location HUD for Moussu Picchu
- Updates Sunken City HUD
- Adds settings toggles for each location HUD
- Other bugfixes and improvements

## Version 0.15.3

- Fixes mouse stat sorting not showing without a page refresh

## Version 0.15.2

- Fixes dark mode style applying to non-dark mode

## Version 0.15.1

- Fixes mouse stats sorting
- Fixes pinch of annoyance image
- Removes redirect to friend page on search
- Adds better success and error messages for quick send supplies
- Shows and error message for 'Show AR' on a map if rates aren't available

## Version 0.15.0

- Adds mapping toggle ar functionality
- Upscales Floating Islands log button
- Adds more map goodies
- Fixes journal image hover spacing
- Updates adblock to only block MH internal ads
- Updates better travel description
- Makes sorted map work with defined map groups
- Adds mouserip link to kingdom dropdown, add MH Improved github link and mouse.rip link to help menu
- Modifies cheese effect font sizes
- Rounds the corners on the quick travel icons
- Fixes EMP400 charm thumbnail, closes #118
- Updates King's Cart costs
- Removes twttr object fill
- Fixes journal full stop again
- Fixes hover profiles styling and quick send supplies interaction
- Rewrites a bunch of the mapping functionality and improve it
- Fixes title when hovering on mouse locations
- Shows a loading icon when loading the sorted page
- Adds toggle AR button for map
- Updates AR badge display to have more colors and categories
- Removes commented out code
- Slightly simplify styles locations for some changes
- Updates styles id
- Adds cheese selectors to acolyte realm
- Adds +5 to better send supplies
- Removes automatic publish action

## Version 0.14.12

- Removes bigger environment icons
- Fixes typo, updates description

## Version 0.14.11

- Fixes linting errors
- Fixes journal image size to not clip border
- Loads all the high res journal themes
- Forces journal theme selector preview to be the max height so the bottom of the dialog doesnt bounce around
- Adds more Journal style tweaks
- Adds an extra online indicator to the top right of each member on the team journal page
- Hides the label and make the text bigger for team mate setup on journal page
- Hides the expiring prize notice
- Vertically centers the 'update details' button for the team
- Only shows team trophy note on hover
- Styles team corkboard to match hunter and map
- Makes the alpha sort page actually just be on top of the simple travel page
- Adds alpha sort travel tab
- Go to friends page directly when selecting in search
- Removes friend profile redirect
- Updates esbuild for userscript
- Adds zugwangs tower styles
- Forces frox wall percent to be an integer
- Also ignores King's Prize Key in better-item-view mhct data
- Adds changelog to release notes
- Fixes item view image background
- Ignores king's credits in better item view
- Fixes larry tips links

## Version 0.14.10

- Fixes trap skin sizing
- Removes current location from region quick travel locations in travel dropdown

## Version 0.14.9

- Fixes linting errors
- Updates dependencies
- Adds publish workflow

## Version 0.14.8

- Moves recipe tweaks from better-ui to better-inventory
- Adds ME cheese warnings for potions
- Builds sourcemaps for userscript
- Removes testing code
- Updates workflows, adds publish workflow
- Adds linting
- Adds dependabot

## Version 0.14.7

- Fix journal entry image border always being removed
- Bump stormcell font size
- Darken journal entry border color
- Make ssdb journal image bigger
- Don't build css as one entire file to allow toggling modules to correctly work
- When clicking the roll button on the skymap, force a short pause before allowing another click
- Add highlighting to keys during FI SP rolling, increase font size of storm cells and cyclone stones,
- Fix better send supplies sorting

## Version 0.14.6

- Fix not being able to click on airship in Floating Islands
- Add profile+ styles
- Warn on crafting items using ME when its not worth it
- Fix paste taking you to a hunter profile while in an input field
- Finish up send supplies fixes. closes #98, closes #97, closes #96
- Fix better send supplies
- Add quick quantity buttons to send supplies
- Highlight equipped cheese in cheese selectors
- Mark items that have an action with a little dot
- Update dashboard on all requests, not just hard refresh
- Update frift dashboard display
- Update FI dashboard display
- Update bwrift dashboard display
- Update vrift dashboard display
- Add table of contents to dashboard
- Pass cached quests to each dashboard location markup getter
- Load dashboard env images from included environments file
- Move travel tweaks to 'better-travel', add quick travel to region areas in dropdown
- Team name hover fix
- Style tab lock/unlock buttons
- Fix tsitu lock/unlock buttons not showing
- Add margin to the right of journal entries
- Fix full stop in journal.. again?
- Fix bait font weight
- Move tournaments to its own module
- Add tournament member listing on hover
- Actually disable the quick send supplies button after clicking it once

## Version  0.14.5

- Adds more styles
- Cleans up TEM crowns
- Adds event styles
- Updates better maps to add ar to list of unsorted mice, fix consolation prizes
- Updates to a different gold/points approach for journal
- Fixes environment name when too long
- Moves mapper into better maps
- Removes friends scroll to top
- Adds Journal fixes
- Sets pb stats
- Shrinks gold and points text
- Adds trap tweaks - pin PB to top and always set its stats correctly
- Styles cleanup, make tem crowns always visible
- Cleans up styles
- Removes unstable mix-blend-mode
- Moves external scripts to src/data
- Adds contributing doc
- Fixes readme headers
- Ignores 29 for markdown linting
- Removes old sample json
- Sorts package.json
- Adds eslint
- Updates userscript build name
- Removes old image upscaling helper script

## Version  0.14.1

- Fixes linting errors

## Version  0.14.0

- Adds feature to paste a hunter id and it will take you to their profile. closes #68
- Ignores chrome charms in mhct data in item view.
- Moves gold and points to little icons
- Updates mhct items in popups to a limit of 15
- Refreshes other peoples hunter profile when viewing location stats
- Fixes up sort button
- Fixes friends issues
- Adds sorting to mouse stats page

## Version  0.13.0

- Minor updates and fixes

## Version  0.12.5

- Adds Gnawnia Rift location HUD styles
- Adds subtabs to mouse menu dropdown
- Adds King's Crowns to mouse page
- Moves adblock to it's own feature module
- Updats Vrift styles
- Updates team invite window styles
- Updates team journal list styles

## Version  0.12.3

- Minor updates and fixes

## Version  0.12.2

- Removes testing and debug calls

## Version  0.12.1

- Fixes firefox ID
- Update mhutils for userscripts
- Fixes marketplace image border radius

## Version  0.12.0

- Fixes kings cart desc heights
- Show/hide aura transition
- Fixes footer border being weird
- Adds Vrift styles
- Fixes spacing for vrift mini journals
- Fixes journal date color
- Moves vrift sim script to its own file
- Adds troll feature
- Updates footer styles
- Update stat bar to show full name on hover for trinket, map, and bait
- Fix larryoffice popup overlay
- Clean up adblock styles
- Updates environment image to be bigger
- Add m400 helper
- Add seasonal garden to Location Dashboard
- Don't show MHCT rates for party charms

## Version  0.11.1

- Adds close button to item popups
- Removes duplicate entry in upscaled image mapping
- Fixes mouse links
- Removes airship image mapping
- Update styles
- Adds full title percent when hovering over progress bar
- Updates Fort Rox journal entries
- Fixes flash of unstyled content for copy ID button
- Updates friend search
- Fixes quick send supplies showing when they don't accept supplies
- Adds Zokor styles

## Version  0.11.0

- Updates journal styles
- Updates Burroughs Rift cheese quantity styles
- Fixes link in mouse view

## Version  0.10.0

- Fixes adblock module always hiding sidebar
- Updates no-sidebars feature
- Cleans up Toxic Spill UI
- Fixes Ember Stone/Root quantity display
- Fixes hunter image size in env list
- Adds consolation prize list to better maps
- Adds Furoma Rift to Dashboard
- Adds Toxic Spill to Dashboard
- Updates styles
- Adds Ultimate Checkmark feature
- Adds Travel Tweaks feature
- Adds Shields feature
- Adds Minluck and Cre feature
- Adds Travel Tweaks feature
- Adds Catch Stats feature
- Adds Journal Privacy feature
- Adds Gift Buttons feature

## Version  0.9.9

- Fixes item stats in popup
- Updates styling
- Adds Better Send Supplies feature
- Move map styles to Better Maps feature
- Updates Burroughs Rift location HUD styles
- Fixes excess scrolls to top on Friends page
- Removes broken M400 helper
- Fixes trap description height
- Fixes marketplace 'you own' overlap
- Removes opacity effect on limit 1 shop items when hovering on them
- Fixes tem bar colors
- Removes marketplace search width changes
- Updates footer to visibly align with the left column rather than both columns
- Aligns arrows for tooltips
- Adds Burroughs Rift misting indicator
- Adds iceberg quantity changes
- Fixes z-index of drill in Iceberg
- Fixes cheese font weight
- Fixes mouse name position
- Fixes bait warning display in Burroughs Rift
- Fixes Sunken City warning always showing

## Version  0.9.8

- Fixes journal replacements not persisting

## Version  0.9.7

- Updates shop styles
- Updates Toxic Spill styles

## Version  0.9.6

- Fixes journal not updating
- Fixes zoom button position
- Fixes progress log loot and bait widths
- Updates styles
- Fixes journal replacements not working
- Adds recipes improvements
- Updates Iceberg styles
- Adds Sunken City styles
- Fixes map avatars
- Fixes tournament hover z-index

## Version  0.9.5

- Minor updates and fixes

## Version  0.9.1

- Minor updates and fixes

## Version  0.9.0

- Minor updates and fixes

## Version  0.7.0

- Minor updates and fixes

## Version  0.0.8

- Minor updates and fixes

## Version  0.0.4

- Adds Burroughs Rift location HUD
- Fixes errors with travel events
- Adds Better Marketplace feature

## Version  0.2.0

- Adds dark mode support
- Adds Zugzwang's Tower to dashboard
- Updates dashboard items
- Updates vrift styles, add some additional UI elements
- Moves SEH styles to Image Upscaling
- Moves non-fixes styles to module
- Moves modules to better names
- Update module descriptions
- Updates styles
- Adds S.S. Huntington IV location HUD
- Adds Forbidden Grove location HUD
- Fixes Labyrinth location HUD
- Adds Quick Filter and Sort feature

## Version 0.0.1

- Initial release
