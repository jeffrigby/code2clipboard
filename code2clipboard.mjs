#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import clipboardy from 'clipboardy';
import {
  MAX_FILE_SIZE,
  MAX_FILES,
  MAX_DEPTH,
  ALLOWED_EXTENSIONS,
  OMIT_TREE,
  EXPANDED_IGNORE,
  PROJECT_DESCRIPTION,
  OUTPUT_TO_CONSOLE,
  argv,
} from './config.mjs';
import micromatch from 'micromatch';
import mime from 'mime-types';
import { isText } from 'istextorbinary';

const matchedFiles = [];

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
    if (shouldIgnore(fullPath)) continue;

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

  return size <= MAX_FILE_SIZE && ALLOWED_EXTENSIONS.has(extension);
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
    `Content Type: ${contentType}, Size: ${fileSize} KB, Last Modified: ${lastModified}\n` +
    `--------------------------------------------------------------------------------`;

  const useMarkdownDelimiter = argv['use-markdown-delimiter'];
  const startComment = useMarkdownDelimiter ? '```' : `//************** Start ${relativePath} **************//`;
  const endComment = useMarkdownDelimiter ? '```' : `//************** End ${relativePath} **************//`;

  return `${fileHeader}\n${startComment}\n${content.trim()}\n${endComment}\n`;
}

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
  console.log(`- Max Depth: ${MAX_DEPTH} File Size: ${MAX_FILE_SIZE / 1024}kb Files: ${MAX_FILES}`);
  // console.debug(`- Extensions: ${[...EXPANDED_IGNORE].join(', ')}`);
  // console.debug(`- Ignore Patterns: ${IGNORE_FILES.join(', ')}`);
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
 * Main function to execute the script.
 */
async function main() {
  try {
    const targetDir = argv.directory;
    logSearchConfig(targetDir);
    const files = (await scanDirectory(targetDir)).slice(0, MAX_FILES);
    const formattedContentsPromises = files.map(async (filePath) => {
      const content = await fs.readFile(filePath, 'utf8');
      return {
        formattedContent: await formatFileContent(filePath),
        size: Buffer.byteLength(content, 'utf8'),
      };
    });

    const formattedContents = await Promise.all(formattedContentsPromises);
    let clipboardContent = formattedContents.map((item) => item.formattedContent).join('\n');
    const totalSizeKB = formattedContents.reduce((acc, item) => acc + item.size, 0) / 1024;

    let header = '';

    if (PROJECT_DESCRIPTION) {
      const descriptionHeader = `Project Description:\n${PROJECT_DESCRIPTION}\n\n`;
      header += descriptionHeader;
    }

    const tree = buildAndPrintTree(matchedFiles);
    if (!OMIT_TREE) {
      const treeFormatted = `Tree Structure\n\`\`\`\n${tree}\`\`\`\n`;
      header += treeFormatted;
    }

    if (header) {
      clipboardContent = `${header}\n${clipboardContent}`;
    }

    clipboardContent = removeExcessLineBreaks(clipboardContent);

    if (OUTPUT_TO_CONSOLE) {
      console.log(clipboardContent);
    }
    clipboardy.writeSync(clipboardContent);
    console.log(`\nCopied Files:\n${tree}`);
    console.log(`${matchedFiles.length} files to the clipboard, totaling ${totalSizeKB.toFixed(2)} KB.`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().then(() => {
  console.log('Run the command with `--help` to see configurable options and defaults.');
});
