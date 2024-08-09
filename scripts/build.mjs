import { $ } from 'bun'; // eslint-disable-line import/no-unresolved
import archiver from 'archiver';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';

const check = chalk.green('✔');

const buildArchive = async () => {
  console.log('Building archive...'); // eslint-disable-line no-console
  await $`mkdir -p dist`;
  await $`git archive --format zip --output dist/archive.zip HEAD`;
  console.log(`${check} Archive built`); // eslint-disable-line no-console
};

const builCss = async (onlyIfMissing = false) => {
  if (! onlyIfMissing) {
    console.log('Fetching external CSS...'); // eslint-disable-line no-console
  }

  await $`bun run scripts/fetch-external-css.mjs ${onlyIfMissing ? '--only-if-missing' : ''}`;

  if (! onlyIfMissing) {
    console.log(`${check} External CSS fetched`); // eslint-disable-line no-console
  }
};

const buildExtension = async (platform) => {
  await builCss(true);
  console.log(`Building extension for ${platform} ${isRelease ? '(release)' : '...'}`); // eslint-disable-line no-console
  await $`bun run scripts/build-extension.mjs --platform=${platform} ${isRelease ? '--release' : ''}`;
  console.log(`${check} Extension for ${platform} built`); // eslint-disable-line no-console
};

const buildUserscript = async () => {
  console.log('Building userscript...'); // eslint-disable-line no-console
  await $`bun run scripts/build-userscript.mjs --platform=userscript`;
  console.log(`${check} Userscript built`); // eslint-disable-line no-console
};

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

const buildZips = async () => {
  console.log('Zipping extensions...'); // eslint-disable-line no-console

  await Promise.all([
    buildZip('chrome'),
    buildZip('firefox'),
  ]);

  console.log(`${check} Extensions zipped`); // eslint-disable-line no-console
};

const type = process.argv[2];
const isRelease = process.argv[3] === '--release';

if (type === 'archive') {
  await buildArchive();
} else if (type === 'css') {
  await builCss();
} if (type === 'extension') {
  await Promise.all([
    buildExtension('chrome'),
    buildExtension('firefox'),
  ]);
} else if (type === 'chrome') {
  await buildExtension('chrome');
} else if (type === 'firefox') {
  await buildExtension('firefox');
} else if (type === 'userscript') {
  await buildUserscript();
} else if (type === 'zips') {
  await buildZips();
} else {
  await builCss();

  await Promise.all([
    buildArchive(),
    buildExtension('chrome'),
    buildExtension('firefox'),
    buildUserscript(),
  ]);

  await buildZips();
}
