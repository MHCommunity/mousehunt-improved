import { $ } from 'bun';

const buildArchive = async () => {
  console.log('Building archive...'); // eslint-disable-line no-console
  await $`mkdir -p dist`;
  await $`git archive --format zip --output dist/archive.zip HEAD`;
  console.log('Archive built.'); // eslint-disable-line no-console
};

const buildExtension = async (platform) => {
  console.log(`Building extension for ${platform}...`); // eslint-disable-line no-console
  await $`bun run scripts/build-extension.mjs --platform=${platform}`;
  console.log(`Extension for ${platform} built.`); // eslint-disable-line no-console
};

const buildUserscript = async () => {
  console.log('Building userscript...'); // eslint-disable-line no-console
  await $`bun run scripts/build-userscript.mjs --platform=userscript`;
  console.log('Userscript built.'); // eslint-disable-line no-console
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
  await $`bun run scripts/build-zips.mjs`;

  await Promise.all([
    buildZip('chrome'),
    buildZip('firefox'),
  ]);

  console.log('Extensions zipped.'); // eslint-disable-line no-console
};

const type = process.argv[2];

if (type === 'archive') {
  await buildArchive();
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
  await Promise.all([
    await Promise.all([
      buildArchive(),
      buildExtension('chrome'),
      buildExtension('firefox'),
      buildUserscript(),
    ]),
    await buildZips(),
  ]);
}
