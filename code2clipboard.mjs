#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import clipboardy from 'clipboardy';
import chalk from 'chalk';
import {
  MAX_FILE_SIZE,
  MAX_FILES,
  MAX_DEPTH,
  EXTENSIONS,
  OMIT_TREE,
  EXPANDED_IGNORE,
  PROJECT_DESCRIPTION,
  OUTPUT_TO_CONSOLE,
  USE_MARKDOWN_DELIMITER,
  argv,
} from './config.mjs';
import micromatch from 'micromatch';
import mime from 'mime-types';
import { isText } from 'istextorbinary';

// Global variables
const matchedFiles = [];
let ignoredFilesCount = 0;
let ignoredDirectoriesCount = 0;
let totalMatchedFilesCount = 0;
const fileExtensionCounts = new Map();

/**
 * Checks if a path should be ignored based on ignore patterns.
 * @param {string} filePath - The file or directory path to check.
 * @returns {boolean} - True if the path should be ignored, false otherwise.
 */
function shouldIgnore(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  return micromatch.isMatch(relativePath, EXPANDED_IGNORE, { dot: true });
}

/**
 * Recursively scans a directory for non-binary files, skipping ignored directories and files.
 * @param {string} dir - The directory to scan.
 * @param {number} depth - The current depth of recursion.
 * @returns {Promise<string[]>} - A promise that resolves with file paths.
 */
