#!/usr/bin/env node

import chalk from 'chalk';
import path from 'path';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import * as rollup from './rollup';
import * as tsc from './tsc';
import { Logger, doesFileExist, readFile } from './utils';

const logger = new Logger('ts-library');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .options({
    prod: {
      type: 'boolean',
      default: false,
      description: 'Build in production mode.',
    },
    buildStrategy: {
      type: 'string',
      default: 'rollup',
      description: `Define build strategy like 'tsc', 'rollup' or 'typesonly'.`,
    },
    analyze: {
      type: 'boolean',
      default: false,
      description: 'Generate bundle analytics.',
    },
    sourcemap: {
      type: 'boolean',
      default: true,
      description: 'Generate sourcemap.',
    },
  })
  .parseSync();

const { buildStrategy, prod: isProduction, analyze, sourcemap } = argv;

async function build() {
  const startTime = Date.now();
  logger.info(`Start building package.`);

  try {
    // Read in additional rollup options
    const rollupConfigPath = path.resolve(process.cwd(), './rollup.config.js');
    const rollupOptions = await readFile<
      rollup.TCreatePackageOptions['rollupOptions']
    >(rollupConfigPath);
    if (rollupOptions != null) {
      logger.info(`Detected rollup.config at ${chalk.green(rollupConfigPath)}`);
    }

    let tsConfigPath: string;
    if (isProduction) {
      tsConfigPath = path.resolve(process.cwd(), './tsconfig.prod.json');
      if (!doesFileExist(tsConfigPath)) {
        tsConfigPath = path.resolve(process.cwd(), './tsconfig.json');
      }
    } else {
      tsConfigPath = path.resolve(process.cwd(), './tsconfig.json');
    }

    // Build package
    switch (buildStrategy) {
      case 'tsc':
        await tsc.compile();
        break;
      case 'rollup':
        await rollup.compileAll(
          rollup.createPackageConfig({
            format: 'esm',
            isProduction,
            preserveModules: true,
            analyze,
            sourcemap,
            rollupOptions: rollupOptions ?? undefined,
            tsconfig: tsConfigPath,
          })
        );
        await rollup.compileAll(
          rollup.createPackageConfig({
            format: 'cjs',
            isProduction,
            preserveModules: true,
            analyze,
            sourcemap,
            rollupOptions: rollupOptions ?? undefined,
            tsconfig: tsConfigPath,
          })
        );
        await tsc.generateDts({ tsconfig: tsConfigPath });
        break;
      case 'typesonly':
        await tsc.generateDts({ tsconfig: tsConfigPath });
        break;
      default:
        logger.error(`Invalid compiler type '${buildStrategy}' chosen!`);
    }

    logger.info(
      `Package was built in ${chalk.green(
        `${((Date.now() - startTime) / 1000).toFixed(2)}s`
      )}.`
    );
  } catch (e: any) {
    logger.error(`Failed to compile package!`);
    console.error(`${e.toString()}\n`, { e });
    process.exit(1);
  }
}

build();
