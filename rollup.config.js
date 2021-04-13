import babel from '@rollup/plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'firstScreenTime',
  },
  plugins: [
    babel({ babelHelpers: 'bundled', exclude: ['node_modules/**'] }),
    uglify()
  ]
}
