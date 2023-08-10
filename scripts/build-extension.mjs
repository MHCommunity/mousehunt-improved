import * as esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'

// need to make an output folder that will have manifest.json, the content script, and our popup.html page, and then build src/index.js to content.js
const build = async () => {
  // make output folder
  fs.mkdirSync(path.join(process.cwd(), 'dist/extension'), { recursive: true })

  // copy manifest.json
  fs.copyFileSync(
    path.join(process.cwd(), 'src/manifest.json'),
    path.join(process.cwd(), 'dist/extension/manifest.json')
  )

  // Copy the popup html and css files.
  fs.copyFileSync(
    path.join(process.cwd(), 'src/extension/popup.html'),
    path.join(process.cwd(), 'dist/extension/popup.html')
  )

  fs.copyFileSync(
    path.join(process.cwd(), 'src/extension/popup.css'),
    path.join(process.cwd(), 'dist/extension/popup.css')
  )

  // Copy the icons.
  fs.mkdirSync(path.join(process.cwd(), 'dist/extension/images'), { recursive: true })

  // Build the content script.
  await esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    minify: true,
    outfile: 'dist/extension/content.js',
    platform: 'browser',
    target: 'chrome58',
    metafile: true,
    sourcemap: true,
    define: {
      EXT_VERSION: JSON.stringify(process.env.npm_package_version),
    }
  })
}
