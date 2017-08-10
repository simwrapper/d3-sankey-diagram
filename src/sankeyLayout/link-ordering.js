/** @module edge-ordering */

import { set } from 'd3-collection'
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
function orderEdgesOne (G, v, {alignLinkTypes = false} = {}) {
  const node = G.node(v)
  node.incoming = G.inEdges(v)
  node.outgoing = G.outEdges(v)

  if (alignLinkTypes) {
    const mo = linkTypeOrder(node)
    node.incoming.sort(compareDirectionGroupingTypes(G, mo, false))
    node.outgoing.sort(compareDirectionGroupingTypes(G, mo, true))
  } else {
    node.incoming.sort(compareDirection(G, false))
    node.outgoing.sort(compareDirection(G, true))
  }
}

function compareDirection (G, head = true) {
  return function (a, b) {
    var da = linkDirection(G, a, head)
    var db = linkDirection(G, b, head)
    var c = head ? 1 : -1

    // links between same node, sort on type
    if (a.v === b.v && a.w === b.w) {
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
