import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import logSymbols from 'log-symbols';

// need to make an output folder that will have manifest.json, the content script, and our popup.html page, and then build src/index.js to content.js
const build = async () => {
  console.log(`> Building extension version ${process.env.npm_package_version}`);

  fs.mkdirSync(path.join(process.cwd(), 'dist/extension'), { recursive: true });

  // Copy manifest.json and inject the version number.
  const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/manifest.json'), 'utf8'))
  manifest.version = process.env.npm_package_version
  fs.writeFileSync(
    path.join(process.cwd(), 'dist/extension/manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log(` ${logSymbols.success} Copied manifest.json`);

  // Copy all our files.
  const files = fs.readdirSync(path.join(process.cwd(), 'src/extension'))
  files.forEach(file => {
    fs.copyFileSync(
      path.join(process.cwd(), 'src/extension', file),
      path.join(process.cwd(), 'dist/extension', file)
    );
    console.log(` ${logSymbols.success} Copied ${file}`);
  })

  // Copy mousehunt-utils.js from node_modules to dist/extension.
  fs.copyFileSync(
    path.join(process.cwd(), 'node_modules/mousehunt-utils/mousehunt-utils.js'),
    path.join(process.cwd(), 'dist/extension/mousehunt-utils.js')
  )
  console.log(` ${logSymbols.success} Copied mousehunt-utils.js`);

  const mhUtils = fs.readFileSync(path.join(process.cwd(), 'node_modules/mousehunt-utils/mousehunt-utils.js'), 'utf8')
  console.log(` ${logSymbols.success} Copied mousehunt-utils.js`);

  await esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    minify: true,
    banner: {
      js: mhUtils,
    },
    outfile: 'dist/extension/main.js',
    platform: 'browser',
    target: 'chrome58',
    metafile: true,
    sourcemap: true,
    define: {
      EXT_VERSION: JSON.stringify(process.env.npm_package_version),
    }
  });

  console.log(` ${logSymbols.success} Built main.js`);
};

build();
