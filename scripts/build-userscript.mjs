import * as esbuild from 'esbuild';
import yargs from 'yargs';

import { CSSMinifyTextPlugin, ImportGlobPlugin } from './shared.mjs';

const main = async (entryfile, outfile, name, description, icon, version, url, replacementKey, replacementValue, subuserscript) => {
  const header = `// ==UserScript==
// @name        🐭️ MouseHunt - @replacement.name
// @description @replacement.description
// @version     @replacement.version
// @license     MIT
// @author      bradp
// @namespace   bradp
// @match       https://www.mousehuntgame.com/*
// @icon        @replacement.icon
// @replacement.key @replacement.value
// @run-at      document-end
// @grant       none
// ==/UserScript==
`;

  if ('-' === replacementKey) {
    replacementKey = '';
  }

  if ('-' === replacementValue) {
    replacementValue = '';
  }

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
        .replaceAll('@replacement.icon', icon)
        .replaceAll('@replacement.version', version)
        .replaceAll('@replacement.key', replacementKey)
        .replaceAll('@replacement.value', replacementValue)
    }
  };

  if (subuserscript) {
    options.footer = {
      js: [
        'mhui.default.load();',
        `migrateUserscript('${name}', '${url}');`,
      ].join('\n')
    };

    options.outfile = `dist/userscripts/${outfile}`;
  }

  return await esbuild.build(options);
};

const argv = yargs(process.argv.slice(2)).parse();

await main(
  argv.path ?? 'src/index.js',
  argv.out ?? 'mousehunt-improved.user.js',
  argv.name ?? '🐭️ MouseHunt Improved',
  argv.description ?? 'Improve your MouseHunt experience. Please only use this when the extension is not available, like on mobile.',
  argv.icon ?? 'https://i.mouse.rip/mh-improved/icon-64.png',
  argv.ver ?? process.env.npm_package_version,
  argv.url ?? '',
  argv.replacementKey ?? '',
  argv.replacementValue ?? '',
  argv.subuserscript ?? false
);
