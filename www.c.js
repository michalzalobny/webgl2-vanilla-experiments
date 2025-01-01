const resolve = require('@rollup/plugin-node-resolve');
const swc = require('rollup-plugin-swc').default;
const commonjs = require('@rollup/plugin-commonjs');
const glslify = require('rollup-plugin-glslify');

const isProduction = process.env.NODE_ENV === 'production';

// DEFINE FILE NAMES FROM /src/js-pages TO BE BUILD HERE:
const FILE_NAMES = ['debug', 'initial-test'];

const inputFiles = FILE_NAMES.map((fileName) => `src/js-pages/${fileName}/App.ts`);
const outputs = FILE_NAMES.map((fileName) => {
  return {
    file: `dist/js/${fileName}.js`,
    format: 'esm',
    sourcemap: !isProduction,
  };
});

// Common plugins for all files
const plugins = [
  resolve({ extensions: ['.js', '.ts'] }),
  commonjs(),
  glslify({
    include: ['**/*.vs', '**/*.fs', '**/*.vert', '**/*.frag', '**/*.glsl'],
    exclude: 'node_modules/**',
    compress: true,
  }),
  swc({
    jsc: {
      target: 'es2020',
      parser: {
        syntax: 'typescript',
      },
    },
    sourceMaps: !isProduction,
    minify: isProduction,
  }),
];

// Create a configuration for each input file
const configs = inputFiles.map((input) => ({
  input,
  output: outputs, // Same outputs for each input
  plugins, // Shared plugins for all files
}));

module.exports = configs;
