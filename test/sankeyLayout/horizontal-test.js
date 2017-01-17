import { minEdgeDx } from '../../src/sankeyLayout/horizontal.js'
import tape from 'tape'
import { assertAlmostEqual } from '../assert-almost-equal'

tape('sankeyLayout: horizontal positioning minEdgeDx', test => {
  function offsetLinkMinWidth (dy) {
    const edge = {
      dy: 3,
      source: { y: 0 },
      target: { y: dy }
    }
    return minEdgeDx(edge)
  }

  test.equal(offsetLinkMinWidth(0), 0, 'no offset has no limit')
  assertAlmostEqual(test, offsetLinkMinWidth(2), 2.83, 1e-2, 'offset of 2')
  assertAlmostEqual(test, offsetLinkMinWidth(10), 3, 1e-2, 'limit of big offset')
  test.end()
})
