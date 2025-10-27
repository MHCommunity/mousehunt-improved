import * as esbuild from 'esbuild';
import FastGlob from 'fast-glob';
import fs from 'node:fs';
import { hideBin } from 'yargs/helpers';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import yargs from 'yargs';

const CSSMinifyTextPlugin = {
  name: 'CSSMinifyTextPlugin',
  /**
   * Setup the plugin.
   *
   * @param {Object} build The build object.
   */
  setup(build) {
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
  /**
   * Setup the plugin.
   *
   * @param {Object} build The build object.
   */
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

const JSONMinifyPlugin = {
  name: 'json-minify',
  /**
   * Setup the plugin.
   *
   * @param {Object} build The build object.
   */
  setup(build) {
    build.onLoad({ filter: /\.json$/ }, async (args) => {
      const fileContents = await fs.promises.readFile(args.path, 'utf8');
      const json = JSON.parse(fileContents);
      const minifiedJson = JSON.stringify(json);
      return { contents: minifiedJson, loader: 'json' };
    });
  },
};

/**
 * Minify JSON files in the data folder and write them to data/dist.
 */
const minifyAllJsonFiles = async () => {
  const files = fs.readdirSync('./src/data');
  for (const file of files) {
    if (! file.endsWith('.json')) {
      continue;
    }

    const data = fs.readFileSync(`./src/data/${file}`, 'utf8');
    const json = JSON.parse(data);
    const minified = JSON.stringify(json);

    fs.mkdirSync('./dist/data', { recursive: true });

    fs.writeFileSync(`./dist/data/${file}`, minified);
  }
};

/**
 * Parse the command line arguments.
 *
 * @param {Array} args The command line arguments.
 *
 * @return {Object} The parsed arguments.
 */
const parseArgs = async (args) => {
  return await yargs(hideBin(args))
    .option('platform', {
      type: 'string',
      choices: ['chrome', 'firefox', 'userscript'],
      demandOption: true,
    })
    .option('watch', {
      type: 'boolean',
    })
    .parseAsync();
};

export {
  CSSMinifyTextPlugin,
  JSONMinifyPlugin,
  ImportGlobPlugin,
  parseArgs,
  minifyAllJsonFiles
};
