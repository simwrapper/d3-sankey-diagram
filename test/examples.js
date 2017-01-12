import { Graph } from 'graphlib'

export function exampleWithLoop () {
  //
  //  f -------,    b<-,
  //  a -- b -- c -- e `
  //    `------ d -'
  //              \
  //      <h---<g-`
  //
  const G = new Graph({directed: true})

  G.setEdge('a', 'b')
  G.setEdge('a', 'd')
  G.setEdge('b', 'c')
  G.setEdge('c', 'e')
  G.setEdge('d', 'e')
  G.setEdge('e', 'b')
  G.setEdge('f', 'c')

  const rankSets = [
    { type: 'same', nodes: ['c', 'd'] }
  ]

  return { G, rankSets }
  // var nodes = [
  //   {id: 'g', direction: 'l'},
  //   {id: 'h', direction: 'l'}
  // ]

  // var edges = [
  //   {source: 'a', target: 'b'},
  //   {source: 'b', target: 'c'},
  //   {source: 'a', target: 'd'},
  //   {source: 'c', target: 'e'},
  //   {source: 'd', target: 'e'},
  //   {source: 'e', target: 'b'},
  //   {source: 'f', target: 'c'},
  //   {source: 'd', target: 'g'},
  //   {source: 'g', target: 'h'}
  // ]

  // var rankSets = [
  //   { type: 'same', nodes: ['c', 'd'] }
  // ]

  // var graph = layeredGraph()(nodes, edges)

  // return { graph: graph, rankSets: rankSets }
}

export function exampleWithReversedNodes () {
  //
  //      a -- b
  //       `
  // d -- c'
  //
  var nodes = [
    {id: 'c', direction: 'l'},
    {id: 'd', direction: 'l'}
  ]

  var edges = [
    {source: 'a', target: 'b'},
    {source: 'a', target: 'c'},
    {source: 'c', target: 'd'}
  ]

  var graph = layeredGraph()(nodes, edges)

  return { graph: graph, rankSets: [] }
}
