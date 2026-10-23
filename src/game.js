import { HINT_COST, TEST_COIN_REWARD, levelBonus, wordReward } from './config.js'
import { LEVEL_COUNT, cloneLevel, listLevels } from './levels.js'
import { findWord, kingLine, sameCell, traceColorFor } from './puzzle.js'
import { AudioBus } from './audio.js'
import { freshSave, loadSave, storageAvailable, writeSave } from './storage.js'
import { UI } from './ui.js'

const KEY_DIRS = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
}

export class Game {
  constructor() {
    this.audio = new AudioBus()
    this.save = loadSave()
    this.catalog = listLevels()
    this.screen = 'menu'
    this.overlay = null
    this.level = null
    this.words = []
    this.selection = []
    this.pointerId = null
    this.pressWord = null
    this.earned = 0
    this.inputLock = false
    this.hintLock = false
    this.solvedKeys = new Set()
    this.focus = [0, 0]
    this.victoryTimer = 0
    this.coachTimer = 0
    this.coachStep = 0
    this.coachBeat = 0
    this.shownCoach = ''
    this.animating = false
    this.drawQueued = false
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.ui = null
    writeSave(this.save)
  }

  start() {
    this.ui = new UI(this)
    this.audio.setEnabled(this.save.sound)
    this.ui.setStorageNote(!storageAvailable())
    this.showMenu()
    this.bindGlobal()
  }

