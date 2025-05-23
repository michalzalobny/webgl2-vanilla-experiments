const resolve = require('@rollup/plugin-node-resolve');
const swc = require('rollup-plugin-swc').default;
const commonjs = require('@rollup/plugin-commonjs');
const glslify = require('rollup-plugin-glslify');

const isProduction = process.env.NODE_ENV === 'production';

// DEFINE FILE NAMES FROM /src/js-pages TO BE BUILD HERE:
const FILE_NAMES = [
  'debug',
  'particle-physics',
  'particle-forces',
  'particle-drag',
  'attraction',
  'spring',
  'chain',
  'cloth',
  'tutorial',
  'leetcode',
  'instanced-points',
  'instanced-objects',
  'tree-view-mvp',
];

const commonPlugins = [
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

const configs = FILE_NAMES.map((fileName) => ({
  input: `src/js-pages/${fileName}/App.ts`,
  output: {
    dir: `dist/js/${fileName}`,
    format: 'esm',
    sourcemap: !isProduction,
  },
  plugins: commonPlugins,
}));

module.exports = configs;