async function scanDirectory(dir, depth = 0) {
  if (depth > MAX_DEPTH) return [];

  let files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (shouldIgnore(fullPath)) {
      if (entry.isDirectory()) {
        ignoredDirectoriesCount++;
      } else {
        ignoredFilesCount++;
      }
      continue; // Skip further processing for ignored paths
    }

    if (entry.isDirectory()) {
      files = [...files, ...(await scanDirectory(fullPath, depth + 1))];
    } else if (await isAllowedFile(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Checks if the file is a binary file.
 *
 * @param {string} filePath - The path to the file to check.
 * @returns {Promise<boolean>} - True if the file is binary, otherwise false.
 */
async function isBinaryFile(filePath) {
  const buffer = await fs.readFile(filePath, { encoding: 'utf8', flag: 'r' });
  return !isText(filePath, buffer);
}

/**
 * Checks if a file is allowed based on its extension and size.
 * @param {string} filePath - The file path to check.
 * @returns {Promise<boolean>} - True if the file is allowed, false otherwise.
 */
async function isAllowedFile(filePath) {
  const { size } = await fs.stat(filePath);
  const extension = path.extname(filePath).slice(1);

  // Check if the file is binary.
  const binaryCheck = await isBinaryFile(filePath);
  if (binaryCheck) return false; // Skip binary files.

  const allowed = size <= MAX_FILE_SIZE && (EXTENSIONS.has(extension) || EXTENSIONS.size === 0);
  if (allowed) {
    fileExtensionCounts.set(extension, (fileExtensionCounts.get(extension) || 0) + 1);
  }
  return allowed;
}

/**
 * Reads and formats the content of a file with a path relative to the current working directory,
 * including file metadata and content type for better context.
 * @param {string} filePath - The absolute path to the file.
 * @returns {Promise<string>} - A promise that resolves with the formatted content.
 */
async function formatFileContent(filePath) {
  const stats = await fs.stat(filePath);
  const relativePath = path.relative(process.cwd(), filePath);
  matchedFiles.push(relativePath);
  const content = await fs.readFile(filePath, 'utf8');
  const fileSize = (stats.size / 1024).toFixed(2); // Size in KB
  const lastModified = stats.mtime.toISOString().split('T')[0]; // YYYY-MM-DD format
  const contentType = mime.lookup(filePath) || 'unknown'; // Determine MIME type based on file extension

  // Creating a detailed header for each file, now including content type
  const fileHeader =
    `--------------------------------------------------------------------------------\n` +
    `File: ${relativePath}\n` +
    `Content-Type: ${contentType}, Size: ${fileSize} KB, Last Modified: ${lastModified}\n` +
    `--------------------------------------------------------------------------------`;

  const startComment = USE_MARKDOWN_DELIMITER ? '```' : `//************** Start ${relativePath} **************//`;
  const endComment = USE_MARKDOWN_DELIMITER ? '```' : `//************** End ${relativePath} **************//`;
  return `${fileHeader}\n${startComment}\n${content.trim()}\n${endComment}\n`;
}

/**
 * Builds a tree structure from the given paths and prints it as a string.
 * @param {string[]} paths - An array of paths.
 * @returns {string} - The string representation of the tree structure.
 */
function buildAndPrintTree(paths) {
  const tree = {};

  // Build the tree structure
  paths.forEach((path) => {
    const segments = path.split('/');
    let current = tree;
    segments.forEach((segment, index) => {
      if (!current[segment]) {
        current[segment] = index === segments.length - 1 ? null : {};
      }
      current = current[segment];
    });
  });

  // Function to recursively build the tree string
  function buildTreeString(node, prefix = '') {
    let treeString = '';
    const entries = Object.entries(node);
    entries.forEach(([key, value], index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      treeString += `${prefix}${connector}${key}\n`;
      if (value) {
        treeString += buildTreeString(value, newPrefix);
      }
    });
    return treeString;
  }

  return buildTreeString(tree);
}

/**
 * Logs the current configuration for the file search.
 */
function logSearchConfig(targetDir) {
  console.log(`Configuration:`);
  console.log(`- Directory: ${targetDir}`);
  console.log(`- Max Depth: ${MAX_DEPTH} Max File Size: ${MAX_FILE_SIZE / 1024}kb Max Files: ${MAX_FILES}`);

  if (EXTENSIONS.size > 0) {
    console.log(`- Match Extensions: ${Array.from(EXTENSIONS).join(', ')}`);
  }
}

/**
 * Removes excess line breaks from the given content.
 * @param {string} content - The content from which to remove excess line breaks.
 * @return {string} - The content with excess line breaks removed.
 */
function removeExcessLineBreaks(content) {
  return content.replace(/\n\s*\n\s*\n/g, '\n\n'); // Reduces multiple blank lines down to a single blank line
}

/**
 * Outputs the statistics of file extensions that match the specified criteria.*
 * @return {void}
 */
function outputExtensionStats() {
  // Check if there are any extensions to report
  if (fileExtensionCounts.size === 0) {
    return;
  }

  // Convert Map to Array, sort by count, and prepare for compact display
  const sortedExtensions = Array.from(fileExtensionCounts.entries()).sort((a, b) => b[1] - a[1]);
  const extensionStats = sortedExtensions
    .map(([extension, count]) => `${extension ? extension : 'no extension'}: ${count}`)
    .join(', ');

  console.log(chalk.blue(`Matched extension: ${extensionStats}`));
}

/**
 * Outputs the statistics of the copy function to the console.
 * @param {Awaited<{formattedContent: string, size: number}>[]} formattedContents - The total size of the copied files in kilobytes.
 * @return {void}
 */
function outputStats(formattedContents) {
  const totalSizeKB = formattedContents.reduce((acc, item) => acc + item.size, 0) / 1024;
  const excludedFilesCount = totalMatchedFilesCount - matchedFiles.length; // Calculate excluded files

  if (matchedFiles.length === 0) {
    console.log(chalk.red('No files found.'));
  } else {
    console.log(chalk.green(`${matchedFiles.length} files to the clipboard, totaling ${totalSizeKB.toFixed(2)} KB.`));
  }

  if (ignoredFilesCount > 0 || ignoredDirectoriesCount > 0) {
    console.log(
      chalk.yellow(
        `Skipped ${ignoredFilesCount} files and ${ignoredDirectoriesCount} directories based on the ignore configuration.`,
      ),
    );
  }

  outputExtensionStats();

  if (excludedFilesCount > 0) {
    console.log(
      chalk.red(
        `Maximum number of files copied: ${MAX_FILES.toLocaleString()}. ${excludedFilesCount.toLocaleString()} files were not included due to the max files limit. You can increase this with the --max-files or -f (code2cb -f 200) option.`,
      ),
    );
    console.log(
      chalk.red(
        `To further refine the selection, exclude specific file types with --extensions-ignore or --ei argument (code2cb --ei txt,md,json) or use -i for more complex patterns.`,
      ),
    );
  }
}

/**
 * Main function to execute the script.
 */
async function main() {
  try {
    const targetDir = argv.directory;
    logSearchConfig(targetDir);
    const allMatchedFiles = await scanDirectory(targetDir);
    totalMatchedFilesCount = allMatchedFiles.length;

    // Prune the list of files to the maximum number of files
    const files = allMatchedFiles.slice(0, MAX_FILES);

    const formattedContentsPromises = files.map(async (filePath) => {
      const content = await fs.readFile(filePath, 'utf8');
      return {
        formattedContent: await formatFileContent(filePath),
        size: Buffer.byteLength(content, 'utf8'),
      };
    });

    const formattedContents = await Promise.all(formattedContentsPromises);
    let clipboardContent = formattedContents.map((item) => item.formattedContent).join('\n');

    let header = '';

    if (PROJECT_DESCRIPTION) {
      const descriptionHeader = `Project Description:\n${PROJECT_DESCRIPTION}\n\n`;
      header += descriptionHeader;
    }

    const tree = buildAndPrintTree(matchedFiles);
    if (!OMIT_TREE) {
      const treeFormatted = `\nTree Structure:\n${tree}\n`;
      header += treeFormatted;
    }

    if (header) {
      clipboardContent = `${header}\n${clipboardContent}`;
    }

    clipboardContent = removeExcessLineBreaks(clipboardContent);

    if (OUTPUT_TO_CONSOLE) {
      console.log(clipboardContent);
    }

    if (formattedContents.length > 0) {
      clipboardy.writeSync(clipboardContent);
      console.log(`\nCopied Files:\n${tree}`);
    }
    outputStats(formattedContents);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().then(() => {
  console.log('Run the command with `--help` to see configurable options and defaults.');
});
