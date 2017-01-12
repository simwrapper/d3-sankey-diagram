import { Graph } from 'graphlib'

function defaultNodeId (d) {
  return d.id
}

function defaultSourceId (d) {
  return d.source
}

function defaultTargetId (d) {
  return d.target
}

function defaultEdgeType (d) {
  return d.type
}

export default function () {
  var nodeId = defaultNodeId
  var sourceId = defaultSourceId
  var targetId = defaultTargetId
  var edgeType = defaultEdgeType

  function graphify (nodeData, edgeData) {
    var i
    var d
    var id

    var graph = new Graph({ multigraph: true, directed: true })

    for (i = 0; i < nodeData.length; ++i) {
      d = nodeData[i]
      id = nodeId(d)
      if (graph.hasNode(id)) {
        throw new Error('duplicate node id: ' + id)
      }
      graph.setNode(id, d)
    }

    for (i = 0; i < edgeData.length; ++i) {
      d = edgeData[i]
      graph.setEdge({ v: sourceId(d), w: targetId(d), name: edgeType(d) }, d)
    }

    return graph
  }

  graphify.nodeId = function (x) {
    if (arguments.length) {
      nodeId = required(x)
      return graphify
    }
    return nodeId
  }

  graphify.sourceId = function (x) {
    if (arguments.length) {
      sourceId = required(x)
      return graphify
    }
    return sourceId
  }

  graphify.targetId = function (x) {
    if (arguments.length) {
      targetId = required(x)
      return graphify
    }
    return targetId
  }

  graphify.edgeType = function (x) {
    if (arguments.length) {
      edgeType = required(x)
      return graphify
    }
    return edgeType
  }

  return graphify
}

function required (f) {
  if (typeof f !== 'function') throw new Error()
  return f
}
