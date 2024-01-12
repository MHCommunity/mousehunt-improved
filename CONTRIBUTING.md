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
  - [Code Style](#code-style)
  - [Building](#building)
  - [Testing](#testing)
  - [Updating data files](#updating-data-files)
  - [Adding a map to the map sorter/categorizer](#adding-a-map-to-the-map-sortercategorizer)
  - [Helpful Feature Flags](#helpful-feature-flags)

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

- `src/index.js` The entry point for the extension. This handles module registration and loading.

- `src/modules/utils.js` Utility functions used by the modules.
- `src/modules/mh-utils.js` Forked version of [MouseHunt Utils](https://github.com/MHCommunity/mousehunt-utils), imported into `utils.js` to allow for just one import path in modules.

## How to add a new module

1. Copy `src/modules/module-template` to `src/modules/your-module-name`.
2. In `src/index.js` add the following line to the top of the file:

```javascript
import moduleName from 'modules/your-module-name';
```

3. Edit `const modules = [ ... ]` and add `moduleName` to the list of modules in the section it belongs to.

### Importing utilities

All of the utility functions are in `src/utils/`. They are broken up into different files, but you can import any of them like this:

```javascript
import { addStyles, getCurrentLocation } from '@utils';
```

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

## Updating data files

The `src/data/` folder contains JSON data files that are used by the extension and may need to be updated from time to time.

- `environments-events.json` Environment data for event locations.
- `items-marketplace-hidden.json` List of items to hide in the marketplace, this should be updated with any new premium items that aren't popular/useful or any other items that should be hidden.
- `library-assignments.json` Library Assignments IDs, costs, rewards, etc.
- `m400-locations.json` Location and mice mapping for the M400 library assignment.
- `map-groups.json` Map groups for the map sorter/categorizer.
- `recipes-me-conversion.json` Recipe IDs that should show a Warning message when converting with Magic Essence.
- `recipes-to-reorder.json` Recipe IDs that should be reordered on the crafting page.
- `relic-hunter-hints.json` Mapping of locations and hints for the Relic Hunter mouse.
- `ultimate-checkmark.json` Item lists for the Ultimate Checkmark feature.
- `upscaled-images-skip.json` List of image URLs to skip when upscaling, used by the Image Upscaling module to skip images that don't need to be upscaled. Can contain a wildcard at the end of the URL to match paths.
- `upscaled-images.json` Mapping of image URLs to upscaled image URLs, used by the Image Upscaling module to replace images with upscaled versions.

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

## Helpful Feature Flags

Enabling these feature flags will enable some helpful features for development. You can enable them by adding them to the comma separated list of feature flags in the extension settings.

These will output information to the console, so make sure you have the console open when testing.

- `debug` - Enables debug logging.
- `debug-all` - Enables all of the debug flags below.
- `debug-dialog` - Popup/dialog IDs and events.
- `debug-navigation` - Page, tab, and travel changes.
- `debug-request` - Ajax requests responses.
- `debug-events` - Events fired (can be hooked into with `onEvent`).
