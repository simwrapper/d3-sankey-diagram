export default function addDummyNodes (edge) {
  const dummyNodes = []
  let r = edge.source.rank

  if (r + 1 <= edge.target.rank) {
    // add more to get forwards
    if (edge.source.backwards) {
      dummyNodes.push({rank: r, backwards: false})  // turn around
    }
    while (++r < edge.target.rank) {
      dummyNodes.push({rank: r, backwards: false})
    }
    if (edge.target.backwards) {
      dummyNodes.push({rank: r, backwards: false})  // turn around
    }
  } else if (r > edge.target.rank) {
    // add more to get backwards
    if (!edge.source.backwards) {
      dummyNodes.push({rank: r, backwards: true})  // turn around
    }
    while (r-- > edge.target.rank + 1) {
      dummyNodes.push({rank: r, backwards: true})
    }
    if (!edge.target.backwards) {
      dummyNodes.push({rank: r, backwards: true})  // turn around
    }
  }

  return dummyNodes
}
