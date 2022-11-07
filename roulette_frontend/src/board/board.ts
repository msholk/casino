import MainScene from "../main/mainScene";
import BoardHover from "./boardHover";
import { HOVER_ALPHA } from "./boardConstants"
import { getTypeBet } from "../lib/betParser";

export default class Board extends Phaser.GameObjects.Container {
    mouseOnBoard: boolean
    hover: BoardHover
    board: Phaser.GameObjects.Image
    top: number
    left: number

    constructor(scene: MainScene, x: number, y: number) {
        super(scene, x, y)

        // add the board image
        this.board = new Phaser.GameObjects.Image(scene, 0, 0, 'board').setInteractive()
        this.add(this.board)

        // rectangle used to show hover
        this.hover = new BoardHover(this)
        // this.hover = new Phaser.GameObjects.Rectangle(scene, -50, -28, (CELL_WIDTH + BORDER_WIDTH * 2), (CELL_HEIGHT + BORDER_WIDTH * 2), 0xD9D9D9).setAlpha(0)

        // hover listeners
        this.board.on('pointerover', () => {
            this.mouseOnBoard = true
            this.hover.setAlpha(HOVER_ALPHA)
        })
        this.board.on('pointerout', () => {
            this.mouseOnBoard = false
            this.hover.setAlpha(0)
        })

        this.board.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            let betType = getTypeBet(pointer.x - this.left, pointer.y - this.top)
            scene.betManager.placeBet(betType)
        })

        // get bounds
        let bounds = this.getBounds()
        this.left = bounds.left
        this.top = bounds.top

        this.hover = new BoardHover(this)
        this.add(this.hover)

    }

    // Update the board with on hover mechanics
    update(xPointer: number, yPointer: number) {

        // get relative x and y positions
        let x = xPointer - this.left
        let y = yPointer - this.top

        this.hover.update(x, y)

    }
}
