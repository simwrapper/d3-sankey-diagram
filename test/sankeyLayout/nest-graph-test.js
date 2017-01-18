import nestGraph from '../../src/sankeyLayout/nest-graph.js'
import tape from 'tape'
import graphify from '../../src/graphify.js'

tape('nestGraph()', test => {
  // 0|---\
  //       \
  // 1|-\   -|
  //     \---|4
  // 2|------|
  //       ,-|
  // 3|---/
  //
  const graph = graphify()([], [
    {source: '0', target: '4', value: 5},
    {source: '1', target: '4', value: 5},
    {source: '2', target: '4', value: 5},
    {source: '3', target: '4', value: 5}
  ]).ordering([[['0'], ['1', '3', '2']], [[], ['4']]])

  const nested = nestGraph(graph)
  test.deepEqual(ids(nested), [
    [ ['0'], ['1', '3', '2'] ],
    [ [], ['4'] ]
  ])
  test.end()
})

tape('nestGraph() includes dummy nodes', test => {
  //
  // a ---*--- c
  //  `-- b --`
  //
  const graph = graphify()([], [
    {source: 'a', target: 'b', value: 1},
    {source: 'b', target: 'c', value: 1},
    {source: 'a', target: 'c', value: 1}
  ]).ordering([ [['a']], [['b']], [['c']] ])
        .updateDummyNodes()

  const nested = nestGraph(graph)
  test.deepEqual(ids(nested), [
    [ ['a'] ],
    [ ['b', '__a_c_1'] ],
    [ ['c'] ]
  ])
  test.end()
})

function ids (layers) {
  return layers.map(bands => bands.map(nodes => nodes.map(d => d.id)))
}
