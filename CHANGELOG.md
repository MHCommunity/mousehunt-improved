# Changelog

## Version 0.24.0

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
- Cleans up main loading file, add error message if failed to load, blank page while laoding
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

-

## Version  0.12.5

-

## Version  0.12.3

-

## Version  0.12.2

-

## Version  0.12.1

-

## Version  0.12.0

-

## Version  0.11.1

-

## Version  0.11.0

-

## Version  0.10.0

-

## Version  0.9.9

-

## Version  0.9.8

-

## Version  0.9.7

-

## Version  0.9.6

-

## Version  0.9.5

-

## Version  0.9.1

-

## Version  0.9.0

-

## Version  0.0.8

-

## Version  0.7.0

-

## Version  0.0.4

-

## Version  0.2.0

-

## Version 0.0.1

- Initial release
