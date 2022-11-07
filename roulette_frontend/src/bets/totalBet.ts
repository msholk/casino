import EventDispatcher from "../events/eventDispatcher";
import MainScene from "../main/mainScene";

export default class TotalBetText extends Phaser.GameObjects.Text {
    totalBet: number

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y, 'Total bet: 0', {fontFamily: '"Press Start 2P"', fontSize: '50px'})
        this.totalBet = 0

        let ed = EventDispatcher.getInstance()
        ed.on('betPlaced', (betValue: number) => {
            this.update(betValue)
        })
    }
    
    update(totalBet: number){
        this.totalBet += totalBet

        this.setText(`Total bet: ${this.totalBet}`)
    }
}
