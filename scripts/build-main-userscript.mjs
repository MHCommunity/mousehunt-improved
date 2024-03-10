import * as esbuild from 'esbuild';

import { CSSMinifyTextPlugin, ImportGlobPlugin } from './shared.mjs';

await esbuild.build({
  entryPoints: ['src/index.js'],
  platform: 'browser',
  format: 'iife',
  globalName: 'mhui',
  bundle: true,
  target: [
    'es6',
    'chrome58',
    'firefox57'
  ],
  plugins: [
    ImportGlobPlugin,
    CSSMinifyTextPlugin
  ],
  outfile: 'dist/mousehunt-improved.user.js',
  minify: false,
  sourcemap: false,
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
  },
});
