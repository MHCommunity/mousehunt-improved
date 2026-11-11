# [Better Gifts](https://www.mousehuntgame.com/preferences.php?tab=mousehunt-improved-settings#mousehunt-improved-settings-better-gifts)

Streamlines the gifts system, making it faster and easier to accept, return, and send gifts to friends.

## Features

- **Accept & Return All**: Adds a button to accept and return all gifts in one click.
- **Accept All**: Adds a button to accept all gifts at once.
- **Select Random/Frequent Friends**: Adds options to select random friends or your most frequent gifters when sending gifts.
- **Hidden Inactive Friends**: Friends who haven't played in a month are left out of the gift selector and random picks, with a Show link under the list to see them. Turn this off with the `better-gifts-show-inactive-friends` [feature flag](./feature-flags.md#better-gifts).
- **Friend Sorting**: Sort the All Friends list in the gift selector by name or last active.
- **Auto-closing Results**: The "Done!" panel fades out a couple of seconds after sending or claiming gifts, staying open while you hover it or when a gift couldn't be sent. Turn this off with the `better-gifts-keep-results` [feature flag](./feature-flags.md#better-gifts).
- **Gift Switcher**: Change which gift and quantity you're sending directly from the gift selector.
- **Improved Styles**: Updates the look and feel of the gift popups for better readability and usability.

## Options

- **Gift order**: Accept and send gifts newest to oldest, or oldest to newest.
- **Skipped gifts**: Gifts to skip when accepting and returning. Options include all except Gift of the Day, none, or specific items (Mozzarella Cheese, Stale Cheese, Radioactive Sludge, or combinations).
- **Gift button opens gift selector**: Clicking the gift button directly opens the gift selector instead of the normal gift dialog. Turn it on by clicking Gifts in Custom Menu (Settings → Appearance → Custom Menu).
