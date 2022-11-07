import MainScene from "../main/mainScene"

export default class SpinButton extends Phaser.GameObjects.Image {

    constructor(scene: MainScene, x: number, y: number, width: number, height: number) {
        super(scene, x, y, 'spin_image')

        // make image interactive to allow hover, click, etc
        this.setInteractive()

        this.on('pointerdown', () => {
            scene.spinRoulette()
        })

        this.displayWidth = width
        this.displayHeight = height

    }
}
