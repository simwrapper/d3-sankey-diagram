import sankeyDiagram from '../src/diagram';

import getBody from './get-document-body';
import d3 from 'd3';
import test from 'tape';


test('diagram: renders something and updates', t => {
  // prepare data
  const {nodes, links} = exampleBlastFurnace();

  // diagram

  const diagram = sankeyDiagram();

  const el = d3.select(getBody()).append('div');

  el
    .datum({nodes, links})
    .call(diagram);
  flushAnimationFrames();

  t.equal(el.selectAll('.node')[0].length, 21,
          'right number of nodes');

  t.equal(el.selectAll('.link')[0].length, 26,
          'right number of links');

  // update does not work in jsdom unless transitions are disabled
  if (process.browser) {
    const h0 = +el.select('.node').select('rect').attr('height');

    links.forEach(e => { e.value *= 1.1; });
    el.call(diagram);
    flushAnimationFrames();
    const h1 = +el.select('.node rect').attr('height');
    t.ok(h1 > h0, 'height updates');
  }

  t.end();
});


test('diagram: renders something and updates with transitions disabled', t => {
  // prepare data
  const {nodes, links} = exampleBlastFurnace();

  // diagram -- disable transitions
  const diagram = sankeyDiagram().duration(null);
  const el = d3.select(getBody()).append('div');

  el
    .datum({nodes, links})
    .call(diagram);

  // flushAnimationFrames not needed
  t.equal(el.selectAll('.node')[0].length, 21,
          'right number of nodes');

  t.equal(el.selectAll('.link')[0].length, 26,
          'right number of links');

  // update
  const h0 = +el.select('.node').select('rect').attr('height');

  links.forEach(e => { e.value *= 1.1; });
  el.call(diagram);
  // flushAnimationFrames not needed
  const h1 = +el.select('.node rect').attr('height');
  t.ok(h1 > h0, 'height updates');

  t.end();
});


test('diagram: types', t => {
  const {nodes, links} = exampleLinkTypes();

  const color = d3.scale.category10();
  const diagram = sankeyDiagram()
        .link(sel => sel.style('fill', d => color(d.data.type)));

  const el = render({nodes, links}, diagram);

  t.equal(el.selectAll('.node')[0].length, 4,
          'right number of nodes');

  t.equal(el.selectAll('.link')[0].length, 5,
          'right number of links');

  t.end();
});


test('diagram: types 2', t => {
  const example = exampleLinkTypes2();

  const color = d3.scale.category10();
  const diagram = sankeyDiagram()
        .link(sel => sel.style('fill', d => color(d.data.type)));

  const el = render(example, diagram);

  t.equal(el.selectAll('.node')[0].length, 5,
          'right number of nodes');

  t.equal(el.selectAll('.link')[0].length, 9,
          'right number of links');

  t.end();
});


test('diagram: link attributes', t => {
  const links = [
    {source: 'a', target: 'b', value: 2, type: 'x',
     color: 'red'},
  ];

  function customLink(link) {
    link
      .attr('class', d => `link type-${d.data.type}`)
      .style('fill', d => d.data.color)
      .style('opacity', d => 1 / d.data.value);
  }

  const diagram = sankeyDiagram()
        .nodeTitle(d => `Node ${d.id}`)
        .linkTypeTitle(d => `Type: ${d.data.type}`)
        .link(customLink);

  const el = render({links}, diagram),
        link = el.selectAll('.link');

  t.deepEqual(d3.rgb(link.style('fill')), d3.rgb('red'), 'link color');
  t.equal(link.style('opacity'), '0.5', 'link opacity');
  t.equal(link.attr('class'), 'link type-x', 'link class');
  t.equal(link.select('title').text(),
          'Node a → Node b\nType: x\n2.00', 'link title');

  diagram
    .nodeTitle('node')
    .linkTypeTitle('z');

  const el2 = render({links}, diagram),
        link2 = el2.selectAll('.link');

  t.equal(link2.select('title').text(),
          'node → node\nz\n2.00', 'link title (const)');

  t.end();
});


test('diagram: node attributes', t => {
  const links = [
    {source: 'a', target: 'b', value: 2}
  ];

  function customNode(node) {
    node
      .attr('class', 'node myclass');
  }

  // disable transitions
  const diagram = sankeyDiagram().duration(null);
  const el = render({links}, diagram);

  t.equal(el.selectAll('.node').attr('class'), 'node', 'node class before');

  diagram.node(customNode);
  el.call(diagram);

  t.equal(el.selectAll('.node').attr('class'), 'node myclass', 'node class after');

  t.end();
});

function render(datum, diagram) {
  const el = d3.select(getBody()).append('div');
  el.datum(datum).call(diagram);
  flushAnimationFrames();
  return el;
}


function exampleBlastFurnace() {
  // Simplified example of links through coke oven and blast furnace
  const nodes = [
  ];

  const links = [
    // main flow
    {source: 'input', target: 'oven', value: 2.5},
    {source: 'oven', target: 'coke', value: 2.5},
    {source: 'coke', target: 'sinter', value: 1},
    {source: 'coke', target: 'bf', value: 1.5},
    {source: 'sinter', target: 'bf', value: 1},
    {source: 'bf', target: 'output', value: 1},
    {source: 'bf', target: 'export', value: 1},

    // additional export links, and input-sinter
    {source: 'sinter', target: 'export', value: 0.2},
    {source: 'oven', target: 'export', value: 0.2},
    {source: 'input', target: 'sinter', value: 0.2},

    // return loops
    {source: 'oven', target: 'input', value: 0.5},
    {source: 'bf', target: 'input', value: 0.5},
  ];

  return {nodes, links};
}


function exampleLinkTypes() {
  const nodes = [
  ];

  const links = [
    {source: 'a', target: 'b', value: 2, type: 'x'},
    {source: 'a', target: 'b', value: 2, type: 'y'},
    {source: 'b', target: 'c', value: 1, type: 'x'},
    {source: 'b', target: 'c', value: 2, type: 'y'},
    {source: 'b', target: 'd', value: 1, type: 'x'},
  ];

  return {nodes, links};
}


function exampleLinkTypes2() {
  // this sometimes fails in Safari
  return {
    nodes: [
      { id: 'a', title: 'a' },
      { id: 'b', title: 'b' },
      { id: 'c', title: 'c' },
      { id: 'x', title: 'd' },
      { id: 'y', title: 'e' },
    ],
    links: [
      { source: 'a', target: 'x', value: 1.0, type: 'x' },
      { source: 'a', target: 'y', value: 0.7, type: 'y' },
      { source: 'a', target: 'y', value: 0.3, type: 'z' },

      { source: 'b', target: 'x', value: 2.0, type: 'x' },
      { source: 'b', target: 'y', value: 0.3, type: 'y' },
      { source: 'b', target: 'y', value: 0.9, type: 'z' },

      { source: 'x', target: 'c', value: 3.0, type: 'x' },
      { source: 'y', target: 'c', value: 1.0, type: 'y' },
      { source: 'y', target: 'c', value: 1.2, type: 'z' },
    ],
    alignLinkTypes: true
  };
}


/* Make animations synchronous for testing */

var flushAnimationFrames = function() {
  var now = Date.now;
  Date.now = function() { return Infinity; };
  d3.timer.flush();
  Date.now = now;
};
