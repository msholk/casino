import MainScene from "../main/mainScene"

const MAX_NUMBER = 37 // 38 numbers

export default class FakeRngScore extends Phaser.GameObjects.Text {
    result: number

    constructor(scene: MainScene, x: number, y: number, style: Phaser.Types.GameObjects.Text.TextStyle){
        super(scene, x, y, '', style)
    }

    generateResult() {
        this.result = Math.floor(Math.random() * MAX_NUMBER)

        if (this.result == 37) {
            this.result = 0
        }

        this.setText(String(this.result))
    }

    getResult(){
        return this.result
    }
}
