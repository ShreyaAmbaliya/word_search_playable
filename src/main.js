import '@fontsource/fredoka/latin-400.css'
import '@fontsource/fredoka/latin-600.css'
import '@fontsource/fredoka/latin-700.css'
import './style.css'
import { Game } from './game.js'

const game = new Game()
game.start()

window.addEventListener('pointerdown', () => game.audio.unlock(), true)
window.addEventListener('keydown', () => game.audio.unlock(), true)
