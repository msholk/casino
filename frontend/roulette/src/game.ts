import 'phaser'
import MainScene from './main/mainScene'
import PreloadScene from './preload/preloadScene'

const DEFAULT_WIDTH = 1920
const DEFAULT_HEIGHT = 1080

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#000',
    scale: {
        parent: 'phaser-game',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT
    },
    dom: {
        createContainer: true
    },
    scene: [PreloadScene, MainScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 400 }
        }
    }
}

window.addEventListener('load', () => {
    const game = new Phaser.Game(config)
})
