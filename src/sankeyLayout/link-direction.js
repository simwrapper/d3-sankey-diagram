export default function linkDirection (link) {
  if (link.source === link.target) {
    // pretend self-links go downwards
    return Math.PI / 2
  } else {
    return Math.atan2(link.target.y - link.source.y,
                      link.target.x - link.source.x)
  }
}
