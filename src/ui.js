import { HINT_COST, TEST_COIN_REWARD } from './config.js'
import { LEVEL_COUNT } from './levels.js'

export class UI {
  constructor(game) {
    this.game = game
    this.app = document.querySelector('#app')
    this.menu = document.querySelector('#menu-view')
    this.gameView = document.querySelector('#game-view')
    this.kicker = document.querySelector('#screen-kicker')
    this.title = document.querySelector('#screen-title')
    this.coinCount = document.querySelector('#coin-count')
    this.coinBox = document.querySelector('#coinbox')
    this.best = document.querySelector('#best-score')
    this.saveNote = document.querySelector('#save-note')
    this.levelGrid = document.querySelector('#level-grid')
    this.pauseBtn = document.querySelector('#btn-pause')
    this.levelPill = document.querySelector('#level-pill')
    this.soundBtn = document.querySelector('#btn-sound')
    this.shopBtn = document.querySelector('#btn-shop')
    this.resetBtn = document.querySelector('#btn-reset')
    this.tip = document.querySelector('#tip')
    this.boardSlot = document.querySelector('#board-slot')
    this.board = document.querySelector('#board')
    this.canvas = document.querySelector('#shape-canvas')
    this.grid = document.querySelector('#grid')
    this.spell = document.querySelector('#spell')
    this.progress = document.querySelector('#progress')
    this.wordList = document.querySelector('#word-list')
    this.hintBtn = document.querySelector('#btn-hint')
    this.coach = document.querySelector('#coach')
    this.coachLead = document.querySelector('#coach-lead')
    this.coachWord = document.querySelector('#coach-word')
    this.coachHand = document.querySelector('#coach-hand')
    this.restartBtn = document.querySelector('#btn-restart')
    this.overlay = document.querySelector('#overlay')
    this.modal = document.querySelector('.modal')
    this.modalX = document.querySelector('#modal-close')
    this.modalTitle = document.querySelector('#modal-title')
    this.modalBody = document.querySelector('#modal-body')
    this.modalActions = document.querySelector('#modal-actions')
    this.confetti = document.querySelector('#confetti')
    this.live = document.querySelector('#live')
    this.restoreFocus = null
    this.resizeObserver = new ResizeObserver(() => this.game.resizeBoard())
    this.resizeObserver.observe(this.boardSlot)
    this.bind()
  }

