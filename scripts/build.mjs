import { $ } from 'bun'; // eslint-disable-line import/no-unresolved
import archiver from 'archiver';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';

import packageJson from '../package.json' with { type: 'json' };

const check = chalk.green('✔');
const dot = chalk.gray('●');

const buildArchive = async () => {
  console.log(`${dot} Building archive...`); // eslint-disable-line no-console
  await $`mkdir -p dist`;
  await $`git archive --format zip --output dist/archive.zip HEAD`;
  console.log(`${check} Archive built`); // eslint-disable-line no-console
};

const fetchExternalFiles = async (skipExternalFiles = false) => {
  if (! skipExternalFiles) {
    console.log(`${dot} Fetching external CSS...`); // eslint-disable-line no-console
  }

  await $`bun run scripts/fetch-external-files.mjs ${skipExternalFiles ? '--skip-external-files' : ''}`;

  if (! skipExternalFiles) {
    console.log(`${check} External CSS fetched`); // eslint-disable-line no-console
  }
};

const buildExtension = async (platform) => {
  await fetchExternalFiles(true);
  console.log(`${dot} Building extension for ${platform} ...`); // eslint-disable-line no-console
  await $`bun run scripts/build-extension.mjs --platform=${platform}`;
  console.log(`${check} Extension for ${platform} built`); // eslint-disable-line no-console
};

const buildUserscript = async () => {
  console.log(`${dot} Building userscript...`); // eslint-disable-line no-console
  await $`bun run scripts/build-userscript.mjs --platform=userscript`;
  console.log(`${check} Userscript built`); // eslint-disable-line no-console
};

const buildZip = async (platform) => {
  const output = fs.createWriteStream(path.join(process.cwd(), `dist/mousehunt-improved-${platform}.zip`));
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  archive.directory(path.join(process.cwd(), `dist/${platform}/`), false);

  await archive.finalize();
};

const buildZips = async () => {
  console.log(`${dot} Zipping extensions...`); // eslint-disable-line no-console

  await buildZip('chrome');
  await buildZip('firefox');

  console.log(`${check} Extensions zipped`); // eslint-disable-line no-console
};

const type = process.argv[2];

console.log(chalk.bold(`Building MouseHunt Improved v${packageJson.version} (${type || 'all'})`)); // eslint-disable-line no-console

if (type === 'archive') {
  await buildArchive();
  process.exit(0); // eslint-disable-line unicorn/no-process-exit
} else if (type === 'css') {
  await fetchExternalFiles();
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
  process.exit(0); // eslint-disable-line unicorn/no-process-exit
} else {
  await fetchExternalFiles(process.argv.includes('--skip-external-files'));

  await Promise.all([
    buildArchive(),
    buildExtension('chrome'),
    buildExtension('firefox'),
    buildUserscript(),
  ]);

  await buildZips();
}

console.log(chalk.bold.green(`Built MouseHunt Improved v${packageJson.version}`)); // eslint-disable-line no-console
