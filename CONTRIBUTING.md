# Contributing to MouseHunt Improved

Thank you for your interest in contributing to MouseHunt Improved! We welcome contributions from the community to make our project even better.

## Table of Contents

- [Getting Started](#getting-started)
- [Code Style](#code-style)
- [Project Structure](#project-structure)
- [How to add a new module](#how-to-add-a-new-module)
- [Testing](#testing)

## Getting Started

To get started with contributing, please follow these steps:

1. Fork the repository and clone it to your local machine.
   > `git clone git@github.com:mouseplace/mousehunt-improved.git`.

_Replace `mouseplace` with your GitHub username in this command._

2. Install any necessary dependencies
   > `bun install`.

_Note: You can also use `npm install` if you prefer, but we recommend using [`bun`](https://bun.sh/)_

3. Create a new branch for your contribution.

> `git checkout -b your-branch-name`.

4. Make your changes!

5. Commit your changes

   > `git commit -m "Add your commit message here"`

6. Push your changes to your forked repository.

> `git push origin your-branch-name`.

7. Open a [pull request](https://github.com/mouseplace/mousehunt-improved/pulls) to the main repository and provide a clear description of your changes.

## Code Style

To easily keep consistent code style, we use [Prettier](https://prettier.io/) to format our code.

_You can replace `bun` with `npm` if you prefer._

- To check your code style, simply run `bun run lint`
- To automatically fix any issues, run `bun run lint:fix`
- You can lint only JS or CSS files by running `bun run lint:js` or `bun run lint:css`

## Project Structure

The project is structured as follows:

- `src/` All the code.
- `src/data` Data files, such as the image upscaling mapping file.
- `src/extension` Files for building the extensions, such as the manifest files.
- `src/modules` The code for all the different modules.

- `index.js` The entry point for the extension. This handles module registration and loading.

## How to add a new module

1. Copy `src/modules/module-template` to `src/modules/your-module-name`.
2. In `src/index.js` add the following line to the top of the file:

   > `import moduleName from './modules/your-module-name';`

3. Add your module to the settings and loading code in the relevant category, including a description and whether it should be enabled by default.

## Adding an existing userscript as a bundled module

- Edit `src/data/external-scripts.json` with the target folder and a URL of the userscript file.
- The automatic conversion to a module is not perfect, it just grabs the code between `use strict` and the last line, so if your script doesn't have `use strict` at the top, it won't work.

## Testing

You can build a userscript, Chrome extension, or Firefox extension to test your changes.

- `npm run build` to build the userscript and extensions.

- Run `npm run build:userscript` to just build the userscript.

- Run `npm run build:extension` to just build the extensions.

After building, you will find the following files in the `dist/` folder.

- `dist/mousehunt-improved.user.js` The userscript. You can use this to develop locally by installing it in your browser via [Violentmonkey](https://violentmonkey.github.io/) and using the 'Track local file changes' option.

- `dist/chrome/` The Chrome extension. You can load this into Chrome by going to `chrome://extensions` and enabling developer mode, then clicking 'Load unpacked' and selecting the folder.

- `dist/firefox/` The Firefox extension. You can load this into Firefox by going to `about:debugging` and clicking 'Load Temporary Add-on' and selecting the `manifest.json` file.

_For Chrome or Firefox, after making changes, you can reload the extension by clicking the reload button on the extension card._

- `dist/chrome.zip` and `dist/firefox.zip` are the zip files for the Chrome and Firefox extensions respectively. These can be uploaded to the Chrome Web Store and Firefox Add-ons site to publish the extension, so you probably don't need to worry about these.
