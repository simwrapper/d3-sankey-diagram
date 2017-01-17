import sortNodes from './sortNodes/index.js'
import assignRanks from './assignRanks/index.js'

export default function Digraph () {
  this._nodes = []
  this._edges = []
}

Digraph.prototype.nodes = function () {
  return this._nodes
}

Digraph.prototype.edges = function () {
  return this._edges
}

Digraph.prototype.sources = function () {
  return this._nodes
    .filter(d => d.incoming.length === 0)
    .map(d => d.id)
}

Digraph.prototype.node = function (id) {
  for (var i = 0; i < this._nodes.length; ++i) {
    if (this._nodes[i].id === id) return this._nodes[i]
  }
  return undefined
}

Digraph.prototype.ordering = function (order) {
  if (arguments.length) {
    order.forEach((x, i) => {
      x.forEach((u, j) => {
        if (u.forEach) {
          u.forEach((v, k) => {
            const d = this.node(v)
            if (d) {
              d.rank = i
              d.band = j
              d.depth = k
            }
          })
        } else {
          const d = this.node(u)
          if (d) {
            d.rank = i
            d.depth = j
          }
        }
      })
    })
    return this
  } else {
    order = []
    this.nodes().forEach(d => {
      const rank = d.rank || 0
      while (rank >= order.length) order.push([])
      order[rank].push(d.id)
    })
    return order
  }
}

Digraph.prototype.sortNodes = function (maxIterations = 25) {
  sortNodes(this, maxIterations)
  return this
}

Digraph.prototype.assignRanks = function (rankSets = []) {
  assignRanks(this, rankSets)
  return this
}
