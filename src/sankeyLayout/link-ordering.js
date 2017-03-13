/** @module edge-ordering */

import linkTypeOrder from './link-type-order'
import linkDirection from './link-direction'

/**
 * Order the edges in the graph G, with node positions already set.
 *
 * @param {Graph} G - The graph. Nodes must have `x` and `y` attributes.
 *
 */
export default function orderEdges (G, {alignLinkTypes = false} = {}) {
  G.nodes().forEach(node => {
    if (alignLinkTypes) {
      const mo = linkTypeOrder(node)
      node.incoming.sort(compareDirectionGroupingTypes(mo, false))
      node.outgoing.sort(compareDirectionGroupingTypes(mo, true))
    } else {
      node.incoming.sort(compareDirection(false))
      node.outgoing.sort(compareDirection(true))
    }
  })
}

function compareDirection (head = true) {
  return function (a, b) {
    var da = linkDirection(a, head)
    var db = linkDirection(b, head)
    var c = head ? 1 : -1

    // links between same node, sort on type
    if (a.source === b.source && a.target === b.target) {
      if (typeof a.type === 'number' && typeof b.type === 'number') {
        return a.type - b.type
      } else if (typeof a.type === 'string' && typeof b.type === 'string') {
        return a.type.localeCompare(b.type)
      } else {
        return 0
      }
    }

    // loops to same slice based on y-position
    if (Math.abs(da - db) < 1e-3) {
      if (a.target === b.target) {
        return b.source.y - a.source.y
      } else if (a.source === b.source) {
        return b.target.y - a.target.y
      } else {
        return 0
      }
    }

    // otherwise sort by direction
    return c * (da - db)
  }
}

function compareDirectionGroupingTypes (mo, clockwise = true) {
  return function (a, b) {
    // sort first by type order
    if (a.type !== b.type) {
      return mo.indexOf(a.type) - mo.indexOf(b.type)
    }

    // Sort on direction for same type
    const da = linkDirection(a)
    const db = linkDirection(b)
    const c = clockwise ? 1 : -1

    // loops to same slice based on y-position
    if (Math.abs(da - db) < 1e-3) {
      if (a.target === b.target) {
        return c * (da > 0 ? -1 : 1) * (a.source.y - b.source.y)
      } else if (a.source === b.source) {
        return c * (da > 0 ? -1 : 1) * (a.target.y - b.target.y)
      } else {
        return 0
      }
    }

    // otherwise sort by direction
    return c * (da - db)
  }
}
