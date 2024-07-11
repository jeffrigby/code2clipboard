// build.mjs
import * as esbuild from 'esbuild';

const result = await esbuild.build({
  entryPoints: ['src/code2clipboard.mjs'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/code2cb.js',
  format: 'esm',
  banner: {
    js: '#!/usr/bin/env node',
  },
  minify: true,
  sourcemap: true,
  treeShaking: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  metafile: true,
  legalComments: 'none',
  packages: 'external'
});

if (result.metafile) {
  const text = await esbuild.analyzeMetafile(result.metafile);
  console.log('Build analysis:');
  console.log(text);
} else {
  console.log('Metafile not generated. Unable to analyze build.');
}