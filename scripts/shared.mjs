import * as esbuild from 'esbuild';
import { readFile } from 'node:fs/promises';

const CSSMinifyTextPlugin = {
  name: 'CSSMinifyTextPlugin',
  setup(build) { // eslint-disable-line jsdoc/require-jsdoc
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const f = await readFile(args.path);
      const css = await esbuild.transform(f, {
        loader: 'css',
        minify: true,
      });
      return {
        loader: 'text',
        contents: css.code,
      };
    });
  }
};

const JSONMinifyPlugin = {
  name: 'JSONMinifyPlugin',
  setup(build) { // eslint-disable-line jsdoc/require-jsdoc
    build.onLoad({ filter: /\.json$/ }, async (args) => {
      const f = await readFile(args.path);
      const json = await esbuild.transform(f, {
        loader: 'json',
        minify: true,
      });
      return {
        loader: 'text',
        contents: json.code,
      };
    });
  }
};

const sharedBuildOptions = {
  entryPoints: ['src/index.js'],
  platform: 'browser',
  format: 'iife',
  globalName: 'mhui',
  bundle: true,
  minify: false,
  metafile: true,
  sourcemap: true,
  target: [
    'es6',
    'chrome58',
    'firefox57'
  ],
};

export {
  CSSMinifyTextPlugin,
  JSONMinifyPlugin,
  sharedBuildOptions
};
