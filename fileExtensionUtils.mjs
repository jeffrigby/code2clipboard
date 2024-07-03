import path from 'path';
import mime from 'mime-types';

/**
 * Map that maps file extensions to corresponding language names for code highlighting in markdown files.
 * @type {Map<string, string>}
 */
const markdownCodeBlockTypeMap = new Map([
  // Web technologies
  ['html', 'html'],
  ['htm', 'html'],
  ['xml', 'xml'],
  ['css', 'css'],
  ['scss', 'scss'],
  ['sass', 'sass'],
  ['less', 'less'],
  ['js', 'javascript'],
  ['jsx', 'jsx'],
  ['ts', 'typescript'],
  ['tsx', 'tsx'],
  ['json', 'json'],
  ['md', 'markdown'],
  ['markdown', 'markdown'],

  // Server-side languages
  ['php', 'php'],
  ['py', 'python'],
  ['rb', 'ruby'],
  ['java', 'java'],
  ['c', 'c'],
  ['cpp', 'cpp'],
  ['cs', 'csharp'],
  ['go', 'go'],
  ['rs', 'rust'],
  ['swift', 'swift'],
  ['kt', 'kotlin'],
  ['scala', 'scala'],

  // Shell scripting
  ['sh', 'bash'],
  ['bash', 'bash'],
  ['zsh', 'bash'],
  ['fish', 'fish'],
  ['bat', 'batch'],
  ['ps1', 'powershell'],

  // Configuration
  ['yml', 'yaml'],
  ['yaml', 'yaml'],
  ['toml', 'toml'],
  ['ini', 'ini'],
  ['env', 'dotenv'],
  ['dockerfile', 'dockerfile'],

  // Database
  ['sql', 'sql'],

  // Other
  ['graphql', 'graphql'],
  ['gql', 'graphql'],
  ['diff', 'diff'],
  ['patch', 'diff'],

  // Fallback
  ['txt', 'plaintext'],
]);

/**
 * Maps a file extension to a Markdown code block type.
 * @param {string} extension - The file extension (without the dot)
 * @returns {string} The corresponding Markdown code block type
 */
export function getMarkdownCodeBlockType(extension) {
  return markdownCodeBlockTypeMap.get(extension.toLowerCase()) || 'plaintext';
}

export const contentTypeMap = new Map([
  // TypeScript
  ['ts', 'application/typescript'],
  ['tsx', 'application/typescript'],

  // JavaScript
  ['js', 'application/javascript'],
  ['jsx', 'application/javascript'],
  ['mjs', 'application/javascript'],

  // Web
  ['html', 'text/html'],
  ['htm', 'text/html'],
  ['css', 'text/css'],
  ['scss', 'text/x-scss'],
  ['sass', 'text/x-scss'],
  ['less', 'text/x-less'],

  // Data formats
  ['json', 'application/json'],
  ['yaml', 'application/x-yaml'],
  ['yml', 'application/x-yaml'],
  ['xml', 'application/xml'],

  // Markdown
  ['md', 'text/markdown'],
  ['markdown', 'text/markdown'],

  // Shell scripts
  ['sh', 'application/x-sh'],
  ['bash', 'application/x-sh'],
  ['zsh', 'application/x-sh'],
  ['fish', 'application/x-sh'],

  // Configuration files
  ['toml', 'application/toml'],
  ['ini', 'text/x-ini'],
  ['env', 'text/plain'],

  // Other common programming languages
  ['py', 'text/x-python'],
  ['rb', 'text/x-ruby'],
  ['php', 'application/x-httpd-php'],
  ['java', 'text/x-java-source'],
  ['c', 'text/x-c'],
  ['cpp', 'text/x-c'],
  ['h', 'text/x-c'],
  ['hpp', 'text/x-c'],
  ['cs', 'text/x-csharp'],
  ['go', 'text/x-go'],
  ['rs', 'text/x-rust'],
  ['swift', 'text/x-swift'],
]);

/**
 * Returns the content type of a file based on its extension.
 * @param {string} filePath - The file path or file name.
 * @returns {string} The content type of the file.
 */
export function getContentType(filePath) {
  const extension = path.extname(filePath).slice(1).toLowerCase();
  return contentTypeMap.get(extension) || mime.lookup(filePath) || 'text/plain';
}
