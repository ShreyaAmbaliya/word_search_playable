import { GLOSSARY } from '../src/glossary.js'
import { LEVELS, LEVEL_COUNT, validateLevel } from '../src/levels.js'
import { kingLine, pathsEqual, isAdjacent, findWord } from '../src/puzzle.js'
import { sanitizeSave, freshSave } from '../src/storage.js'
import { HINT_COST, wordReward } from '../src/config.js'

let failed = 0

function fail(message) {
  failed += 1
  console.error(message)
}

if (LEVEL_COUNT < 20) fail(`Expected at least 20 levels, found ${LEVEL_COUNT}`)

const ids = LEVELS.map((level) => level.id)
if (ids.some((id, index) => id !== index + 1)) fail(`Level ids must be 1..${LEVEL_COUNT}`)

for (const level of LEVELS) {
  const errors = validateLevel(level)
  if (errors.length) {
    fail(`Level ${level.id} invalid: ${errors.join('; ')}`)
    continue
  }
  for (const word of level.words) {
    if (!GLOSSARY[word.text]) fail(`Level ${level.id} ${word.text} has no meaning`)
    const reverse = [...word.path].reverse()
    if (!pathsEqual(word.path, reverse)) fail(`Level ${level.id} ${word.text} reverse should match`)
    if (!findWord(word.path, level.words.map((item) => ({ ...item, solved: false })))) {
      fail(`Level ${level.id} ${word.text} was not found by the matcher`)
    }
    const clipped = word.path.slice(0, -1)
    if (pathsEqual(word.path, clipped)) fail(`Level ${level.id} ${word.text} matched a shorter path`)
    const scrambled = word.path.map((cell) => [cell[0], cell[1]])
    if (scrambled.length > 1) {
      const swap = scrambled[0]
      scrambled[0] = scrambled[1]
      scrambled[1] = swap
      if (pathsEqual(word.path, scrambled) && word.text !== [...word.text].reverse().join('')) {
        const reversedPath = [...word.path].reverse()
        const isJustReverse = pathsEqual(scrambled, reversedPath) && scrambled.every((cell, i) => cell[0] === reversedPath[i][0] && cell[1] === reversedPath[i][1])
        if (!isJustReverse) fail(`Level ${level.id} ${word.text} matched a swapped path`)
      }
    }
  }
  console.log(`Level ${level.id} OK  ${level.size}x${level.size}  ${level.words.map((word) => word.text).join(', ')}`)
}

if (isAdjacent([0, 0], [1, 1]) || !isAdjacent([0, 0], [0, 1]) || isAdjacent([0, 0], [0, 2])) fail('adjacency check failed')
const line = kingLine([0, 0], [0, 2])
if (JSON.stringify(line) !== JSON.stringify([[0, 1], [0, 2]])) fail(`straight line was ${JSON.stringify(line)}`)
if (kingLine([0, 0], [2, 2]).length !== 0) fail('a diagonal step should not connect')

const dirty = sanitizeSave({
  coins: -4,
  score: 12.8,
  bestScore: 3,
  sound: 'yes',
  highestUnlocked: 99,
  completed: [1, 2, 2, 40, 'no', 3],
})
if (dirty.coins !== 0) fail('negative coins should clamp to 0')
if (dirty.score !== 12 || dirty.bestScore !== 12) fail('score sanitize failed')
if (dirty.sound !== true) fail('invalid sound should fall back to on')
if (dirty.highestUnlocked !== LEVEL_COUNT + 1) {
  fail(`an out-of-range unlock should clamp to the last level, got ${dirty.highestUnlocked}`)
}
if (dirty.completed.join(',') !== '1,2,3') fail('completed sanitize failed')

const broken = sanitizeSave(null)
if (broken.coins !== freshSave().coins) fail('null save should reset')
if (HINT_COST !== 20) fail('hint cost must be 20')
if (wordReward(3) < HINT_COST / 2) fail('word rewards should feel meaningful next to the hint cost')

if (failed) {
  console.error(`${failed} check(s) failed`)
  process.exit(1)
}
console.log(`All ${LEVEL_COUNT} levels are solvable.`)
