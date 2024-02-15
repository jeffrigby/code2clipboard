import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

/**
 * Default values for configuration options.
 *
 * @type {object}
 * @property {number} MAX_DEPTH - The maximum depth of directory recursion. Default is 5.
 * @property {number} MAX_FILE_SIZE - The maximum file size (in KB) to consider. Default is 100.
 * @property {number} MAX_FILES - The maximum number of files to process. Default is 10.
 * @property {array} ADD_IGNORE - Additional items to be ignored. Default is an empty array.
 * @property {array} ADD_EXTENSIONS - Additional file extensions to be considered. Default is an empty array.
 * @property {array} EXTENSIONS - The file extensions to be considered. Default includes common programming languages/extensions.
 * @property {array} IGNORE - Directories and files to ignore when processing. Default includes common ignored directories/files.
 */
export const config = {
  MAX_DEPTH: process.env.MAX_DEPTH || 5,
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 100,
  MAX_FILES: process.env.MAX_FILES || 10,
  ADD_IGNORE: process.env.ADD_IGNORE ? process.env.ADD_IGNORE : '',
  ADD_EXTENSIONS: process.env.ADD_EXTENSIONS ? process.env.ADD_EXTENSIONS : '',
  OMIT_TREE: process.env.OMIT_TREE === 'true',
  OUTPUT_TO_CONSOLE: process.env.OUTPUT_TO_CONSOLE === 'true',
  USE_MARKDOWN_DELIMITER: process.env.USE_MARKDOWN_DELIMITER === 'true',
  EXTENSIONS: process.env.EXTENSIONS
    ? process.env.EXTENSIONS
    : [
        'js',
        'ts',
        'mjs',
        'cjs',
        'java',
        'c',
        'cpp',
        'cs',
        'py',
        'rb',
        'go',
        'rs',
        'swift',
        'kt',
        'php',
        'lua',
        'html',
        'htm',
        'xml',
        'xhtml',
        'md',
        'markdown',
        'css',
        'scss',
        'sass',
        'less',
        'sh',
        'bash',
        'ps1',
        'bat',
        'cmd',
        'json',
        'yaml',
        'yml',
        'toml',
        'ini',
        'cfg',
        'conf',
        'ejs',
        'pug',
        'hbs',
        'twig',
        'sql',
        'psql',
        'plsql',
        'db',
        'accdb',
        'pl',
        'r',
        'vb',
        'vbs',
        'json5',
        'csv',
        'tsv',
        'groovy',
        'dart',
        'wasm',
        'toml',
        'gradle',
        'properties',
        'rst',
        'wiki',
      ],
  IGNORE: process.env.IGNORE
    ? process.env.IGNORE
    : [
        'node_modules',
        '.git',
        'dist',
        'build',
        'package-lock.json',
        'yarn.lock',
        '.idea',
        '.vscode',
        '.DS_Store',
        'out',
        'bin',
        'obj',
        '.cache',
        'cache',
        'tmp',
        'temp',
        'logs',
        '*.log',
        '.env',
        '.env.local',
        '.env.development',
        '.env.production',
        '*.config.js',
        '*.config.json',
        'secret',
        '*.pem',
        '*.key',
        '__tests__',
        '__mocks__',
        '*.spec.js',
        '*.test.js',
        'bower_components',
        '*.tar.gz',
        '*.zip',
        '*.rar',
        'Thumbs.db',
        'ehthumbs.db',
        'Desktop.ini',
        '.aws-sam',
        'samconfig.toml',
        'coverage',
        'venv',
        '.venv',
        '.npm',
        '.yarn',
        '.history',
        '*.out',
        '*.err',
        '*.dmp',
        '*.bak',
        '.temp',
        '.tmp',
        '.sass-cache',
      ],
};

