import path from 'path';
import babel from '@rollup/plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const resolveFile = function(filePath) {
  return path.join(__dirname, filePath);
}

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'iife',
    name: 'firstScreenTime',
  },
  plugins: [
    babel({ babelHelpers: 'bundled', exclude: ['node_modules/**'] }),
    uglify(),
    livereload(),
    serve({
      port: 3001,
      contentBase: [resolveFile('example'), resolveFile('/')]
    })
  ]
}
