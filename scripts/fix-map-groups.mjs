import fs from 'node:fs';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

/* eslint-disable no-console */

/**
 * Read a file.
 *
 * @param {string} filePath The path to the file to read.
 *
 * @return {string} The contents of the file.
 */
const loadFile = async (filePath) => {
  const file = path.resolve(filePath);
  if (! fs.existsSync(file)) {
    console.log(`${filePath} does not exist`);
    throw new Error(`${filePath} does not exist`);
  }

  const f = await readFile(file);
  return JSON.parse(f);
};

/**
 * Check if the mouse name has a replacement in the replacements.json file.
 *
 * @param {string} name The name of the mouse to check.
 *
 * @return {string} The replacement name if it exists, otherwise the original name.
 */
const lookup = (name) => {
  const replacement = replacements.find((r) => {
    return r.name === name || r.name === `${name} Mouse`;
  });

  if (replacement) {
    return replacement.type;
  }
  return name;
};

/**
 * Main function.
 */
const main = async () => {
  // For each of the keys in the json, loop through the categories property and each of the mice in the category. if there's a replacement for it, replace it in the json.
  const groups = Object.keys(mapGroups);
  if (groups.length === 0) {
    console.log('No maps found');
    return;
  }

  console.log(`Checking ${groups.length} maps …`);

  groups.forEach((key) => {
    const categories = mapGroups[key].categories;
    let replacementsMade = 0;
    categories.forEach((category) => {
      category.mice.forEach((mouse) => {
        let replaced = false;
        let replacedName = '';
        let originalName = '';

        if (typeof mouse === 'object') {
          const name = mouse.mouse;
          replacedName = lookup(name);
          if (name !== replacedName) {
            originalName = mouse.mouse;
            mouse.mouse = replacedName;
            replaced = true;
          }
        } else {
          replacedName = lookup(mouse);
          if (mouse !== replacedName) {
            originalName = mouse;
            category.mice[category.mice.indexOf(mouse)] = replacedName;
            replaced = true;
          }
        }

        if (replaced) {
          replacementsMade++;
          console.log(`🐭 Replaced ${originalName} with ${replacedName} in ${category.name} in ${key}`);
        }
      });
    });

    if (replacementsMade > 0) {
      console.log('');
    }

    if (replacementsMade === 0) {
      console.log(`✅️ No fixes needed in ${key}`);
      return;
    }
    console.log(`✅️ Replaced ${replacementsMade} mice in ${categories.length} categories in ${key}`);
  });

  // write the json back to the src/data/map-groups.json file
  fs.writeFileSync(mapGroupsPath, JSON.stringify(mapGroups, null, 2));
  console.log('Done!');
};

const mapGroupsPath = './src/data/map-groups.json';
const mapGroups = await loadFile(mapGroupsPath);
const replacements = await loadFile('./src/data/mice.json');

await main();
/* eslint-enable no-console */
