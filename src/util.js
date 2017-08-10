import { Graph } from 'graphlib'

export function buildGraph (graph, nodeId, nodeBackwards, sourceId, targetId, linkType, linkValue) {
  var G = new Graph({ directed: true, multigraph: true })
  graph.nodes.forEach(function (node, i) {
    const id = nodeId(node, i)
    if (G.hasNode(id)) throw new Error('duplicate: ' + id)
    G.setNode(id, {
      data: node,
      index: i,
      backwards: nodeBackwards(node, i)
    })
  })

  graph.links.forEach(function (link, i) {
    var label = {
      data: link,
      index: i,
      points: [],
      value: linkValue(link, i)
    }
    const v = sourceId(link, i)
    const w = targetId(link, i)
    if (!G.hasNode(v)) throw new Error('missing: ' + v)
    if (!G.hasNode(w)) throw new Error('missing: ' + w)
    G.setEdge(v, w, label, linkType(link, i))
  })

  G.setGraph({})

  return G
}
