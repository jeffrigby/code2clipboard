import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { defaultIgnore } from './defaultIgnore.mjs';
import chalk from 'chalk';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load .env file if it exists
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(chalk.green(`Loading environment variables from ${filePath}`));
    dotenv.config({ path: filePath });
  }
}

// Load .code2clipboard.env from home directory
const homeEnvPath = path.join(os.homedir(), '.code2clipboard.env');
loadEnvFile(homeEnvPath);

// Load .code2clipboard.env from current working directory (or specified directory)
const cwdEnvPath = path.join(process.cwd(), '.code2clipboard.env');
loadEnvFile(cwdEnvPath);

/**
 * Configuration for the software.
 *
 * @typedef {Object} Config
 * @property {number} MAX_DEPTH - The maximum depth to traverse when scanning the file system. Default is 5.
 * @property {number} MAX_FILE_SIZE - The maximum file size in MB that will be processed. Default is 100.
 * @property {number} MAX_FILES - The maximum number of files to process. Default is 100.
 * @property {string} ADD_IGNORE - Additional patterns to ignore when scanning the file system. Default is an empty string.
 * @property {string} EXTENSIONS_IGNORE - File extensions to ignore when scanning the file system. Default is an empty string.
 * @property {string} IGNORE - Patterns to ignore when scanning the file system. If not provided, default patterns will be used.
 * @property {string} ADD_EXTENSIONS - Additional file extensions to include when scanning the file system. Default is an empty string.
 * @property {boolean} OMIT_TREE - Whether to omit the directory tree structure in the output. Default is false.
 * @property {boolean} OUTPUT_TO_CONSOLE - Whether to output the result to the console. Default is false.
 * @property {string} EXTENSIONS - File extensions to include when scanning the file system. If not provided, all file extensions will be allowed.
 * @property {string} PROJECT_DESCRIPTION - Description of the project. Default is an empty string.
 */
export const config = {
  MAX_DEPTH: process.env.MAX_DEPTH || 5,
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 100,
  MAX_FILES: process.env.MAX_FILES || 100,
  ADD_IGNORE: process.env.ADD_IGNORE ? process.env.ADD_IGNORE : '',
  EXTENSIONS_IGNORE: process.env.EXTENSIONS_IGNORE ? process.env.EXTENSIONS_IGNORE : '',
  IGNORE: process.env.IGNORE ? process.env.IGNORE : defaultIgnore,
  ADD_EXTENSIONS: process.env.ADD_EXTENSIONS ? process.env.ADD_EXTENSIONS : '',
  OMIT_TREE: process.env.OMIT_TREE === 'true',
  OUTPUT_TO_CONSOLE: process.env.OUTPUT_TO_CONSOLE === 'true',
  EXTENSIONS: process.env.EXTENSIONS ? process.env.EXTENSIONS : '', // Allow all file extensions by default
  PROJECT_DESCRIPTION: process.env.PROJECT_DESCRIPTION || '',
};

/**
 * The `argv` variable is used to parse and store command line arguments using the yargs library.
 * It provides an easy way to define and handle command line options and arguments.
 *
 * @type {Object}
 * @property {number} max-depth - Maximum depth for directory scanning. Default value is `config.MAX_DEPTH`.
 * @property {number} max-filesize - Maximum file size in kilobytes (KB). Default value is `config.MAX_FILE_SIZE`.
 * @property {number} max-files - Maximum number of files. Default value is `config.MAX_FILES`.
 * @property {string[]} add-ignore - Additional patterns to ignore. Enter as a comma-separated list of patterns. Use * as a wildcard.
 *   Default value is `config.ADD_IGNORE`.
 * @property {string} directory - Directory to scan. Default value is the current working directory.
 * @property {string[]} ignore - Override ignore patterns entirely. Enter as a comma-separated list of patterns. Use * as a wildcard.
 *   Default value is `config.IGNORE`.
 * @property {string[]} extensions - Only copy file matching the extension added here. Enter as a comma-separated list of patterns.
 *   Default value is `config.EXTENSIONS`.
 * @property {string[]} extensions-ignore - Ignore files matching the extension added here. Enter as a comma-separated list of patterns.
 *   Default value is `config.EXTENSIONS_IGNORE`.
 * @property {boolean} omit-tree - Omit the tree from the copied content. Default value is `config.OMIT_TREE`.
 * @property {string} project-description - Provide a brief description of the project. Default value is an empty string.
 * @property {boolean} output-to-console - Output the copied content to the console instead of the clipboard.
 *   Default value is `config.OUTPUT_TO_CONSOLE`.
 * @property {boolean} use-markdown-delimiter - Use markdown delimiter for code blocks (may not work with all file types, e.g. .md).
 *   Default value is `config.USE_MARKDOWN_DELIMITER`.
 */
