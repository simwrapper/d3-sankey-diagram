import d3 from 'd3';

import sankeyLinkPath from './linkPath';


export default function() {
  let linkTitle = (d) => defaultLinkTitle;

  const path = sankeyLinkPath();

  function sankeyLink(selection) {
    selection.each(function(d) {
      const link = d3.select(this),
            transition = d3.transition(link);

      if (!this._current) {
        // first time
        this._current = d;
        link.attr('d', path);
      }

      // Enter title
      const title = link.selectAll('title').data([0]);
      title.enter().append('title');

      // Update
      if (transition.attrTween) {
        transition.attrTween('d', tweenLink);
      } else {
        transition.attr('d', path);
        this._current = d;
      }

      link.select('title')
        .text(linkTitle);

    });
  }

  // Store the displayed state in _current.
  // Then, interpolate from _current to the new state.
  // During the transition, _current is updated in-place by d3.interpolate.
  function tweenLink(b) {
    var i = d3.interpolate(this._current, {
      x0: b.x0,
      y0: b.y0,
      x1: b.x1,
      y1: b.y1,
      dy: b.dy,
      r0: b.r0,
      r1: b.r1,
    });
    this._current = i(0);
    return function(t) {
      var link = i(t);
      return path(i(t));
    };
  }

  sankeyLink.linkTitle = function(x) {
    if (!arguments.length) return linkTitle;
    linkTitle = d3.functor(x);
    return sankeyLink;
  };

  return sankeyLink;
}


function defaultLinkTitle(d) {
  return `${d.source.id} → ${d.target.id}\n${d.data.type || ''}`;
}
