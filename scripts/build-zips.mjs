import archiver from 'archiver';
import fs from 'node:fs';
import path from 'node:path';

const buildZip = async (platform) => {
  // Zip up the extension folder.
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
