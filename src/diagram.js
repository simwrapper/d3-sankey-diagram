// The reusable SVG component for the sliced Sankey diagram

import { sankeyLayout } from 'sankey-layout';

import sankeyLink from './link';
import sankeyNode from './node';

import d3 from 'd3';
import {Graph} from 'graphlib';


export default function sankeyDiagram() {

  let margin = {top: 100, right: 100, bottom: 100, left: 100},
      width = 500,
      height = 500;

  let linkColor = (d => null),
      linkOpacity = (d => null),
      materialTitle = (d => d.data.material);

  let selectedNode = null,
      selectedEdge = null;

  const layout = sankeyLayout()
          .whitespace(0.5)
          .separation(nodeSeparation);

  const format = d3.format('.3s');

  const node = sankeyNode(),
        link = sankeyLink()
          .linkTitle(linkTitle);

  /* Main chart */

  var dispatch = d3.dispatch('selectNode', 'selectEdge');
  function exports(_selection) {
    _selection.each(function(datum) {

      // Create the skeleton, if it doesn't already exist
      const svg = d3.select(this).selectAll('svg').data([datum]);
      createGroups(svg);

      // Update dimensions
      svg.attr({width: width, height: height});
      svg.select('.sankey')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      svg.select('.slice-titles')
        .attr('transform', 'translate(' + margin.left + ',0)');

      // Do Sankey layout
      if (!datum) return;
      layout.size([width - margin.left - margin.right,
                   height - margin.top - margin.bottom]);
      layout(datum.flows || [], datum.processes || [], datum.rankSets || []);

      // Render
      updateNodes(svg, layout.nodes());
      updateLinks(svg, layout.links());
      // updateSlices(svg, layout.slices(nodes));

      // Events
      svg.on('click', function() {
        dispatch.selectNode.call(this, null);
        dispatch.selectEdge.call(this, null);
      });

    });
  }

  function updateNodes(svg, nodes) {
    var nodeSel = svg.select('.nodes').selectAll('.node')
          .data(nodes, d => d.id);

    nodeSel.enter()
      .append('g')
      .classed('node', true)
    // .classed('offstage', getNodeOffstage)
      .on('click', selectNode);

    nodeSel
      .call(node)
      .attr('class', d => `node node-type-${(d.data || {}).style || 'default'}`
            + (d.id === selectedNode ? ' selected' : ''));

    nodeSel.exit().remove();
  }

  function updateLinks(svg, edges) {
    var linkSel = svg.select('.links').selectAll('.link')
          .data(edges, d => d.id);

    linkSel.enter()
      .append('path')
      .attr('class', 'link')
      .style('fill', linkColor)
      .style('opacity', linkOpacity)
      .on('click', selectEdge);

    // Update
    linkSel.call(link);
    linkSel.transition()
      .style('fill', linkColor)
      .style('opacity', linkOpacity);

    linkSel.classed('selected', (d) => d.id === selectedEdge);
    linkSel.sort(linkOrder);

    linkSel.exit().remove();
  }

  function updateSlices(svg, slices) {
    var slice = svg.select('.slice-titles').selectAll('.slice')
          .data(slices, function(d) { return d.id; });

    var textWidth = (slices.length > 1 ?
                     0.9 * (slices[1].x - slices[0].x) :
                     null);

    slice.enter().append('g')
      .attr('class', 'slice')
      .append('foreignObject')
      .attr('requiredFeatures',
            'http://www.w3.org/TR/SVG11/feature#Extensibility')
      .attr('height', margin.top)
      .attr('class', 'title')
      .append('xhtml:div')
      .style('text-align', 'center')
      .style('word-wrap', 'break-word');
    // .text(pprop('sliceMetadata', 'title'));

    slice
      .attr('transform', function(d) {
        return 'translate(' + (d.x - textWidth / 2) + ',0)'; })
      .select('foreignObject')
      .attr('width', textWidth)
      .select('div');
    // .text(pprop('sliceMetadata', 'title'));

    slice.exit().remove();
  }

  function linkOrder(a, b) {
    // var f = style('edges', 'zIndex');
    // return (f(a) || 0) - (f(b) || 0);
    if (a.id === selectedEdge) return +1;
    if (b.id === selectedEdge) return -1;
    if (!a.source || a.target && a.target.direction === 'd') return -1;
    if (!b.source || b.target && b.target.direction === 'd') return +1;
    if (!a.target || a.source && a.source.direction === 'd') return -1;
    if (!b.target || b.source && b.source.direction === 'd') return +1;
    return a.dy - b.dy;
  }

  function linkTitle(d) {
    const parts = [];
    const sourceTitle = node.nodeTitle()(d.source),
          targetTitle = node.nodeTitle()(d.target),
          matTitle = materialTitle(d);
    parts.push(`${sourceTitle} → ${targetTitle}`);
    if (matTitle) parts.push(matTitle);
    parts.push(format(d.value));
    return parts.join('\n');
  }

  function selectEdge(d) {
    d3.event.stopPropagation();
    var el = d3.select(this)[0][0];
    dispatch.selectEdge.call(el, d);
  }

  function selectNode(d) {
    d3.event.stopPropagation();
    var el = d3.select(this)[0][0];
    dispatch.selectNode.call(el, d);
  }

  /* Public API */
  exports.width = function(_x) {
    if (!arguments.length) return width;
    width = parseInt(_x);
    return this;
  };

  exports.height = function(_x) {
    if (!arguments.length) return height;
    height = parseInt(_x);
    return this;
  };

  exports.margins = function(_x) {
    if (!arguments.length) return margin;
    margin = {
      top: _x.top === undefined ? margin.top : _x.top,
      left: _x.left === undefined ? margin.left : _x.left,
      bottom: _x.bottom === undefined ? margin.bottom : _x.bottom,
      right: _x.right === undefined ? margin.right : _x.right,
    };
    return this;
  };

  exports.ease = function(_x) {
    if (!arguments.length) return ease;
    ease = _x;
    return this;
  };

  exports.edgeValue = function(_x) {
    if (!arguments.length) return layout.edgeValue();
    layout.edgeValue(_x);
    return this;
  };

  // Node styles and title

  exports.nodeTitle = function(_x) {
    if (!arguments.length) return node.nodeTitle;
    node.nodeTitle(_x);
    return this;
  };

  // Link styles and titles

  exports.materialTitle = function(_x) {
    if (!arguments.length) return materialTitle;
    materialTitle = d3.functor(_x);
    return this;
  };

  exports.linkColor = function(_x) {
    if (!arguments.length) return linkColor;
    linkColor = d3.functor(_x);
    return this;
  };

  exports.linkOpacity = function(_x) {
    if (!arguments.length) return linkOpacity;
    linkOpacity = d3.functor(_x);
    return this;
  };

  exports.scale = function(_x) {
    if (!arguments.length) return scale;
    scale = _x;
    return this;
  };

  exports.selectNode = function(_x) {
    selectedNode = _x;
    return this;
  };

  exports.selectEdge = function(_x) {
    selectedEdge = _x;
    return this;
  };

  d3.rebind(exports, dispatch, 'on');
  return exports;
}

