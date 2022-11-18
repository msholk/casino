import EventDispatcher from "../utils/eventDispatcher";
import MainScene from "../main/mainScene";

export default class TotalBet extends Phaser.GameObjects.DOMElement {
    totalBetAmmount: number

    constructor(scene: MainScene, x: number, y: number){
        super(scene, x, y)
        
        this.totalBetAmmount = 0

        // set perspective
        this.setPerspective(800)
        this.rotate3d.x = 20
        this.rotate3d.w = 8

        let ed = EventDispatcher.getInstance()
        ed.on('betPlaced', (chipValue: number) => {

            this.update(chipValue)
        })
        ed.on('betFinished', () => {
            this.reset()
        })
    }

    update(value: number){
        this.totalBetAmmount += value

        // set text to new value
        let element = document.getElementById('totalBet') as HTMLDivElement
        element.innerText = `Total Bet: ${this.totalBetAmmount}`
    }

    reset(){
        this.totalBetAmmount = 0

        // set text to new value
        let element = document.getElementById('totalBet') as HTMLDivElement
        element.innerText = `Total Bet: ${this.totalBetAmmount}`
    }
}
