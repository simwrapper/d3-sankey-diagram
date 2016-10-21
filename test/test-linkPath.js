import sankeyLink from '../src/linkPath';

import test from 'tape';

import { assertAlmostEqual } from './assert-almost-equal';
import compareSVGPath from './compareSVGPath';


test('link SVG: different radii', t => {
  let link = sankeyLink();
  let edge1 = {
    x0: 0,
    y0: 0,
    x1: 30,
    y1: 70,
    dy: 2,
    r0: 10,
    r1: 20,
  };

  // Arc: A rx ry theta large-arc-flag direction-flag x y
  compareSVGPath(t, link(edge1),
                 'M0,-1 ' +
                 'A11 11 1.571 0 1 11,10 ' +
                 'L11,50 ' +
                 'A19 19 1.571 0 0 30,69 ' +
                 'L30,71 ' +
                 'A21 21 1.571 0 1 9,50 '+
                 'L9,10 ' +
                 'A9 9 1.571 0 0 0,1 ' +
                 'Z', 'edge1');

  let edge2 = {
    x0: 0,
    y0: 0,
    x1: 30,
    y1: -70,
    dy: 2,
    r0: 10,
    r1: 20,
  };

  compareSVGPath(t, link(edge2),
                 'M0,-1 ' +
                 'A9 9 1.571 0 0 9,-10 ' +
                 'L9,-50 ' +
                 'A21 21 1.571 0 1 30,-71 ' +
                 'L30,-69 ' +
                 'A19 19 1.571 0 0 11,-50 '+
                 'L11,-10 ' +
                 'A11 11 1.571 0 1 0,1 ' +
                 'Z', 'edge2');
  t.end();
});


test('link SVG: default link shape has two adjacent circular arcs', t => {
  let link = sankeyLink();
  let edge = {
    x0: 0,
    x1: 15,
    y0: 0,
    y1: 10,
    dy: 2
  };

  // radius = 5
  // Arc: A rx ry theta large-arc-flag direction-flag x y
  compareSVGPath(t, link(edge),
                 'M0,-1 ' +
                 'A6 6 0.729 0 1 4,0.527 ' +
                 'L12.333,7.981 ' +
                 'A4 4 0.729 0 0 15,9 ' +
                 'L15,11 ' +
                 'A6 6 0.729 0 1 11,9.472 '+
                 'L2.666,2.018 ' +
                 'A4 4 0.729 0 0 0,1 ' +
                 'Z');
  t.end();
});


test('link SVG: default link shape reduces to straight line', t => {
  let link = sankeyLink();
  let edge = {
    x0: 0,
    y0: 0,
    x1: 10,
    y1: 0,
    dy: 2,
    r0: 1,
    r1: 1,
  };

  // Arc: A rx ry theta large-arc-flag direction-flag x y
  compareSVGPath(t, link(edge),
                 'M0,-1 ' +
                 'A0 0 0 0 0 0,-1 ' +
                 'L10,-1 ' +
                 'A0 0 0 0 0 10,-1 ' +
                 'L10,1 ' +
                 'A0 0 0 0 0 10,1 ' +
                 'L0,1 ' +
                 'A0 0 0 0 0 0,1 ' +
                 'Z');

  t.end();
});


// XXX check this with r0, r1
test('link SVG: specifying link radius', t => {
  let link = sankeyLink();
  let edge = {
    x0: 0,
    x1: 2,
    y0: 0,
    y1: 10,
    dy: 2,
    r1: 1,  // minimum radius
    r2: 1,  // minimum radius
  };

  // radius = 1, angle = 90
  // Arc: A rx ry theta large-arc-flag direction-flag x y
  compareSVGPath(t, link(edge),
                 'M0,-1 ' +
                 'A2 2 1.570 0 1 2,0.999 ' +
                 'L2,9 ' +
                 'A0 0 1.570 0 0 2,9 ' +
                 'L2,11 ' +
                 'A2 2 1.570 0 1 0,9 ' +
                 'L0,1 ' +
                 'A0 0 1.570 0 0 0,1 ' +
                 'Z');
  t.end();
});


