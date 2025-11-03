import fs from 'node:fs';
import path from 'node:path';

const cssFilesToFetch = [
  'dark-mode-mice-images.css',
  'great-winter-hunt-global.css',
  'journal-icons.css',
  'upscaled-images.css',
  'upscaled-journal-theme-images.css',
  'upscaled-mice-images.css',
];

const onlyIfMissing = process.argv.includes('--skip-external-files');

fs.mkdirSync(path.join(process.cwd(), 'src/extension/static/data'), { recursive: true });

for (const file of cssFilesToFetch) {
  if (onlyIfMissing && fs.existsSync(path.join(process.cwd(), 'src/extension/static', file))) {
    continue;
  }

  const res = await fetch(`https://api.mouse.rip/${file}?cache=${Date.now() + Math.random()}`);
  const text = await res.text();

  fs.writeFileSync(path.join(process.cwd(), 'src/extension/static', file), text);
}
