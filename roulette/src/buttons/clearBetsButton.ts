import MainScene from "../main/mainScene";
import EventDispatcher from "../utils/eventDispatcher";

export default class ClearBetsButton extends Phaser.GameObjects.Sprite {
    buttonPressed: boolean

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y, 'clearBetsButton')
        this.scale = 0.4
        this.buttonPressed = false
        
        this.setInteractive()
        // handle all the frames
        this.on('pointerover', () => {
            this.setFrame(1)
        })

        this.on('pointerout', () => {
            this.setFrame(0)
        })

        this.on('pointerdown', () => {
            scene.betManager.cleanBets()
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
