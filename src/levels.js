import { defineWord } from './glossary.js'

const PALETTE = ['#FFD84A', '#FF5548', '#FF8A1E', '#FF6FAE', '#FFB020', '#FF7A59']

const RAW_LEVELS = [
  {
    id: 1,
    size: 4,
    theme: 'Warm-up',
    tip: 'A word can run across, down, or bend. Backward counts too.',
    grid: ['CATS', 'OWAU', 'AAYN', 'KDOG'],
    coach: [
      { text: 'Swipe letters that share a side. Find the word:', word: 'CAT' },
      { text: 'Words can run down. Find the word:', word: 'SUN' },
      { text: 'Words can bend. Find the word:', word: 'WAY' },
    ],
    words: [
      { text: 'CAT', path: [[0, 0], [0, 1], [0, 2]] },
      { text: 'SUN', path: [[0, 3], [1, 3], [2, 3]] },
      { text: 'WAY', path: [[1, 1], [2, 1], [2, 2]] },
      { text: 'OAK', path: [[1, 0], [2, 0], [3, 0]] },
      { text: 'DOG', path: [[3, 1], [3, 2], [3, 3]] },
    ],
  },
  {
    id: 2,
    size: 3,
    theme: 'Columns',
    tip: 'These shapes run down the columns.',
    grid: ['BEA', 'AAR', 'TRM'],
    words: [
      { text: 'BAT', path: [[0, 0], [1, 0], [2, 0]] },
      { text: 'EAR', path: [[0, 1], [1, 1], [2, 1]] },
      { text: 'ARM', path: [[0, 2], [1, 2], [2, 2]] },
    ],
  },
  {
    id: 3,
    size: 3,
    theme: 'Corners',
    tip: 'Each word sits on its own row.',
    grid: ['SUN', 'TEA', 'OAK'],
    words: [
      { text: 'SUN', path: [[0, 0], [0, 1], [0, 2]] },
      { text: 'TEA', path: [[1, 0], [1, 1], [1, 2]] },
      { text: 'OAK', path: [[2, 0], [2, 1], [2, 2]] },
    ],
  },
  {
    id: 4,
    size: 3,
    theme: 'Trio',
    tip: '',
    grid: ['ONE', 'TSK', 'WOY'],
    words: [
      { text: 'ONE', path: [[0, 0], [0, 1], [0, 2]] },
      { text: 'TWO', path: [[1, 0], [2, 0], [2, 1]] },
      { text: 'SKY', path: [[1, 1], [1, 2], [2, 2]] },
    ],
  },
  {
    id: 5,
    size: 3,
    theme: 'Gems',
    tip: '',
    grid: ['JOA', 'GYR', 'EMC'],
    words: [
      { text: 'JOY', path: [[0, 0], [0, 1], [1, 1]] },
      { text: 'ARC', path: [[0, 2], [1, 2], [2, 2]] },
      { text: 'GEM', path: [[1, 0], [2, 0], [2, 1]] },
    ],
  },
  {
    id: 6,
    size: 3,
    theme: 'Barn',
    tip: '',
    grid: ['COW', 'BAR', 'LEG'],
    words: [
      { text: 'COW', path: [[0, 0], [0, 1], [0, 2]] },
      { text: 'BAR', path: [[1, 0], [1, 1], [1, 2]] },
      { text: 'LEG', path: [[2, 0], [2, 1], [2, 2]] },
    ],
  },
  {
    id: 7,
    size: 4,
    theme: 'Pond',
    tip: 'A wider board. Trace one shape at a time.',
    grid: ['FISH', 'BIRD', 'LION', 'ZVQX'],
    words: [
      { text: 'FISH', path: [[0, 0], [0, 1], [0, 2], [0, 3]] },
      { text: 'BIRD', path: [[1, 0], [1, 1], [1, 2], [1, 3]] },
      { text: 'LION', path: [[2, 0], [2, 1], [2, 2], [2, 3]] },
    ],
  },
  {
    id: 8,
    size: 4,
    theme: 'Picnic',
    tip: '',
    grid: ['WCMB', 'AAOE', 'VKOA', 'EENR'],
    words: [
      { text: 'WAVE', path: [[0, 0], [1, 0], [2, 0], [3, 0]] },
      { text: 'CAKE', path: [[0, 1], [1, 1], [2, 1], [3, 1]] },
      { text: 'MOON', path: [[0, 2], [1, 2], [2, 2], [3, 2]] },
      { text: 'BEAR', path: [[0, 3], [1, 3], [2, 3], [3, 3]] },
    ],
  },
  {
    id: 9,
    size: 4,
    theme: 'Meadow',
    tip: '',
    grid: ['STAR', 'FLAM', 'RDUP', 'OGCK'],
    words: [
      { text: 'STAR', path: [[0, 0], [0, 1], [0, 2], [0, 3]] },
      { text: 'FROG', path: [[1, 0], [2, 0], [3, 0], [3, 1]] },
      { text: 'LAMP', path: [[1, 1], [1, 2], [1, 3], [2, 3]] },
      { text: 'DUCK', path: [[2, 1], [2, 2], [3, 2], [3, 3]] },
    ],
  },
  {
    id: 10,
    size: 4,
    theme: 'Sparks',
    tip: 'Each word sits on its own row.',
    grid: ['FIRE', 'GOLD', 'RAIN', 'MOTH'],
    words: [
      { text: 'FIRE', path: [[0, 0], [0, 1], [0, 2], [0, 3]] },
      { text: 'GOLD', path: [[1, 0], [1, 1], [1, 2], [1, 3]] },
      { text: 'RAIN', path: [[2, 0], [2, 1], [2, 2], [2, 3]] },
      { text: 'MOTH', path: [[3, 0], [3, 1], [3, 2], [3, 3]] },
    ],
  },
  {
    id: 11,
    size: 4,
    theme: 'Bright',
    tip: '',
    grid: ['WBLU', 'APIE', 'VKNL', 'EAVA'],
    words: [
      { text: 'WAVE', path: [[0, 0], [1, 0], [2, 0], [3, 0]] },
      { text: 'BLUE', path: [[0, 1], [0, 2], [0, 3], [1, 3]] },
      { text: 'PINK', path: [[1, 1], [1, 2], [2, 2], [2, 1]] },
      { text: 'LAVA', path: [[2, 3], [3, 3], [3, 2], [3, 1]] },
    ],
  },
  {
    id: 12,
    size: 4,
    theme: 'Weather',
    tip: '',
    grid: ['STOR', 'CRAM', 'LNIX', 'OUDY'],
    words: [
      { text: 'STORM', path: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]] },
      { text: 'CLOUD', path: [[1, 0], [2, 0], [3, 0], [3, 1], [3, 2]] },
      { text: 'RAIN', path: [[1, 1], [1, 2], [2, 2], [2, 1]] },
    ],
  },
  {
    id: 13,
    size: 4,
    theme: 'Stable',
    tip: '',
    grid: ['HORS', 'TIGE', 'CXER', 'RABY'],
    words: [
      { text: 'HORSE', path: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]] },
      { text: 'TIGER', path: [[1, 0], [1, 1], [1, 2], [2, 2], [2, 3]] },
      { text: 'CRAB', path: [[2, 0], [3, 0], [3, 1], [3, 2]] },
    ],
  },
  {
    id: 14,
    size: 4,
    theme: 'Trail',
    tip: '',
    grid: ['RING', 'RLIF', 'ANOR', 'EBGO'],
    words: [
      { text: 'RING', path: [[0, 0], [0, 1], [0, 2], [0, 3]] },
      { text: 'FROG', path: [[1, 3], [2, 3], [3, 3], [3, 2]] },
      { text: 'BEAR', path: [[3, 1], [3, 0], [2, 0], [1, 0]] },
      { text: 'LION', path: [[1, 1], [1, 2], [2, 2], [2, 1]] },
    ],
  },
  {
    id: 15,
    size: 5,
    theme: 'Market',
    tip: 'Each fruit sits on its own row.',
    grid: ['APPLE', 'GRAPE', 'MANGO', 'PEACH', 'LIMEX'],
    words: [
      { text: 'APPLE', path: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
      { text: 'GRAPE', path: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]] },
      { text: 'MANGO', path: [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]] },
      { text: 'PEACH', path: [[3, 0], [3, 1], [3, 2], [3, 3], [3, 4]] },
      { text: 'LIME', path: [[4, 0], [4, 1], [4, 2], [4, 3]] },
    ],
  },
  {
    id: 16,
    size: 5,
    theme: 'Night sky',
    tip: '',
    grid: ['STARM', 'COMEO', 'EORTO', 'AKBIN', 'RTHTY'],
    words: [
      { text: 'STAR', path: [[0, 0], [0, 1], [0, 2], [0, 3]] },
      { text: 'MOON', path: [[0, 4], [1, 4], [2, 4], [3, 4]] },
      { text: 'COMET', path: [[1, 0], [1, 1], [1, 2], [1, 3], [2, 3]] },
      { text: 'EARTH', path: [[2, 0], [3, 0], [4, 0], [4, 1], [4, 2]] },
      { text: 'ORBIT', path: [[2, 1], [2, 2], [3, 2], [3, 3], [4, 3]] },
    ],
  },
  {
    id: 17,
    size: 5,
    theme: 'Recital',
    tip: '',
    grid: ['PIANO', 'FDRUM', 'LHARS', 'USOPX', 'TENGY'],
    words: [
      { text: 'PIANO', path: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
      { text: 'FLUTE', path: [[1, 0], [2, 0], [3, 0], [4, 0], [4, 1]] },
      { text: 'DRUMS', path: [[1, 1], [1, 2], [1, 3], [1, 4], [2, 4]] },
      { text: 'HARP', path: [[2, 1], [2, 2], [2, 3], [3, 3]] },
      { text: 'SONG', path: [[3, 1], [3, 2], [4, 2], [4, 3]] },
    ],
  },
  {
    id: 18,
    size: 5,
    theme: 'Valley',
    tip: '',
    grid: ['SRIVE', 'TCMFR', 'OLAER', 'NOPLN', 'EUDEX'],
    words: [
      { text: 'STONE', path: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
      { text: 'RIVER', path: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 4]] },
      { text: 'CLOUD', path: [[1, 1], [2, 1], [3, 1], [4, 1], [4, 2]] },
      { text: 'MAPLE', path: [[1, 2], [2, 2], [3, 2], [3, 3], [4, 3]] },
      { text: 'FERN', path: [[1, 3], [2, 3], [2, 4], [3, 4]] },
    ],
  },
  {
    id: 19,
    size: 5,
    theme: 'Tickets',
    tip: '',
    grid: ['TRAIN', 'PLANE', 'BTTIC', 'OATEK', 'HOTEL'],
    words: [
      { text: 'TRAIN', path: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
      { text: 'PLANE', path: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]] },
      { text: 'BOAT', path: [[2, 0], [3, 0], [3, 1], [2, 1]] },
      { text: 'TICKET', path: [[2, 2], [2, 3], [2, 4], [3, 4], [3, 3], [3, 2]] },
      { text: 'HOTEL', path: [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4]] },
    ],
  },
  {
    id: 20,
    size: 5,
    theme: 'Castle',
    tip: 'Final board. Every bend still belongs to one shape.',
    grid: ['MAGIC', 'SQUEE', 'WCRON', 'OKIWN', 'RDNGX'],
    words: [
      { text: 'MAGIC', path: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
      { text: 'SWORD', path: [[1, 0], [2, 0], [3, 0], [4, 0], [4, 1]] },
      { text: 'QUEEN', path: [[1, 1], [1, 2], [1, 3], [1, 4], [2, 4]] },
      { text: 'CROWN', path: [[2, 1], [2, 2], [2, 3], [3, 3], [3, 4]] },
      { text: 'KING', path: [[3, 1], [3, 2], [4, 2], [4, 3]] },
    ],
  },
]

