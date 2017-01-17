import tape from 'tape'
import graphify from '../src/graphify.js'
import Digraph from '../src/digraph.js'

tape('graphify() has the expected defaults', test => {
  var g = graphify()
  test.equal(g.nodeId()({id: 'foo'}), 'foo')
  test.equal(g.nodeBackwards()({backwards: true}), true)
  test.equal(g.sourceId()({source: 'bar'}), 'bar')
  test.equal(g.targetId()({target: 'baz'}), 'baz')
  test.equal(g.edgeType()({type: 'x'}), 'x')
  test.end()
})

tape('graphify(nodes, edges) builds the graph structure', test => {
  var g = graphify()
  var l = g([
    {id: 'a', backwards: true},
    {id: 'b'}
  ], [
    {source: 'a', target: 'b', type: 'c'}
  ])

  test.ok(l instanceof Digraph)
  var n = l.nodes()
  var e = l.edges()
  test.deepEqual(n, [
    {id: 'a', incoming: [], outgoing: [e[0]], backwards: true, data: {id: 'a', backwards: true}},
    {id: 'b', incoming: [e[0]], outgoing: [], backwards: false, data: {id: 'b'}}
  ])
  test.deepEqual(l.edges(), [
    {source: n[0], target: n[1], type: 'c', data: {source: 'a', target: 'b', type: 'c'}}
  ])
  test.end()
})

tape('graphify(nodes, edges) observes the specified accessor functions', test => {
  var g = graphify()
      .nodeId(function (d) { return d.foo })
      .nodeBackwards(function (d) { return d.jar })
      .sourceId(function (d) { return d.bar })
      .targetId(function (d) { return d.baz })
      .edgeType(function (d) { return d.fred })

  var l = g([
    {foo: 'a', jar: true},
    {foo: 'b'}
  ], [
    {bar: 'a', baz: 'b', fred: 'c'}
  ])

  var n = l.nodes()
  var e = l.edges()
  test.deepEqual(n, [
    {id: 'a', incoming: [], outgoing: [e[0]], backwards: true, data: {foo: 'a', jar: true}},
    {id: 'b', incoming: [e[0]], outgoing: [], backwards: false, data: {foo: 'b'}}
  ])
  test.deepEqual(l.edges(), [
    {source: n[0], target: n[1], type: 'c', data: {bar: 'a', baz: 'b', fred: 'c'}}
  ])
  test.end()
})

tape('graphify.nodeId(id) tests that nodeId is a function', test => {
  var g = graphify()
  test.throws(function () { g.nodeId(42) })
  test.throws(function () { g.nodeId(null) })
  test.end()
})

tape('graphify.nodeBackwards(id) tests that nodeBackwards is a function', test => {
  var g = graphify()
  test.throws(function () { g.nodeBackwards(42) })
  test.throws(function () { g.nodeBackwards(null) })
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

  var n = l.nodes()
  var e = l.edges()
  test.deepEqual(n, [
    {id: 'a', incoming: [], outgoing: [e[0]], backwards: false, data: {id: 'a'}},
    {id: 'b', incoming: [e[0]], outgoing: [], backwards: false, data: {}}
  ])
  test.deepEqual(l.edges(), [
    {source: n[0], target: n[1], type: undefined, data: {source: 'a', target: 'b'}}
  ])
  test.end()
})
