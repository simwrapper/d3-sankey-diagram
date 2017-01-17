import dummyNodes from '../../src/sortNodes/dummy-nodes.js'
import tape from 'tape'

tape('dummyNodes(edge) adds nothing to short edges', test => {
  test.deepEqual(dummyNodes({
    source: {id: 'a', rank: 0},
    target: {id: 'b', rank: 1}
  }), [], 'forwards')

  test.deepEqual(dummyNodes({
    source: {id: 'a', rank: 1, backwards: true},
    target: {id: 'b', rank: 0, backwards: true}
  }), [], 'backwards')

  test.end()
})

tape('dummyNodes(edge) adds forwards nodes to forwards-forwards edges', test => {
  test.deepEqual(dummyNodes({
    source: {id: 'a', rank: 0},
    target: {id: 'b', rank: 2}
  }), [
    {rank: 1, backwards: false}
  ])

  test.deepEqual(dummyNodes({
    source: {id: 'a', rank: 1},
    target: {id: 'b', rank: 4}
  }), [
    {rank: 2, backwards: false},
    {rank: 3, backwards: false}
  ])

  test.end()
})

tape('dummyNodes(edge) adds backwards nodes to backwards-backwards edges', test => {
  test.deepEqual(dummyNodes({
    source: {id: 'a', rank: 2, backwards: true},
    target: {id: 'b', rank: 0, backwards: true}
  }), [
    {rank: 1, backwards: true}
  ])

  test.deepEqual(dummyNodes({
    source: {id: 'a', rank: 4, backwards: true},
    target: {id: 'b', rank: 1, backwards: true}
  }), [
    {rank: 3, backwards: true},
    {rank: 2, backwards: true}
  ])

  test.end()
})

tape('dummyNodes(edge) adds turn-around nodes to forwards-backwards edges', test => {
  //        a --,
  //            |
  //  b <-- * <-`
  test.deepEqual(dummyNodes({
    source: {id: 'a', rank: 1, backwards: false},
    target: {id: 'b', rank: 0, backwards: true}
  }), [
    {rank: 1, backwards: true}
  ])

  //  a --,
  //      |
  //  b <-`
  test.deepEqual(dummyNodes({
    source: {id: 'a', rank: 0, backwards: false},
    target: {id: 'b', rank: 0, backwards: true}
  }), [])

  //  a --> * --,
  //            |
  //        b <-`
  test.deepEqual(dummyNodes({
    source: {id: 'a', rank: 0, backwards: false},
    target: {id: 'b', rank: 1, backwards: true}
  }), [
    {rank: 1, backwards: false}
  ])

  test.end()
})

tape('dummyNodes(edge) adds turn-around nodes to backwards-forwards edges', test => {
  //  ,-- a
  //  |
  //  `-> * --> b
  test.deepEqual(dummyNodes({
    source: {id: 'a', rank: 0, backwards: true},
    target: {id: 'b', rank: 1, backwards: false}
  }), [
    {rank: 0, backwards: false}
  ])

  //  ,-- a
  //  |
  //  `-> b
  test.deepEqual(dummyNodes({
    source: {id: 'a', rank: 0, backwards: true},
    target: {id: 'b', rank: 0, backwards: false}
  }), [])

  //  ,-- * <-- a
  //  |
  //  `-> b
  test.deepEqual(dummyNodes({
    source: {id: 'a', rank: 1, backwards: true},
    target: {id: 'b', rank: 0, backwards: false}
  }), [
    {rank: 0, backwards: true}
  ])

  test.end()
})
