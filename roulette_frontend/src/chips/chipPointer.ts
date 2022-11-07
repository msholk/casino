import MainScene from "../main/mainScene";
import { NO_CHIP } from "./chipConstants";

export default class ChipPointer extends Phaser.GameObjects.Image{
    scene: MainScene

    constructor(scene: MainScene){
        // initially, the 1 chip but could be any and shouldn't be visible
        super(scene, 0, 0, '1_chip')
        this.setVisible(false).setScale(0.3).setZ(100)

        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.visible) this.setPosition(pointer.x, pointer.y)
        })

        this.scene = scene
    }

    update(chip: number){
        chip == NO_CHIP ? this.setVisible(false) : this.setTexture(`${chip}_chip`).setVisible(true)
    }
}
