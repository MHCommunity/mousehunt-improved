const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const externalScripts = require('../external-scripts.json');

externalScripts.forEach((script) => {
  console.log(`Syncing ${script.target} from ${script.url}`);
  const contents = fetch(script.url)
    .then((res) => res.text())
    .then((text) => {
      // Split the text into lines.
      const splitLines = text.split('\n');

      // Find the first line that has 'use strict' in it.
      const useStrictIndex = splitLines.findIndex((line) => line.includes('use strict'));

      // Remove the lines before 'use strict'.
      splitLines.splice(0, useStrictIndex);

      // Make sure we're removing the trailing blank line and the line before it.
      if (splitLines[splitLines.length - 1] === '') {
        splitLines.pop();
      }

      splitLines.pop();
      return `export default () => {\n${splitLines.join('\n')}\n};\n`;
    });

  const targetPath = path.join(__dirname, '..', 'src', 'modules', 'external', script.target, 'index.js');

  // create the directory if it doesn't exist
  if (!fs.existsSync(path.dirname(targetPath))) {
    fs.mkdirSync(path.dirname(targetPath));
  }

  // write the file
  contents.then((contents) => {
    fs.writeFile(targetPath, contents, (err) => {
      if (err) {
        console.error(`Failed syncing ${script.target}`);
        console.error(err);
      } else {
        console.log(`Synced ${script.target}`);
      }
    });
  });

});
