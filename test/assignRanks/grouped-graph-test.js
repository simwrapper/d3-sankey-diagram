import groupedGraph from '../../src/assignRanks/grouped-graph'
import graphify from '../../src/graphify.js'
import tape from 'tape'

// XXX reversing edges into Smin and out of Smax?
// XXX reversing edges marked as "right to left"?

tape('rank assignment: groupedGraph() produces one group per node, without ranksets', (test) => {
  const G = graphify()([], [
    {source: 'a', target: 'b'},
    {source: 'a', target: 'c'}
  ])

  const GG = groupedGraph(G)

  test.deepEqual(GG.nodes(), ['0', '1', '2'])
  test.deepEqual(GG.node('0'), {type: 'min', nodes: ['a']})
  test.deepEqual(GG.node('1'), {type: 'same', nodes: ['b']})
  test.deepEqual(GG.node('2'), {type: 'same', nodes: ['c']})
  test.deepEqual(GG.edges(), [{v: '0', w: '1'}, {v: '0', w: '2'}])
  test.end()
})

tape('rank assignment: groupedGraph() ignores repeated edges', (test) => {
  const G = graphify()([], [
    {source: 'a', target: 'b', type: 'x'},
    {source: 'a', target: 'b', type: 'y'}
  ])

  const GG = groupedGraph(G)

  test.deepEqual(GG.nodes(), ['0', '1'])
  test.deepEqual(GG.node('0'), {type: 'min', nodes: ['a']})
  test.deepEqual(GG.node('1'), {type: 'same', nodes: ['b']})
  test.deepEqual(GG.edges(), [{v: '0', w: '1'}])
  test.end()
})

tape('rank assignment: groupedGraph() produces one group per rankset', (test) => {
  const G = graphify()([], [
    {source: 'a', target: 'b'},
    {source: 'a', target: 'c'}
  ])

  const GG = groupedGraph(G, [{type: 'same', nodes: ['b', 'c']}])

  test.deepEqual(GG.nodes(), ['0', '1'])
  test.deepEqual(GG.node('0'), {type: 'min', nodes: ['a']})
  test.deepEqual(GG.node('1'), {type: 'same', nodes: ['b', 'c']})
  test.deepEqual(GG.edges(), [{v: '0', w: '1'}])
  test.end()
})

tape('rank assignment: groupedGraph() respects explicit "min" rankset', (test) => {
  const G = graphify()([], [
    {source: 'a', target: 'b'},
    {source: 'a', target: 'c'}
  ])

  const GG = groupedGraph(G, [{type: 'min', nodes: ['b', 'c']}])

  test.deepEqual(GG.nodes(), ['0', '1'])
  test.deepEqual(GG.node('0'), {type: 'min', nodes: ['b', 'c']})
  test.deepEqual(GG.node('1'), {type: 'same', nodes: ['a']})
  test.deepEqual(GG.edges(), [{v: '1', w: '0'}])
  test.end()
})

tape('rank assignment: groupedGraph() sets delta on forward edges to 1', (test) => {
  const G = graphify()([], [{source: 'a', target: 'b'}])
  const GG = groupedGraph(G)
  test.deepEqual(GG.node('0'), {type: 'min', nodes: ['a']})
  test.deepEqual(GG.node('1'), {type: 'same', nodes: ['b']})
  test.deepEqual(GG.edge('0', '1'), {delta: 1})
  test.end()
})

tape('rank assignment: groupedGraph() sets delta on forward-backwards edges to 0', (test) => {
  const G = graphify()([{id: 'b', backwards: true}], [{source: 'a', target: 'b'}])
  const GG = groupedGraph(G)
  test.deepEqual(GG.node('0'), {type: 'min', nodes: ['a']})
  test.deepEqual(GG.node('1'), {type: 'same', nodes: ['b']})
  test.deepEqual(GG.edge('0', '1'), {delta: 0})
  test.end()
})

tape('rank assignment: groupedGraph() sets delta on backwards-forwards edges to 0 and reverses', (test) => {
  const G = graphify()([{id: 'a', backwards: true}], [{source: 'a', target: 'b'}])
  const GG = groupedGraph(G)
  test.deepEqual(GG.node('0'), {type: 'min', nodes: ['a']})
  test.deepEqual(GG.node('1'), {type: 'same', nodes: ['b']})
  test.deepEqual(GG.edge('1', '0'), {delta: 0})
  test.end()
})

tape('rank assignment: groupedGraph() sets delta on backwards-backwards edges to 1 and reverses', (test) => {
  const G = graphify()([{id: 'a', backwards: true}, {id: 'b', backwards: true}], [{source: 'a', target: 'b'}])
  const GG = groupedGraph(G)
  test.deepEqual(GG.node('0'), {type: 'min', nodes: ['a']})
  test.deepEqual(GG.node('1'), {type: 'same', nodes: ['b']})
  test.deepEqual(GG.edge('1', '0'), {delta: 1})
  test.end()
})

tape('rank assignment: groupedGraph() sets delta on forward-forward loops to 0', (test) => {
  const G = graphify()([{id: 'a', backwards: false}], [{source: 'a', target: 'a'}])
  const GG = groupedGraph(G)
  test.deepEqual(GG.node('0'), {type: 'min', nodes: ['a']})
  test.deepEqual(GG.edge('0', '0'), {delta: 0})
  test.end()
})

tape('rank assignment: groupedGraph() sets delta on backwards-backwards loops to 0', (test) => {
  const G = graphify()([{id: 'a', backwards: true}], [{source: 'a', target: 'a'}])
  const GG = groupedGraph(G)
  test.deepEqual(GG.node('0'), {type: 'min', nodes: ['a']})
  test.deepEqual(GG.edge('0', '0'), {delta: 0})
  test.end()
})
