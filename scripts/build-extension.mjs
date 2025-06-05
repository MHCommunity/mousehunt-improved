import * as esbuild from 'esbuild';
import copyPlugin from '@sprout2000/esbuild-copy-plugin'; // eslint-disable-line import/default
import fs from 'node:fs';
import path from 'node:path';

import {
  CSSMinifyTextPlugin,
  ImportGlobPlugin,
  JSONMinifyPlugin,
  minifyAllJsonFiles,
  parseArgs
} from './shared.mjs';

const argv = await parseArgs(process.argv);

/**
 * Main build function.
 *
 * @param {string}  platform The platform to build for.
 * @param {boolean} watch    Whether to watch for changes.
 *
 * @return {Promise<void>} Esbuild build result.
 */
const buildExtension = async (platform, watch = false) => {
  fs.mkdirSync(path.join(process.cwd(), `dist/${platform}`), { recursive: true });

  // Copy manifest.json and inject the version number.
  const manifest = JSON.parse(fs.readFileSync(
    path.join(process.cwd(), 'src/extension/manifest.json'), 'utf8'
  ));

  fs.writeFileSync(
    path.join(process.cwd(), `dist/${platform}/manifest.json`),
    JSON.stringify({
      ...manifest,
      version: process.env.npm_package_version,
    }, null, 2)
  );

  minifyAllJsonFiles();

  const opts = {
    entryPoints: ['src/index.js'],
    platform: 'browser',
    format: 'iife',
    globalName: 'mhui',
    bundle: true,
    minify: true,
    metafile: false,
    sourcemap: true,
    target: [
      'es6',
      'chrome58',
      'firefox57'
    ],
    alias: {
      '@data': path.resolve(process.cwd(), 'dist/data'),
    },
    dropLabels: ['excludeFromExtension'],
    outfile: `dist/${platform}/main.js`,
    plugins: [
      ImportGlobPlugin,
      CSSMinifyTextPlugin,
      JSONMinifyPlugin,
      copyPlugin.copyPlugin({ // eslint-disable-line import/no-named-as-default-member
        src: 'src/extension',
        dest: `dist/${platform}`,
        /**
         * Don't copy the screenshots dir or any dotfiles.
         * We don't copy the manifest because we're copying a modified version of it above.
         *
         * @param {string} file The file to filter.
         *
         * @return {boolean} Whether to filter the file.
         */
        filter: (file) => {
          return (
            ! file.startsWith('src/extension/screenshots') &&
            ! file.startsWith('src/extension/.') &&
            ! file.startsWith('src/extension/manifest') &&
            ! file.startsWith('src/extension/content.js')
          );
        }
      }),
    ],
    banner: {
      js: [
        `const mhImprovedVersion = '${process.env.npm_package_version}';`,
        `const mhImprovedPlatform = '${platform}';`,
      ].join('\n'),
    }
  };

  if (watch) {
    console.log(' Watching for changes...'); // eslint-disable-line no-console
    opts.logLevel = 'info';
    const ctx = await esbuild.context(opts);
    return await ctx.watch();
  }

  await esbuild.build({
    entryPoints: ['src/extension/content.js'],
    platform: 'browser',
    bundle: true,
    minify: false,
    sourcemap: true,
    target: [
      'es6',
      'chrome58',
      'firefox57'
    ],
    outfile: `dist/${platform}/content.js`,
  });

  const result = await esbuild.build(opts);
  fs.writeFileSync(`dist/metafile-${platform}.json`, JSON.stringify(result.metafile, null, 2));
};

await buildExtension(argv.platform, argv.watch, argv.release);