const argv = yargs(hideBin(process.argv))
  .option('max-depth', {
    alias: 'd',
    describe: 'Maximum depth for directory scanning',
    type: 'number',
    default: config.MAX_DEPTH,
  })
  .option('max-filesize', {
    alias: 's',
    describe: 'Maximum file size in kilobytes (KB)',
    type: 'number',
    default: config.MAX_FILE_SIZE,
  })
  .option('max-files', {
    alias: 'f',
    describe: 'Maximum number of files',
    type: 'number',
    default: config.MAX_FILES,
  })
  .option('add-ignore', {
    alias: 'i',
    describe: 'Additional patterns to ignore. Enter as a comma-separated list of patterns. Use * as a wildcard.',
    type: 'string',
    coerce: splitAndTrimCsv,
    default: config.ADD_IGNORE,
  })
  .option('directory', {
    alias: 'dir',
    describe: 'Directory to scan',
    type: 'string',
    default: process.cwd(),
  })
  .option('ignore', {
    alias: 'oi',
    describe: 'Override ignore patterns entirely. Enter as a comma-separated list of patterns. Use * as a wildcard.',
    type: 'string',
    coerce: splitAndTrimCsv,
    default: config.IGNORE,
  })
  .option('extensions', {
    alias: 'e',
    describe:
      'Only copy files matching the extension added here, this will override the ignore patterns. Enter as a comma-separated list of patterns.',
    type: 'string',
    coerce: splitAndTrimCsv,
    default: config.EXTENSIONS,
  })
  .option('extensions-ignore', {
    alias: 'ei',
    describe: 'Ignore files matching the extension added here. Enter as a comma-separated list of patterns.',
    type: 'string',
    coerce: splitAndTrimCsv,
    default: config.EXTENSIONS_IGNORE,
  })
  .option('omit-tree', {
    alias: 'ot',
    describe: 'Omit the tree from the copied content',
    type: 'boolean',
    default: config.OMIT_TREE,
  })
  .option('project-description', {
    alias: 'pd',
    describe: 'Provide a brief description of the project.',
    type: 'string',
    default: config.PROJECT_DESCRIPTION,
  })
  .option('output-to-console', {
    alias: 'c',
    describe: 'Output the copied content to the console instead of the clipboard',
    type: 'boolean',
    default: config.OUTPUT_TO_CONSOLE,
  })
  .parse();

/**
 * Splits a CSV string into an array with each value trimmed.
 * @param {string|array} csvString The CSV string to split.
 * @return {string[]} An array of trimmed values.
 */
function splitAndTrimCsv(csvString) {
  // Ignore if csvString is already an array
  if (Array.isArray(csvString)) return csvString;

  if (!csvString) return [];
  return csvString.split(',').map((item) => item.trim());
}

/**
 * Filters out patterns for extensions explicitly included by the user.
 * @param {string[]} patterns - The input patterns to filter.
 * @param {Set<string>} includedExtensions - Extensions explicitly passed by the user.
 * @return {string[]} - Filtered patterns.
 */
