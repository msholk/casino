import MainScene from "../main/mainScene";
import RouletteResult from "./rouletteResult";

export default class Roulette extends Phaser.GameObjects.Container {
    rouletteResult: RouletteResult

    constructor(scene: MainScene, x: number, y: number){
        super(scene, x, y)

        // add roulette image
        // let rouletteShadow = new Phaser.GameObjects.Image(scene, 0, 40, 'rouletteShadow')
        // this.add(rouletteShadow)
        let roulette = new Phaser.GameObjects.Image(scene, -6, 75, 'roulette')
        this.add(roulette)

        // roulette result
        this.rouletteResult = new RouletteResult(scene, -18, 65)
        scene.add.existing(this.rouletteResult) // needed to make anims work
        this.add(this.rouletteResult)
    }
}
