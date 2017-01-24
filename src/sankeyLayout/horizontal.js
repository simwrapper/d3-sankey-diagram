import { sum } from 'd3-array'

export function minEdgeDx (edge) {
  const w = edge.dy
  const dy = edge.target.y - edge.source.y
  const ay = Math.abs(dy) - w  // final sign doesn't matter
  const dx2 = w * w - ay * ay
  const dx = dx2 >= 0 ? Math.sqrt(dx2) : w
  return dx
}

export default function positionHorizontally (nested, width) {
  const minWidths = new Array(nested.length - 1)
  for (let i = 0; i < nested.length - 1; ++i) {
    minWidths[i] = 0
    nested[i].forEach(band => {
      band.forEach(d => {
        // edges for dummy nodes, outgoing for real nodes
        (d.outgoing || d.edges).forEach(e => {
          minWidths[i] = Math.max(minWidths[i], minEdgeDx(e))
        })
      })
    })
  }
  const totalMinWidth = sum(minWidths)

  let dx
  if (totalMinWidth > width) {
    // allocate fairly
    dx = minWidths.map(w => width * w / totalMinWidth)
  } else {
    const spare = (width - totalMinWidth) / (nested.length - 1)
    dx = minWidths.map(w => w + spare)
  }

  let x = 0
  nested.forEach((layer, i) => {
    layer.forEach(band => {
      band.forEach(d => {
        d.x = x
      })
    })
    x += dx[i]
  })
}
