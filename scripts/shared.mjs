import * as esbuild from 'esbuild';
import FastGlob from 'fast-glob';
import fs from 'node:fs';
import { hideBin } from 'yargs/helpers';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import yargs from 'yargs';

const SVGDataUriPlugin = {
  name: 'SVGDataUriPlugin',
  /**
   * Setup the plugin.
   *
   * @param {Object} build The build object.
   */
  setup(build) {
    build.onLoad({ filter: /\.svg$/ }, async (args) => {
      const svg = await readFile(args.path, 'utf8');
      return {
        contents: svg
          .replaceAll(/\s+/g, ' ')
          .replaceAll('> <', '><')
          .trim(),
        loader: 'dataurl',
      };
    });
  },
};

const CSSMinifyTextPlugin = {
  name: 'CSSMinifyTextPlugin',
  /**
   * Setup the plugin.
   *
   * @param {Object} build The build object.
   */
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = await esbuild.build({
        entryPoints: [args.path],
        bundle: true,
        minify: false,
        write: false,
        loader: {
          '.png': 'dataurl',
        },
        plugins: [SVGDataUriPlugin],
      });
      return {
        loader: 'text',
        contents: css.outputFiles[0].text,
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
        const files = await FastGlob(globPattern);
        files.sort();

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
 * Get the base esbuild options shared by the extension and userscript builds.
 *
 * @param {string} platform The platform to build for.
 *
 * @return {Object} The esbuild options.
 */
const getBaseBuildOptions = (platform) => ({
  entryPoints: ['src/index.js'],
  platform: 'browser',
  format: 'iife',
  globalName: 'mhui',
  bundle: true,
  minify: false,
  target: [
    'es6',
    'chrome58',
    'firefox57'
  ],
  plugins: [
    ImportGlobPlugin,
    CSSMinifyTextPlugin,
    JSONMinifyPlugin,
    SVGDataUriPlugin
  ],
  alias: {
    '@data': path.resolve(process.cwd(), 'dist/data'),
    '@images': path.resolve(process.cwd(), 'src/images'),
  },
  loader: {
    '.png': 'dataurl',
  },
  dropLabels: ['userscript' === platform ? 'excludeFromUserscript' : 'excludeFromExtension'],
  banner: {
    js: [
      `const mhImprovedVersion = '${process.env.npm_package_version}';`,
      `const mhImprovedPlatform = '${platform}';`,
    ].join('\n'),
  },
});

/**
 * Minify JSON files in the data folder and write them to data/dist.
 */
const minifyAllJsonFiles = async () => {
  fs.mkdirSync('./dist/data', { recursive: true });

  const files = fs.readdirSync('./src/data');
  for (const file of files) {
    if (! file.endsWith('.json')) {
      continue;
    }

    const data = fs.readFileSync(`./src/data/${file}`, 'utf8');
    const json = JSON.parse(data);
    const minified = JSON.stringify(json);

    fs.writeFileSync(`./dist/data/${file}`, minified);
  }

  // Combine the per-map files into a single map-groups.json, keyed by filename.
  const mapGroups = {};
  const mapGroupFiles = fs.readdirSync('./src/data/map-groups').filter((file) => file.endsWith('.json')).sort();
  for (const file of mapGroupFiles) {
    const data = fs.readFileSync(`./src/data/map-groups/${file}`, 'utf8');
    mapGroups[path.basename(file, '.json')] = JSON.parse(data);
  }

  fs.writeFileSync('./dist/data/map-groups.json', JSON.stringify(mapGroups));
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
  SVGDataUriPlugin,
  getBaseBuildOptions,
  parseArgs,
  minifyAllJsonFiles
};
