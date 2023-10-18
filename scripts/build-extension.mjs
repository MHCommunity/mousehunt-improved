import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const buildExtension = async (platform) => {
  // Remove the files inside the dist/<platform> folder.
  if (fs.existsSync(path.join(process.cwd(), `dist/${platform}`))) {
    fs.rmSync(path.join(process.cwd(), `dist/${platform}`), { recursive: true });
  }

  fs.mkdirSync(path.join(process.cwd(), `dist/${platform}`), { recursive: true });

  // Copy manifest.json and inject the version number.
  const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), `src/extension/manifest-${platform}.json`), 'utf8'));
  manifest.version = process.env.npm_package_version;
  fs.writeFileSync(
    path.join(process.cwd(), `dist/${platform}/manifest.json`),
    JSON.stringify(manifest, null, 2)
  );

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

    // if its a directory, don't copy it
    if (fs.lstatSync(path.join(process.cwd(), 'src/extension', file)).isDirectory()) {
      return;
    }

    fs.copyFileSync(
      path.join(process.cwd(), 'src/extension', file),
      path.join(process.cwd(), `dist/${platform}`, file)
    );
  });

  const mhutils = await esbuild.build({
    entryPoints: ['node_modules/mousehunt-utils/mousehunt-utils.js'],
    minify: true,
    platform: 'browser',
    keepNames: true,
    define: {
      EXT_VERSION: JSON.stringify(process.env.npm_package_version),
    },
    write: false
  });

  // Build the content script.
await esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    minify: true,
    outfile: `dist/${platform}/main.js`,
    platform: 'browser',
    format: 'iife',
    globalName: 'mhui',
    loader: {
      '.css': 'text',
    },
    metafile: true,
    sourcemap: true,
    define: {
      EXT_VERSION: JSON.stringify(process.env.npm_package_version),
    },
    banner: {
      js: mhutils.outputFiles[0].text,
    },
  });

  console.log(`Built extension for ${platform}`);


  // Zip up the extension folder.
  const output = fs.createWriteStream(path.join(process.cwd(), `dist/${platform}.zip`));
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  archive.on('error', function(err) {
    throw err;
  });

  archive.pipe(output);

  archive.directory(path.join(process.cwd(), `dist/${platform}`), false);

  await archive.finalize();

  console.log(`Zipped extension for ${platform}`);
};

const platform = process.argv[2];
console.log(`Building ${platform} extension for version ${process.env.npm_package_version}`);

buildExtension(platform);
