import * as esbuild from 'esbuild';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';

import { CSSMinifyTextPlugin, ImportGlobPlugin, JSONMinifyPlugin, minifyAllJsonFiles } from './shared.mjs';

await minifyAllJsonFiles();

await esbuild.build({
  entryPoints: ['src/index.js'],
  platform: 'browser',
  format: 'iife',
  globalName: 'mhui',
  bundle: true,
  minify: false,
  minifySyntax: true,
  sourcemap: false,
  sourcesContent: false,
  target: [
    'es6',
    'chrome58',
    'firefox57'
  ],
  plugins: [
    ImportGlobPlugin,
    CSSMinifyTextPlugin,
    JSONMinifyPlugin
  ],
  outfile: 'dist/mousehunt-improved.user.js',
  alias: {
    '@data': path.resolve(process.cwd(), 'dist/data'),
  },
  dropLabels: ['excludeFromUserscript'],
  banner: {
    js: [
      '// ==UserScript==',
      '// @name        🐭️ MouseHunt Improved',
      '// @description Improve your MouseHunt experience. Please only use this when the extension is not available.',
      `// @version     ${process.env.npm_package_version}`,
      '// @license     MIT',
      '// @author      bradp',
      '// @namespace   bradp',
      '// @match       https://www.mousehuntgame.com/*',
      '// @icon        https://i.mouse.rip/mh-improved/icon-64.png',
      '// @run-at      document-end',
      '// @grant       none',
      '// ==/UserScript==',
      `const mhImprovedVersion = '${process.env.npm_package_version}';`,
      'const mhImprovedPlatform = \'userscript\';',
    ].join('\n'),
  }
});

const file = fs.readFileSync(path.resolve(process.cwd(), 'dist/mousehunt-improved.user.js'), 'utf8');

// Remove any comment lines that start with `// node_modules` or `// src` (they may start with a space or tab).
const cleaned = file
  .replaceAll(/\s*\/\/\s*(node_modules|src).*/g, '')
  .replaceAll(/^\s+/gm, '');

// write the cleaned file back to disk
fs.writeFileSync(path.resolve(process.cwd(), 'dist/mousehunt-improved.user.js'), cleaned);

if (cleaned.length >= 2097152) { // GreasyFork limit.
  console.warn(chalk.yellow(`⚠ The userscript is too large for GreasyFork. Reduce the size by ${cleaned.length - 2097152} bytes.`)); // eslint-disable-line no-console
}
