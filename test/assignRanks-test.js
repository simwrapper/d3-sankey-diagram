// import { assignRanks } from '..'
import assignRanks from '../src/assignRanks/index.js'
import graphify from '../src/graphify.js'
import tape from 'tape'

tape('rank assignment: overall', test => {
  //
  //  f -------,    b<-,
  //  a -- b -- c -- e `
  //    `------ d -'
  //              \
  //      <h---<g-`
  //
  const G = graphify()([
    {id: 'g', backwards: true},
    {id: 'h', backwards: true}
  ], [
    {source: 'a', target: 'b'},
    {source: 'b', target: 'c'},
    {source: 'a', target: 'd'},
    {source: 'c', target: 'e'},
    {source: 'd', target: 'e'},
    {source: 'e', target: 'b'},
    {source: 'f', target: 'c'},
    {source: 'd', target: 'g'},
    {source: 'g', target: 'h'}
  ])

  const rankSets = [
    { type: 'same', nodes: ['c', 'd'] }
  ]

  // Without rankSets
  assignRanks(G, [])
  test.deepEqual(ranks(G), {
    'a': 0,
    'b': 1,
    'c': 2,
    'd': 1,
    'e': 3,
    'f': 1,
    'g': 1,
    'h': 0
  }, 'ranks without rankSets')

  assignRanks(G, rankSets)
  test.deepEqual(ranks(G), {
    'a': 0,
    'b': 1,
    'c': 2,
    'd': 2,
    'e': 3,
    'f': 1,
    'g': 2,
    'h': 1
  }, 'ranks with rankSets')

  test.end()
})

tape('rank assignment: disconnected', test => {
  //
  //   a -- b
  //        c -- d
  //
  const G = graphify()([], [
    {source: 'a', target: 'b'},
    {source: 'c', target: 'd'}
  ])

  const rankSets = [
    { type: 'same', nodes: ['b', 'c'] }
  ]

  // Without rankSets
  assignRanks(G, [])
  test.deepEqual(ranks(G), {
    'a': 0,
    'b': 1,
    'c': 0,
    'd': 1
  }, 'ranks without rankSets')

  assignRanks(G, rankSets)
  test.deepEqual(ranks(G), {
    'a': 0,
    'b': 1,
    'c': 1,
    'd': 2
  }, 'ranks with rankSets')

  test.end()
})

function ranks (G) {
  var r = {}
  G.nodes().forEach(d => { r[d.id] = d.rank })
  return r
}
