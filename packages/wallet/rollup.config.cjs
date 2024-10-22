const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const typescript = require('@rollup/plugin-typescript');
const babel = require('@rollup/plugin-babel').babel; 
const nodePolyfills = require('rollup-plugin-node-polyfills');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const sass = require('sass'); // Import the 'sass' package
const wasm = require('@rollup/plugin-wasm');
const dts = require('rollup-plugin-dts').default;
const image = require('@rollup/plugin-image');
const json = require('@rollup/plugin-json');
const { terser } = require('rollup-plugin-terser');
const ignore = require('rollup-plugin-ignore');
const { removeScssImports } = require('./rollupUtils.ts');
const pkg = require('./package.json');

const commonPlugins = [
  peerDepsExternal(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: false,
    noEmitOnError: false,
    exclude: ['**/*.scss', '**/*.css']
  }),

  babel({
    babelHelpers: 'bundled',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    include: ['src/**/*'],
  }),
  nodePolyfills(),
  resolve({
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    browser: true,
    preferBuiltins: false,
  }),
  commonjs({
    include: /node_modules/,
    exclude: ['**/*.scss', '**/*.css'],
  }),
  
  postcss({
    extract: true,
    minimize: true,
    sourceMap: true,
    extensions: ['.css', '.scss'],
    use: [
      [
        'sass',
        {
          includePaths: [
            './src',
            './src/styles',
          ]
        },
      ],
    ],
    plugins: [autoprefixer()],
  }),
  terser(),
  json(),
  wasm(),
  image(),
  ignore(['**/*.scss', '**/*.css']),

];

module.exports = [
  // CommonJS Build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins: commonPlugins,
    external: [
      ...Object.keys(pkg.peerDependencies || {}),
      /^@polkadot\//,
      /^@substrate\//,
      /^react-hot-toast$/,
    ],
  },
  // ES Module Build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/esm/index.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: commonPlugins,
    external: [
      ...Object.keys(pkg.peerDependencies || {}),
      /^@polkadot\//,
      /^@substrate\//,
      /^react-hot-toast$/,
    ],
  },
  // Type Declarations Build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [
      removeScssImports(),
      dts({
        respectExclude: true,

        exclude: [
          'src/variables.scss',
          'src/styles',
          '**/*.scss',
          '**/*.css',
        ],
      }),
      ignore([
        '**/*.scss', 
        '**/*.css']),

    ],
    external: [
      ...Object.keys(pkg.peerDependencies || {}),
      /^@polkadot\//,
      /^@substrate\//,
      /^react-hot-toast$/,
      /\.css$/u,
      /\.scss$/u,
      /\.rollupUtils.ts$/u,

    ],


  },
];
