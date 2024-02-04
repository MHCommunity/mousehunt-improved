import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';

import FastGlob from 'fast-glob';

const userscriptHeader = `// ==UserScript==
// @name        __NAME__
// @description __DESCRIPTION__
// @version     process.env.VERSION
// @license     MIT
// @author      bradp
// @namespace   bradp
// @match       https://www.mousehuntgame.com/*
// @icon        https://i.mouse.rip/mh-improved/icon-64.png
// @run-at      document-end
// @grant       none
// ==/UserScript==`;

const build = async () => {
  return new Promise((resolve, reject) => {
    exec('npm run build:userscript', (error) => {
      if (error) {
        console.error(`exec error: ${error}`); // eslint-disable-line no-console
        reject(error);
        return;
      }
      resolve();
    });
  });
};

const copyFile = async (from, to) => {
  return fs.copyFile(from, to);
};

const main = async () => {
  await fs.mkdir('dist/userscripts', { recursive: true });
  await copyFile('src/index.js.bak', 'src/index.js');
  await copyFile('src/userscript-header.js.bak', 'src/userscript-header.js');

  await build();

  await copyFile('src/index.js', 'src/index.js.bak');
  await copyFile('src/userscript-header.js', 'src/userscript-header.js.bak');
  await copyFile('dist/mousehunt-improved.user.js', 'dist/mousehunt-improved.user.js.bak');

  // get a list of all the modules
  let modules = await FastGlob('src/modules/*', { onlyDirectories: true });
  modules = modules.map((module) => module.split('/').pop());

  for (const module of modules) {
    const modulePath = `src/modules/${module}/index.js`;
    const moduleFile = await fs.readFile(modulePath, 'utf8');
    const moduleExport = moduleFile.match(/export default (async )?/);
    const moduleDetails = moduleFile.slice(moduleExport.index + moduleExport[0].length)
      .replaceAll(/load:.*\n/g, '')
      .replaceAll(/settings.*\n/g, '')
      .replaceAll(';', '')
      .trim();

    const obj = eval(`(${moduleDetails})`); // eslint-disable-line no-eval
    if (obj.type === 'required') {
      continue;
    }

    console.log(`Building userscript for ${module}`); // eslint-disable-line no-console

    const userscript = userscriptHeader
      .replace('__NAME__', module.name)
      .replace('__DESCRIPTION__', module.description);

    // remove all non-alphanumeric characters from the module id
    const moduleSlug = module.id.replaceAll(/[^\dA-Za-z]/g, '');
    let updatedIndexFile = '';
    updatedIndexFile += `import ${moduleSlug} from './modules/${module.id}'\n`;
    updatedIndexFile += `${moduleSlug}.load();\n`;

    await fs.writeFile('src/index.js', updatedIndexFile);

    await fs.writeFile('src/userscript-header.js', userscript);
    await build();

    const userscriptFile = await fs.readFile('dist/mousehunt-improved.user.js', 'utf8');
    const updatedUserscriptFile = userscriptFile
      .replace(/const mhImprovedVersion = '.*';\n/, '')
      .replace(/const mhImprovedPlatform = '.*';\n/, '');

    await fs.writeFile(`dist/userscripts/${module.id}.user.js`, updatedUserscriptFile);

    await copyFile('src/index.js.bak', 'src/index.js');
    await copyFile('src/userscript-header.js.bak', 'src/userscript-header.js');
    await copyFile('dist/mousehunt-improved.user.js.bak', 'dist/mousehunt-improved.user.js');
  }

  // remove the backup files
  await fs.unlink('src/index.js.bak');
  await fs.unlink('src/userscript-header.js.bak');
  await fs.unlink('dist/mousehunt-improved.user.js.bak');

  console.log('🎉️ All done! 🎉️'); // eslint-disable-line no-console
};

await main();
