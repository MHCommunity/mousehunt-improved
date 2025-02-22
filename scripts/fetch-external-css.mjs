import fs from 'node:fs';
import path from 'node:path';

const filesToFetch = [
  'dark-mode-mice-images.css',
  'journal-icons.css',
  'upscaled-images.css',
  'upscaled-journal-theme-images.css',
  'upscaled-mice-images.css',
];

const main = async (onlyIfMissing = false) => {
  fs.mkdirSync(path.join(process.cwd(), 'src/extension/static'), { recursive: true });

  for (const file of filesToFetch) {
    if (onlyIfMissing && fs.existsSync(path.join(process.cwd(), 'src/extension/static', file))) {
      continue;
    }

    const res = await fetch(`https://static.mouse.rip/${file}?cache=${Date.now() + Math.random()}`);
    const text = await res.text();

    fs.writeFileSync(path.join(process.cwd(), 'src/extension/static', file), text);
  }
};

await main(process.argv[2] === '--only-if-missing');
