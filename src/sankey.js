/**
 */

import { sum } from 'd3-array'
import assignRanks from './assignRanks/index.js'
import sortNodes from './sortNodes/index.js'
import { addDummyNodes, removeDummyNodes } from './sortNodes/dummy-nodes.js'
import nestGraph from './sankeyLayout/nest-graph.js'
import positionHorizontally from './sankeyLayout/horizontal.js'
import positionVertically from './sankeyLayout/verticalJustified.js'
import orderLinks from './sankeyLayout/link-ordering.js'
import layoutLinks from './sankeyLayout/layout-links.js'
import { buildGraph } from './util.js'

function defaultNodes (graph) {
  return graph.nodes
}

function defaultLinks (graph) {
  return graph.links
}

function defaultNodeId (d) {
  return d.id
}

function defaultNodeBackwards (d) {
  return d.direction && d.direction.toLowerCase() === 'l'
}

function defaultSourceId (d) {
  return typeof d.source === 'object' ? d.source.id : d.source
}

function defaultTargetId (d) {
  return typeof d.target === 'object' ? d.target.id : d.target
}

function defaultLinkType (d) {
  return d.type
}

export default function sankeyLayout () {
  var nodes = defaultNodes
  var links = defaultLinks
  var nodeId = defaultNodeId
  var nodeBackwards = defaultNodeBackwards
  var sourceId = defaultSourceId
  var targetId = defaultTargetId
  var linkType = defaultLinkType
  var ordering = null
  var rankSets = [] // XXX setter/getter
  var maxIterations = 25 // XXX setter/getter

  var size = [1, 1]
  var scale = null
  var linkValue = function (e) { return e.value }
  var whitespace = 0.5
  var verticalLayout = positionVertically()
  var alignLinkTypes = false

  function sankey () {
    var graph = {nodes: nodes.apply(null, arguments), links: links.apply(null, arguments)}
    var G = buildGraph(graph, nodeId, nodeBackwards, sourceId, targetId, linkType, linkValue)

    setNodeValues(G, linkValue)

    if (ordering !== null) {
      applyOrdering(G, ordering)
    } else {
      assignRanks(G, rankSets)
      sortNodes(G, maxIterations)
    }

    addDummyNodes(G)
    setNodeValues(G, linkValue)
    // XXX sort nodes?

    const nested = nestGraph(G.nodes().map(u => G.node(u)))
    maybeScaleToFit(G, nested)
    setWidths(G, scale)

    // position nodes
    verticalLayout(nested, size[1], whitespace)
    positionHorizontally(G, size[0])

    // // sort & position links
    orderLinks(G, { alignLinkTypes: alignLinkTypes })
    layoutLinks(G)

    removeDummyNodes(G)
    addLinkEndpoints(G)

    copyResultsToGraph(G, graph)

    return graph
  }

  sankey.nodeId = function (x) {
    if (arguments.length) {
      nodeId = required(x)
      return sankey
    }
    return nodeId
  }

  sankey.nodeBackwards = function (x) {
    if (arguments.length) {
      nodeBackwards = required(x)
      return sankey
    }
    return nodeBackwards
  }

  sankey.sourceId = function (x) {
    if (arguments.length) {
      sourceId = required(x)
      return sankey
    }
    return sourceId
  }

  sankey.targetId = function (x) {
    if (arguments.length) {
      targetId = required(x)
      return sankey
    }
    return targetId
  }

  sankey.linkType = function (x) {
    if (arguments.length) {
      linkType = required(x)
      return sankey
    }
    return linkType
  }

  // sankey.layoutLinks = function (graph, doOrderLinks) {
  //   if (scale === null) sankey.scaleToFit(graph)
  //   // set node and edge sizes
  //   setNodeValues(graph, linkValue, scale)
  //   if (doOrderLinks) {
  //     orderLinks(graph)
  //   }
  //   layoutLinks(graph)
  //   return graph
  // }

  // sankey.scaleToFit = function (graph) {
  function maybeScaleToFit (G, nested) {
    if (scale !== null) return
    const maxValue = sum(nested.bandValues)
    if (maxValue <= 0) {
      scale = 1
    } else {
      scale = size[1] / maxValue
      if (whitespace !== 1) scale *= (1 - whitespace)
    }
  }

  sankey.ordering = function (x) {
    if (!arguments.length) return ordering
    ordering = x
    return sankey
  }

  sankey.size = function (x) {
    if (!arguments.length) return size
    size = x
    return sankey
  }

  sankey.whitespace = function (x) {
    if (!arguments.length) return whitespace
    whitespace = x
    return sankey
  }

  sankey.scale = function (x) {
    if (!arguments.length) return scale
    scale = x
    return sankey
  }

  sankey.linkValue = function (x) {
    if (!arguments.length) return linkValue
    linkValue = x
    return sankey
  }

  sankey.verticalLayout = function (x) {
    if (!arguments.length) return verticalLayout
    verticalLayout = required(x)
    return sankey
  }

  sankey.alignLinkTypes = function (x) {
    if (!arguments.length) return alignLinkTypes
    alignLinkTypes = !!x
    return sankey
  }

  function applyOrdering (G, ordering) {
    ordering.forEach((x, i) => {
      x.forEach((u, j) => {
        if (u.forEach) {
          u.forEach((v, k) => {
            const d = G.node(v)
            if (d) {
              d.rank = i
              d.band = j
              d.depth = k
            }
          })
        } else {
          const d = G.node(u)
          if (d) {
            d.rank = i
            // d.band = 0
            d.depth = j
          }
        }
      })
    })
  }

  return sankey
}

function setNodeValues (G, linkValue) {
  G.nodes().forEach(u => {
    const d = G.node(u)
    const incoming = sum(G.inEdges(u), e => G.edge(e).value)
    const outgoing = sum(G.outEdges(u), e => G.edge(e).value)
    d.value = Math.max(incoming, outgoing)
  })
}

function setWidths (G, scale) {
  G.edges().forEach(e => {
    const edge = G.edge(e)
    edge.dy = edge.value * scale
  })
  G.nodes().forEach(u => {
    const node = G.node(u)
    node.dy = node.value * scale
  })
}

function required (f) {
  if (typeof f !== 'function') throw new Error()
  return f
}

function addLinkEndpoints (G) {
  G.edges().forEach(e => {
    const edge = G.edge(e)
    edge.points.unshift({x: edge.x0, y: edge.y0})
    edge.points.push({x: edge.x1, y: edge.y1})
  })
}

function copyResultsToGraph (G, graph) {
  G.nodes().forEach(u => {
    const node = G.node(u)
    node.data.incoming = []
    node.data.outgoing = []
    node.data.x = node.x
    node.data.y = node.y
    node.data.dy = node.dy
    node.data.rank = node.rank
    node.data.band = node.band
    node.data.depth = node.depth
    node.data.value = node.value
  })

  G.edges().forEach(e => {
    const edge = G.edge(e)
    edge.data.source = G.node(e.v).data
    edge.data.target = G.node(e.w).data
    edge.data.source.outgoing.push(edge.data)
    edge.data.target.incoming.push(edge.data)
    edge.data.value = edge.value
    edge.data.dy = edge.dy
    edge.data.points = edge.points || []
  })
}
