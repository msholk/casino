import MainScene from "../main/mainScene"

const colors = {
    WARNING: '#eae559',
    ERROR: '#ef572d',
    INFO: '#93a8e2',
}

export default class MessageFlasher {
    scene: MainScene
    colors: Record<string, string>

    constructor(scene: MainScene) {
        this.scene = scene
        this.colors = colors
    }

    flashMessage(x: number, y: number, text: string, fontsize = '64px', color = '#fff') {
        console.log(fontsize)
        let flashMsg = this.scene.add.text(x, y, text,
            {
                fontSize: fontsize,
                fontFamily: '"Press Start 2P"',
                color: color
            })

        // fade the text away
        this.scene.tweens.add({
            targets: flashMsg, alpha: 0, y: '-=200', duration: 4000,
            onComplete: function (this: Phaser.GameObjects.Text) { this.destroy() }, onCompleteScope: flashMsg
        })
    }
}