  bind() {
    this.pauseBtn.addEventListener('click', () => this.game.openOverlay('pause'))
    this.soundBtn.addEventListener('click', () => this.game.toggleSound())
    this.shopBtn.addEventListener('click', () => this.game.openOverlay('shop'))
    this.resetBtn.addEventListener('click', () => this.game.openOverlay('reset'))
    this.hintBtn.addEventListener('click', () => this.game.useHint())
    this.restartBtn.addEventListener('click', () => this.game.requestRestart())
    this.modal.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]')
      if (!button || !this.modal.contains(button)) return
      this.game.onAction(button.dataset.action)
    })
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay && this.game.overlay === 'word') this.game.closeOverlay()
    })
    this.overlay.addEventListener('keydown', (event) => this.trapTab(event))
    this.levelGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-level]')
      if (!button || button.disabled) return
      this.game.startLevel(Number(button.dataset.level))
    })
  }

  showMenu() {
    this.menu.hidden = false
    this.gameView.hidden = true
    this.pauseBtn.hidden = true
    this.levelPill.hidden = true
    this.soundBtn.hidden = false
    document.body.classList.remove('playing')
    this.hideCoach()
    this.kicker.textContent = 'Letter paths'
    this.title.textContent = 'Word Shapes'
    this.renderStats()
    this.renderLevels()
    this.renderSound()
  }

  showGame() {
    this.menu.hidden = true
    this.gameView.hidden = false
    this.pauseBtn.hidden = false
    this.levelPill.hidden = false
    this.levelPill.textContent = `LVL ${this.game.level.id}`
    this.soundBtn.hidden = true
    document.body.classList.add('playing')
    this.kicker.textContent = 'Word Shapes'
    this.title.textContent = 'Word Shapes'
    this.renderHud()
    this.renderSound()
  }

  renderStats() {
    const { save } = this.game
    this.coinCount.textContent = save.coins.toLocaleString()
    const cleared = save.completed.length
    this.best.textContent = `Best score ${save.bestScore.toLocaleString()} · ${cleared}/${LEVEL_COUNT} cleared`
  }

  renderHud() {
    this.renderStats()
    if (!this.game.level) return
    const found = this.game.words.filter((word) => word.solved).length
    const total = this.game.words.length
    this.progress.textContent = `${found} of ${total} words`
    const hintLeft = this.game.words.some((word) => !word.solved) && !this.game.currentLesson()
    this.hintBtn.disabled = !hintLeft
    this.hintBtn.setAttribute('aria-label', `Hint, costs ${HINT_COST} coins`)
  }

  renderLevels() {
    const { save, catalog } = this.game
    this.levelGrid.replaceChildren()
    for (const level of catalog) {
      const done = save.completed.includes(level.id)
      const locked = level.id > save.highestUnlocked
      const button = document.createElement('button')
      button.type = 'button'
      button.className = `level-btn${done ? ' done' : ''}${locked ? ' locked' : ''}${!done && !locked && level.id === save.highestUnlocked ? ' current' : ''}`
      button.dataset.level = String(level.id)
      button.disabled = locked
      const state = locked ? 'locked' : done ? 'cleared' : 'open'
      button.setAttribute('aria-label', `Level ${level.id}, ${level.theme}, ${state}`)
      button.innerHTML = `<span class="level-num">${level.id}</span><span class="level-theme">${level.theme}</span>`
      this.levelGrid.append(button)
    }
  }

  renderWords(words) {
    this.wordList.replaceChildren()
    for (const word of words) {
      const item = document.createElement('li')
      item.className = word.solved ? 'found' : 'pending'
      item.style.setProperty('--swatch', word.color)
      const shown = word.solved ? word.text.length : word.revealed || 0
      const label = word.solved
        ? word.text
        : `${word.text.slice(0, shown)}${'·'.repeat(word.text.length - shown)}`
      item.textContent = label
      item.setAttribute('aria-label', word.solved ? `Found ${word.text}` : `Hidden word, ${word.text.length} letters${shown ? `, ${shown} revealed` : ''}`)
      this.wordList.append(item)
    }
  }

  renderSpell(text) {
    this.spell.textContent = text ? text.split('').join(' ') : ''
    this.spell.classList.toggle('has-text', Boolean(text))
  }

  setTip(text) {
    this.tip.textContent = text || 'Follow each colored shape.'
  }

  showCoach(lead, word, color) {
    this.coach.hidden = false
    this.coachHand.hidden = false
    this.coachLead.textContent = `${lead} `
    this.coachWord.textContent = word
    this.coachWord.style.color = color
    this.board.classList.add('coaching')
  }

  hideCoach() {
    this.coach.hidden = true
    this.coachHand.hidden = true
    this.board.classList.remove('coaching')
  }

  placeCoachHand(x, y) {
    this.coachHand.style.left = `${x}px`
    this.coachHand.style.top = `${y}px`
  }

  renderSound() {
    const on = this.game.save.sound
    this.soundBtn.setAttribute('aria-pressed', on ? 'false' : 'true')
    this.soundBtn.setAttribute('aria-label', on ? 'Mute sound' : 'Unmute sound')
    this.soundBtn.classList.toggle('is-muted', !on)
  }

  setStorageNote(show) {
    this.saveNote.hidden = !show
  }

  renderOverlay(name) {
    this.restoreFocus = document.activeElement
    const level = this.game.level
    const coins = this.game.save.coins
    this.confetti.hidden = true
    this.confetti.replaceChildren()
    this.modal.classList.remove('word-card')
    this.modalX.hidden = true
    this.modalTitle.style.color = ''
    if (name === 'word') {
      this.renderWordCard(this.game.wordCard)
    } else if (name === 'pause') {
      this.fill('Paused', '<p>The board is waiting.</p>', [
        ['resume', 'Resume', true],
        ['sound', this.game.save.sound ? 'Sound: On' : 'Sound: Off', false],
        ['restart', 'Restart level', false],
        ['menu', 'Level menu', false],
      ])
    } else if (name === 'shop') {
      this.fill(
        'Coins',
        `<p class="shop-balance">You have <strong>${coins.toLocaleString()}</strong> coins.</p>
         <p class="fine">Claim test coins adds ${TEST_COIN_REWARD} coins right away. This is a test reward for the demo. It does not play an ad.</p>`,
        [
          ['claim', 'Claim test coins', true],
          ['close', 'Close', false],
        ],
      )
    } else if (name === 'victory') {
      const last = level.id >= LEVEL_COUNT
      this.fill(
        'Level clear!',
        `<p class="theme-name">${level.theme}</p>
         <p>Level ${level.id} is complete.</p>
         <p class="earn">+${this.game.earned.toLocaleString()} coins</p>`,
        [
          ['next', last ? 'Level menu' : 'Next level', true],
          ['menu', 'Levels', false],
        ],
      )
      this.burst()
    } else if (name === 'reset') {
      this.fill('Reset progress?', '<p>This clears cleared levels, coins, score, and the sound setting on this browser.</p>', [
        ['reset-yes', 'Reset', true],
        ['close', 'Cancel', false],
      ])
    } else if (name === 'restart') {
      this.fill('Restart level?', '<p>Found words on this try go back under their shapes. Coins you already earned stay.</p>', [
        ['restart-yes', 'Restart', true],
        ['close', 'Cancel', false],
      ])
    }
    this.overlay.hidden = false
    this.app.inert = true
    const first = this.modalActions.querySelector('button')
    window.requestAnimationFrame(() => first?.focus())
  }

  renderWordCard(word) {
    this.modal.classList.add('word-card')
    this.modalX.hidden = false
    this.modalTitle.textContent = word.text
    this.modalTitle.style.color = word.color
    this.modalBody.replaceChildren()
    const meaning = document.createElement('p')
    meaning.className = 'meaning'
    meaning.textContent = word.meaning
    const example = document.createElement('p')
    example.className = 'example'
    const label = document.createElement('span')
    label.textContent = 'Example'
    example.append(label, document.createTextNode(`“${word.example}”`))
    this.modalBody.append(meaning, example)
    this.modalActions.replaceChildren()
    const close = document.createElement('button')
    close.type = 'button'
    close.dataset.action = 'close'
    close.className = 'primary-btn'
    close.textContent = 'Close'
    this.modalActions.append(close)
  }

  fill(title, body, actions) {
    this.modalTitle.textContent = title
    this.modalBody.innerHTML = body
    this.modalActions.replaceChildren()
    for (const [action, label, primary] of actions) {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.action = action
      button.className = primary ? 'primary-btn' : 'ghost-btn'
      button.textContent = label
      this.modalActions.append(button)
    }
  }

  hideOverlay() {
    this.overlay.hidden = true
    this.modal.classList.remove('word-card')
    this.modalX.hidden = true
    this.modalTitle.style.color = ''
    this.app.inert = false
    this.confetti.hidden = true
    const back = this.restoreFocus
    if (back && typeof back.focus === 'function' && document.contains(back)) back.focus()
  }

  burst() {
    if (this.game.reduced) return
    this.confetti.hidden = false
    const colors = ['#FFD84A', '#FF5548', '#FF8A1E', '#FF6FAE', '#fff6df']
    for (let i = 0; i < 18; i += 1) {
      const bit = document.createElement('i')
      bit.style.left = `${8 + Math.random() * 84}%`
      bit.style.background = colors[i % colors.length]
      bit.style.animationDelay = `${Math.random() * 0.2}s`
      bit.style.transform = `rotate(${Math.random() * 80 - 40}deg)`
      this.confetti.append(bit)
    }
  }

  floatReward(text) {
    const floater = document.createElement('span')
    floater.className = 'floater'
    floater.textContent = text
    this.coinBox.append(floater)
    this.coinCount.classList.add('bump')
    window.setTimeout(() => this.coinCount.classList.remove('bump'), 320)
    floater.addEventListener('animationend', () => floater.remove())
    if (this.game.reduced) floater.remove()
  }

  shakeCoins() {
    this.coinBox.classList.add('shake')
    window.setTimeout(() => this.coinBox.classList.remove('shake'), 360)
  }

  announce(message) {
    this.live.textContent = ''
    window.setTimeout(() => {
      this.live.textContent = message
    }, 30)
  }

  trapTab(event) {
    if (event.key !== 'Tab' || this.overlay.hidden) return
    const buttons = [...this.overlay.querySelectorAll('button:not([hidden])')]
    if (!buttons.length) return
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}
