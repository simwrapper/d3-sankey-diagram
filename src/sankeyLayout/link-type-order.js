import { set } from 'd3-collection'

export default function linkTypeOrder (link) {
  const types = set()
  link.incoming.forEach(e => types.add(e.type))
  link.outgoing.forEach(e => types.add(e.type))

  const sorted = types.values()
  sorted.sort()
  return sorted

  // const dirs = new Map(Array.from(edgesByType.entries()).map(([k, v]) => {
  //   const total = sumBy(v, e => G.edge(e).value),
  //         wdirs = sumBy(v, e => G.edge(e).value * otherY(e));
  //   return [k, wdirs / total];
  // }));

  // const mo = Array.from(dirs.keys());

  // // XXX This isn't right because the correct order should depend on the order
  // // of neighbouring nodes...
  // /* mo.sort((a, b) => dirs.get(a) - dirs.get(b)); */
  // mo.sort();

  // return mo;

  // function otherY(e) {
  //   if (e.v === u) return G.node(e.w).y;
  //   if (e.w === u) return G.node(e.v).y;
  //   throw new Error();
  // }
}
