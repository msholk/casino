import EventDispatcher from "../events/eventDispatcher";
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
    }

    update(value: number){
        // set text to new value
        let element = document.getElementById('totalBet') as HTMLDivElement
        this.totalBetAmmount += value

        element.innerText = `Total Bet: ${this.totalBetAmmount}`
    }
}
