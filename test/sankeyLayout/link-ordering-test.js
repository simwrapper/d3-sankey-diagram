import orderLinks from '../../src/sankeyLayout/link-ordering.js'
import graphify from '../../src/graphify.js'
import tape from 'tape'

tape('orderLinks() works between neighbouring layers', test => {
  const G = example4to1()
  orderLinks(G)

  test.deepEqual(incoming(G.node('4')), ['0', '1', '2', '3'],
                 'node 4 incoming')

  // change ordering: put node 3 at top, node 0 at bottom
  G.node('0').y = G.node('3').y
  G.node('3').y = 0
  orderLinks(G)

  test.deepEqual(incoming(G.node('4')), ['3', '1', '2', '0'],
                'node 4 incoming swapped')

  test.end()
})

tape('orderLinks() starting and ending in same slice', test => {
  const G = exampleLoops()
  orderLinks(G)

  test.deepEqual(incoming(G.node('3')), ['2', '1', '0', '5', '4'], 'incoming')
  test.deepEqual(outgoing(G.node('3')), ['2', '1', '6', '5', '4'], 'outgoing')
  test.end()
})

tape('orderLinks() sorts links with string types', test => {
  //
  //  0 --|
  //  1 --|2 -- 3
  //
  const G = exampleTypes(['m2', 'm1'])
  orderLinks(G)

  test.deepEqual(outgoing(G.node('2')), ['3/m1', '3/m2'], 'outgoing sorted by type')
  test.deepEqual(incoming(G.node('3')), ['2/m1', '2/m2'], 'incoming sorted by type')
  test.end()
})

tape('orderLinks() sorts links with numeric types', test => {
  //
  //  0 --|
  //  1 --|2 -- 3
  //
  const G = exampleTypes([8, 7])
  orderLinks(G)

  test.deepEqual(outgoing(G.node('2')), ['3/7', '3/8'], 'outgoing sorted by type')
  test.deepEqual(incoming(G.node('3')), ['2/7', '2/8'], 'incoming sorted by type')
  test.end()
})

tape('orderLinks() can align links by destination', test => {
  const G = exampleTypes(['m1', 'm2'])
  orderLinks(G, { alignLinkTypes: false })

  test.deepEqual(outgoing(G.node('0')), ['2/m1', '2/m2'], 'node 0 outgoing')
  test.deepEqual(outgoing(G.node('1')), ['2/m1', '2/m2'], 'node 1 outgoing')
  test.deepEqual(outgoing(G.node('2')), ['3/m1', '3/m2'], 'node 2 outgoing')
  test.deepEqual(incoming(G.node('2')), ['0/m1', '0/m2', '1/m1', '1/m2'], 'node 2 incoming')
  test.end()
})

tape('orderLinks() can align links by type', test => {
  const G = exampleTypes(['m1', 'm2'])
  orderLinks(G, { alignLinkTypes: true })

  test.deepEqual(outgoing(G.node('0')), ['2/m1', '2/m2'], 'node 0 outgoing')
  test.deepEqual(outgoing(G.node('1')), ['2/m1', '2/m2'], 'node 1 outgoing')
  test.deepEqual(outgoing(G.node('2')), ['3/m1', '3/m2'], 'node 2 outgoing')
  test.deepEqual(incoming(G.node('2')), ['0/m1', '1/m1', '0/m2', '1/m2'], 'node 2 incoming')
  test.end()
})

tape('orderLinks() puts self-loops at the bottom', test => {
  const G = graphify()([], [
    {source: '0', target: '1', value: 1},
    {source: '1', target: '1', value: 1},
    {source: '1', target: '2', value: 1}
  ])
  G.node('0').x = 0
  G.node('0').y = 0
  G.node('1').x = 1
  G.node('1').y = 0
  G.node('2').x = 2
  G.node('2').y = 0
  orderLinks(G)

  test.deepEqual(outgoing(G.node('1')), ['2', '1'], 'node 1 outgoing')
  test.deepEqual(incoming(G.node('1')), ['0', '1'], 'node 1 incoming')
  test.end()
})

function example4to1 () {
  // 0|---\
  //       \
  // 1|-\   -|
  //     \---|4
  // 2|------|
  //       ,-|
  // 3|---/
  //
  const G = graphify()([], [
    {source: '0', target: '4', value: 5},
    {source: '1', target: '4', value: 5},
    {source: '2', target: '4', value: 5},
    {source: '3', target: '4', value: 5}
  ])

  G.node('0').x = 0
  G.node('1').x = 0
  G.node('2').x = 0
  G.node('3').x = 0
  G.node('4').x = 1

  G.node('0').y = 0
  G.node('1').y = 1
  G.node('2').y = 2
  G.node('3').y = 3
  G.node('4').y = 0

  return G
}

function exampleLoops () {
  //
  //     |--1--|
  //     ||-2-||
  //  0 --- 3 --- 6
  //     ||-4-||
  //     |--5--|
  //
  const G = graphify()([], [
    {source: '0', target: '3', value: 2},
    {source: '3', target: '1', value: 2},
    {source: '3', target: '2', value: 2},
    {source: '3', target: '4', value: 2},
    {source: '3', target: '5', value: 2},
    {source: '1', target: '3', value: 2},
    {source: '2', target: '3', value: 2},
    {source: '4', target: '3', value: 2},
    {source: '5', target: '3', value: 2},
    {source: '3', target: '6', value: 6}
  ])

  G.node('0').x = 0
  G.node('0').y = 3
  for (var i = 1; i <= 5; ++i) {
    G.node('' + i).x = 1
    G.node('' + i).y = i
  }
  G.node('6').x = 2
  G.node('6').y = 3

  return G
}

function exampleTypes (types) {
  //
  //  0 --|
  //  1 --|2 -- 3
  //
  const edges = []
  types.forEach(m => {
    edges.push({source: '0', target: '2', type: m, value: 1})
    edges.push({source: '1', target: '2', type: m, value: 1})
    edges.push({source: '2', target: '3', type: m, value: 2})
  })
  const G = graphify()([], edges)

  G.node('0').x = 0
  G.node('0').y = 0
  G.node('1').x = 0
  G.node('1').y = 3
  G.node('2').x = 1
  G.node('2').y = 0.5
  G.node('3').x = 2
  G.node('3').y = 0.5

  return G
}

function incoming (node) {
  return node.incoming.map(e => e.source.id + (e.type ? '/' + e.type : ''))
}

function outgoing (node) {
  return node.outgoing.map(e => e.target.id + (e.type ? '/' + e.type : ''))
}
