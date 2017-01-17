import sankeyLayout from '../../src/sankeyLayout/index.js'
import tape from 'tape'
import graphify from '../../src/graphify.js'
import { assertAlmostEqual } from '../assert-almost-equal'

tape('sankeyLayout#scaleToFit', test => {
  const graph = example4to1()
  const pos = sankeyLayout()

  test.equal(pos.scale(), null, 'initially scale is null')

  pos.scaleToFit(graph)
  test.equal(pos.scale(), 1 / 20 * 0.5, 'default scaling with 50% whitespace')

  pos.whitespace(0).scaleToFit(graph)
  test.equal(pos.scale(), 1 / 20 * 1.0, 'scaling with 0% whitespace')

  test.end()
})

tape('sankeyLayout() basic positioning', test => {
  const graph = example4to1()

  // 50% whitespace: scale = 8 / 20 * 0.5 = 0.2
  // margin = 8 * 50% / 5 = 0.8
  // total node height = 4 * 5 * 0.2 = 4
  // remaining space = 8 - 4 - 2*0.8 =2.4
  // spread betweeen 3 gaps = 0.8
  sankeyLayout().size([1, 8])(graph)

  test.deepEqual(nodeAttr(graph, d => d.dy), [1, 1, 1, 1, 4], 'node heights')
  assertAlmostEqual(test, nodeAttr(graph, d => d.y), [
    0.8,
    0.8 + 1 + 0.8,
    0.8 + 1 + 0.8 + 1 + 0.8,
    0.8 + 1 + 0.8 + 1 + 0.8 + 1 + 0.8,
    2  // centred
  ], 1e-6, 'node y')

  assertAlmostEqual(test, nodeAttr(graph, d => d.x), [0, 0, 0, 0, 1], 'node x')
  test.end()
})

tape('sankeyLayout() horizontal positioning', test => {
  function nodeX (width) {
    const graph = graphify()([], [
      {source: '0', target: '1', value: 3},
      {source: '1', target: '2', value: 3}
    ]).ordering([['0'], ['1'], ['2']])
    return sankeyLayout().size([width, 1])(graph).nodes().map(d => d.x)
  }

  test.deepEqual(nodeX(6), [0, 3, 6], 'equal when straight')
  // test.deepEqual(nodeX([6, 0]), [0, 8, 10], 'min width moves x position');
  // test.deepEqual(nodeX([6, 2]), [0, 7, 10], 'min width moves x position 2');
  // test.deepEqual(nodeX([7, 5]), [0, 10*7/12, 10], 'width allocated fairly if insufficient');
  test.end()
})

function nodeAttr (graph, f) {
  const r = graph.nodes().map(d => [d.id, f(d)])
  r.sort((a, b) => a[0].localeCompare(b[0]))
  return r.map(d => d[1])
}

// tape('justifiedPositioning: override', test => {
//   const {graph, order} = example4to1();

//   // margin = 8 * 50% / 5 = 0.8
//   const margin = 8 * 0.5 / 5;
//   const pos = justified().size([1, 8]);

//   console.log('------ before', graph.node('4'));
//   pos(graph, order);
//   console.log('------ after', graph.node('4'));

//   const autoY = graph.node('4').y;

//   // Force to top of band
//   graph.node('4').data.forceY = 0;
//   pos(graph, order);
//   test.notEqual(graph.node('4').y, autoY, 'forced y - changed 1');
//   assertAlmostEqual(test, graph.node('4').y, margin, 1e-3, 'forced y - value 1');

//   // Force to bottom of band
//   graph.node('4').data.forceY = 1;
//   pos(graph, order);
//   test.notEqual(graph.node('4').y, autoY, 'forced y - changed 2');
//   assertAlmostEqual(test, graph.node('4').y, 8 - margin - graph.node('4').dy, 1e-3, 'forced y - value 2');

//   test.end();
// });

tape('sankeyLayout() nodes with zero value are ignored', test => {
  const graph = graphify()([], [
    {source: '0', target: '4', value: 5},
    {source: '1', target: '4', value: 5},
    {source: '2', target: '4', value: 0},  // NB value = 0
    {source: '3', target: '4', value: 5}
  ]).ordering([['0', '1', '2', '3'], ['4']])

  const y = nodeAttr(sankeyLayout()(graph), d => d.y)

  const sep01 = y[1] - y[0]
  const sep13 = y[3] - y[1]

  test.equal(nodeAttr(graph, d => d.dy)[2], 0, 'node 2 should have no height')
  assertAlmostEqual(test, sep01, sep13, 1e-6, 'node 2 should not affect spacing of others')
  test.end()
})

tape('justifiedPositioning: bands', test => {
  // 0 -- 2         : band x
  //
  //      1 -- 3    : band y
  //        `- 4    :
  //
  const graph = graphify()([], [
    {source: '0', target: '2', value: 5},
    {source: '1', target: '3', value: 10},
    {source: '1', target: '4', value: 15}
  ]).ordering([ [['0'], []], [['2'], ['1']], [[], ['3', '4']] ])

  const nodes = nodeAttr(sankeyLayout().size([1, 8])(graph), d => d)

  // 50% whitespace: scale = 8 / 20 * 0.5 = 0.2
  const margin = (5 / 30) * 8 / 5

  // Bands should not overlap
  const yb = margin + nodes[0].dy + margin
  test.ok(nodes[0].y >= margin, 'node 0 >= margin')
  test.ok(nodes[2].y >= margin, 'node 2 >= margin')
  test.ok(nodes[0].y + nodes[0].dy < yb, 'node 0 above boundary')
  test.ok(nodes[2].y + nodes[2].dy < yb, 'node 2 above boundary')

  test.ok(nodes[1].y > yb, 'node 1 below boundary')
  test.ok(nodes[3].y > yb, 'node 3 below boundary')
  test.ok(nodes[4].y > yb, 'node 4 below boundary')
  test.ok(nodes[1].y + nodes[1].dy <= 8, 'node 1 within height')
  test.ok(nodes[3].y + nodes[3].dy <= 8, 'node 3 within height')
  test.ok(nodes[4].y + nodes[4].dy <= 8, 'node 4 within height')

  test.end()
})

function example4to1 () {
  // 0|---\
  //       \
  // 1|-\   -|
  //     \---|4
  // 2|------|
  //       ,-|
  // 3|---/
  //
  return graphify()([], [
    {source: '0', target: '4', value: 5},
    {source: '1', target: '4', value: 5},
    {source: '2', target: '4', value: 5},
    {source: '3', target: '4', value: 5}
  ]).ordering([['0', '1', '2', '3'], ['4']])
}
