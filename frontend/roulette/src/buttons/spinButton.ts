import EventDispatcher from "../events/eventDispatcher";
import MainScene from "../main/mainScene";

export default class SpinButton extends Phaser.GameObjects.Image {
    scene: MainScene

    constructor(scene: MainScene, x: number, y: number){
        super(scene, x, y, 'spinButton')

        this.scene = scene

        this.setInteractive()

        this.scale = 0.4

        // on click, confirm bet and launch roulette
        this.on('pointerdown', () => {
            let ed = EventDispatcher.getInstance()
            ed.emit('betConfirmed')
        })
    }
}
