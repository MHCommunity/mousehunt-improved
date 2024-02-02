// eslint-disable-next-line import/no-extraneous-dependencies
import { sentryEsbuildPlugin } from '@sentry/esbuild-plugin';

import { CSSMinifyTextPlugin, sharedBuildOptions } from './shared.mjs';

import * as esbuild from 'esbuild';
import archiver from 'archiver';
import copyPlugin from '@sprout2000/esbuild-copy-plugin'; // eslint-disable-line import/default
import fs from 'node:fs';
import path from 'node:path';

/**
 * Main build function.
 *
 * @param {string} platform The platform to build for.
 */
const buildExtension = async (platform) => {
  fs.mkdirSync(path.join(process.cwd(), `dist/${platform}`), { recursive: true });

  // Copy manifest.json and inject the version number.
  const manifest = JSON.parse(fs.readFileSync(
    path.join(process.cwd(), `src/extension/manifest-${platform}.json`), 'utf8'
  ));

  fs.writeFileSync(
    path.join(process.cwd(), `dist/${platform}/manifest.json`),
    JSON.stringify({
      ...manifest,
      version: process.env.npm_package_version,
    }, null, 2)
  );

  const plugins = [
    CSSMinifyTextPlugin,
    copyPlugin.copyPlugin({ // eslint-disable-line import/no-named-as-default-member
      src: 'src/extension',
      dest: `dist/${platform}`,
      filter: (file) => { // eslint-disable-line jsdoc/require-jsdoc
        // Don't copy the screenshots dir or any dotfiles. We don't copy the manifest
        // because we're copying a modified version of it above.
        return (
          ! file.startsWith('screenshots') &&
          ! file.startsWith('.') &&
          ! file.startsWith('manifest-')
        );
      }
    }),
  ];

  // If we're building for production, add the Sentry plugin.
  if ('production' === process.env.NODE_ENV) {
    plugins.push(sentryEsbuildPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'brad-parbs',
      project: 'mh-improved',
      telemetry: false,
      release: {
        name: `mousehunt-improved@${process.env.npm_package_version}`,
      }
    }));
  }

  await esbuild.build({
    ...sharedBuildOptions,
    outfile: `dist/${platform}/main.js`,
    plugins,
    banner: {
      js: [
        `const mhImprovedVersion = '${process.env.npm_package_version}';`,
        `const mhImprovedPlatform = '${platform}';`,
      ].join('\n'),
    },
  });

  // Zip up the extension folder.
  const output = fs.createWriteStream(path.join(process.cwd(), `dist/${platform}.zip`));
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  archive.directory(path.join(process.cwd(), `dist/${platform}`), false);

  await archive.finalize();
};

await buildExtension(process.argv[2]);
