import orderLinks from '../../src/sankeyLayout/link-ordering.js'
import tape from 'tape'
import { Graph } from 'graphlib'

tape('orderLinks() works between neighbouring layers', test => {
  const graph = new Graph({ directed: true, multigraph: true })
  graph.setNode('0', {x: 0, y: 0})
  graph.setNode('1', {x: 0, y: 1})
  graph.setNode('2', {x: 0, y: 2})
  graph.setNode('3', {x: 0, y: 3})
  graph.setNode('4', {x: 1, y: 1.5})
  graph.setEdge('0', '4', {})
  graph.setEdge('1', '4', {})
  graph.setEdge('2', '4', {})
  graph.setEdge('3', '4', {})
  orderLinks(graph)

  test.deepEqual(incoming(graph.node('4')), ['0', '1', '2', '3'],
                 'incoming')

  // change ordering: put node 3 at top, node 0 at bottom
  graph.node('0').y = 3
  graph.node('3').y = 0
  orderLinks(graph)

  test.deepEqual(incoming(graph.node('4')), ['3', '1', '2', '0'],
                'node 4 incoming swapped')

  test.end()
})

tape('orderLinks() starting and ending in same slice', test => {
  //
  //     |--1--|
  //     ||-2-||
  //  0 --- 3 --- 6
  //     ||-4-||
  //     |--5--|
  //
  const graph = new Graph({ directed: true, multigraph: true })
  graph.setNode('0', {x: 0, y: 2})
  graph.setNode('1', {x: 1, y: 0})
  graph.setNode('2', {x: 1, y: 1})
  graph.setNode('3', {x: 1, y: 2})
  graph.setNode('4', {x: 1, y: 3})
  graph.setNode('5', {x: 1, y: 4})
  graph.setNode('6', {x: 2, y: 2})
  graph.setEdge('0', '3', {value: 2})
  graph.setEdge('1', '3', {value: 2})
  graph.setEdge('2', '3', {value: 2})
  graph.setEdge('4', '3', {value: 2})
  graph.setEdge('5', '3', {value: 2})
  graph.setEdge('3', '1', {value: 2})
  graph.setEdge('3', '2', {value: 2})
  graph.setEdge('3', '4', {value: 2})
  graph.setEdge('3', '5', {value: 2})
  graph.setEdge('3', '6', {value: 6})
  orderLinks(graph)

  test.deepEqual(incoming(graph.node('3')), ['2', '1', '0', '5', '4'], 'incoming')
  test.deepEqual(outgoing(graph.node('3')), ['2', '1', '6', '5', '4'], 'outgoing')
  test.end()
})

tape('orderLinks() sorts links with string types', test => {
  //
  //  0 --|
  //  1 --|2 -- 3
  //
  const graph = exampleTypes(['m2', 'm1'])

  orderLinks(graph, { alignLinkTypes: false })
  test.deepEqual(incoming(graph.node('2')), ['0/m1', '0/m2', '1/m1', '1/m2'], 'types not aligned')

  orderLinks(graph, { alignLinkTypes: true })
  test.deepEqual(incoming(graph.node('2')), ['0/m1', '1/m1', '0/m2', '1/m2'], 'types aligned')

  test.end()
})

tape('orderLinks() sorts links with numeric types', test => {
  //
  //  0 --|
  //  1 --|2 -- 3
  //
  const graph = exampleTypes([8, 7])

  orderLinks(graph, { alignLinkTypes: false })
  test.deepEqual(incoming(graph.node('2')), ['0/7', '0/8', '1/7', '1/8'], 'types not aligned')

  orderLinks(graph, { alignLinkTypes: true })
  test.deepEqual(incoming(graph.node('2')), ['0/7', '1/7', '0/8', '1/8'], 'types aligned')

  test.end()
})

tape('orderLinks() puts self-loops at the bottom', test => {
  const graph = new Graph({ directed: true, multigraph: true })
  graph.setNode('0', {x: 0, y: 0})
  graph.setNode('1', {x: 1, y: 0})
  graph.setNode('2', {x: 2, y: 0})
  graph.setEdge('0', '1', {value: 1})
  graph.setEdge('1', '1', {value: 1})
  graph.setEdge('1', '2', {value: 1})
  orderLinks(graph)

  test.deepEqual(outgoing(graph.node('1')), ['2', '1'], 'node 1 outgoing')
  test.deepEqual(incoming(graph.node('1')), ['0', '1'], 'node 1 incoming')
  test.end()
})

function exampleTypes (types) {
  //
  //  0 --|
  //  1 --|2
  //
  const graph = new Graph({ directed: true, multigraph: true })
  graph.setNode('0', {x: 0, y: 0})
  graph.setNode('1', {x: 0, y: 3})
  graph.setNode('2', {x: 1, y: 0})
  types.forEach(m => {
    graph.setEdge('0', '2', {value: 1}, m)
    graph.setEdge('1', '2', {value: 1}, m)
  })
  return graph
}

function incoming (node) {
  return node.incoming.map(e => e.v + (e.name ? '/' + e.name : ''))
}

function outgoing (node) {
  return node.outgoing.map(e => e.w + (e.name ? '/' + e.name : ''))
}
