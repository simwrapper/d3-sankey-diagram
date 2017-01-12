import assignRanks from '../../src/assignRanks'

import { Graph } from 'graphlib'
import tape from 'tape'

tape('rank assignment: overall', test => {
  //
  //  f -------,    b<-,
  //  a -- b -- c -- e `
  //    `------ d -'
  //              \
  //      <h---<g-`
  //
  const G = new Graph({directed: true})

  G.setEdge('a', 'b')
  G.setEdge('b', 'c')
  G.setEdge('a', 'd')
  G.setEdge('c', 'e')
  G.setEdge('d', 'e')
  G.setEdge('e', 'b')
  G.setEdge('f', 'c')
  G.setEdge('d', 'g')
  G.setEdge('g', 'h')

  G.setNode('g', { direction: 'l' })
  G.setNode('h', { direction: 'l' })

  const rankSets = [
    { type: 'same', nodes: ['c', 'd'] }
  ]

  // Without rankSets
  const ranks1 = assignRanks(G, [])
  test.deepEqual(ranks1, [
    ['a', 'h'],
    ['b', 'd', 'f', 'g'],
    ['c'],
    ['e']
  ], 'ranks without rankSets')

  const ranks2 = assignRanks(G, rankSets)
  test.deepEqual(ranks2, [
    ['a'],
    ['b', 'f', 'h'],
    ['c', 'd', 'g'],
    ['e']
  ], 'ranks with rankSets')

  // Edges are still in original orientation
  test.deepEqual(G.edges(), [
    {v: 'a', w: 'b'},
    {v: 'b', w: 'c'},
    {v: 'a', w: 'd'},
    {v: 'c', w: 'e'},
    {v: 'd', w: 'e'},
    {v: 'e', w: 'b'},
    {v: 'f', w: 'c'},
    {v: 'd', w: 'g'},
    {v: 'g', w: 'h'}
  ], 'edges')

  test.end()
})

tape('rank assignment: disconnected', test => {
  //
  //   a -- b
  //        c -- d
  //
  const G = new Graph({directed: true})
  G.setEdge('a', 'b')
  G.setEdge('c', 'd')

  const rankSets = [
    { type: 'same', nodes: ['b', 'c'] }
  ]

  // Without rankSets
  const ranks1 = assignRanks(G, [])
  test.deepEqual(ranks1, [
    ['a', 'c'],
    ['b', 'd']
  ], 'ranks without rankSets')

  const ranks2 = assignRanks(G, rankSets)
  test.deepEqual(ranks2, [
    ['a'],
    ['b', 'c'],
    ['d']
  ], 'ranks with rankSets')

  test.end()
})