/**
 * Command-line arguments parsed using yargs.
 * @typedef {Object} Argv
 * @property {number} max-depth - Maximum depth for directory scanning. Defaults to value specified in process.env.MAX_DEPTH or defaults.MAX_DEPTH.
 * @property {number} max-filesize - Maximum file size in kilobytes (KB). Defaults to value specified in process.env.MAX_FILE_SIZE or defaults.MAX_FILE_SIZE.
 * @property {number} max-files - Maximum number of files. Defaults to value specified in process.env.MAX_FILES or defaults.MAX_FILES.
 * @property {string[]} add-ignore - Additional patterns to ignore. Defaults to value specified in process.env.ADD_IGNORE or defaults.ADD_IGNORE.
 * @property {string[]} add-extensions - Additional file extensions to include. Defaults to value specified in process.env.ADD_EXTENSIONS or defaults.ADD_EXTENSIONS.
 * @property {string} directory - Directory to scan. Defaults to current working directory (process.cwd()).
 * @property {string[]} ignore - Override ignore patterns entirely. Defaults to value specified in process.env.IGNORE or defaults.IGNORE.
 * @property {string[]} extensions - Override extensions entirely. Defaults to value specified in process.env.EXTENSIONS or defaults.EXTENSIONS.
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
    describe: 'Additional patterns to ignore. Enter as a comma-separated list of patterns.',
    type: 'string',
    coerce: splitAndTrimCsv,
    default: config.ADD_IGNORE,
  })
  .option('add-extensions', {
    alias: 'e',
    describe: 'Additional file extensions to include. Enter as a comma-separated list of patterns.',
    type: 'string',
    coerce: splitAndTrimCsv,
    default: config.ADD_EXTENSIONS,
  })
  .option('directory', {
    alias: 'dir',
    describe: 'Directory to scan',
    type: 'string',
    default: process.cwd(),
  })
  .option('ignore', {
    alias: 'oi',
    describe: 'Override ignore patterns entirely. Enter as a comma-separated list of patterns.',
    type: 'string',
    coerce: splitAndTrimCsv,
    default: config.IGNORE,
  })
  .option('extensions', {
    alias: 'oe',
    describe: 'Override extensions entirely. Enter as a comma-separated list of patterns.',
    type: 'string',
    coerce: splitAndTrimCsv,
    default: config.EXTENSIONS,
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
    default: '',
  })
  .option('output-to-console', {
    alias: 'c',
    describe: 'Output the copied content to the console instead of the clipboard',
    type: 'boolean',
    default: config.OUTPUT_TO_CONSOLE,
  })
  .option('use-markdown-delimiter', {
    alias: 'md',
    describe: 'Use markdown delimiter for code blocks (may not work with all file types, e.g. .md)',
    type: 'boolean',
    default: config.USE_MARKDOWN_DELIMITER,
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
 * Expands ignore patterns based on given input patterns.
 * @param {string[]} patterns - The input patterns to expand.
 * @return {string[]} - The expanded ignore patterns.
 */
function expandIgnorePatterns(patterns) {
  return patterns.flatMap((pattern) => {
    // For directories (assumed by not having a file extension), ignore the directory and its contents
    if (pattern.endsWith('/') || (!pattern.includes('.') && !pattern.startsWith('*'))) {
      return [`**/${pattern}/**`, `**/${pattern}`];
    }
    // For files or patterns with wildcards, apply them at any depth
    return [`**/${pattern}`];
  });
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
 * The set of allowed extensions for file processing.
 * @type {Set<string>}
 */
export const ALLOWED_EXTENSIONS = new Set(
  argv['add-extensions'].length === 0 ? argv['extensions'] : argv['extensions'].concat(argv['add-extensions']),
);

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
export const EXPANDED_IGNORE = expandIgnorePatterns(IGNORE_FILES);

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

/**
 * Use markdown delimiter for code blocks (may not work with all file types, e.g. .md).
 * @type {boolean}
 */
export const USE_MARKDOWN_DELIMITER = argv['use-markdown-delimiter'];

export { argv };
