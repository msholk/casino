import EventDispatcher from "../utils/eventDispatcher";
import MainScene from "../main/mainScene";

export default class SpinButton extends Phaser.GameObjects.Sprite {
    buttonPressed: boolean

    constructor(scene: MainScene, x: number, y: number){
        super(scene, x, y, 'spinButton')
        this.scale = 0.4
        this.buttonPressed = false

        this.setInteractive()
        // on click, confirm bet and launch roulette
        this.on('pointerdown', () => {
            let ed = EventDispatcher.getInstance()
            ed.emit('betConfirmed')
        })

        this.on('pointerover', () => {
            this.setFrame(2)
        })

        this.on('pointerout', () => {
            this.setFrame(0)
        })

        let ed = EventDispatcher.getInstance()
        ed.on('rouletteLaunched', () => {
            this.buttonPressed = true
            this.setFrame(1)
        })
        ed.on('rouletteStopped', () => {
            this.buttonPressed = false
            this.setFrame(0)
        })
    }
}
