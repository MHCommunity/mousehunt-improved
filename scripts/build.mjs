import * as esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'

let result = await esbuild.buildSync({
  entryPoints: ['src/index.js'],
  outfile: 'dist/better-mh.user.js',
  banner: {
    js: fs.readFileSync(path.join(process.cwd(), 'src/meta.js'), 'utf8').replace('process.env.VERSION', process.env.npm_package_version)
  },
  bundle: true,
  format: 'iife',
  globalName: 'mhui',
  loader: {
    '.css': 'text',
  },
  metafile: true,
  sourcemap: true,
  splitting: false,
  define: {
    EXT_VERSION: JSON.stringify(process.env.npm_package_version),
  }
})

console.log(await esbuild.analyzeMetafile(result.metafile))
