import EventDispatcher from "../events/eventDispatcher";
import { getPlayerBalance } from "../lib/blockchain";
import MainScene from "../main/mainScene";

export default class PlayerBalance extends Phaser.GameObjects.DOMElement {
    playerBalance: number

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y)

        this.updateBalance()

        // set perspective
        this.setPerspective(800)
        this.rotate3d.x = 20
        this.rotate3d.w = 8

        let ed = EventDispatcher.getInstance()
        ed.on('balanceChanged', this.updateBalance, this)
    }

    async updateBalance() {
        let balance = await getPlayerBalance()
        console.log('updating balance')

        // 10 to the power of 15 since 1 eth/matic == 1000 chips
        this.playerBalance = balance[0].div(Math.pow(10, 15)).toNumber()
        console.log(this.playerBalance)

        let element = document.getElementById('playerBalance') as HTMLDivElement
        element.innerText = `Player Balance: ${this.playerBalance}`
    }
}
