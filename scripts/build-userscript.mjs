import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { CSSMinifyTextPlugin, sharedBuildOptions } from './shared.mjs';


const header = fs.readFileSync(
  path.join(process.cwd(), 'src/userscript-header.js'), 'utf8')
  .replace('process.env.VERSION', process.env.npm_package_version);

await esbuild.build({
  ...sharedBuildOptions,
  plugins: [CSSMinifyTextPlugin],
  outfile: `dist/mousehunt-improved.user.js`,
  minify: false,
  sourcemap: false,
  banner: {
    js: [
      header,
      `const mhImprovedVersion = '${process.env.npm_package_version}';`,
      `const mhImprovedPlatform = 'userscript';`,
    ].join('\n'),
  },
});
