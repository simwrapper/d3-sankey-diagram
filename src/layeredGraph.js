var keyPrefix = '$'  // Protect against keys like “__proto__”.

function defaultId (d) {
  return d.id
}

function defaultSourceId (d) {
  return d.source
}

function defaultTargetId (d) {
  return d.target
}

export default function () {
  var id = defaultId
  var sourceId = defaultSourceId
  var targetId = defaultTargetId

  function layeredGraph (nodeData, edgeData) {
    var i
    var d
    var nn = nodeData.length
    var ne = edgeData.length
    var nodes = new Array(nn)
    var edges = new Array(ne)
    var nodeKey
    var nodesByKey = {}
    var source
    var target

    for (i = 0; i < nn; ++i) {
      d = nodeData[i]
      nodes[i] = { id: id(d), data: d }
      nodeKey = keyPrefix + nodes[i].id
      if (nodeKey in nodesByKey) {
        throw new Error('duplicate node id: ' + nodes[i].id)
      }
      nodesByKey[nodeKey] = nodes[i]
    }

    for (i = 0; i < ne; ++i) {
      d = edgeData[i]
      source = nodesByKey[keyPrefix + sourceId(d)]
      target = nodesByKey[keyPrefix + targetId(d)]
      if (!source) throw new Error('unknown source id: ' + sourceId(d))
      if (!target) throw new Error('unknown target id: ' + targetId(d))
      edges[i] = { source: source, target: target, data: d }
    }

    return {
      nodes: nodes,
      edges: edges
    }
  }

  layeredGraph.id = function (x) {
    if (arguments.length) {
      id = required(x)
      return layeredGraph
    }
    return id
  }

  layeredGraph.sourceId = function (x) {
    if (arguments.length) {
      sourceId = required(x)
      return layeredGraph
    }
    return sourceId
  }

  layeredGraph.targetId = function (x) {
    if (arguments.length) {
      targetId = required(x)
      return layeredGraph
    }
    return targetId
  }

  return layeredGraph
}

function required (f) {
  if (typeof f !== 'function') throw new Error()
  return f
}
