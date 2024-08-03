import fs from 'node:fs';
import path from 'node:path';

const filesToFetch = [
  'dark-mode-mice-images.css',
  'upscaled-images.css',
  'upscaled-journal-theme-images.css',
  'journal-icons.css',
];

const main = async () => {
  for (const file of filesToFetch) {
    console.log(`Fetching ${file}...`); // eslint-disable-line no-console
    const res = await fetch(`https://api.mouse.rip/${file}`);
    const text = await res.text();

    // Make sure the directory exists.
    fs.mkdirSync(path.join(process.cwd(), 'src/extension/static'), { recursive: true });

    fs.writeFileSync(path.join(process.cwd(), 'src/extension/static', file), text);
  }
};

await main();
