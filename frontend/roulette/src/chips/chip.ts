import ChipContainer from "./chipsContainer"
import EventDispatcher from "../events/eventDispatcher"
import { NO_CHIP } from "./chipConstants"

export default class Chip extends Phaser.GameObjects.Image {
    chipValue: number

    constructor(container: ChipContainer, x: number, value: number) {
        super(container.scene, x, container.height / 2, `${value}_chip`)

        // make image interactive to allow hover, click, etc
        this.setInteractive()

        // TODO: pedir directamente los frames a 100x100
        this.setScale(0.5)
        this.chipValue = value

        // grow image on hover
        this.on('pointerover', () => {
            this.scale += 0.1
        })

        // shrink image on hover leave
        this.on('pointerout', () => {
            this.scale -= 0.1
        })

        // set container current value to the chip value or unselect it
        this.on('pointerdown', () => {
            let valueToEmit = container.currentValue == this.chipValue ? NO_CHIP : this.chipValue

            let ed = EventDispatcher.getInstance()
            ed.emit('chipChanged', valueToEmit, container.currentValue)
        })

        // handle the select effect
        let ed = EventDispatcher.getInstance()
        ed.on('chipChanged', (newValue, previousValue) => {
            // if it was selected previously and now another chip is being selected
            if(this.chipValue == previousValue && this.chipValue != newValue){
                container.scene.tweens.add({
                    targets: this,
                    y: '+=20',
                    duration: 200
                })
            }

            else if(this.chipValue == newValue){
                container.scene.tweens.add({
                    targets: this,
                    y: '-=20',
                    duration: 200
                })
            }
        })

    }

}
