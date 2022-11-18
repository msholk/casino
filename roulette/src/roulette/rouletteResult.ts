import MainScene from "../main/mainScene";
import EventDispatcher from "../utils/eventDispatcher";

const rouletteFrameToNumber = [29, 32, 35, 1, 4, 7, 10, 13, 16, 19, 22, 38, 25, 28, 31, 34, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 37, 2, 5, 8, 11, 14, 17, 20, 23, 26]

export default class RouletteResult extends Phaser.GameObjects.Sprite {
    scene: MainScene

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y, 'rouletteSprite')
        // this.setScale(0.8)

        this.scene = scene

        // create animation
        scene.anims.create({ key: 'spin', frameRate: 30, frames: scene.anims.generateFrameNumbers('rouletteSprite', { start: 0, end: 37 }), repeat: -1 })

        let ed = EventDispatcher.getInstance()
        ed.on('rouletteLaunched', () => {
            this.play('spin')
        })

        ed.on('rouletteStopped', (result: number, winByPos: Array<number>) => {
            this.stop()

            let totalWin = 0
            for (let pos of winByPos) {
                totalWin += pos
            }

            // flash message with the results
            let msg: string
            let msgX: number
            if (totalWin) {
                msg = `You won ${totalWin}!`
                msgX = 620
            } else {
                if(result == 37) msg = 'Roulette stopped at 00!'
                else if(result == 36) msg = 'Roulette stopped at 0!'
                else msg = `Roulette stopped at ${result}!`

                msgX = 470
            }
            scene.messageFlasher.flashMessage(msgX, 300, msg, undefined, scene.messageFlasher.colors.INFO)

            let initialIndex = Number(this.frame.name)

            let shouldStop = false
            let finalIndex = -1
            for (let i = initialIndex; shouldStop == false; i = (i + 1) % rouletteFrameToNumber.length) {
                if (rouletteFrameToNumber[i] == result) {
                    shouldStop = true
                    finalIndex = i
                }
            }

            // ensure the roulette spins the right way
            if (initialIndex > finalIndex) {
                this.animateFromTo(initialIndex, 37)
                this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    this.animateFromTo(0, finalIndex)
                })
            }
            else {
                this.animateFromTo(initialIndex, finalIndex)
            }

            console.log('index found: ', finalIndex)
        })

        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.scene.anims.remove('finalSpin')
        })

    }

    animateFromTo(from: number, to: number) {
        console.log(this.scene.anims.generateFrameNumbers('rouletteSprite', { start: ((from + 1) % 38), end: to }))
        this.scene.anims.create({
            key: 'finalSpin',
            frameRate: 30,
            frames: this.scene.anims.generateFrameNumbers('rouletteSprite', { start: (from + 1) % 38, end: to }),

        })
        this.play('finalSpin')
    }

}
