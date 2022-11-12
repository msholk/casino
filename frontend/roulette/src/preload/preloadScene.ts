import { CHIPS_VALUES } from '../chips/chipConstants'
import WebFontFile from './webFontFile'

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' })
    }

    preload() {
        // load background
        this.load.image('bg', 'assets/img/background.png')
        // load spin image
        this.load.image('spin_image', 'assets/img/spin.jpeg')
        // load board
        this.load.image('board', 'assets/img/board.png')
        this.load.image('boardBlurrHover', 'assets/img/board_hover.png')
        // load chips
        for (let i = 0; i < CHIPS_VALUES.length; i++) {
            this.load.image(`${CHIPS_VALUES[i]}_chip`, `assets/img/${CHIPS_VALUES[i]}_chip.png`)
        }
        // load buttons
        this.load.image('spinButton', 'assets/img/spin.png')

        this.load.html('cashier', 'assets/html/cashier.html')
        this.load.html('totalBet', 'assets/html/totalBet.html')
        this.load.html('playerBalance', 'assets/html/playerBalance.html')

        // fonts from google fonts
        this.load.addFile(new WebFontFile(this.load, 'Press Start 2P'))
    }

    create() {
        this.scene.start('MainScene')

        /**
         * This is how you would dynamically import the mainScene class (with code splitting),
         * add the mainScene to the Scene Manager
         * and start the scene.
         * The name of the chunk would be 'mainScene.chunk.js
         * Find more about code splitting here: https://webpack.js.org/guides/code-splitting/
         */
        // let someCondition = true
        // if (someCondition)
        //   import(/* webpackChunkName: "mainScene" */ './mainScene').then(mainScene => {
        //     this.scene.add('MainScene', mainScene.default, true)
        //   })
        // else console.log('The mainScene class will not even be loaded by the browser')
    }
}
