import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

console.log('Syncing external scripts ...\n');

const externalScripts = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'external-scripts.json')));
externalScripts.forEach((script) => {
  const contents = fetch(script.url)
    .then((res) => res.text())
    .then((text) => {
      // Split the text into lines.
      const splitLines = text.split('\n');

      // Find the first line that has 'use strict' in it.
      const useStrictIndex = splitLines.findIndex((line) => line.includes('use strict'));

      // Remove the lines before 'use strict'.
      splitLines.splice(0, useStrictIndex);
      // Remove the 'use strict' line.
      splitLines.splice(0, 1);

      // Remove any blank lines at the start.
      while (splitLines[0] === '') {
        splitLines.shift();
      }

      // Remove any blank lines at the end.
      while (splitLines[splitLines.length - 1] === '') {
        splitLines.pop();
      }

      // Remove the last line, which is the '})();' line.
      splitLines.pop();

      return `export default () => {\n${splitLines.join('\n')}\n};\n`;
    });

  const targetPath = path.join(process.cwd(), 'src', `${script.target}.js`);

  // Create the directory if it doesn't exist.
  if (!fs.existsSync(path.dirname(targetPath))) {
    fs.mkdirSync(path.dirname(targetPath));
  }

  // Write the file.
  contents.then((contents) => {
    fs.writeFile(targetPath, contents, (err) => {
      if (err) {
        console.error(`Failed syncing ${script.target}`);
        console.error(err);
      } else {
        console.log(` ✅️ ${script.target}`);
      }
    });
  });
});
