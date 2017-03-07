/**
 * Edge positioning.
 *
 * @module edge-positioning
 */

import { findFirst, sweepCurvatureInwards } from './utils'

export default function layoutLinks (graph) {
  graph.edges().forEach(edge => {
    edge.id = `${edge.source.id}-${edge.target.id}-${edge.type}`
    edge.segments = new Array(1 + (edge.dummyNodes || []).length)
    for (let i = 0; i < edge.segments.length; ++i) edge.segments[i] = {}
  })

  setEdgeEndpoints(graph)
  setEdgeCurvatures(graph)

  return graph
}

function setEdgeEndpoints (G) {
  G.nodes().forEach(node => {
    let sy = 0
    let ty = 0

    node.outgoing.forEach(edge => {
      const seg = edge.segments[0]
      seg.x0 = node.x
      seg.y0 = node.y + sy + edge.dy / 2
      seg.d0 = node.backwards ? 'l' : 'r'
      seg.dy = edge.dy
      sy += edge.dy
    })

    node.incoming.forEach(edge => {
      const seg = edge.segments[edge.segments.length - 1]
      seg.x1 = node.x
      seg.y1 = node.y + ty + edge.dy / 2
      seg.d1 = node.backwards ? 'l' : 'r'
      seg.dy = edge.dy
      ty += edge.dy
    })
  })

  G.dummyNodes().forEach(node => {
    let y = 0

    node.edges.forEach(edge => {
      const dummies = edge.dummyNodes || []
      for (let i = 0; i < dummies.length; ++i) {
        if (dummies[i] === node) {
          const segIn = edge.segments[i]
          const segOut = edge.segments[i + 1]
          segIn.x1 = segOut.x0 = node.x
          segIn.y1 = segOut.y0 = node.y + y + edge.dy / 2
          segIn.d1 = segOut.d0 = node.backwards ? 'l' : 'r'
          segIn.dy = edge.dy
          y += edge.dy
          break
        }
      }
    })
  })
}

function setEdgeCurvatures (G) {
  G.nodes().forEach(node => {
    node.outgoing.sort((a, b) => a.segments[0].y0 - b.segments[0].y0)
    node.incoming.sort((a, b) => a.segments[a.segments.length - 1].y1 - b.segments[b.segments.length - 1].y1)
    setEdgeEndCurvatures(node.outgoing.map(edge => edge.segments[0]), 'r0')
    setEdgeEndCurvatures(node.incoming.map(edge => edge.segments[edge.segments.length - 1]), 'r1')
  })
}

function maximumRadiusOfCurvature (link) {
  var Dx = link.x1 - link.x0
  var Dy = link.y1 - link.y0
  if (link.d0 !== link.d1) {
    return Math.abs(Dy) / 2.1
  } else {
    return (Dy !== 0) ? (Dx * Dx + Dy * Dy) / Math.abs(4 * Dy) : Infinity
  }
}

function setEdgeEndCurvatures (segments, rr) {
  // initialise segments, find reversal of curvature
  segments.forEach(seg => {
    // const seg = (i < 0) ? edge.segments[edge.segments.length + i] : edge.segments[i]
    seg.Rmax = maximumRadiusOfCurvature(seg)
    seg[rr] = Math.max(seg.dy / 2, (seg.d0 === seg.d1 ? seg.Rmax * 0.6 : (5 + seg.dy / 2)))
  })

  let jmid = (rr === 'r0'
              ? findFirst(segments, f => f.y1 > f.y0)
              : findFirst(segments, f => f.y0 > f.y1))
  if (jmid === null) jmid = segments.length

  // Set maximum radius down from middle
  sweepCurvatureInwards(segments.slice(jmid), rr)

  // Set maximum radius up from middle
  if (jmid > 0) {
    let segments2 = []
    for (let j = jmid - 1; j >= 0; j--) segments2.push(segments[j])
    sweepCurvatureInwards(segments2, rr)
  }
}
