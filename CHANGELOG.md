# Changelog

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
- Removes shadow on emtpy HUD icons
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
- Updates gift inbox footer "You can send/recieve X gifts today" to be two lines.
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
- Splits required module into seperate modules, set to alwaysLoad
- Moves journal privacy back to standalone module
- Moves dev to module folder
- Reorders location dashboard setting
- Adds changelog.md
- Adds debug functionality with a flag
- Removes sample migtated userscript
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
- Don't show fullstop after team name in hover profile
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
- Updates keyboard shortcuts to ignore keypresses when ctrl is pressed
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
- Moves 'Only ppen multiple' to Better Inventory
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
- Update font size for MHCT links
- Make the 'you own' in shops look nicer and more clear
- Fix alignment of kings crown mice
- Fix issues with better travel settings & correctly defaulting to the tab
- Switch to using helper method to grab settings to ensure they're prefix correctly
- Bump mh-utils version
- Shrink puzzle input font size a bit
- Upscale storm cell image
- Fix the 'send 1 free gifts' typo
- Style the gift of the day
- Add a 'select random friends' button for gift sending
- Don't make multiple leave buttons for the M400 helper
- Simplify travel location option
- General map support and styles cleanup
- Clone the leave map button so it's at the top as well
- Add error message if no ARs are found on mousepopup, link to MHCT
- Remove broken MHCT link
- Use the same _mhct target for mhct links to reuse window
- Update name of localstorage keys to be consistent
- Add export/import buttons to rankup forecast userscript
- Reposition current floor marker for maps
- Remove weird inventory action button spacing
- Move away from onPageChange to onNavigate for performance
- Limit the warn on bad crafts overlay checker to not fire constantly
- Add a slight delay to keyboard shortcuts to attempt to prevent keyboard shortcut mashing and crashing the page
- Fix charm shortcut key
- Fix TEM crown styles
- Cache AR values in session storage if there was an error retrieving them or they were empty
- Clean up and rewriting of AR caching, use of map type, etc
- Support scavenger maps in generic sorted page
- Remove extra padding in map mouse data dropdown
- Clean up mice crowns display
- Add keyboard shortcuts help popup, add more shortcuts
- Switch to listening for the paste shortcut for hunter ID quick navigation
- Add daily reward and King's Reward styles
- Update Map subcategory header styles

## Version 0.17.1

- Fix keyboard shortcuts firing always, even in input fields

## Version 0.17.0

- Add keyboard shortcuts feature
- Fix gift buttons setting alignment
- Add more map styles
- Highlight paragon shrines on sky map
- Allow skipping 'bad' gifts in gift return buttons
- Revert mapping full height tweak

## Version 0.16.4

- Update M400 helper
- Underline quest smash link
- Move message indicator dot
- Fix passing parcel display
- Fix hover profile name color
- Add BW reminder to Floating Island island start
- Fix plural invites text
- Make gift item icon look nicer on gift selector
- Fix map heights
- Fix quick send supplies trying to use null thumbnail
- Dont show HUD setting toggles for areas without new HUDs
- Clean up TEM mice display
- Add windmill styles
- Align quick travel icons
- Add fullstop to unstable charm journal entries
- Fix TEM power type alignment
- Show full catch/miss number on mouse view popup
- Make current iceberg zone show as bold
- Unhide invite manage link on maps

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
- Fixes EMP400 charm thubmnail, closes #118
- Updates King's Cart costs
- Removes twttr object fill
- Fixes journal fullstop again
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
- Fixs journal image size to not clip border
- Loads all the high res journal themes
- Forces journal theme selector preview to be the max height so the bottom of the dialog doesnt bounce around
- Adds more Journal style tweaks
- Adds an extra online indicator to the top right of each member on the team journal page
- Hides the label and make the text bigger for team mate setup on journal page
- Hides the expiring prize notice
- Vertically centers the 'udpate details' button for the team
- Only shows team trophy note on hover
- Styles team corkboard to match hunter and map
- Makes the alpha sort page actually just be on top of the simple travel page
- Adds alpha sort travel tab
- Go to friends page directly when selecting in search
- Removes friend profile redirect
- Updates esbuild for userscript
- Adds zugwangs tower styles
- Forces frox wall percent to be an interger
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
- Fix fullstop in journal.. again?
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
