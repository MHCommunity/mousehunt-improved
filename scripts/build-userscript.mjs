import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

import { getBaseBuildOptions, minifyAllJsonFiles } from './shared.mjs';

const version = process.env.npm_package_version;

await minifyAllJsonFiles();

// Build the payload that gets published to npm. The version constants live in
// its banner rather than in the loader because @require'd code runs before
// the userscript body.
await esbuild.build({
  ...getBaseBuildOptions('userscript'),
  outfile: 'dist/mousehunt-improved.min.js',
});

// The userscript itself is just a loader: the code comes from the pinned
// @require URL, which unpkg serves from the matching npm release.
const loader = [
  '// ==UserScript==',
  '// @name        🐭️ MouseHunt Improved',
  '// @description Improve your MouseHunt experience. Please only use this when the extension is not available.',
  `// @version     ${version}`,
  '// @license     MIT',
  '// @author      bradp',
  '// @namespace   bradp',
  '// @match       https://www.mousehuntgame.com/*',
  '// @icon        https://i.mouse.rip/mh-improved/icon-64.png',
  '// @run-at      document-end',
  '// @grant       none',
  `// @require     https://unpkg.com/mousehunt-improved@${version}/dist/mousehunt-improved.min.js`,
  '// ==/UserScript==',
  '//',
  "if ('undefined' === typeof mhui) {",
  "  console.error('MouseHunt Improved failed to load. Check that unpkg.com is not being blocked, or reinstall from https://greasyfork.org/en/scripts/465139-mousehunt-improved');",
  '}',
  '',
].join('\n');

fs.writeFileSync(path.resolve(process.cwd(), 'dist/mousehunt-improved.user.js'), loader);
