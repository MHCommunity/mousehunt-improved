import archiver from 'archiver';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Zip up the extension folder.
 *
 * @param {string} platform The platform to build the zip for.
 */
const buildZip = async (platform) => {
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

await buildZip('firefox');
await buildZip('chrome');
