export function sameCell(a, b) {
  return !!a && !!b && a[0] === b[0] && a[1] === b[1]
}

export function isAdjacent(a, b) {
  const dr = Math.abs(a[0] - b[0])
  const dc = Math.abs(a[1] - b[1])
  return dr + dc === 1
}

export function pathsEqual(a, b) {
  if (!a || !b || a.length !== b.length || a.length === 0) return false
  let forward = true
  let reverse = true
  for (let i = 0; i < a.length; i += 1) {
    if (!sameCell(a[i], b[i])) forward = false
    if (!sameCell(a[i], b[a.length - 1 - i])) reverse = false
  }
  return forward || reverse
}

export function isPrefix(partial, full) {
  if (!partial?.length || partial.length > full.length) return false
  for (let i = 0; i < partial.length; i += 1) {
    if (!sameCell(partial[i], full[i])) return false
  }
  return true
}

export function matchesEitherWay(partial, full) {
  return isPrefix(partial, full) || isPrefix(partial, [...full].reverse())
}

export function findWord(path, words, includeSolved = false) {
  return words.find((word) => (includeSolved || !word.solved) && pathsEqual(path, word.path)) || null
}

export function traceColorFor(path, words) {
  const hit = words.find((word) => !word.solved && matchesEitherWay(path, word.path))
  return hit ? hit.color : '#FFD84A'
}

/** Cells from `from` (exclusive) to `to` (inclusive) along one row or column. */
export function kingLine(from, to) {
  const dr = to[0] - from[0]
  const dc = to[1] - from[1]
  if (dr !== 0 && dc !== 0) return []
  const cells = []
  const steps = Math.abs(dr) + Math.abs(dc)
  const sr = Math.sign(dr)
  const sc = Math.sign(dc)
  let r = from[0]
  let c = from[1]
  for (let i = 0; i < steps; i += 1) {
    r += sr
    c += sc
    cells.push([r, c])
  }
  return cells
}
