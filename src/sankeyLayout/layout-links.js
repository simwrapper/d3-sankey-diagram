/**
 * Edge positioning.
 *
 * @module link-positioning
 */

import { map } from 'd3-collection'
import { findFirst, sweepCurvatureInwards } from './utils'

/*
 * Requires incoming and outgoing attributes on nodes
 */
export default function layoutLinks (G) {
  // G.edges().forEach(e => {
  //   // link.id = `${link.source.id}-${link.target.id}-${link.type}`
  //   // link.segments = new Array(1 + (link.dummyNodes || []).length)
  //   // for (let i = 0; i < link.segments.length; ++i) link.segments[i] = {}
  // })

  setEdgeEndpoints(G)
  setEdgeCurvatures(G)

  return G
}

function setEdgeEndpoints (G) {
  G.nodes().forEach(u => {
    const node = G.node(u)
    node.subdivisions.forEach(sub => {
      let sy = node.y + sub.y
      let ty = node.y + sub.y

      sub.outgoing.forEach(e => {
        const link = G.edge(e)
        link.x0 = node.x
        link.y0 = sy + link.dy / 2
        link.d0 = node.backwards ? 'l' : 'r'
        link.dy = link.dy
        sy += link.dy
      })

      sub.incoming.forEach(e => {
        const link = G.edge(e)
        link.x1 = node.x
        link.y1 = ty + link.dy / 2
        link.d1 = node.backwards ? 'l' : 'r'
        link.dy = link.dy
        ty += link.dy
      })
    })
  })
}

function setEdgeCurvatures (G) {
  G.nodes().forEach(u => {
    const node = G.node(u)
    // node.outgoing.sort((a, b) => a.y0 - b.y0)
    // node.incoming.sort((a, b) => a.y1 - b.y1)
    setEdgeEndCurvatures(G, flatten(node.subdivisions, d => d.outgoing), 'r0')
    setEdgeEndCurvatures(G, flatten(node.subdivisions, d => d.incoming), 'r1')
  })
}

function flatten (x, f) {
  return x.reduce(function (a, b) { return a.concat(f(b)) }, [])
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

function setEdgeEndCurvatures (G, edges, rr) {
  const links = edges.map(e => G.edge(e))

  // initialise segments, find reversal of curvature
  links.forEach(link => {
    // const link = (i < 0) ? link.segments[link.segments.length + i] : link.segments[i]
    link.Rmax = maximumRadiusOfCurvature(link)
    link[rr] = Math.max(link.dy / 2, (link.d0 === link.d1 ? link.Rmax * 0.6 : (5 + link.dy / 2)))
  })

  let jmid = (rr === 'r0'
              ? findFirst(links, f => f.y1 > f.y0)
              : findFirst(links, f => f.y0 > f.y1))
  if (jmid === null) jmid = links.length

  // Set maximum radius down from middle
  sweepCurvatureInwards(links.slice(jmid), rr)

  // Set maximum radius up from middle
  if (jmid > 0) {
    let links2 = []
    for (let j = jmid - 1; j >= 0; j--) links2.push(links[j])
    sweepCurvatureInwards(links2, rr)
  }
}
