import { sum } from 'd3-array'

export default function positionNodesVertically (graph, nested, totalHeight, whitespace, separation) {
  const bandVals = bandValues(nested)

  nested.forEach(layer => {
    let y = 0
    layer.forEach((band, j) => {
      // Height of this band, based on fraction of value
      const bandHeight = bandVals[j] / sum(bandVals) * totalHeight

      const margin = whitespace * bandHeight / 5
      const height = bandHeight - 2 * margin
      const total = sum(band, d => d.dy)
      const gaps = band.map((d, i) => {
        if (!d.value) return 0
        return band[i + 1] ? separation(band[i], band[i + 1], graph) : 0
      })
      const space = Math.max(0, height - total)
      const kg = sum(gaps) ? space / sum(gaps) : 0

      const isFirst = true
      const isLast = true  // XXX bands

      let yy = y + margin
      if (band.length === 1) {
        // centre vertically
        yy += (height - band[0].dy) / 2
      }

      let prevGap = isFirst ? Number.MAX_VALUE : 0  // edge of graph
      band.forEach((node, i) => {
        node.y = yy
        node.spaceAbove = prevGap
        node.spaceBelow = gaps[i] * kg
        yy += node.dy + node.spaceBelow
        prevGap = node.spaceBelow

        // XXX is this a good idea?
        if (node.data && node.data.forceY !== undefined) {
          node.y = margin + node.data.forceY * (height - node.dy)
        }
      })
      if (band.length > 0) {
        band[band.length - 1].spaceBelow = isLast ? Number.MAX_VALUE : 0  // edge of graph
      }

      y += bandHeight
    })
  })
}

export function bandValues (nested) {
  if (nested.length === 0 || nested[0].length === 0) return []

  const Nb = nested[0].length
  const values = new Array(Nb)
  for (let i = 0; i < Nb; i++) values[i] = 0

  nested.forEach(rank => {
    rank.forEach((band, j) => {
      const total = sum(band, d => d.value)
      values[j] = Math.max(values[j], total)
    })
  })

  return values
}
