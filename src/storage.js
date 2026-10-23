import { START_COINS } from './config.js'
import { LEVEL_COUNT } from './levels.js'

export const SAVE_KEY = 'wordshapes.v1'

export function freshSave() {
  return {
    coins: START_COINS,
    score: 0,
    bestScore: 0,
    sound: true,
    highestUnlocked: 1,
    completed: [],
  }
}

export function sanitizeSave(input) {
  const save = freshSave()
  if (!input || typeof input !== 'object') return save

  const coins = Number(input.coins)
  if (Number.isFinite(coins)) save.coins = clamp(Math.floor(coins), 0, 999999999)

  const score = Number(input.score)
  if (Number.isFinite(score)) save.score = clamp(Math.floor(score), 0, 999999999)

  const best = Number(input.bestScore)
  if (Number.isFinite(best)) save.bestScore = clamp(Math.floor(best), 0, 999999999)
  save.bestScore = Math.max(save.bestScore, save.score)

  if (typeof input.sound === 'boolean') save.sound = input.sound

  const unlocked = Number(input.highestUnlocked)
  if (Number.isFinite(unlocked)) {
    save.highestUnlocked = clamp(Math.floor(unlocked), 1, LEVEL_COUNT + 1)
  }

  if (Array.isArray(input.completed)) {
    const ids = new Set()
    for (const value of input.completed) {
      const id = Number(value)
      if (Number.isInteger(id) && id >= 1 && id <= LEVEL_COUNT) ids.add(id)
    }
    save.completed = [...ids].sort((a, b) => a - b)
    for (const id of save.completed) {
      save.highestUnlocked = Math.max(save.highestUnlocked, Math.min(LEVEL_COUNT + 1, id + 1))
    }
  }

  return save
}

let canPersist = true

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return freshSave()
    return sanitizeSave(JSON.parse(raw))
  } catch {
    canPersist = false
    return freshSave()
  }
}

export function writeSave(save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save))
    canPersist = true
    return true
  } catch {
    canPersist = false
    return false
  }
}

export function storageAvailable() {
  return canPersist
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
