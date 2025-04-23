# Contributing to MouseHunt Improved

Thank you for your interest in contributing to MouseHunt Improved! We welcome contributions from the community to make our project even better.

## Table of Contents

- [Contributing to MouseHunt Improved](#contributing-to-mousehunt-improved)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Step 1: Fork](#step-1-fork)
    - [Step 2: Install Dependencies](#step-2-install-dependencies)
    - [Step 3: Branch](#step-3-branch)
    - [Step 4: Make Changes](#step-4-make-changes)
    - [Step 5: Commit and Push](#step-5-commit-and-push)
    - [Step 6: Create a Pull Request](#step-6-create-a-pull-request)
  - [Project Structure](#project-structure)
  - [How to add a new module](#how-to-add-a-new-module)
    - [Importing utilities](#importing-utilities)
    - [Adding settings to a module](#adding-settings-to-a-module)
  - [Code Style](#code-style)
  - [Building](#building)
  - [Testing](#testing)
  - [Data files](#data-files)
  - [Adding a map to the map sorter/categorizer](#adding-a-map-to-the-map-sortercategorizer)
  - [Building an extension or userscript that interacts with MouseHunt Improved](#building-an-extension-or-userscript-that-interacts-with-mousehunt-improved)
    - [Example Userscript](#example-userscript)

## Getting Started

### Step 1: Fork

Fork the project [on GitHub](https://github.com/MHCommunity/mousehunt-improved) and clone your fork
locally.

```sh
git clone git@github.com:<your-username>/mousehunt-improved.git
cd mousehunt-improved
git remote add upstream https://github.com/MHCommunity/mousehunt-improved.git
git fetch upstream
```

### Step 2: Install Dependencies

MouseHunt Improved uses [Bun](https://bun.sh/) to manage dependencies, but if you prefer to use `npm` you can use that instead, just replace `bun` with `npm` in the commands below.

```sh
bun install
```

### Step 3: Branch

Create a branch and start hacking:

```sh
git checkout -b my-branch
```

### Step 4: Make Changes

Check out the [project structure](#project-structure) section for information on how the project is structured and [building](#building) for information on how to build the project and test your changes.

### Step 5: Commit and Push

```sh
git commit -m "Add some feature"
git push origin my-branch
```

### Step 6: Create a Pull Request

Open a [pull request](https://github.com/MHCommunity/mousehunt-improved/pulls) with a clear title and description of your changes.
ion of your changes.

## Project Structure

The project is structured as follows:

- `src/data/` Data files, such as the image upscaling mapping file.
- `src/extension/` Files for building the extensions, such as the manifest files.
- `src/modules/` The code for all the different modules.
- `src/utils/` Utility functions used by the modules.
- `src/index.js` The entry point for the extension. This handles module registration and loading.

## How to add a new module

1. Create a new folder in `src/modules/` with the name of your module. Inside this folder, create an `index.js` file that exports the expected module properties, for example:

```javascript
const init = async () => {
  // Your module code here.
};

/**
 * Initialize the module.
 */
export default {
  id: 'my-module',
  name: 'My Module',
  description: 'This is my module description.',
  type: 'feature', // or 'element-hiding', 'advanced', or 'beta'.
  default: false, // Whether the module should be enabled by default.
  load: init
};
```

### Importing utilities

All of the utility functions are in `src/utils/`. They are broken up into different files, but you can import any of them like this:

```javascript
import { addStyles, getCurrentLocation } from '@utils';
```

### Adding settings to a module

Settings for a module are defined by passing a function that returns an array of settings objects to the module. A simple example of a toggle setting would look like this:

```javascript
const settings = () => {
  return [
    {
      id: 'my-module.my-setting',
      title: 'Enable an option for my module',
      description: 'This is a description of the setting.', // Optional, usually not needed.
      default: false,
    }
  ];
};

/**
 * Initialize the module.
 */
export default {
  id: 'my-module',
  name: 'My Module',
  description: 'This is my module description.',
  type: 'feature',
  default: false,
  load: init,
  settings
};
```

There are a variety of different setting types available, such as text inputs, dropdowns, and more. Check out the existing modules for examples of how to use these.

## Code Style

The code style is enforced using [ESLint](https://eslint.org/) and [Stylelint](https://stylelint.io/).

To lint your code, run `bun run lint`. This will run both ESLint and Stylelint. To automatically fix any issues, run `bun run lint:fix`.

There are also individual commands for more specific linting:

- `bun run lint:js` to lint JavaScript files.
- `bun run lint:js:fix` to automatically fix any issues in JavaScript files.
- `bun run lint:css` to lint CSS files.
- `bun run lint:css:fix` to automatically fix any issues in CSS files.
- `bun run lint:json` to lint JSON files.
- `bun run lint:json:fix` to automatically fix any issues in JSON files.
- `bun run lint:md` to lint Markdown files.
- `bun run lint:md:fix` to automatically fix any issues in Markdown files.

## Building

You can build a Chrome extension, Firefox extension, or userscript.

- `bun run build` to build the extensions and userscript.
- `bun run build:extension` to just build the extensions.
- `bun run build:extension:chrome` to just build the Chrome extension.
- `bun run build:extension:firefox` to just build the Firefox extension.
- `bun run build:userscript` to just build the userscript.

After building, you will find the following files in the `dist/` folder.

- `dist/chrome/` The Chrome extension.
- `dist/firefox/` The Firefox extension. You can load this into Firefox by going to `about:debugging` and clicking 'Load Temporary Add-on' and selecting the `manifest.json` file.
- `dist/archive.zip` Zip file containing the non-minified code for uploading to the Firefox Add-ons site.
- `dist/chrome.zip` Zip file for uploading to the Chrome Web Store.
- `dist/firefox.zip` Zip file for uploading to the Firefox Add-ons site.
- `dist/mousehunt-improved.user.js` The userscript file.

## Testing

To test your changes, you can load the local version of the extension into your browser.

For Chrome, go to `chrome://extensions` and enable 'Developer mode' in the top right corner.
Then click 'Load unpacked' and select the `dist/chrome` folder.

For Firefox, go to `about:debugging` and click 'Load Temporary Add-on' and select the `manifest.json` file in the `dist/firefox` folder.

For the userscript, you can use [Violentmonkey](https://violentmonkey.github.io/) to install it in your browser. You can then use the 'Track local file changes' option to develop locally.

_For Chrome or Firefox you can reload the extension by clicking the reload button on the extension card if your aren't seeing your changes._

## Data files

The `src/data/` folder contains JSON data files that are used by the extension and may need to be updated from time to time.

- `backgrounds.json` - Used by Custom Background and Custom HUD to provide a list of available backgrounds.
  - The format is an array of objects with the following properties:
    - `id` - A unique ID for the background.
    - `name` - The name of the background.
    - `css` - The CSS value to use for the background. This should be a valid CSS `background` value.
  - Examples:
    - `{ "id": "my-background", "name": "My Background", "css": "url(https://example.com/background.png) top center / 200px" }`
    - `{ "id": "a-gradient", "name": "A Gradient", "css": "linear-gradient(90deg, #ff0000, #00ff00)" }`
- `journal-item-colors.json` - Used by Better Journal's 'Unique item colors' setting to color code journal items.
- `journal-environment-mapping.json` - Used by Journal Changer to map environments to the corresponding journal theme.
- `journal-events.json` - Used by Journal Changer to categorize the event journal themes.
- `library-assignments.json` - Used by Better Quests to enhance the Library Assignments popup.
- `magic-essence-potions.json` - Used by Better Inventory to show warnings on potions that are a bad use of Magic Essence.
- `map-groups.json` - Used by Better Maps to categorize mice on the Sorted map tab.
- `ultimate-checkmark.json` - Used by Ultimate Checkmark to populate the list of items for each category.
- `update-summary.json` - Used to provide a summary of the changes with each update.

## Adding a map to the map sorter/categorizer

To add a new map to the list of automatically sorted/categorized maps, you need to add it to `src/data/map-groups.json`. The format is as follows:

```json
{
  "<map-id>": {
    "categories": [
      {
        "name": "My Category",
        "id": "my-category",
        "icon": "https://example.com/icon.png",
        "color": "#bc4ce3",
        "mice": [
          "mouse-type",
          "another-mouse-type",
          {
            "mouse": "a-mouse-with-a-subcategory",
            "subcategory": "my-subcategory"
          }
        ]
      },
      {
        "name": "Another Category",
        "id": "..."
      }
    ],
    "subcategories": [
      {
        "id": "my-subcategory",
        "name": "My Subcategory",
      }
    ]
  }
}
```

The `categories` array contains the categories that the map should be sorted into. Each category has the following properties:

- `name` - The name of the category.
- `id` - The ID of the category. This should be unique and can only contain lowercase letters, numbers, and dashes.
- `icon` - The URL of the icon to use for the category.
- `color` - A hex color code to use for the category.
- `mice` - An array of mice that should be sorted into this category. Each mouse can either be a string with the mouse type, or an object with the following properties:
  - `mouse` - The mouse type.
  - `subcategory` - The ID of the subcategory to sort the mouse into.

The `subcategories` array is only needed if you have mice that should be sorted into a subcategory. The subcategory object just needs `id` and `name` properties.

> [!TIP]
> Running `bun run fix-map-groups` will go through the mice in the map groups file and replace any mouse names with their mouse types, so you can use the full names like "Mutated Behemoth Mouse" in the file and then run this command to replace them with the mouse types like "mutated_behemoth".

## Building an extension or userscript that interacts with MouseHunt Improved

If you want to build an extension or userscript that is compatible with or interacts with MouseHunt Improved, it is pretty simple to do so. The extension adds `mhui` (containing information about what modules are loaded) and `mhutils` (a collection of utility functions) to the `app` object in the global scope. You can access these from your extension or userscript.

This is how you can check if MouseHunt Improved is loaded and use the utilities:

```javascript
// Listen for the extension to load.
document.addEventListener('mh-improved-loaded', () => {
  // `app.mhui` contains information about what modules are loaded.
  // `window.app.mhutils` contains utility functions that you can use.

  // For example, to do something only if the "Better Maps" module is loaded:
  if (app.mhui.modules.includes('better-maps')) {
    console.log('Better Maps module is loaded!');
  }

  // You can also leverage the utility functions provided by MouseHunt Improved.
  const currentLocation = app.mhutils.getCurrentLocation();
  console.log('Current location:', currentLocation);
});
```

### Example Userscript

```javascript
// ==UserScript==
// @name         My MouseHunt Userscript
// @match        https://www.mousehuntgame.com/*
// ==/UserScript==

(function() {
  'use strict';

  // When the user navigates to the scoreboards page, show a message.
  // This is just an example of how to use the mhutils functions.
  // You can use any of the functions available in mhutils.
  document.addEventListener('mh-improved-loaded', () => {
    app.mhutils.onNavigation(() => {
      app.mhutils.showHornMessage({
        title: "Don't forget!",
        text: "You're always #1!",
        button: 'Got it!',
        dismiss: 5000,
        color: 'pink',
      });
    }, { page: 'scoreboards' });
  });
})();
```