function filterIncludedExtensions(patterns, includedExtensions) {
  return patterns.filter((pattern) => {
    if (!pattern.startsWith('*.')) return true; // Keep non-extension patterns

    const extension = pattern.slice(2); // Remove '*.' prefix
    if (includedExtensions.has(extension)) {
      console.log(chalk.red(`Excluding '${pattern}' from ignore list as '${extension}' is explicitly included.`));
      return false;
    }
    return true;
  });
}

/**
 * Adds ignore patterns for specified extensions.
 * @param {string[]} patterns - Existing patterns.
 * @param {string[]} extensionsToIgnore - File extensions to ignore.
 * @return {string[]} - Updated patterns including new ignore patterns for extensions.
 */
function addIgnoreExtensions(patterns, extensionsToIgnore) {
  const ignorePatterns = extensionsToIgnore.map((ext) => `**/*.${ext.startsWith('.') ? ext.slice(1) : ext}`);
  return patterns.concat(ignorePatterns);
}

/**
 * Expands ignore patterns for directories to include their contents.
 * @param {string[]} patterns - The patterns to expand.
 * @return {string[]} - Expanded patterns.
 */
function expandDirectoryPatterns(patterns) {
  return patterns.flatMap((pattern) => {
    if (pattern.endsWith('/') || (!pattern.includes('.') && !pattern.startsWith('*'))) {
      // Assume pattern is a directory if it ends with '/' or does not contain '.' and does not start with '*'
      return [`**/${pattern}/**`, `**/${pattern}`];
    }
    return [`**/${pattern}`]; // Apply file or wildcard patterns at any depth
  });
}

/**
 * Expands ignore patterns based on given input patterns, extensions to ignore, and user-specified extensions.
 * @param {string[]} patterns - The input patterns to expand.
 * @param {string[]} ignoreExtensions - Additional file extensions to ignore.
 * @param {Set<string>} userExtensions - The file extensions explicitly passed by the user.
 * @return {string[]} - The expanded ignore patterns.
 */
function expandIgnorePatterns(patterns, ignoreExtensions, userExtensions) {
  let filteredPatterns = patterns;

  if (userExtensions.size > 0) {
    filteredPatterns = filterIncludedExtensions(patterns, userExtensions);
  }

  if (ignoreExtensions.length > 0) {
    filteredPatterns = addIgnoreExtensions(filteredPatterns, ignoreExtensions);
  }

  return expandDirectoryPatterns(filteredPatterns);
}

/**
 * Represents the maximum file size in bytes.
 * @type {number}
 */
export const MAX_FILE_SIZE = argv['max-filesize'] * 1024;

/**
 * Represents the maximum number of files.
 * @type {number}
 */
export const MAX_FILES = argv['max-files'];

/**
 * The maximum depth for a specific operation.
 * @type {number}
 */
export const MAX_DEPTH = argv['max-depth'];

/**
 * Omit the tree from the copied content.
 * @type {boolean}
 */
export const OMIT_TREE = argv['omit-tree'];

/**
 * The set of allowed extensions for file processing. Empty defaults to all file extensions.
 * @type {Set<string>}
 */
export const EXTENSIONS = new Set(argv['extensions'].length > 0 ? argv['extensions'] : '');

/**
 * IGNORE_FILES represents a variable used to store the value of the 'ignore' argument passed through argv.
 * @type {string[]}
 */
export const IGNORE_FILES =
  argv['add-ignore'].length === 0 ? argv['ignore'] : argv['ignore'].concat(argv['add-ignore']);

/**
 * EXPANDED_IGNORE represents a variable used to store the expanded ignore patterns.
 * @type {string[]}
 */
export const EXPANDED_IGNORE = expandIgnorePatterns(IGNORE_FILES, argv['extensions-ignore'], EXTENSIONS);

/**
 * The description of the project.
 * @type {string}
 */
export const PROJECT_DESCRIPTION = argv['project-description'];

/**
 * Output the copied content to the console instead of the clipboard.
 * @type {boolean}
 */
export const OUTPUT_TO_CONSOLE = argv['output-to-console'];

export { argv };
