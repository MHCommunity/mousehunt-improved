import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';

const pexec = util.promisify(exec);

const main = async () => {
  const userscriptsToBuild = JSON.parse(fs.readFileSync(
    path.join(process.cwd(), 'src/data/userscripts.json')
  ));

  for (let userscript of userscriptsToBuild) {
    userscript = {
      name: userscript.name ?? '',
      description: userscript.description ?? ' ',
      icon: userscript.icon ?? 'https://brrad.com/mouse.png',
      version: userscript.version ?? '0.0.0',
      path: userscript.path ?? 'src/index.js',
      url: userscript.url ?? '',
    };

    // For each of the keys, we need to escape any single quotes.
    Object.keys(userscript).forEach((key) => {
      userscript[key] = userscript[key].replaceAll('\'', '@replacement.quote');
    });

    // I need to run 'bun run build-userscript -- userscript.<id>.user.js src/modules/<id>/index.js <name> <description> <icon> <version>'
    const command = [
      'bun run build:userscript',
      '--path', `'"${userscript.path}"'`,
      '--out', `'"userscripts/${userscript.id}.user.js"'`,
      '--name', `'"${userscript.name}"'`,
      '--description', `'"${userscript.description}"'`,
      '--icon', `'"${userscript.icon}"'`,
      '--ver', `'"${userscript.version}"'`,
      '--url', `'"${userscript.url}"'`,
      '--replacementKey', '\'"@require    "\'',
      '--replacementValue', '\'"https://cdn.jsdelivr.net/npm/script-migration@1.1.1"\'',
      '--subuserscript', 'true'
    ].join(' ');

    await pexec(command);
  }
};

await main();
