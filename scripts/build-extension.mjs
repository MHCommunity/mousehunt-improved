import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import logSymbols from 'log-symbols';
import archiver from 'archiver';

const buildExtension = async (platform) => {
  console.log(`> Building extension for ${platform} version ${process.env.npm_package_version}`);

  // Remove the extension folder if it exists.
  if (fs.existsSync(path.join(process.cwd(), `dist/extension/${platform}`))) {
    fs.rmSync(path.join(process.cwd(), `dist/extension/${platform}`), { recursive: true });
  }

  fs.mkdirSync(path.join(process.cwd(), `dist/extension/${platform}`), { recursive: true });

  // Copy manifest.json and inject the version number.
  const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), `src/extension/manifest-${platform}.json`), 'utf8'));
  manifest.version = process.env.npm_package_version;
  fs.writeFileSync(
    path.join(process.cwd(), `dist/extension/${platform}/manifest.json`),
    JSON.stringify(manifest, null, 2)
  );

  console.log(` ${logSymbols.success} Copied manifest-${platform}.json to ${platform}/manifest.json`);

  // Copy all our files.
  const files = fs.readdirSync(path.join(process.cwd(), 'src/extension'));

  // Ignore any .DS_Store files and other hidden files.
  files.forEach(file => {
    if (
      file.startsWith('.') ||
      (file.startsWith('manifest-') && file.endsWith('.json'))
    ) {
      return;
    }

    // If it's firefox, don't copy the background.js
    if (platform === 'firefox' && file === 'background.js') {
      return;
    }

    fs.copyFileSync(
      path.join(process.cwd(), 'src/extension', file),
      path.join(process.cwd(), `dist/extension/${platform}`, file)
    );
    console.log(` ${logSymbols.success} Copied ${file}`);
  });

  const mhUtils = fs.readFileSync(path.join(process.cwd(), 'node_modules/mousehunt-utils/mousehunt-utils.js'), 'utf8');
  console.log(` ${logSymbols.success} Copied mousehunt-utils.js`);

  // minifiy mhutils
  // const { code } = await esbuild.transform(mhUtils, {
  //   minify: false,
  //   target: 'es2015',
  // });

  await esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    minify: false,
    banner: {
      js: mhUtils,
    },
    outfile: `dist/extension/${platform}/main.js`,
    platform: 'browser',
    metafile: true,
    sourcemap: true,
    define: {
      EXT_VERSION: JSON.stringify(process.env.npm_package_version),
    }
  });

  // Zip up the extension folder.
  const output = fs.createWriteStream(path.join(process.cwd(), `dist/extension/${platform}.zip`));
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  archive.on('error', function(err) {
    throw err;
  });

  archive.pipe(output);

  archive.directory(path.join(process.cwd(), `dist/extension/${platform}`), false);

  await archive.finalize();

  console.log(`\n ${logSymbols.success} Built extension for ${platform} version ${process.env.npm_package_version}\n`);
};

// need to make an output folder that will have manifest.json, the content script, and our popup.html page, and then build src/index.js to content.js
const build = async () => {
  await buildExtension('firefox');
  await buildExtension('chrome');

  console.log(` ${logSymbols.success} Build complete!`);
};

build();
