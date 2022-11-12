import MainScene from "../main/mainScene";

export default class TopPannelUi extends Phaser.GameObjects.Container {
    cashierForm: Phaser.GameObjects.DOMElement

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y)

        // bg rectangle
        let graphics = new Phaser.GameObjects.Graphics(scene)
        graphics.fillGradientStyle(0x000, 0x000, 0x050418, 0x050418, 1, 1, 0.3, 0.3)
        graphics.fillRect(0, -100, scene.cameras.main.width, 250)
        this.add(graphics)

        // can't add this to the container
        this.cashierForm = scene.add.dom(1200, 300).createFromCache('cashier')
        this.cashierForm.setPerspective(800)

        this.cashierForm.rotate3d.w = 8
        this.cashierForm.rotate3d.x = 2
    }

}
