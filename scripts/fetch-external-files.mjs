import fs from 'node:fs';
import path from 'node:path';

const cssFilesToFetch = ['great-winter-hunt-global.css', 'journal-icons.css', 'upscaled-images.css', 'upscaled-journal-theme-images.css', 'upscaled-mice-images.css'];

const onlyIfMissing = process.argv.includes('--skip-external-files');

fs.mkdirSync(path.join(process.cwd(), 'src/extension/static/data'), { recursive: true });

for (const file of cssFilesToFetch) {
  if (onlyIfMissing && fs.existsSync(path.join(process.cwd(), 'src/extension/static', file))) {
    continue;
  }

  const res = await fetch(`https://api.mouse.rip/${file}?cache=${Date.now() + Math.random()}`);
  if (! res.ok) {
    throw new Error(`Failed to fetch '${file}' from api.mouse.rip: ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (! contentType.includes('text/css')) {
    throw new Error(`Refusing to write '${file}': unexpected content-type '${contentType}' from api.mouse.rip`);
  }

  const text = await res.text();

  fs.writeFileSync(path.join(process.cwd(), 'src/extension/static', file), text);
}
