/*
 * build a graphlib Graph from our own Digraph object
 *
 * add dummy nodes too.
 */

import { Graph } from 'graphlib'
// import dummyNodes from './dummy-nodes.js'

export default function buildGraph (graph) {
  const G = new Graph({ directed: true, multigraph: true })
  const ranks = []

  function ensureNode (id, node) {
    if (G.hasNode(id)) {
      return G.node(id)
    }
    G.setNode(id, node)
    const r = node.rank || 0
    while (r >= ranks.length) ranks.push([])
    ranks[r].push(id)
    return node
  }

  // Add real nodes
  graph.nodes().forEach(node => ensureNode(node.id, node))

  // Add edges & dummy nodes
  graph.edges().forEach(edge => {
    // const dummy = dummyNodes(edge)
    // XXX this isn't really the place for this?
    // edge.dummyNodes = dummy
    const dummy = edge.dummyNodes || []

    let v = edge.source.id
    for (let i = 0; i < dummy.length; ++i) {
      const id = `__${edge.source.id}_${edge.target.id}_${i}`
      ensureNode(id, dummy[i])
      G.setEdge(v, (v = id), edge, edge.type)
    }

    G.setEdge(v, edge.target.id, edge, edge.type)
  })

  return { G, ranks }
}
