import tape from 'tape'
import graphify from '../src/graphify.js'
import { Graph } from 'graphlib'

tape('graphify() has the expected defaults', test => {
  var g = graphify()
  test.equal(g.nodeId()({id: 'foo'}), 'foo')
  test.equal(g.sourceId()({source: 'bar'}), 'bar')
  test.equal(g.targetId()({target: 'baz'}), 'baz')
  test.equal(g.edgeType()({type: 'x'}), 'x')
  test.end()
})

tape('graphify(nodes, edges) builds the graph structure', test => {
  var g = graphify()
  var l = g([
    {id: 'a'},
    {id: 'b'}
  ], [
    {source: 'a', target: 'b', type: 'z'}
  ])

  test.ok(l instanceof Graph)
  test.ok(l.isMultigraph())
  test.ok(l.isDirected())
  test.deepEqual(l.nodes(), ['a', 'b'])
  test.deepEqual(l.node('a'), {id: 'a'})
  test.deepEqual(l.node('b'), {id: 'b'})
  test.deepEqual(l.edges(), [{v: 'a', w: 'b', name: 'z'}])
  test.deepEqual(l.edge('a', 'b', 'z'), {source: 'a', target: 'b', type: 'z'})
  test.end()
})

tape('graphify(nodes, edges) observes the specified nodeId, sourceId, targetId and edgeType functions', test => {
  var g = graphify()
      .nodeId(function (d) { return d.foo })
      .sourceId(function (d) { return d.bar })
      .targetId(function (d) { return d.baz })
      .edgeType(function (d) { return d.fred })

  var l = g([
    {foo: 'a'},
    {foo: 'b'}
  ], [
    {bar: 'a', baz: 'b', fred: 'c'}
  ])

  test.deepEqual(l.nodes(), ['a', 'b'])
  test.deepEqual(l.node('a'), {foo: 'a'})
  test.deepEqual(l.node('b'), {foo: 'b'})
  test.deepEqual(l.edges(), [{v: 'a', w: 'b', name: 'c'}])
  test.deepEqual(l.edge('a', 'b', 'c'), {bar: 'a', baz: 'b', fred: 'c'})
  test.end()
})

tape('graphify.nodeId(id) tests that nodeId is a function', test => {
  var g = graphify()
  test.throws(function () { g.nodeId(42) })
  test.throws(function () { g.nodeId(null) })
  test.end()
})

tape('graphify.sourceId(id) tests that id is a function', test => {
  var g = graphify()
  test.throws(function () { g.sourceId(42) })
  test.throws(function () { g.sourceId(null) })
  test.end()
})

tape('graphify.targetId(id) tests that id is a function', test => {
  var g = graphify()
  test.throws(function () { g.targetId(42) })
  test.throws(function () { g.targetId(null) })
  test.end()
})

tape('graphify.edgeType(id) tests that id is a function', test => {
  var g = graphify()
  test.throws(function () { g.edgeType(42) })
  test.throws(function () { g.edgeType(null) })
  test.end()
})

tape('graphify(nodes, edges) throws an error if multiple nodes have the same id', test => {
  var g = graphify()
  test.throws(function () {
    g([{id: 'a'}, {id: 'a'}], [])
  }, /\bduplicate\b/)
  test.end()
})

tape('graphify(nodes, edges) adds a new node if source or target id does not exist', test => {
  var g = graphify()
  var l = g([{id: 'a'}], [{source: 'a', target: 'b'}])
  test.deepEqual(l.nodes(), ['a', 'b'])
  test.end()
})
