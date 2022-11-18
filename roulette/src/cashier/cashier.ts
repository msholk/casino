import EventDispatcher from "../utils/eventDispatcher";
import { playerDeposit, playerWithdraw } from "../lib/blockchain";
import MainScene from "../main/mainScene";

export default class Cashier extends Phaser.GameObjects.DOMElement {

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y)

        // set perspective
        this.setPerspective(800)
        this.rotate3d.x = 20
        this.rotate3d.w = 8

        // call blockchain methods
        this.on('click', async function(event) {
            event.preventDefault()

            let quantityElement = document.getElementsByName('quantity')[0] as HTMLInputElement
            let quantity = quantityElement.value

            if(!quantity || Number(quantity) <= 0) {
                return
            }

            if (event.target.name === 'depositButton') {
                await playerDeposit(Number(quantity))

            } else if (event.target.name === 'withdrawButton') {
                await playerWithdraw(Number(quantity))
            }

            let ed = EventDispatcher.getInstance()
            ed.emit('balanceChanged')
        })
    }

}
