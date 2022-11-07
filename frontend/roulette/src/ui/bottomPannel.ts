import ChipContainer from "../chips/chipsContainer";
import MainScene from "../main/mainScene";

export default class BottomPannelUi extends Phaser.GameObjects.Container {
    chipContainer: ChipContainer

    constructor(scene: MainScene, x: number, y: number){
        super(scene, x, y)

        // bg rectangle
        let graphics = new Phaser.GameObjects.Graphics(scene)
        graphics.fillGradientStyle(0x050418, 0x050418, 0x000, 0x000, 0.3, 0.3, 1, 1)
        graphics.fillRect(0, -100, scene.cameras.main.width, 360)
        this.add(graphics)

        this.chipContainer = new ChipContainer(scene, 0, 0)
        this.add(this.chipContainer)

    }

}