test('link SVG: minimum thickness', t => {
  let link = sankeyLink();
  let edge = {
    x0: 0,
    x1: 10,
    y0: 0,
    y1: 0,
    dy: 2
  };

  let path1 = link(edge);
  edge.dy = 0.01;
  let path2 = link(edge);

  compareSVGPath(t, path1, path2, 'minimum thickness should be 2');

  edge.dy = 0;
  compareSVGPath(t, link(edge),
                 'M0,0 ' +
                 'A0 0 0 0 0 0,0 ' +
                 'L10,0 ' +
                 'A0 0 0 0 0 10,0 ' +
                 'L10,0 ' +
                 'A0 0 0 0 0 10,0 ' +
                 'L0,0 ' +
                 'A0 0 0 0 0 0,0 ' +
                 'Z', 'should disappear when dy = 0');

  t.end();
});


// test('link SVG: self-loops are drawn below with default radius 1.5x width', t => {
//   let link = sankeyLink(),
//       node = {},
//       edge = {
//         x0: 0,
//         x1: 0,
//         y0: 0,
//         y1: 0,
//         dy: 10,
//         source: node,
//         target: node,
//       };

//   // Arc: A rx ry theta large-arc-flag direction-flag x y
//   compareSVGPath(t, link(edge),
//                  'M0.1,-5 ' +
//                  'A12.5 12.5 6.283 1 1 -0.1,-5 ' +
//                  'L-0.1,5 ' +
//                  'A2.5 2.5 6.283 1 0 0.1,5 ' +
//                  'Z');

//   t.end();
// });


test('link SVG: flow from forward to reverse node', t => {
  let edge = {
    x0: 0,
    y0: 0,
    x1: 0,
    y1: 50,
    dy: 10,
    d0: 'r',
    d1: 'l',
  };

  // Arc: A rx ry theta large-arc-flag direction-flag x y
  compareSVGPath(t, sankeyLink()(edge),
                 'M0,-5 ' +
                 'A15 15 1.570 0 1 15,10 ' +
                 'L15,40 ' +
                 'A15 15 1.570 0 1 0,55 ' +
                 'L0,45 ' +
                 'A5 5 1.570 0 0 5,40 ' +
                 'L5,10 ' +
                 'A5 5 1.570 0 0 0,5 ' +
                 'Z');

  // force radius
  edge.r0 = edge.r1 = 20;
  compareSVGPath(t, sankeyLink()(edge),
                 'M0,-5 ' +
                 'A25 25 1.570 0 1 25,20 ' +
                 'L25,30 ' +
                 'A25 25 1.570 0 1 0,55 ' +
                 'L0,45 ' +
                 'A15 15 1.570 0 0 15,30 ' +
                 'L15,20 ' +
                 'A15 15 1.570 0 0 0,5 ' +
                 'Z');

  t.end();
});


test('link SVG: flow from reverse to forward node', t => {
  let edge = {
    x0: 0,
    y0: 0,
    x1: 0,
    y1: 50,
    dy: 10,
    d0: 'l',
    d1: 'r',
  };

  // Arc: A rx ry theta large-arc-flag direction-flag x y
  compareSVGPath(t, sankeyLink()(edge),
                 'M0,-5 ' +
                 'A15 15 1.570 0 0 -15,10 ' +
                 'L-15,40 ' +
                 'A15 15 1.570 0 0 0,55 ' +
                 'L0,45 ' +
                 'A5 5 1.570 0 1 -5,40 ' +
                 'L-5,10 ' +
                 'A5 5 1.570 0 1 0,5 ' +
                 'Z');
  t.end();
});


test('link SVG: flow from reverse to reverse node', t => {
  let edge = {
    x0: 20,
    y0: 0,
    x1: 0,
    y1: 0,
    dy: 10,
    d0: 'l',
    d1: 'l',
  };

  // Arc: A rx ry theta large-arc-flag direction-flag x y
  compareSVGPath(t, sankeyLink()(edge),
                 'M0,-5 ' +
                 'A0 0 0 0 0 0,-5 ' +
                 'L20,-5 ' +
                 'A0 0 0 0 0 20,-5 ' +
                 'L20,5 ' +
                 'A0 0 0 0 0 20,5 ' +
                 'L0,5 ' +
                 'A0 0 0 0 0 0,5 ' +
                 'Z');
  t.end();
});


test('link SVG: flow from forward to offstage node', t => {
  let edge = {
    x0: 0,
    y0: 5,
    x1: 10,
    y1: 30,
    dy: 10,
    d0: 'r',
    d1: 'd',
  };

  // Arc: A rx ry theta large-arc-flag direction-flag x y
  compareSVGPath(t, sankeyLink()(edge),
                 'M0,0 ' +
                 'A15 15 1.570 0 1 15,15 ' +
                 'L15,30 5,30 5,15 ' +
                 'A5 5 1.570 0 0 0,10 ' +
                 'Z');
  t.end();
});
