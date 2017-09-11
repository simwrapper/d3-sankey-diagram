import { map } from 'd3-collection'
import { sum } from 'd3-array'

export default function buildSubdivisions (G) {
  G.nodes().forEach(u => {
    const node = G.node(u)

    if (!node.subdivisions) node.subdivisions = []

    let defaultSub = null
    if (node.subdivisions.filter(d => d.id === null).length === 0) {
      defaultSub = {id: null}
      node.subdivisions.push(defaultSub)
    }

    node.subdivisions.forEach(sub => {
      sub.incoming = []
      sub.outgoing = []
    })

    const subs = map(node.subdivisions, d => d.id)
    G.inEdges(u).forEach(e => {
      const edge = G.edge(e)
      let s = edge.targetSub
      if (!subs.has(s)) s = null
      subs.get(s).incoming.push(e)
      edge.targetSub = subs.get(s)
    })
    G.outEdges(u).forEach(e => {
      const edge = G.edge(e)
      let s = edge.sourceSub
      if (!subs.has(s)) s = null
      subs.get(s).outgoing.push(e)
      // console.log(edge, s, subs.get(s))
      edge.sourceSub = subs.get(s)
    })

    if (defaultSub && defaultSub.incoming.length + defaultSub.outgoing.length === 0) {
      node.subdivisions.pop()
    }

    // Set coords
    let y = 0
    node.subdivisions.forEach(sub => {
      sub.y = y
      sub.dy = Math.max(sum(sub.incoming, e => G.edge(e).dy),
                        sum(sub.outgoing, e => G.edge(e).dy))

      sub.outgoing.forEach(e => {
        const link = G.edge(e)
        link.x0 = node.x1
        link.y0 = node.y + sub.y + link.dy / 2
      })
      sub.incoming.forEach(e => {
        const link = G.edge(e)
        link.x1 = node.x0
        link.y1 = node.y + sub.y + link.dy / 2
      })
      y += sub.dy
    })
  })
}
//   if (!node.data || !node.data.subdivisions) return
//   // XXX right place for this?
//   const subs = map(node.data.subdivisions, function (d) { return d.id })

//   node.outgoing.forEach(eachLink(true))
//   node.incoming.forEach(eachLink(false))

//   function eachLink (head) {
//     const attr = head ? 'y0' : 'y1'
//     return function (e) {
//       const link = G.edge(e)
//       const sl = getSub(link, head)
//       if (subs.has(sl)) {
//         updateSub(subs.get(sl), link, attr)
//       }
//     }
//   }

//   function updateSub (sub, link, attr) {
//     sub.y0 = minDefault(sub.y0, link[attr] - link.dy / 2 - node.y)
//     sub.y1 = maxDefault(sub.y1, link[attr] + link.dy / 2 - node.y)
//     return sub
//   }

//   function minDefault (x, y) {
//     return (x === undefined ? y : Math.min(y, x))
//   }

//   function maxDefault (x, y) {
//     return (x === undefined ? y : Math.max(y, x))
//   }
// }

