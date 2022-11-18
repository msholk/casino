import { connectWallet } from "../lib/blockchain";
import MainScene from "../main/mainScene";

export default class ConnectWalletButton extends Phaser.GameObjects.Sprite {
    connected: boolean

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y, 'walletButton')

        this.connected = false
        this.scale = 0.4

        this.setInteractive()
        this.checkWalletConnected()

        this.on('pointerdown', this.checkWalletConnected)
    }

    async checkWalletConnected() {
        let ret = await connectWallet()

        if (ret) {
            this.setFrame(1)
            this.connected = true
        }
    }
}
