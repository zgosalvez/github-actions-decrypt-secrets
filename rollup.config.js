const alias = require('@rollup/plugin-alias');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const path = require('path');

const actionsIoPath = path.resolve(__dirname, 'node_modules/@actions/io/lib/io.js');
const actionsIoUtilPath = path.resolve(__dirname, 'node_modules/@actions/io/lib/io-util.js');
const actionsCorePath = path.resolve(__dirname, 'node_modules/@actions/core/lib/core.js');
const actionsOidcUtilsPath = path.resolve(__dirname, 'node_modules/@actions/core/lib/oidc-utils.js');

function onwarn(warning, warn) {
  if (
    warning.code === 'THIS_IS_UNDEFINED' &&
    (warning.id === actionsIoPath || warning.id === actionsIoUtilPath)
  ) {
    return;
  }

  if (
    warning.code === 'CIRCULAR_DEPENDENCY' &&
    Array.isArray(warning.ids) &&
    warning.ids.length === 3 &&
    warning.ids[0] === actionsCorePath &&
    warning.ids[1] === actionsOidcUtilsPath &&
    warning.ids[2] === actionsCorePath
  ) {
    return;
  }

  warn(warning);
}

const plugins = [
  alias({
    entries: [
      {
        find: /^@actions\/io$/,
        replacement: actionsIoPath,
      },
    ],
  }),
  nodeResolve({
    preferBuiltins: true,
  }),
  commonjs(),
];

module.exports = [
  {
    input: 'src/main.js',
    output: {
      file: 'dist/main/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    onwarn,
    plugins,
  },
  {
    input: 'src/post.js',
    output: {
      file: 'dist/post/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    onwarn,
    plugins,
  },
];
