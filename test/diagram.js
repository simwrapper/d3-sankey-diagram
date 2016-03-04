import sankeyDiagram from 'lib/diagram';

import d3 from 'd3';
import test from 'prova';


test('diagram', t => {
  // prepare data
  const {nodes, edges} = exampleBlastFurnace();

  // diagram

  const diagram = sankeyDiagram();

  const el = d3.select('body').append('div');

  el
    .datum({nodes: nodes, edges: edges})
    .call(diagram);

  t.equal(el.selectAll('.node')[0].length, 21,
          'right number of nodes');

  t.equal(el.selectAll('.link')[0].length, 26,
          'right number of links');

  t.end();
});


function exampleBlastFurnace() {
  // Simplified example of flows through coke oven and blast furnace
  const nodes = [
  ];

  const edges = [
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

  return {nodes, edges};
}
