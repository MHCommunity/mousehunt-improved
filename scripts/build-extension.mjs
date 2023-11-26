import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import esBuildCopyPlugin from "@sprout2000/esbuild-copy-plugin";
import { CSSMinifyTextPlugin, sharedBuildOptions } from './shared.mjs';


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

  await esbuild.build({
    ...sharedBuildOptions,
    outfile: `dist/${platform}/main.js`,
    plugins: [
      CSSMinifyTextPlugin,
      esBuildCopyPlugin.copyPlugin({
        src: 'src/extension',
        dest: `dist/${platform}`,
        filter: (file) => {
          // Don't copy the screenshots dir or any dotfiles. We don't copy the manifest
          // because we're copying a modified version of it above.
          return (
            ! file.startsWith('screenshots') &&
            ! file.startsWith('.') &&
            ! file.startsWith('manifest-')
          );
        }
      })
    ],
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

  archive.on('error', function(err) {
    throw err;
  });

  archive.pipe(output);

  archive.directory(path.join(process.cwd(), `dist/${platform}`), false);

  await archive.finalize();
};

buildExtension(process.argv[2]);
