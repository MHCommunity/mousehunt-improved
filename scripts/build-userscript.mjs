import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

await esbuild.buildSync({
  entryPoints: ['src/index.js'],
  outfile: 'dist/mousehunt-improved.user.js',
  banner: {
    js: fs.readFileSync(
      path.join(process.cwd(), 'src/userscript-header.js'), 'utf8')
      .replace('process.env.VERSION', process.env.npm_package_version)
  },
  bundle: true,
  format: 'iife',
  globalName: 'mhui',
  loader: {
    '.css': 'text',
  },
  metafile: true,
  sourcemap: false,
  splitting: false,
  define: {
    EXT_VERSION: JSON.stringify(process.env.npm_package_version),
  }
});
