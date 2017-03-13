export default function linkDirection (link, head = true) {
  if (link.source === link.target) {
    // pretend self-links go downwards
    return Math.PI / 2 * (head ? +1 : -1)
  } else {
    return Math.atan2(link.target.y - link.source.y,
                      link.target.x - link.source.x)
  }
}
