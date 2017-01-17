import { Graph } from 'graphlib'
import { map } from 'd3-collection'

/**
 * Create a new graph where nodes in the same rank set are merged into one node.
 *
 * Depends on the "backwards" attribute of the nodes in G, and the "delta"
 * atribute of the edges.
 *
 */
export default function groupedGraph (G, rankSets = []) {
  // Not multigraph because this is only used for calculating ranks
  const GG = new Graph({directed: true})
  if (G.nodes().length === 0) return GG

  // Make sure there is a minimum-rank set
  rankSets = ensureSmin(G, rankSets)

  // Construct map of node ids to the set they are in, if any
  const nodeSets = map()
  var set
  var id
  var i
  var j
  for (i = 0; i < rankSets.length; ++i) {
    set = rankSets[i]
    if (!set.nodes || set.nodes.length === 0) continue
    id = '' + i
    for (j = 0; j < set.nodes.length; ++j) {
      nodeSets.set(set.nodes[j], id)
    }
    GG.setNode(id, { type: set.type, nodes: set.nodes })
  }

  // use i to keep counting new ids
  var d
  var nodes = G.nodes()
  for (j = 0; j < nodes.length; ++j) {
    d = nodes[j]
    if (!nodeSets.has(d.id)) {
      id = '' + (i++)
      set = { type: 'same', nodes: [d.id] }
      nodeSets.set(d.id, id)
      GG.setNode(id, set)
    }
  }

  // Add edges between nodes/groups
  var sourceSet
  var targetSet
  var edges = G.edges()
  var edge
  for (i = 0; i < edges.length; ++i) {
    d = edges[i]
    sourceSet = nodeSets.get(d.source.id)
    targetSet = nodeSets.get(d.target.id)

    // Minimum edge length depends on direction of nodes:
    //  -> to -> : 1
    //  -> to <- : 0
    //  <- to -> : 0 (in opposite direction??)
    //  <- to <- : 1 in opposite direction
    edge = GG.edge(sourceSet, targetSet) || { delta: 0 }
    if (sourceSet === targetSet) {
      edge.delta = 0
      GG.setEdge(sourceSet, targetSet, edge)
    } else if (d.source.backwards) {
      edge.delta = Math.max(edge.delta, d.target.backwards ? 1 : 0)
      GG.setEdge(targetSet, sourceSet, edge)
    } else {
      edge.delta = Math.max(edge.delta, d.target.backwards ? 0 : 1)
      GG.setEdge(sourceSet, targetSet, edge)
    }
  }

  return GG
}

function ensureSmin (G, rankSets) {
  for (var i = 0; i < rankSets.length; ++i) {
    if (rankSets[i].type === 'min') {
      return rankSets  // ok
    }
  }

  // find the first sourceSet node, or else use the first node
  var sources = G.sources()
  var n0 = sources.length ? sources[0] : G.nodes()[0].id
  return [{ type: 'min', nodes: [ n0 ] }].concat(rankSets)
}
