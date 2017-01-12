import sortNodes from '../../src/sortNodes/index.js'
import { exampleBlastFurnaceWithDummy } from './examples'
import tape from 'tape'

tape('sortNodes', test => {
  let {G, ranks} = exampleBlastFurnaceWithDummy()
  let order = sortNodes(G, ranks)

  let expected = [
    [['_oven_input_2', '_bf_input_5', 'input']],
    [['_oven_input_1', '_bf_input_4', 'oven', '_input_sinter_1']],
    [['_bf_input_3', 'coke', '_input_sinter_2', '_oven_export_1']],
    [['_bf_input_2', '_coke_bf', 'sinter', '_oven_export_2']],
    [['_bf_input_1', 'bf', '_sinter_export', '_oven_export_3']],
    [['output', 'export']]
  ]
  test.deepEqual(order, expected)

  test.end()
})
