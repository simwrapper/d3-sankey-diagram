import { select, local } from 'd3-selection'

export default function () {
  let nodeTitle = (d) => d.id
  let nodeVisible = (d) => !!nodeTitle(d)

  function sankeyNode (context) {
    const selection = context.selection ? context.selection() : context

    if (selection.select('text').empty()) {
      selection.append('title')
      selection.append('text')
        .attr('dy', '.35em')
      selection.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
      selection.append('rect')
        .attr('x', -5)
        .attr('y', -5)
        .attr('width', 10)
        .style('fill', 'none')
        .style('visibility', 'hidden')
        .style('pointer-events', 'all')

      selection
        .attr('transform', nodeTransform)
    }

    let title = selection.select('title')
    let text = selection.select('text')
    let line = selection.select('line')
    let clickTarget = selection.select('rect')

    // Local var for title position of each node
    const nodeLayout = local()
    selection.each(function (d) {
      const layoutData = titlePosition(d)
      layoutData.dy = (d.dy === 0) ? 0 : Math.max(1, d.dy)
      nodeLayout.set(this, layoutData)
    })

    // Update un-transitioned
    title
      .text(nodeTitle)

    text
      .attr('text-anchor', function (d) { return nodeLayout.get(this).right ? 'end' : 'start' })
      .text(nodeTitle)
      .each(wrap, 100)

    // Are we in a transition?
    if (context !== selection) {
      text = text.transition(context)
      line = line.transition(context)
      clickTarget = clickTarget.transition(context)
    }

    // Update
    context
      .attr('transform', nodeTransform)
      .style('display', function (d) {
        return (d.dy === 0 || !nodeVisible(d)) ? 'none' : 'inline'
      })

    line
      .attr('y1', function (d) { return nodeLayout.get(this).titleAbove ? -5 : 0 })
      .attr('y2', function (d) { return nodeLayout.get(this).dy })

    clickTarget
      .attr('height', function (d) { return nodeLayout.get(this).dy + 5 })

    text
      .attr('transform', textTransform)

    function textTransform (d) {
      const layout = nodeLayout.get(this)
      const y = layout.titleAbove ? -10 : d.dy / 2
      const x = (layout.right ? 1 : -1) * (layout.titleAbove ? 4 : -4)
      return 'translate(' + x + ',' + y + ')'
    }
  }

  sankeyNode.nodeVisible = function (x) {
    if (arguments.length) {
      nodeVisible = required(x)
      return sankeyNode
    }
    return nodeVisible
  }

  sankeyNode.nodeTitle = function (x) {
    if (arguments.length) {
      nodeTitle = required(x)
      return sankeyNode
    }
    return nodeTitle
  }

  return sankeyNode
}

function nodeTransform (d) {
  return 'translate(' + d.x + ',' + d.y + ')'
}

function titlePosition (d) {
  let titleAbove = false
  let right = false

  // If thin, and there's enough space, put above
  if (d.spaceAbove > 20 && d.style !== 'type') {
    titleAbove = true
  } else {
    titleAbove = false
    if (d.outgoing.length === 1 && d.incoming.length > 1) {
      right = false
    } else if (d.incoming.length === 1 && d.outgoing.length > 1) {
      right = true
    }
  }

  // Stick labels outside at edges
  if (d.incoming.length === 0) {
    right = true
    titleAbove = false
  } else if (d.outgoing.length === 0) {
    right = false
    titleAbove = false
  }

  return {titleAbove, right}
}

function wrap (d, width) {
  var text = select(this)
  var lines = text.text().split(/\n/)
  var lineHeight = 1.1 // ems
  if (lines.length === 1) return
  text.text(null)
  lines.forEach(function (line, i) {
    text.append('tspan')
      .attr('x', 0)
      .attr('dy', (i === 0 ? 0.7 - lines.length / 2 : 1) * lineHeight + 'em')
      .text(line)
  })
}

function required (f) {
  if (typeof f !== 'function') throw new Error()
  return f
}
