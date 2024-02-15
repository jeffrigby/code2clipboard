# code2clipboard CLI Tool

This documentation covers the usage, configuration options, and setup process for the
`code2clipboard` (`copy2cb` for short) command-line interface (CLI) tool.
This Node.js application is designed to scan a specified directory for source code files,
format their content, and copy it to the clipboard for easy pasting elsewhere, such as a
GitHub Gist or a ChatGPT.

## Example Output

When you run the `code2clipboard` tool, it formats the selected files' content and metadata, preparing it for
copying to the clipboard.

Here's an example of what the tool copies, based on the specified options and
configurations:

```
Project Description:: Description of the project if specified in the arguments

Tree Structure
├── src
│   ├── index.js
│   └── config.js

--------------------------------------------------------------------------------
File: src/index.js
Content Type: application/javascript, Size: 1.45 KB, Last Modified: 2024-02-15
--------------------------------------------------------------------------------
//************** Start src/index.js **************//
console.log('Hello, world!');
// Example function
function greet(name) {
  console.log(`Hello, ${name}!`);
}
greet('code2clipboard');
//************** End src/index.js **************//

--------------------------------------------------------------------------------
File: src/config.js
Content Type: application/javascript, Size: 0.97 KB, Last Modified: 2024-02-15
--------------------------------------------------------------------------------
//************** Start src/config.js **************//
// Configuration options
const config = {
  greeting: 'Hello, world!',
};
module.exports = config;
//************** End src/config.js **************//
```

This output provides a clear and organized way to copy and share code suitable for pasting into
app like ChatGPT or GitHub Gists, or other platforms.

## Requirements

- Node.js (minimum LTS version)
- npm or Yarn

## Installation

First, clone the repository or download the source code to your local machine. Then, navigate to the root directory of the application (`code2clipboard`) and run the following command to install the necessary dependencies:

```sh
npm install
```

Or, if you use Yarn:

```sh
yarn install
```

For convenience, it's recommended to run `npm link` or `yarn link` to make the `code2clipboard` command available globally on your system.

## Usage

The `code2clipboard` tool is executed from the command line. Navigate to the root directory of the application and use the following syntax to run the tool:

```sh
node /path/to/code2clipboard.mjs [options]
```

or if you have linked the package you can run this from anywhere:

```sh
code2cb [options]
```

### Options

The tool supports several command-line options to customize the scanning and copying behavior all of which are optional.

- `--max-depth, -d`: Maximum depth for directory scanning. Default is 5.
- `--max-filesize, -s`: Maximum file size in kilobytes (KB) to consider for copying. Default is 100 KB.
- `--max-files, -f`: Maximum number of files to process and copy to the clipboard. Default is 10.
- `--add-ignore, -i`: Additional patterns to ignore during file scanning. This parameter should be a CSV string.
- `--add-extensions, -e`: Additional file extensions to include during file scanning. This parameter should be a CSV string.
- `--directory, -dir`: Directory to scan for files. Defaults to the current working directory (`process.cwd()`).
- `--ignore, --oi` Override ignore patterns entirely. Enter multiple entries as CSV. `--ignore node_modules,.git` will ignore both `node_modules` and `.git` directories.
- `--extensions, --oe`: Override the default file extensions entirely. Enter multiple extensions as a CSV string. For example, `--extensions js,ts,jsx,tsx,mjs` will only consider JavaScript and TypeScript
- `--omit-tree, --ot`: Omit the visual file tree from the copied content. Defaults to `false`.
- `--output-to-console, -c`: Output the copied content to the console in addition to the clipboard. Defaults to `false`.
- `--use-markdown-delimiter, -md`: Use markdown delimiters for the copied content. Defaults to `false`.

## Configuration

The `config.mjs` file holds the default configuration and environment variable management. You can modify the default behavior of the tool by setting environment variables in a `.env` file in the root directory. Supported environment variables include:

- `MAX_DEPTH`: Overrides the default maximum directory scanning depth.
- `MAX_FILE_SIZE`: Overrides the default maximum file size (in KB).
- `MAX_FILES`: Overrides the default maximum number of files to process.
- `ADD_IGNORE`: Additional ignore patterns, specified as a CSV string.
- `ADD_EXTENSIONS`: Additional file extensions to consider, specified as a CSV string.
- `OMIT_TREE`: Set to `true` to omit the file tree from the copied content.
- `EXTENSIONS`: Overrides the default file extensions entirely, specified as a CSV string.
- `IGNORE`: Overrides the default ignore patterns entirely, specified as a CSV string.
- `OUTPUT_TO_CONSOLE`: Set to `true` to output the copied content to the console in addition to the clipboard.
- `USE_MARKDOWN_DELIMETER`: Set to `true` to use markdown delimiters for the copied content instead of comment (Defaults to `//************** Start/End PATH **************//`)

Here's an example of what the `.env` file might look like:

```
MAX_DEPTH=3
MAX_FILE_SIZE=200
ADD_IGNORE=.log,.temp
OMIT_TREE=true
```

There's a sample `.env.example` file in the root directory that you can use as a template.

## Package Dependencies

- `clipboardy`: For copying content to the clipboard.
- `dotenv`: To manage environment variables.
- `micromatch`: For matching file paths against patterns.
- `yargs`: To parse command-line options.
- `isTextOrBinary`: To determine if a file is text or binary.

## Examples

### Basic Usage

Copy files from the current directory with the default configuration:

```sh
node /path/to/code2clipboard.mjs
```

Or if globally linked:

```sh
code2cb
```

### Specifying a Different Directory

Copy files from a specific directory:

```sh
code2cb --directory /path/to/your/project
```

### Limiting Search Depth

Limit directory scanning to 2 levels deep:

```sh
code2cb -d 2
```

### Limiting to only JS/TS files

Limit the file extensions to only javascript/typescript files:

```sh
code2cb --oe mjs,cjs,ts,js,jsx,tsx;
```

### Adjusting Maximum File Size

Copy files that are 50KB or smaller:

```sh
code2cb -s 50
```

### Changing the Number of Files

Copy a maximum of 5 files:

```sh
code2cb -f 5
```

### Custom Ignore Patterns

Ignore `dist` and `test` directories:

```sh
code2cb --ignore dist,test
code2cb -i dist,test
```

### Adding File Extensions

Include `.txt` and `.log` files in addition to the default set:

```sh
code2cb --add-extensions txt,log
```

### Omitting the File Tree

Copy files without including the file tree in the clipboard content:

```sh
code2cb --omit-tree
```

### Comprehensive Example

Combine multiple options to tailor the copying process. In this example, we're scanning up to 3 directory levels deep in the `/src` directory for files up to 200KB in size. We aim to copy a maximum of 20 files, ignoring only the `node_modules` and `.git` directories and adding `.txt` files to the default list of file extensions. We also choose to omit the file tree from the copied content:

```sh
code2cb -d 3 -s 200 -f 20 --directory /src --ignore node_modules,.git --add-extensions txt --omit-tree
```

These examples cover a range of use cases that demonstrate the versatility and flexibility of the `code2clipboard` tool. Users can mix and match options according to their specific needs, making it convenient to quickly copy and share code or file contents.
