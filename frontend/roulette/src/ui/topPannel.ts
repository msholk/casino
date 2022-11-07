import TotalBetText from "../bets/totalBet";
import MainScene from "../main/mainScene";

export default class TopPannelUi extends Phaser.GameObjects.Container {
    totalBet: TotalBetText

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y)

        // bg rectangle
        let graphics = new Phaser.GameObjects.Graphics(scene)
        graphics.fillGradientStyle(0x000, 0x000, 0x050418, 0x050418, 1, 1, 0.3, 0.3)
        graphics.fillRect(0, -100, scene.cameras.main.width, 300)
        this.add(graphics)

        this.totalBet = new TotalBetText(scene, 1100, 40)
        this.add(this.totalBet)
    }

}
