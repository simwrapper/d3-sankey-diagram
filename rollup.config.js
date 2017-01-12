// Rollup plugins
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  entry: 'index.js',
  dest: 'build/d3-sankey-diagram.js',
  format: 'umd',
  moduleName: 'd3',
  globals: {
    'd3-collection': 'd3',
    'd3-array': 'd3'
  },
  plugins: [
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      namedExports: {
        'node_modules/graphlib/index.js': ['Graph', 'alg']
      }
    })
  ]
}
