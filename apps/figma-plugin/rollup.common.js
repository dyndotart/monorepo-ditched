import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';

const isProduction = false;

// Reads and parses the dotenv file using the `dotenv` package
function parseDotenv(filePath) {
  const data = fs.readFileSync(filePath);
  const parsed = dotenv.parse(data);

  // Wrap values with quotes to handle strings containing special characters (required for replace plugin)
  const env = {};
  for (const key in parsed) {
    env[`process.env.${key}`] = JSON.stringify(parsed[key]);
  }

  return env;
}

/** @type {import('rollup').RollupOptions} */
const sharedPlugins = {
  start: [
    // Replace process.env.NODE_ENV with 'production' or 'development'
    replace({
      preventAssignment: true,
      'process.env.npm_package_version': JSON.stringify(
        require('./package.json').version
      ),
      'process.env.NODE_ENV': JSON.stringify(
        isProduction ? 'production' : 'development'
      ),
    }),
    // Resolve and bundle dependencies from node_modules
    nodeResolve(),
    // Convert CommonJS modules (e.g. from node_module packages) to ES modules what is used in this app
    commonjs(),
    // TypeScript compilation
    typescript({
      tsconfig: path.resolve('./tsconfig.json'),
      exclude: /node_modules/,
    }),
  ],
  end: [
    // Minify JavaScript in production
    isProduction && terser(),
  ],
};

export default [
  // Configuration for background code
  {
    input: path.resolve('./src/background/index.ts'),
    output: {
      file: 'dist/code.js',
      format: 'cjs',
      sourcemap: false,
    },
    plugins: [
      // Parse environment variables
      replace({
        preventAssignment: true,
        ...parseDotenv(path.resolve('./.env.background')),
      }),
      ...sharedPlugins.start,
      ...sharedPlugins.end,
    ],
    external: ['react', 'react-dom'],
  },
  // Configuration for UI code
  {
    input: path.resolve('./src/ui/index.tsx'),
    output: {
      file: 'dist/ui.js',
      format: 'iife',
      sourcemap: false,
    },
    plugins: [
      // Parse environment variables
      replace({
        preventAssignment: true,
        ...parseDotenv(path.resolve('./.env.ui')),
      }),
      ...sharedPlugins.start,
      // Generate HTML file with injected bundle
      html({
        fileName: `ui.html`,
        template(options) {
          return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Your Name</title>
  </head>
  <body>
    <script>${options?.bundle[`ui.js`]['code']}</script>
    <div id="root" />
  </body>
</html>
        `;
        },
      }),
      // Process and bundle CSS files
      postcss({
        config: {
          path: './postcss.config.js',
          ctx: {},
        },
        extract: 'dist/ui.css',
        minimize: isProduction,
        sourceMap: !isProduction,
      }),
      // Copy static files to output folder
      copy({
        targets: [
          {
            src: 'manifest.json',
            dest: 'dist',
          },
        ],
      }),
      ...sharedPlugins.end,
    ],
  },
];
