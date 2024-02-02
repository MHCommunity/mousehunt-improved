import { CSSMinifyTextPlugin, sharedBuildOptions } from './shared.mjs';

import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const header = fs.readFileSync(
  path.join(process.cwd(), 'src/userscript-header.js'), 'utf8')
  .replace('process.env.VERSION', process.env.npm_package_version);

await esbuild.build({
  ...sharedBuildOptions,
  plugins: [CSSMinifyTextPlugin],
  outfile: 'dist/mousehunt-improved.user.js',
  minify: false,
  sourcemap: true,
  banner: {
    js: [
      header,
      `const mhImprovedVersion = '${process.env.npm_package_version}';`,
      'const mhImprovedPlatform = \'userscript\';',
    ].join('\n'),
  },
});
