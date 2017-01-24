import layoutLinks from '../../src/sankeyLayout/layout-links.js'
import tape from 'tape'
import graphify from '../../src/graphify.js'
import { assertAlmostEqual, assertNotAlmostEqual } from '../assert-almost-equal'

tape('linkLayout: link attributes', test => {
  const links = layoutLinks(example2to1(0)).edges()

  // ids
  test.deepEqual(links.map(f => f.id), ['0-2-m1', '1-2-m2'], 'f.id')

  test.deepEqual(links.map(d => d.segments.length), [1, 1])

  // x coordinates
  test.deepEqual(links.map(f => f.segments[0].x0), [0, 0], 'f.x0')
  test.deepEqual(links.map(f => f.segments[0].x1), [2, 2], 'f.x1')

  // y coordinates
  test.deepEqual(links.map(f => f.segments[0].y0), [0.5, 3.5], 'f.y0')
  test.deepEqual(links.map(f => f.segments[0].y1), [2.5, 3.5], 'f.y1')

  // directions
  test.deepEqual(links.map(f => f.segments[0].d0), ['r', 'r'], 'f.d0')
  test.deepEqual(links.map(f => f.segments[0].d1), ['r', 'r'], 'f.d1')

  // thickness
  test.deepEqual(links.map(f => f.segments[0].dy), links.map(f => f.dy))

  test.end()
})

tape('linkLayout: loose edges', test => {
  const links = layoutLinks(example2to1(0)).edges()

  // should not overlap
  test.ok((links[0].segments[0].r1 + links[0].dy / 2) <=
          (links[1].segments[0].r1 - links[1].dy / 2),
          'links should not overlap')

  test.end()
})

tape('linkLayout: tight curvature', test => {
  // setting f= 0.3 moves up the lower link to constrain the curvature at node
  // 2.
  const links = layoutLinks(example2to1(0.3)).edges()

  // curvature should no longer be symmetric
  assertNotAlmostEqual(test,
                       links.map(f => f.segments[0].r0),
                       links.map(f => f.segments[0].r1), 1e-6,
                       'radius should not be equal at both ends')

  // should not overlap
  assertAlmostEqual(test,
                    (links[0].segments[0].r1 + links[0].dy / 2),
                    (links[1].segments[0].r1 - links[1].dy / 2), 1e-6,
                    'link curvatures should just touch')

  test.end()
})

tape('linkLayout: maximum curvature limit', test => {
  // setting f=1 moves up the lower link so far the curvature hits the limit
  // 2.
  const links = layoutLinks(example2to1(1.0)).edges()

  // curvature should no longer be symmetric
  assertNotAlmostEqual(test,
                       links.map(f => f.segments[0].r0),
                       links.map(f => f.segments[0].r1), 1e-6,
                       'radius should not be equal at both ends')

  assertAlmostEqual(test, (links[0].segments[0].r1 - links[0].dy / 2), 0, 1e-6,
                    'inner link curvature should be zero')

  test.end()
})

tape('linkLayout: dummy nodes', test => {
  const graph = graphify()([], [{source: 'a', target: 'b', type: 'x'}, {source: 'a', target: 'b', type: 'y'}])
        .ordering([ ['a'], [], ['b'] ])
        .updateDummyNodes()

  graph.node('a').x = 0
  graph.node('a').y = 0
  graph.node('a').dy = 2

  graph.node('b').x = 2
  graph.node('b').y = 0
  graph.node('b').dy = 2

  graph.dummyNodes()[0].x = 1
  graph.dummyNodes()[0].y = 0
  graph.dummyNodes()[0].dy = 2

  graph.edges()[0].dy = 2
  graph.edges()[1].dy = 2

  const link1 = layoutLinks(graph).edges()[0]
  const link2 = layoutLinks(graph).edges()[1]
  test.equal(link1.segments.length, 2)
  test.equal(link2.segments.length, 2)

  test.deepEqual(link1.segments.map(d => d.x0), [0, 1], 'x0')
  test.deepEqual(link1.segments.map(d => d.x1), [1, 2], 'x1')
  test.deepEqual(link1.segments.map(d => d.y0), [1, 1], 'y0')
  test.deepEqual(link1.segments.map(d => d.y1), [1, 1], 'y1')

  test.deepEqual(link2.segments.map(d => d.x0), [0, 1], 'x0')
  test.deepEqual(link2.segments.map(d => d.x1), [1, 2], 'x1')
  test.deepEqual(link2.segments.map(d => d.y0), [3, 3], 'y0')
  test.deepEqual(link2.segments.map(d => d.y1), [3, 3], 'y1')

  test.end()
})

function example2to1 (f) {
  // 0|---\
  //       \
  // 1|-\   -|
  //     \---|2
  //

  // f == 0 means 1-2 is level
  // f == 1 means 1-2 is tight below 0-2

  const y0 = 0
  const y1 = 1 + (1 - f) * 2
  const y2 = 2

  const graph = graphify()([], [
    {source: '0', target: '2', type: 'm1'},
    {source: '1', target: '2', type: 'm2'}
  ])

  graph.node('0').x = 0
  graph.node('0').y = y0
  graph.node('0').dy = 1

  graph.node('1').x = 0
  graph.node('1').y = y1
  graph.node('1').dy = 1

  graph.node('2').x = 2
  graph.node('2').y = y2
  graph.node('2').dy = 2

  graph.edges()[0].dy = 1
  graph.edges()[1].dy = 1

  return graph
}
