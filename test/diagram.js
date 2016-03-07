import sankeyDiagram from '../src/diagram';

import d3 from 'd3';
import test from 'prova';


test('diagram', t => {
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


/* Make animations synchronous for testing */
var flushAnimationFrames = function() {
  var now = Date.now;
  Date.now = function() { return Infinity; };
  d3.timer.flush();
  Date.now = now;
};
