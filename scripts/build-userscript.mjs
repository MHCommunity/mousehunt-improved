import fs from 'node:fs';
import path from 'node:path';

import * as esbuild from 'esbuild';

import { CSSMinifyTextPlugin, ImportGlobPlugin } from './shared.mjs';

const build = async (entryfile, outfile, name, description, version, url) => {
  const header = `// ==UserScript==
// @name        🐭️ MouseHunt - @replacement.name
// @description @replacement.description
// @version     @replacement.version
// @license     MIT
// @author      bradp
// @namespace   bradp
// @match       https://www.mousehuntgame.com/*
// @icon        https://i.mouse.rip/mh-improved/icon-64.png
// @run-at      document-end
// @grant       none
// @require     https://cdn.jsdelivr.net/npm/script-migration@1.1.1
// ==/UserScript==
`;

  name = name.replaceAll('@replacement.quote', '\'');
  description = description.replaceAll('@replacement.quote', '\'');

  const options = {
    entryPoints: [entryfile],
    platform: 'browser',
    format: 'iife',
    globalName: 'mhui',
    bundle: true,
    minify: false,
    metafile: true,
    sourcemap: false,
    target: [
      'es6',
      'chrome58',
      'firefox57'
    ],
    plugins: [
      ImportGlobPlugin,
      CSSMinifyTextPlugin
    ],
    outfile: `dist/${outfile}`,
    banner: {
      js: header
        .replaceAll('@replacement.name', name)
        .replaceAll('@replacement.description', description)
        .replaceAll('@replacement.version', version)
    }
  };

  options.footer = {
    js: [
      'mhui.default.load();',
      `migrateUserscript('${name.replaceAll("'", "\\'")}', '${version}', '${url}');`
    ].join('\n')
  };

  options.outfile = `dist/userscripts/${outfile}`;

  return await esbuild.build(options);
};

const main = async () => {
  const userscriptsToBuild = JSON.parse(fs.readFileSync(
    path.join(process.cwd(), 'src/data/userscripts.json')
  ));

  userscriptsToBuild.forEach(async (userscript) => {
    console.log(`Building userscript: ${userscript.id}`); // eslint-disable-line no-console
    userscript = {
      id: userscript.id ?? '',
      name: userscript.name ?? '',
      description: userscript.description ?? ' ',
      icon: userscript.icon ?? 'https://brrad.com/mouse.png',
      version: userscript.version ?? '0.0.0',
      path: userscript.path ?? 'src/index.js',
      url: userscript.url ?? '',
    };

    // For each of the keys, we need to escape any single quotes.
    Object.keys(userscript).forEach((key) => {
      userscript[key] = userscript[key].replaceAll('\'', '@replacement.quote');
    });

    build(
      userscript.path || 'src/index.js',
      `${userscript.id}.user.js` || 'mousehunt-improved.user.js',
      userscript.name || '🐭️ MouseHunt Improved',
      userscript.description || 'Improve your MouseHunt experience. Please only use this when the extension is not available, like on mobile.',
      userscript.version || process.env.npm_package_version,
      userscript.url || ''
    );
  });
};

await main();
