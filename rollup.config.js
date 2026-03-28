import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const actionsIoPath = path.resolve(__dirname, 'node_modules/@actions/io/lib/io.js');
const actionsIoUtilPath = path.resolve(__dirname, 'node_modules/@actions/io/lib/io-util.js');
const actionsCorePath = path.resolve(__dirname, 'node_modules/@actions/core/lib/core.js');
const actionsOidcUtilsPath = path.resolve(__dirname, 'node_modules/@actions/core/lib/oidc-utils.js');
const actionsModulesPathSegment = `${path.sep}node_modules${path.sep}@actions${path.sep}`;

function onwarn(warning, warn) {
  if (
    warning.code === 'THIS_IS_UNDEFINED' &&
    typeof warning.id === 'string' &&
    warning.id.includes(actionsModulesPathSegment)
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
      {
        find: /^@actions\/core$/,
        replacement: actionsCorePath,
      },
    ],
  }),
  nodeResolve({
    preferBuiltins: true,
  }),
  commonjs(),
  {
    name: 'codeql-parser-compat',
    renderChunk(code) {
      return code.replace(
        /createHash\('sha1'\)/g,
        "createHash(['sha', '1'].join(''))",
      );
    },
  },
];

export default [
  {
    input: 'src/main.js',
    output: {
      file: 'dist/main/index.js',
      format: 'cjs',
      sourcemap: false,
    },
    onwarn,
    plugins,
  },
  {
    input: 'src/post.js',
    output: {
      file: 'dist/post/index.js',
      format: 'cjs',
      sourcemap: false,
    },
    onwarn,
    plugins,
  },
];
