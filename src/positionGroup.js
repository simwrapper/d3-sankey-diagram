export default function positionGroup(nodes, group) {
  const rect = {
    top: Number.MAX_VALUE,
    left: Number.MAX_VALUE,
    bottom: 0,
    right: 0
  };

  group.nodes.forEach(n => {
    const node = nodes.get(n);
    if (!node) return;
    if (node.x < rect.left) rect.left = node.x;
    if (node.x > rect.right) rect.right = node.x;
    if (node.y < rect.top) rect.top = node.y;
    if (node.y + node.dy > rect.bottom) rect.bottom = node.y + node.dy;
  });

  return Object.assign({}, group, { rect });
}
