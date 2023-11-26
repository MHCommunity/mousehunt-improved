import * as esbuild from 'esbuild';
import { readFile } from "fs/promises"

export const CSSMinifyTextPlugin = {
  name: "CSSMinifyTextPlugin",
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const f = await readFile(args.path)
      const css = await esbuild.transform(f, {
        loader: 'css',
        minify: true,
      })
      return {
        loader: 'text',
        contents: css.code,
      }
    })
  }
};
export const sharedBuildOptions = {
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
