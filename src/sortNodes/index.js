/** @module node-ordering */

import { map } from 'd3-collection'
import buildGraph from './build-graph.js'
import initialOrdering from './initial-ordering.js'
import swapNodes from './swap-nodes.js'
import countCrossings from './count-crossings.js'
import sortNodesOnce from './weighted-median-sort.js'

/**
 * Return an ordering for the graph G.
 *
 * The ordering is a list of lists of node ids, corresponding to the ranks of
 * the graphs, and the order of nodes within each rank.
 *
 * @param {Graph} G - The graph. Nodes must have a `rank` attribute.
 *
 */
export default function sortNodes (graph, maxIterations = 25) {
  let { G, ranks } = buildGraph(graph)
  let order = initialOrdering(G, ranks)
  let best = order
  let i = 0

  while (i++ < maxIterations) {
    sortNodesOnce(G, order, (i % 2 === 0))
    swapNodes(G, order)
    if (allCrossings(G, order) < allCrossings(G, best)) {
      // console.log('improved', allCrossings(G, order), order);
      best = copy(order)
    }
  }

  // Assign depth to nodes
  const depths = map()
  best.forEach(nodes => {
    nodes.forEach((u, i) => {
      depths.set(u, i)
    })
  })

  graph.nodes().forEach(node => {
    node.depth = depths.get(node.id)
  })

  // XXX depends on buildGraph() setting edge.dummyNodes
  graph.edges().forEach(edge => {
    (edge.dummyNodes || []).forEach((node, i) => {
      const id = `__${edge.source.id}_${edge.target.id}_${i}`
      node.depth = depths.get(id)
    })
  })

  return graph
}

function allCrossings (G, order) {
  let count = 0
  for (let i = 0; i < order.length - 1; ++i) {
    count += countCrossings(G, order[i], order[i + 1])
  }
  return count
}

function copy (order) {
  let result = []
  order.forEach(rank => {
    result.push(rank.map(d => d))
  })
  return result
}
