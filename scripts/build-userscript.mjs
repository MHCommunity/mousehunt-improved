import { sentryEsbuildPlugin } from '@sentry/esbuild-plugin';

import { CSSMinifyTextPlugin, sharedBuildOptions } from './shared.mjs';

import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const header = fs.readFileSync(
  path.join(process.cwd(), 'src/userscript-header.js'), 'utf8')
  .replace('process.env.VERSION', process.env.npm_package_version);

const plugins = [
  CSSMinifyTextPlugin,
];

// If we're building for production, add the Sentry plugin.
if ('production' === process.env.NODE_ENV) {
  plugins.push(sentryEsbuildPlugin({
    authToken: process.env.SENTRY_AUTH_TOKEN,
    org: 'brad-parbs',
    project: 'mh-improved',
    telemetry: false,
    release: {
      name: `mousehunt-improved-userscript@${process.env.npm_package_version}`,
    }
  }));
}

await esbuild.build({
  ...sharedBuildOptions,
  plugins,
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