export const LEVEL_COUNT = RAW_LEVELS.length

export function validateLevel(level) {
  const errors = []
  if (!level) return ['missing level']
  const { size, grid, words, id } = level
  if (!Number.isInteger(size) || size < 2 || size > 8) errors.push('bad size')
  if (!Array.isArray(grid) || grid.length !== size) errors.push('grid row count')
  for (let r = 0; r < (grid?.length || 0); r += 1) {
    const row = grid[r]
    if (typeof row !== 'string' || row.length !== size) errors.push(`row ${r} length`)
    else if (!/^[A-Z]+$/.test(row)) errors.push(`row ${r} letters`)
  }
  if (!Array.isArray(words) || words.length < 2) errors.push('need at least 2 words')
  const used = new Set()
  for (const word of words || []) {
    if (!word || !/^[A-Z]{3,8}$/.test(word.text || '')) {
      errors.push(`bad word text on level ${id}`)
      continue
    }
    if (!Array.isArray(word.path) || word.path.length !== word.text.length) {
      errors.push(`${word.text} path length`)
      continue
    }
    const seen = new Set()
    word.path.forEach((cell, index) => {
      if (!Array.isArray(cell) || cell.length !== 2) {
        errors.push(`${word.text} cell ${index}`)
        return
      }
      const [r, c] = cell
      if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || c < 0 || r >= size || c >= size) {
        errors.push(`${word.text} out of bounds at ${index}`)
        return
      }
      if (grid?.[r]?.[c] !== word.text[index]) {
        errors.push(`${word.text} letter ${index} expected ${word.text[index]} found ${grid?.[r]?.[c] || '?'}`)
      }
      const key = `${r},${c}`
      if (seen.has(key)) errors.push(`${word.text} repeats ${key}`)
      seen.add(key)
      if (used.has(key)) errors.push(`${word.text} overlaps ${key}`)
      used.add(key)
      if (index > 0) {
        const [pr, pc] = word.path[index - 1]
        const dr = Math.abs(pr - r)
        const dc = Math.abs(pc - c)
        if (dr + dc !== 1) errors.push(`${word.text} step ${index} is not side by side`)
      }
    })
  }
  return errors
}

export function cloneLevel(id) {
  const requested = RAW_LEVELS.find((level) => level.id === id) || RAW_LEVELS[0]
  const errors = validateLevel(requested)
  const source = errors.length
    ? RAW_LEVELS.find((level) => validateLevel(level).length === 0) || RAW_LEVELS[0]
    : requested
  if (errors.length) {
    console.warn(`Level ${requested.id} failed validation and was replaced.`, errors)
  }
  return {
    id: source.id,
    size: source.size,
    theme: source.theme,
    tip: source.tip,
    coach: source.coach ? source.coach.map((step) => ({ text: step.text, word: step.word })) : null,
    grid: source.grid.slice(),
    words: source.words.map((word, index) => {
      const defined = defineWord(word.text)
      return {
        text: word.text,
        path: word.path.map((cell) => [cell[0], cell[1]]),
        color: PALETTE[index % PALETTE.length],
        meaning: defined.meaning,
        example: defined.example,
        solved: false,
        hinted: false,
        revealed: 0,
      }
    }),
  }
}

export function listLevels() {
  return RAW_LEVELS.map((level) => ({
    id: level.id,
    size: level.size,
    theme: level.theme,
    words: level.words.length,
  }))
}

export { RAW_LEVELS as LEVELS }
