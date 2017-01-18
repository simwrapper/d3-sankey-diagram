import sortNodes from '../../src/sortNodes/index.js'
// import { exampleBlastFurnaceWithDummy } from './examples'
import graphify from '../../src/graphify.js'
import tape from 'tape'

tape('sortNodes()', test => {
  //
  //  a -- b -- d
  //   `-- c -- e
  //
  const graph = graphify()([], [
    {source: 'a', target: 'b'},
    {source: 'a', target: 'c'},
    {source: 'b', target: 'd'},
    {source: 'c', target: 'e'}
  ])
  graph.node('a').rank = 0
  graph.node('b').rank = 1
  graph.node('c').rank = 1
  graph.node('d').rank = 2
  graph.node('e').rank = 2

  sortNodes(graph)

  test.deepEqual(depths(graph.nodes()), {
    'a': 0,
    'b': 0,
    'c': 1,
    'd': 0,
    'e': 1
  })

  test.end()
})

tape('sortNodes() with dummy nodes', test => {
  //
  //  a ---*--- d
  //   `-- b -- c
  //
  const graph = graphify()([], [
    {source: 'a', target: 'b'},
    {source: 'b', target: 'c'},
    {source: 'a', target: 'd'}
  ])
  graph.node('a').rank = 0
  graph.node('b').rank = 1
  graph.node('c').rank = 2
  graph.node('d').rank = 2

  sortNodes(graph.updateDummyNodes())

  test.deepEqual(depths(graph.nodes()), {
    'a': 0,
    'b': 1,
    'c': 1,
    'd': 0
  })

  test.deepEqual(depths(graph.dummyNodes()), {
    '__a_d_1': 0
  })

  test.end()
})

function depths (nodes) {
  var r = {}
  nodes.forEach(d => { r[d.id] = d.depth })
  return r
}
