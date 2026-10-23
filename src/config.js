export const HINT_COST = 20
export const TEST_COIN_REWARD = 30
export const START_COINS = 50

export function wordReward(length) {
  return 8 + length * 2
}

export function levelBonus(size) {
  return 15 + size * 5
}
