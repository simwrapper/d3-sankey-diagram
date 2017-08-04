import tape from 'tape'
import graphify from '../src/graphify.js'

tape('Digraph.sources()', test => {
  var G = graphify()([
    {id: 'a'},
    {id: 'b'}
  ], [
    {source: 'a', target: 'b', type: 'c'}
  ])

  test.deepEqual(G.sources(), ['a'])
  test.end()
})

tape('Digraph.updateDummyNodes() adds dummy nodes', test => {
  var G = graphify()([
    {id: 'a'},
    {id: 'b'},
    {id: 'c'}
  ], [
    {source: 'a', target: 'b', type: 'x'},
    {source: 'b', target: 'c', type: 'x'}
  ]).ordering([ ['a'], [], ['b'], ['c'] ])

  test.deepEqual(G.dummyNodes(), [])
  test.equal(G.edges()[0].dummyNodes, undefined)
  test.equal(G.edges()[1].dummyNodes, undefined)

  test.deepEqual(G.updateDummyNodes().dummyNodes(), [
    {id: '__a_b_1', rank: 1, backwards: false, edges: [G.edges()[0]]}
  ])
  test.equal(G.edges()[0].dummyNodes.length, 1)
  test.equal(G.edges()[1].dummyNodes.length, 0)

  test.end()
})

tape('Digraph.node() returns node by id', test => {
  var G = graphify()([
    {id: 'a'},
    {id: 'b'}
  ], [
    {source: 'a', target: 'b', type: 'c'}
  ])

  test.equal(G.node('a').id, 'a')
  test.equal(G.node('z'), undefined)
  test.end()
})

tape('Digraph.ordering(order) sets rank and depth', test => {
  var G = graphify()([], [
    {source: 'a', target: 'b'},
    {source: 'a', target: 'c'},
    {source: 'c', target: 'd'}
  ]).ordering([['a'], ['b', 'c'], ['d']])

  test.deepEqual(rankBandAndDepth(G), {
    a: [0, undefined, 0],
    b: [1, undefined, 0],
    c: [1, undefined, 1],
    d: [2, undefined, 0]
  })
  test.end()
})

tape('Digraph.ordering(order) sets rank, band and depth when given 3-level order', test => {
  var G = graphify()([], [
    {source: 'a', target: 'b'},
    {source: 'a', target: 'c'},
    {source: 'c', target: 'd'}
  ]).ordering([[['a'], []], [['b', 'c'], []], [[], ['d']]])

  test.deepEqual(rankBandAndDepth(G), {
    a: [0, 0, 0],
    b: [1, 0, 0],
    c: [1, 0, 1],
    d: [2, 1, 0]
  })
  test.end()
})

tape('Digraph.ordering() returns ordering', test => {
  var G = graphify()([], [
    {source: 'a', target: 'b'},
    {source: 'a', target: 'c'},
    {source: 'c', target: 'd'}
  ]).ordering([['a'], ['b', 'c'], ['d']])

  test.deepEqual(G.ordering(), [['a'], ['b', 'c'], ['d']])
  test.end()
})

function rankBandAndDepth (G) {
  const r = {}
  G.nodes().forEach(d => {
    r[d.id] = [d.rank, d.band, d.depth]
  })
  return r
}