  bindGlobal() {
    window.addEventListener('keydown', (event) => this.onKeyDown(event))
    window.addEventListener('pointermove', (event) => this.onPointerMove(event), { passive: false })
    window.addEventListener('pointerup', (event) => this.onPointerUp(event))
    window.addEventListener('pointercancel', (event) => this.onPointerCancel(event))
    window.addEventListener('resize', () => this.resizeBoard())
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.screen === 'game' && !this.overlay && !this.inputLock) this.openOverlay('pause')
    })
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    motion.addEventListener?.('change', () => {
      this.reduced = motion.matches
    })
  }

  showMenu() {
    this.clearVictoryTimer()
    this.stopCoach()
    this.screen = 'menu'
    this.level = null
    this.selection = []
    this.pointerId = null
    document.body.classList.remove('tracing', 'playing')
    this.ui.showMenu()
  }

  startLevel(id) {
    this.clearVictoryTimer()
    this.level = cloneLevel(id)
    this.words = this.level.words
    this.selection = []
    this.pointerId = null
    this.earned = 0
    this.inputLock = false
    this.hintLock = false
    this.focus = [0, 0]
    this.coachStep = 0
    this.coachBeat = 0
    this.shownCoach = ''
    this.screen = 'game'
    this.rebuildSolved()
    document.body.classList.add('playing')
    document.body.classList.remove('tracing')
    this.ui.showGame()
    this.renderBoard()
    this.ui.renderHud()
    this.scheduleDraw()
    this.audio.playTap()
    this.tileAt(0, 0)?.focus()
  }

  renderBoard() {
    const size = this.level.size
    this.ui.grid.style.setProperty('--n', String(size))
    this.ui.grid.replaceChildren()
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'tile'
        button.dataset.r = String(r)
        button.dataset.c = String(c)
        button.textContent = this.level.grid[r][c]
        button.tabIndex = r === 0 && c === 0 ? 0 : -1
        button.setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}, ${this.level.grid[r][c]}`)
        this.ui.grid.append(button)
      }
    }
    this.ui.grid.onpointerdown = (event) => this.onPointerDown(event)
    this.ui.grid.oncontextmenu = (event) => event.preventDefault()
    this.ui.grid.onkeydown = (event) => this.onGridKey(event)
    this.paintWordStyles()
    this.ui.renderWords(this.words)
    this.ui.renderSpell('')
    this.ui.setTip(this.level.tip)
    this.resizeBoard()
    this.startCoach()
  }

  resizeBoard() {
    const slot = this.ui.boardSlot
    if (!slot || this.screen !== 'game') return
    const styles = getComputedStyle(slot)
    const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
    const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
    const size = Math.floor(Math.min(slot.clientWidth - padX, slot.clientHeight - padY))
    if (size < 8) return
    const next = `${size}px`
    if (this.ui.board.style.width !== next || this.ui.board.style.height !== next) {
      this.ui.board.style.width = next
      this.ui.board.style.height = next
      this.scheduleDraw()
    }
    this.placeCoachHand()
  }

  onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return
    if (this.inputLock || this.overlay || this.screen !== 'game') return
    const cell = this.cellFromPoint(event.clientX, event.clientY)
    if (!cell) return
    if (!this.lessonAllows(cell) && !this.solvedWordAt(cell)) return
    event.preventDefault()
    this.audio.unlock()
    this.pointerId = event.pointerId
    this.pressWord = this.solvedWordAt(cell)
    document.body.classList.add('tracing')
    this.selection = []
    try {
      this.ui.grid.setPointerCapture(event.pointerId)
    } catch {
      // Untrusted and a few mobile browsers reject capture. Window listeners still follow the gesture.
    }
    if (!this.isSolvedCell(cell)) this.extend(cell, false)
  }

  onPointerMove(event) {
    if (this.pointerId === null || event.pointerId !== this.pointerId) return
    event.preventDefault()
    const cell = this.cellFromPoint(event.clientX, event.clientY)
    if (!cell || this.isSolvedCell(cell)) return
    this.pressWord = null
    if (!this.selection.length) this.extend(cell, false)
    else this.extend(cell, true)
  }

  onPointerUp(event) {
    if (this.pointerId === null || event.pointerId !== this.pointerId) return
    this.finishStroke()
  }

  onPointerCancel(event) {
    if (this.pointerId === null || event.pointerId !== this.pointerId) return
    this.pointerId = null
    this.pressWord = null
    document.body.classList.remove('tracing')
    this.selection = []
    this.ui.renderSpell('')
    this.paintSelection()
    this.scheduleDraw()
  }

  finishStroke() {
    this.pointerId = null
    document.body.classList.remove('tracing')
    const tapped = this.pressWord
    this.pressWord = null
    if (this.overlay || this.inputLock) {
      this.selection = []
      this.ui.renderSpell('')
      this.paintSelection()
      this.scheduleDraw()
      return
    }
    if (tapped && !this.selection.length) {
      this.openWordCard(tapped)
      return
    }
    const path = this.selection.map((cell) => [cell[0], cell[1]])
    if (path.length < 3) {
      this.selection = []
      this.ui.renderSpell('')
      this.paintSelection()
      this.scheduleDraw()
      return
    }
    const solvedHit = findWord(path, this.words, true)
    if (solvedHit?.solved) {
      this.selection = []
      this.ui.renderSpell('')
      this.paintSelection()
      this.scheduleDraw()
      return
    }
    const match = findWord(path, this.words, false)
    if (!match) {
      this.rejectSelection()
      return
    }
    this.acceptWord(match)
  }

  extend(target, allowBridge) {
    if (this.isSolvedCell(target) || !this.lessonAllows(target)) return
    if (!this.selection.length) {
      this.selection.push(target)
      this.afterExtend(1)
      return
    }
    const last = this.selection[this.selection.length - 1]
    if (sameCell(last, target)) return
    if (this.selection.length >= 2 && sameCell(this.selection[this.selection.length - 2], target)) {
      this.selection.pop()
      this.afterExtend(0)
      return
    }
    const existing = this.selection.findIndex((cell) => sameCell(cell, target))
    if (existing >= 0) {
      this.selection.length = existing + 1
      this.afterExtend(0)
      return
    }
    const steps = kingLine(last, target)
    const allowed = allowBridge ? 2 : 1
    if (!steps.length || steps.length > allowed) return
    for (const cell of steps) {
      if (this.isSolvedCell(cell) || this.selection.some((item) => sameCell(item, cell))) return
    }
    for (const cell of steps) this.selection.push(cell)
    this.afterExtend(steps.length)
  }

  afterExtend(added) {
    if (added > 0) this.audio.playSelect(this.selection.length)
    this.focus = this.selection[this.selection.length - 1] || this.focus
    this.paintSelection()
    this.ui.renderSpell(this.selection.map((cell) => this.level.grid[cell[0]][cell[1]]).join(''))
    this.scheduleDraw()
  }

  acceptWord(word) {
    word.solved = true
    this.rebuildSolved()
    const reward = wordReward(word.text.length)
    this.earned += reward
    this.save.coins += reward
    this.save.score += reward
    this.save.bestScore = Math.max(this.save.bestScore, this.save.score)
    writeSave(this.save)
    this.selection = []
    this.ui.renderSpell('')
    this.paintSelection()
    this.paintWordStyles()
    this.ui.renderWords(this.words)
    this.ui.renderHud()
    this.ui.floatReward(`+${reward}`)
    this.audio.playWord()
    this.ui.announce(`Found ${word.text}.`)
    word.path.forEach((cell, index) => {
      const tile = this.tileAt(cell[0], cell[1])
      tile.classList.add('pop')
      tile.style.animationDelay = this.reduced ? '0ms' : `${index * 45}ms`
    })
    this.scheduleDraw(true)
    const found = this.words.filter((item) => item.solved).length
    if (found === this.words.length) this.queueVictory()
  }

  rejectSelection() {
    const path = this.selection.slice()
    this.inputLock = true
    this.ui.board.classList.add('shake')
    path.forEach((cell) => this.tileAt(cell[0], cell[1])?.classList.add('error'))
    this.ui.spell.classList.add('bad')
    this.audio.playError()
    this.ui.announce('That path is not a hidden word.')
    window.setTimeout(() => {
      path.forEach((cell) => this.tileAt(cell[0], cell[1])?.classList.remove('error'))
      this.ui.board.classList.remove('shake')
      this.ui.spell.classList.remove('bad')
      this.selection = []
      this.inputLock = false
      this.ui.renderSpell('')
      this.paintSelection()
      this.scheduleDraw()
    }, this.reduced ? 80 : 340)
  }

  queueVictory() {
    const bonus = levelBonus(this.level.size)
    this.earned += bonus
    this.save.coins += bonus
    this.save.score += bonus
    this.save.bestScore = Math.max(this.save.bestScore, this.save.score)
    if (!this.save.completed.includes(this.level.id)) this.save.completed.push(this.level.id)
    this.save.completed.sort((a, b) => a - b)
    this.save.highestUnlocked = Math.max(this.save.highestUnlocked, Math.min(LEVEL_COUNT + 1, this.level.id + 1))
    writeSave(this.save)
    this.ui.renderHud()
    this.inputLock = true
    this.audio.playWin()
    this.victoryTimer = window.setTimeout(() => {
      this.inputLock = false
      this.openOverlay('victory')
      this.ui.announce(`Level ${this.level.id} clear.`)
    }, this.reduced ? 160 : 700)
  }

  useHint() {
    if (this.inputLock || this.hintLock || this.screen !== 'game' || this.overlay || this.currentLesson()) return
    const word = this.words.find((item) => !item.solved && item.revealed > 0 && item.revealed < item.text.length)
      || this.words.find((item) => !item.solved && item.revealed < item.text.length)
    if (!word) return
    if (this.save.coins < HINT_COST) {
      this.ui.announce(`A hint costs ${HINT_COST} coins.`)
      this.ui.shakeCoins()
      this.openOverlay('shop')
      return
    }
    this.selection = []
    this.ui.renderSpell('')
    this.save.coins -= HINT_COST
    writeSave(this.save)
    word.revealed += 1
    word.hinted = true
    this.hintLock = true
    this.ui.renderHud()
    this.ui.renderWords(this.words)
    this.paintWordStyles()
    this.audio.playHint()
    const letter = word.text[word.revealed - 1]
    this.ui.announce(`Hint ${word.revealed} of ${word.text.length}: ${letter}.`)
    const tile = this.tileAt(word.path[word.revealed - 1][0], word.path[word.revealed - 1][1])
    tile?.classList.add('pop')
    window.setTimeout(() => {
      this.hintLock = false
    }, 280)
  }

  requestRestart() {
    if (this.overlay) return
    if (this.words.some((word) => word.solved)) this.openOverlay('restart')
    else this.restartLevel()
  }

  restartLevel() {
    const id = this.level?.id
    if (!id) return
    this.closeOverlay()
    this.startLevel(id)
  }

  nextLevel() {
    const next = (this.level?.id || 0) + 1
    this.closeOverlay()
    if (next > LEVEL_COUNT) this.showMenu()
    else this.startLevel(next)
  }

  exitToMenu() {
    this.closeOverlay()
    this.showMenu()
  }

  claimTestCoins() {
    this.audio.unlock()
    this.save.coins += TEST_COIN_REWARD
    writeSave(this.save)
    this.ui.renderHud()
    this.ui.floatReward(`+${TEST_COIN_REWARD}`)
    this.audio.playCoin()
    this.ui.announce(`Claimed ${TEST_COIN_REWARD} test coins.`)
    if (this.overlay === 'shop') this.ui.renderOverlay('shop')
  }

  resetProgress() {
    this.save = freshSave()
    writeSave(this.save)
    this.audio.setEnabled(true)
    this.closeOverlay()
    this.showMenu()
    this.ui.announce('Progress reset.')
  }

  toggleSound() {
    this.save.sound = !this.save.sound
    writeSave(this.save)
    this.audio.setEnabled(this.save.sound)
    this.ui.renderSound()
    if (this.overlay === 'pause') this.ui.renderOverlay('pause')
    this.ui.announce(this.save.sound ? 'Sound on.' : 'Sound off.')
  }

  openOverlay(name) {
    this.pointerId = null
    document.body.classList.remove('tracing')
    this.overlay = name
    this.ui.renderOverlay(name)
  }

  closeOverlay() {
    if (!this.overlay) return
    this.overlay = null
    this.ui.hideOverlay()
  }

  onAction(action) {
    switch (action) {
      case 'resume':
      case 'close':
        this.closeOverlay()
        break
      case 'sound':
        this.toggleSound()
        break
      case 'restart':
        this.closeOverlay()
        this.requestRestart()
        break
      case 'menu':
        this.exitToMenu()
        break
      case 'claim':
        this.claimTestCoins()
        break
      case 'reset-yes':
        this.resetProgress()
        break
      case 'restart-yes':
        this.restartLevel()
        break
      case 'next':
        this.nextLevel()
        break
      default:
        break
    }
  }

  onKeyDown(event) {
    if (event.key !== 'Escape') return
    if (this.overlay === 'victory') return
    if (this.overlay) {
      event.preventDefault()
      this.closeOverlay()
      return
    }
    if (this.screen === 'game' && this.selection.length) {
      event.preventDefault()
      this.selection = []
      this.ui.renderSpell('')
      this.paintSelection()
      this.scheduleDraw()
      return
    }
    if (this.screen === 'game' && !this.inputLock) {
      event.preventDefault()
      this.openOverlay('pause')
    }
  }

  onGridKey(event) {
    if (this.screen !== 'game' || this.overlay || this.inputLock) return
    const dir = KEY_DIRS[event.code]
    if (dir) {
      event.preventDefault()
      const next = [this.focus[0] + dir[0], this.focus[1] + dir[1]]
      if (!this.inBounds(next)) return
      this.moveFocus(next)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      this.keyboardActivate()
      return
    }
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (!this.selection.length) return
      this.selection.pop()
      if (this.selection.length) this.moveFocus(this.selection[this.selection.length - 1], false)
      this.ui.renderSpell(this.spellText())
      this.paintSelection()
      this.scheduleDraw()
    }
  }

  openWordCard(word) {
    this.wordCard = word
    this.audio.playTap()
    this.openOverlay('word')
    this.ui.announce(`${word.text}. ${word.meaning} Example: ${word.example}`)
  }

  keyboardActivate() {
    const cell = this.focus
    const found = this.solvedWordAt(cell)
    if (found) {
      this.openWordCard(found)
      return
    }
    if (!this.selection.length) {
      this.extend(cell, false)
      return
    }
    const tail = this.selection[this.selection.length - 1]
    if (sameCell(tail, cell)) {
      if (this.selection.length >= 3) this.finishStroke()
      return
    }
    this.extend(cell, false)
  }

  moveFocus(cell, fromArrow = true) {
    const current = this.tileAt(this.focus[0], this.focus[1])
    if (current) current.tabIndex = -1
    this.focus = cell
    const next = this.tileAt(cell[0], cell[1])
    if (next) {
      next.tabIndex = 0
      if (fromArrow) next.focus()
    }
  }

  paintSelection() {
    this.paintWordStyles()
  }

  paintWordStyles() {
    for (const tile of this.ui.grid.children) {
      tile.classList.remove('solved', 'hinted', 'selected')
      tile.style.removeProperty('--word')
      for (const name of ['--ex-t', '--ex-r', '--ex-b', '--ex-l', '--rtl', '--rtr', '--rbr', '--rbl']) tile.style.removeProperty(name)
    }
    for (const word of this.words) {
      if (word.solved) {
        this.paintGroup(word.path, word.color, 'solved')
        word.path.forEach((cell, index) => {
          this.tileAt(cell[0], cell[1])?.setAttribute('aria-label', `${word.text[index]}, in solved word ${word.text}. Show meaning.`)
        })
      } else if (word.revealed > 0) {
        this.paintGroup(word.path.slice(0, word.revealed), word.color, 'hinted')
      }
    }
    if (this.selection.length) {
      this.paintGroup(this.selection, traceColorFor(this.selection, this.words), 'selected')
    }
    this.syncCoach()
    this.draw()
  }

  currentLesson() {
    const steps = this.level?.coach
    if (!steps?.length) return null
    while (this.coachStep < steps.length) {
      const step = steps[this.coachStep]
      const word = this.words.find((item) => item.text === step.word)
      if (word && !word.solved) return { text: step.text, word }
      this.coachStep += 1
    }
    return null
  }

  lessonAllows(cell) {
    const lesson = this.currentLesson()
    if (!lesson) return true
    return lesson.word.path.some((item) => sameCell(item, cell))
  }

  startCoach() {
    this.stopCoach()
    if (!this.level?.coach) {
      this.syncCoach()
      return
    }
    this.syncCoach()
    if (this.reduced) return
    this.coachTimer = window.setInterval(() => {
      if (this.selection.length || this.overlay || this.pointerId !== null) return
      this.coachBeat += 1
      this.placeCoachHand()
    }, 900)
  }

  stopCoach() {
    if (this.coachTimer) window.clearInterval(this.coachTimer)
    this.coachTimer = 0
  }

  syncCoach() {
    const tiles = [...this.ui.grid.children]
    const lesson = this.currentLesson()
    if (!lesson) {
      tiles.forEach((tile) => tile.classList.remove('dim'))
      this.ui.hideCoach()
      if (this.shownCoach && this.shownCoach !== 'done' && this.level?.coach) {
        this.shownCoach = 'done'
        this.stopCoach()
        this.ui.announce('Find the remaining words. Backward counts too.')
      }
      return
    }
    const keys = new Set(lesson.word.path.map(([r, c]) => `${r},${c}`))
    for (const tile of tiles) {
      const onPath = keys.has(`${tile.dataset.r},${tile.dataset.c}`)
      tile.classList.toggle('dim', !onPath && !tile.classList.contains('solved'))
    }
    this.ui.showCoach(lesson.text, lesson.word.text, lesson.word.color)
    this.placeCoachHand()
    if (this.shownCoach !== lesson.word.text) {
      this.shownCoach = lesson.word.text
      this.ui.announce(`${lesson.text} ${lesson.word.text}.`)
    }
  }

  coachTarget() {
    const lesson = this.currentLesson()
    if (!lesson) return null
    const path = lesson.word.path
    const selected = this.selection
    if (selected.length) {
      const forward = path
      const backward = [...path].reverse()
      const follows = (route) => selected.every((cell, index) => sameCell(cell, route[index]))
      if (follows(forward) && selected.length < forward.length) return forward[selected.length]
      if (follows(backward) && selected.length < backward.length) return backward[selected.length]
      return path[0]
    }
    return path[this.coachBeat % path.length]
  }

  placeCoachHand() {
    const cell = this.coachTarget()
    if (!cell || this.ui.coachHand.hidden) return
    const tile = this.tileAt(cell[0], cell[1])
    if (!tile) return
    const board = this.ui.board.getBoundingClientRect()
    const rect = tile.getBoundingClientRect()
    this.ui.placeCoachHand(rect.left - board.left + rect.width * 0.38, rect.top - board.top + rect.height * 0.58)
  }

  paintGroup(cells, color, className) {
    const members = new Set(cells.map(([r, c]) => `${r},${c}`))
    for (const [r, c] of cells) {
      const tile = this.tileAt(r, c)
      if (!tile) continue
      tile.classList.add(className)
      tile.style.setProperty('--word', color)
      const up = members.has(`${r - 1},${c}`)
      const right = members.has(`${r},${c + 1}`)
      const down = members.has(`${r + 1},${c}`)
      const left = members.has(`${r},${c - 1}`)
      tile.style.setProperty('--ex-t', up ? '1' : '0')
      tile.style.setProperty('--ex-r', right ? '1' : '0')
      tile.style.setProperty('--ex-b', down ? '1' : '0')
      tile.style.setProperty('--ex-l', left ? '1' : '0')
      tile.style.setProperty('--rtl', !up && !left ? 'var(--corner)' : '0px')
      tile.style.setProperty('--rtr', !up && !right ? 'var(--corner)' : '0px')
      tile.style.setProperty('--rbr', !down && !right ? 'var(--corner)' : '0px')
      tile.style.setProperty('--rbl', !down && !left ? 'var(--corner)' : '0px')
    }
  }

  scheduleDraw(animate = false) {
    if (animate) {
      this.animating = true
      this.animStarted = 0
    }
    if (this.drawQueued) return
    this.drawQueued = true
    requestAnimationFrame((time) => this.drawFrame(time))
  }

  drawFrame(time) {
    this.drawQueued = false
    this.draw()
    if (this.animating) {
      if (!this.animStarted) this.animStarted = time
      if (time - this.animStarted < (this.reduced ? 80 : 900)) this.scheduleDraw()
      else {
        this.animating = false
        this.animStarted = 0
      }
    }
  }

  draw() {
    const canvas = this.ui.canvas
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    if (rect.width < 8 || rect.height < 8 || !this.level) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.round(rect.width * dpr)
    const height = Math.round(rect.height * dpr)
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)
    for (const group of this.shapeGroups()) {
      const path = this.shapePath(group.cells)
      if (!path) continue
      ctx.fillStyle = group.color
      ctx.fill(path)
    }
  }

  shapeGroups() {
    const groups = []
    for (const word of this.words || []) {
      if (word.solved) groups.push({ cells: word.path, color: word.color })
      else if (word.revealed > 0) groups.push({ cells: word.path.slice(0, word.revealed), color: word.color })
    }
    if (this.selection.length) groups.push({ cells: this.selection, color: traceColorFor(this.selection, this.words) })
    return groups
  }

  tileBox(tile) {
    return {
      x: tile.offsetLeft + this.ui.grid.offsetLeft,
      y: tile.offsetTop + this.ui.grid.offsetTop,
      w: tile.offsetWidth,
      h: tile.offsetHeight,
    }
  }

  shapePath(cells) {
    const members = new Set(cells.map(([r, c]) => `${r},${c}`))
    const rects = []
    for (const [r, c] of cells) {
      const tile = this.tileAt(r, c)
      if (!tile) continue
      const box = this.tileBox(tile)
      let { x, y, w, h } = box
      if (members.has(`${r},${c + 1}`)) w = this.tileBox(this.tileAt(r, c + 1)).x - x
      if (members.has(`${r + 1},${c}`)) h = this.tileBox(this.tileAt(r + 1, c)).y - y
      rects.push({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) })
    }
    if (!rects.length) return null
    const xs = [...new Set(rects.flatMap((rect) => [rect.x, rect.x + rect.w]))].sort((a, b) => a - b)
    const ys = [...new Set(rects.flatMap((rect) => [rect.y, rect.y + rect.h]))].sort((a, b) => a - b)
    const edges = new Map()
    const addEdge = (x1, y1, x2, y2) => {
      const fwd = `${x1},${y1},${x2},${y2}`
      const rev = `${x2},${y2},${x1},${y1}`
      if (edges.has(rev)) edges.delete(rev)
      else edges.set(fwd, [x1, y1, x2, y2])
    }
    for (let ix = 0; ix < xs.length - 1; ix += 1) {
      for (let iy = 0; iy < ys.length - 1; iy += 1) {
        const x = xs[ix]
        const y = ys[iy]
        const w = xs[ix + 1] - x
        const h = ys[iy + 1] - y
        if (w <= 0 || h <= 0) continue
        const cx = x + w / 2
        const cy = y + h / 2
        const inside = rects.some((rect) => cx > rect.x && cx < rect.x + rect.w && cy > rect.y && cy < rect.y + rect.h)
        if (!inside) continue
        addEdge(x, y, x + w, y)
        addEdge(x + w, y, x + w, y + h)
        addEdge(x + w, y + h, x, y + h)
        addEdge(x, y + h, x, y)
      }
    }
    const loops = this.chainEdges(edges)
    if (!loops.length) return null
    const radius = parseFloat(getComputedStyle(this.ui.board).getPropertyValue('--corner')) || 22
    const path = new Path2D()
    for (const loop of loops) {
      const points = this.simplifyLoop(loop)
      if (points.length < 3) continue
      this.traceRounded(path, points, radius)
    }
    return path
  }

  chainEdges(edges) {
    const next = new Map()
    for (const [x1, y1, x2, y2] of edges.values()) next.set(`${x1},${y1}`, [x2, y2])
    const unused = new Set(next.keys())
    const loops = []
    while (unused.size) {
      const start = unused.values().next().value
      const loop = []
      let key = start
      let guard = 0
      do {
        unused.delete(key)
        const [x, y] = key.split(',').map(Number)
        loop.push({ x, y })
        const point = next.get(key)
        if (!point) break
        key = `${point[0]},${point[1]}`
        guard += 1
      } while (key !== start && guard <= next.size)
      if (loop.length >= 3) loops.push(loop)
    }
    return loops
  }

  simplifyLoop(loop) {
    const points = []
    const count = loop.length
    for (let index = 0; index < count; index += 1) {
      const prev = loop[(index + count - 1) % count]
      const curr = loop[index]
      const next = loop[(index + 1) % count]
      const cross = (curr.x - prev.x) * (next.y - curr.y) - (curr.y - prev.y) * (next.x - curr.x)
      if (Math.abs(cross) > 0.5) points.push(curr)
    }
    return points
  }

  traceRounded(path, points, radius) {
    const count = points.length
    const start = points[0]
    const after = points[1]
    const lead = Math.min(radius, Math.hypot(after.x - start.x, after.y - start.y) / 2)
    const span = Math.hypot(after.x - start.x, after.y - start.y) || 1
    path.moveTo(start.x + ((after.x - start.x) * lead) / span, start.y + ((after.y - start.y) * lead) / span)
    for (let index = 1; index <= count; index += 1) {
      const curr = points[index % count]
      const next = points[(index + 1) % count]
      path.arcTo(curr.x, curr.y, next.x, next.y, radius)
    }
    path.closePath()
  }

  cellFromPoint(x, y) {
    const stack = document.elementsFromPoint(x, y)
    const tile = stack.map((node) => node.closest?.('[data-r]') || null).find((node) => node && this.ui.grid.contains(node))
    if (!tile) return null
    return [Number(tile.dataset.r), Number(tile.dataset.c)]
  }

  tileAt(r, c) {
    return this.ui.grid.querySelector(`[data-r="${r}"][data-c="${c}"]`)
  }

  isSolvedCell(cell) {
    return this.solvedKeys.has(`${cell[0]},${cell[1]}`)
  }

  solvedWordAt(cell) {
    if (!cell) return null
    return this.words.find((word) => word.solved && word.path.some((item) => sameCell(item, cell))) || null
  }

  rebuildSolved() {
    this.solvedKeys = new Set()
    for (const word of this.words) {
      if (!word.solved) continue
      for (const [r, c] of word.path) this.solvedKeys.add(`${r},${c}`)
    }
  }

  inBounds(cell) {
    return cell[0] >= 0 && cell[1] >= 0 && cell[0] < this.level.size && cell[1] < this.level.size
  }

  spellText() {
    return this.selection.map((cell) => this.level.grid[cell[0]][cell[1]]).join('')
  }

  clearVictoryTimer() {
    if (this.victoryTimer) window.clearTimeout(this.victoryTimer)
    this.victoryTimer = 0
  }
}
