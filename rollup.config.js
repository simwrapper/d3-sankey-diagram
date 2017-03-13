// Rollup plugins
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import buble from 'rollup-plugin-buble'

export default {
  entry: 'index.js',
  dest: 'build/d3-sankey-diagram.js',
  format: 'umd',
  moduleName: 'd3',
  globals: {
    'd3-collection': 'd3',
    'd3-array': 'd3',
    'd3-selection': 'd3',
    'd3-transition': 'd3',
    'd3-dispatch': 'd3',
    'd3-format': 'd3',
    'd3-interpolate': 'd3'
  },
  external: [
    'd3-collection',
    'd3-array',
    'd3-selection',
    'd3-transition',
    'd3-dispatch',
    'd3-format',
    'd3-interpolate'
  ],
  plugins: [
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      namedExports: {
        'node_modules/graphlib/index.js': ['Graph', 'alg']
      }
    }),
    buble()
  ]
}