function nodeSeparation(a, b, G) {
  const a0 = G.inEdges(a).map(e => e.v),
        b0 = G.inEdges(b).map(e => e.v),
        a1 = G.outEdges(a).map(e => e.w),
        b1 = G.outEdges(b).map(e => e.w);
  let k = 0, n = 0, i;

  for (i = 0; i < b0.length; ++i) {
    ++n;
    if (a0.indexOf(b0[i]) !== -1) ++k;
  }
  for (i = 0; i < a0.length; ++i) {
    ++n;
    if (b0.indexOf(a0[i]) !== -1) ++k;
  }
  for (i = 0; i < b1.length; ++i) {
    ++n;
    if (a1.indexOf(b1[i]) !== -1) ++k;
  }
  for (i = 0; i < a1.length; ++i) {
    ++n;
    if (b1.indexOf(a1[i]) !== -1) ++k;
  }

  if (n === 0) { return 1; }
  return 1 - 0.6 * k / n;
}


function createGroups(svg) {
  const gEnter = svg.enter().append('svg')
          .append('g')
          .classed('sankey', true);
  gEnter.append('g').classed('links', true);  // Links below nodes
  gEnter.append('g').classed('nodes', true);
  gEnter.append('g').classed('slice-titles', true);  // Slice titles
}
