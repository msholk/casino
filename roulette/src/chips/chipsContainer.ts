import Chip from "./chip"
import { CHIPS_VALUES, CHIPS_X_POSITIONS, NO_CHIP } from "./chipConstants"
import EventDispatcher from "../utils/eventDispatcher"

export default class ChipContainer extends Phaser.GameObjects.Container {
    currentValue: number

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y)

        for(let i = 0; i < CHIPS_VALUES.length; i++){
            this.add(new Chip(this, CHIPS_X_POSITIONS[i] + 50, CHIPS_VALUES[i], ))
        }

        // no chips selected initially
        this.currentValue = -1

        let ed = EventDispatcher.getInstance()
        ed.on('chipChanged', (chipValue: number) => {
            this.currentValue = this.currentValue == chipValue ? NO_CHIP : chipValue
        }, this)
    }

}
