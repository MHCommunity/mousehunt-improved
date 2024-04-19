import * as esbuild from 'esbuild';
import FastGlob from 'fast-glob';
import fs from 'node:fs';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const CSSMinifyTextPlugin = {
  name: 'CSSMinifyTextPlugin',
  setup(build) { // eslint-disable-line jsdoc/require-jsdoc
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const f = await readFile(args.path);
      const css = await esbuild.transform(f, {
        loader: 'css',
        minify: true,
      });
      return {
        loader: 'text',
        contents: css.code,
      };
    });
  }
};

const ImportGlobPlugin = {
  name: 'ImportGlobPlugin',
  setup(build) {
    build.onLoad({ filter: /\.js$/ }, async (args) => {
      let contents = fs.readFileSync(args.path, 'utf8');

      const matches = contents.match(/import \* as imported from '(.*)';/);
      if (matches) {
        const globPattern = path.resolve(path.dirname(args.path), matches[1]).replaceAll('\\', '/');
        const files = (
          await FastGlob(globPattern)
        );

        let importStatements = '';
        const importNames = [];

        for (const [index, file] of files.entries()) {
          const relativePath = path.relative(path.dirname(args.path), file).replaceAll('\\', '/');
          const importName = `imported${index}`;
          importStatements += `import ${importName} from './${relativePath}';\n`;
          importNames.push(importName);
        }

        importStatements += `const imported = [${importNames.join(', ')}];\n`;

        contents = contents.replace(matches[0], importStatements);
      }

      return {
        contents,
        loader: 'js',
      };
    });
  },
};

export {
  CSSMinifyTextPlugin,
  ImportGlobPlugin
};
