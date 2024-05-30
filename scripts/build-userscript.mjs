import * as esbuild from 'esbuild';

import { CSSMinifyTextPlugin, ImportGlobPlugin, parseArgs } from './shared.mjs';

const argv = await parseArgs(process.argv);

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
  minifySyntax: true,
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
  define: {
    __SENTRY_DSN__: JSON.stringify(argv.release ? 'https://a677b0fe4d2fbc3a7db7410353d91f39@o4506582061875200.ingest.sentry.io/4506781071835136' : ''),
  }
});
