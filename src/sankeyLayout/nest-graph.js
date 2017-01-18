import { nest } from 'd3-collection'
import { max } from 'd3-array'

export default function nestGraph (graph) {
  const maxRank = max(graph.nodes(), d => d.rank || 0)
  const maxBand = max(graph.nodes(), d => d.band || 0)

  const nodes = graph.nodes().concat(graph.dummyNodes())

  const nested = nest()
    .key(d => d.rank || 0)
    .key(d => d.band || 0)
    .sortValues((a, b) => a.depth - b.depth)
    .map(nodes)

  const result = new Array(maxRank + 1)
  for (let i = 0; i <= maxRank; ++i) {
    result[i] = new Array(maxBand + 1)
    for (let j = 0; j <= maxBand; ++j) {
      result[i][j] = nested.get(i).get(j) || []
    }
  }

  return result
}
