/** @module edge-ordering */

import { set, map } from 'd3-collection'
import linkDirection from './link-direction'

/**
 * Order the edges at all nodes.
 */
export default function orderEdges (G, opts) {
  G.nodes().forEach(u => orderEdgesOne(G, u, opts))
}

/**
 * Order the edges at the given node.
 */
function orderEdgesOne (G, v, {alignLinkTypes = false, firstRun = false} = {}) {
  const node = G.node(v)

  // node.incoming = G.inEdges(v)
  // node.outgoing = G.outEdges(v)

  // if (firstRun) {
  //   // set edge endpoints to centre of nodes
  //   // XXX would be better to calculate subdivisions up front
  //   setEdgeEndpoints(G, node)
  // }

  node.subdivisions.forEach(sub => {
    sub.incoming.sort(compareDirection(G, node, false))
    sub.outgoing.sort(compareDirection(G, node, true))
  })
  // if (alignLinkTypes) {
  //   const mo = linkTypeOrder(node)
  //   node.incoming.sort(compareDirectionGroupingTypes(G, mo, false))
  //   node.outgoing.sort(compareDirectionGroupingTypes(G, mo, true))
  // } else {
  //   node.incoming.sort(compareDirection(G, node, false))
  //   node.outgoing.sort(compareDirection(G, node, true))
  // }
}

// function getSub (G, e, head) {
//   const edge = G.edge(e)
//   return head ? edge.sourceSub : edge.targetSub
// }

function compareDirection (G, node, head = true) {
  // const subOrder = (node.data && node.data.subdivisions || []).map(function (d) {
  //   return d.id
  // })

  return function (a, b) {
    // // Sort first on subdivision, if set
    // // XXX copy sub to graph, don't use .data
    // var sa = getSub(G, a, head)
    // var sb = getSub(G, b, head)
    // if (sa !== sb) {
    //   // TODO looking index in node.subdivisions
    //   return subOrder.indexOf(sa) - subOrder.indexOf(sb)
    // }

    var da = linkDirection(G, a, head)
    var db = linkDirection(G, b, head)
    var c = head ? 1 : -1

    // links between same node, sort on type
    if (a.v === b.v && a.w === b.w && Math.abs(da - db) < 1e-3) {
      if (typeof a.name === 'number' && typeof b.name === 'number') {
        return a.name - b.name
      } else if (typeof a.name === 'string' && typeof b.name === 'string') {
        return a.name.localeCompare(b.name)
      } else {
        return 0
      }
    }

    // loops to same slice based on y-position
    if (Math.abs(da - db) < 1e-3) {
      if (a.w === b.w) {
        return G.node(b.v).y - G.node(a.v).y
      } else if (a.v === b.v) {
        return G.node(b.w).y - G.node(a.w).y
      } else {
        return 0
      }
    }

    // otherwise sort by direction
    return c * (da - db)
  }
}

function compareDirectionGroupingTypes (G, mo, clockwise = true) {
  return function (a, b) {
    // sort first by type order
    if (a.name !== b.name) {
      return mo.indexOf(a.name) - mo.indexOf(b.name)
    }

    // Sort on direction for same type
    const da = linkDirection(G, a, clockwise)
    const db = linkDirection(G, b, clockwise)
    const c = clockwise ? 1 : -1

    // loops to same slice based on y-position
    if (Math.abs(da - db) < 1e-3) {
      if (a.w === b.w) {
        return c * (da > 0 ? -1 : 1) * (G.node(a.v).y - G.node(b.v).y)
      } else if (a.v === b.v) {
        return c * (da > 0 ? -1 : 1) * (G.node(a.w).y - G.node(b.w).y)
      } else {
        return 0
      }
    }

    // otherwise sort by direction
    return c * (da - db)
  }
}

function linkTypeOrder (node) {
  const types = set()
  node.incoming.forEach(e => types.add(e.name))
  node.outgoing.forEach(e => types.add(e.name))

  const sorted = types.values()
  sorted.sort()
  return sorted
}
