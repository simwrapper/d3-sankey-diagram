import sankeyDiagram from '../src/diagram';

import d3 from 'd3';
import test from 'tape';


test('diagram: renders something and updates', t => {
  // prepare data
  const {processes, flows} = exampleBlastFurnace();

  // diagram

  const diagram = sankeyDiagram();

  const el = d3.select('body').append('div');

  el
    .datum({processes, flows})
    .call(diagram);
  flushAnimationFrames();

  t.equal(el.selectAll('.node')[0].length, 21,
          'right number of nodes');

  t.equal(el.selectAll('.link')[0].length, 26,
          'right number of links');

  // update
  const h0 = +el.select('.node').select('rect').attr('height');

  flows.forEach(e => { e.value *= 1.1; });
  el.call(diagram);
  flushAnimationFrames();
  const h1 = +el.select('.node rect').attr('height');
  t.ok(h1 > h0, 'height updates');

  t.end();
});


test('diagram: materials', t => {
  const {processes, flows} = exampleMaterials();

  const color = d3.scale.category10();
  const diagram = sankeyDiagram()
          .linkColor(d => color(d.data.material));

  const el = render({processes, flows}, diagram);

  t.equal(el.selectAll('.node')[0].length, 4,
          'right number of nodes');

  t.equal(el.selectAll('.link')[0].length, 5,
          'right number of links');

  t.end();
});


test('diagram: link attributes', t => {
  const flows = [
    {source: 'a', target: 'b', value: 2, material: 'x',
     color: 'red'},
  ];

  const diagram = sankeyDiagram()
          .nodeTitle(d => `Node ${d.id}`)
          .materialTitle(d => `Material: ${d.data.material}`)
          .linkColor(d => d.data.color)
          .linkOpacity(d => 1 / d.data.value);

  const el = render({flows}, diagram),
        link = el.selectAll('.link');

  t.deepEqual(d3.rgb(link.style('fill')), d3.rgb('red'), 'link color');
  t.equal(link.style('opacity'), '0.5', 'link opacity');
  t.equal(link.select('title').text(),
          'Node a → Node b\nMaterial: x\n2.00', 'link title');

  diagram
    .nodeTitle('node')
    .materialTitle('z')
    .linkColor('blue')
    .linkOpacity(0.9);

  const el2 = render({flows}, diagram),
        link2 = el2.selectAll('.link');

  t.deepEqual(d3.rgb(link2.style('fill')), d3.rgb('blue'), 'link color (const)');
  t.equal(link2.style('opacity'), '0.9', 'link opacity (const)');
  t.equal(link2.select('title').text(),
          'node → node\nz\n2.00', 'link title (const)');

  t.end();
});


function render(datum, diagram) {
  const el = d3.select('body').append('div');
  el.datum(datum).call(diagram);
  flushAnimationFrames();
  return el;
}


function exampleBlastFurnace() {
  // Simplified example of flows through coke oven and blast furnace
  const processes = [
  ];

  const flows = [
    // main flow
    {source: 'input', target: 'oven', value: 2.5},
    {source: 'oven', target: 'coke', value: 2.5},
    {source: 'coke', target: 'sinter', value: 1},
    {source: 'coke', target: 'bf', value: 1.5},
    {source: 'sinter', target: 'bf', value: 1},
    {source: 'bf', target: 'output', value: 1},
    {source: 'bf', target: 'export', value: 1},

    // additional export flows, and input-sinter
    {source: 'sinter', target: 'export', value: 0.2},
    {source: 'oven', target: 'export', value: 0.2},
    {source: 'input', target: 'sinter', value: 0.2},

    // return loops
    {source: 'oven', target: 'input', value: 0.5},
    {source: 'bf', target: 'input', value: 0.5},
  ];

  return {processes, flows};
}


function exampleMaterials() {
  const processes = [
  ];

  const flows = [
    {source: 'a', target: 'b', value: 2, material: 'x'},
    {source: 'a', target: 'b', value: 2, material: 'y'},
    {source: 'b', target: 'c', value: 1, material: 'x'},
    {source: 'b', target: 'c', value: 2, material: 'y'},
    {source: 'b', target: 'd', value: 1, material: 'x'},
  ];

  return {processes, flows};
}


/* Make animations synchronous for testing */
var flushAnimationFrames = function() {
  var now = Date.now;
  Date.now = function() { return Infinity; };
  d3.timer.flush();
  Date.now = now;
};
