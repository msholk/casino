import Board from "./board";

import { getTypeBet } from "../lib/betParser"
import { CELL_WIDTH, BOARD_HEIGHTS, betTypes, HOVER_ALPHA } from "./boardConstants";


export default class BoardHover extends Phaser.GameObjects.Image {
    board: Board

    constructor(board: Board) {
        super(board.scene, 0, 70, 'boardBlurrHover')
        this.board = board

        this.setAlpha(0)
    }

    update(x: number, y: number) {


        let hoverTypeBet = getTypeBet(x, y)

        let xHoverPosition = hoverTypeBet.x * CELL_WIDTH
        let yHoverPosition = 0
        for (let i = 0; i < hoverTypeBet.y; i++) {
            yHoverPosition += BOARD_HEIGHTS[i]
        }

        // adjust hover rectangle coordinate system to match the phaser container 0,0 == center system
        this.x = (xHoverPosition - this.board.board.width / 2)
        this.y = (yHoverPosition - this.board.board.height / 2)

        switch (hoverTypeBet.type) {
            
            // horizontal split, halfs, even/odd, Color, set rectangle to be 2 by 1
            case betTypes.SecondHalf:
            case betTypes.FirstHalf:
            case betTypes.Color:
            case betTypes.HorizontalSplit:
            case betTypes.OddsOrEven:
                this.alpha = HOVER_ALPHA
                this.displayWidth = CELL_WIDTH * 2
                this.displayHeight = BOARD_HEIGHTS[hoverTypeBet.y]
                this.y += BOARD_HEIGHTS[hoverTypeBet.y] / 2
                break

            case betTypes.VerticalSplit: // vertical split, set rectangle to be 1 by 2
                this.alpha = HOVER_ALPHA
                this.displayWidth = CELL_WIDTH * 1
                this.displayHeight = BOARD_HEIGHTS[hoverTypeBet.y] * 2
                this.x += CELL_WIDTH / 2
                break

            case betTypes.Zero: // Zero case, set rectangle to be 1 by 3
                this.alpha = HOVER_ALPHA
                this.displayWidth = CELL_WIDTH * 1
                this.displayHeight = BOARD_HEIGHTS[hoverTypeBet.y] * 3
                this.x += CELL_WIDTH / 2
                this.y += BOARD_HEIGHTS[hoverTypeBet.y] / 2
                break

            case betTypes.Corner: // corner case, set rectangle to be 2 by 2
                this.alpha = HOVER_ALPHA
                this.displayWidth = CELL_WIDTH * 2 + 60
                this.displayHeight = BOARD_HEIGHTS[hoverTypeBet.y] * 2 + 60
                break

            case betTypes.FullRow:
            case betTypes.Straight: // straigh case, set rectangle to be 1 by 1
                this.alpha = HOVER_ALPHA
                this.displayWidth = CELL_WIDTH * 1
                this.displayHeight = BOARD_HEIGHTS[hoverTypeBet.y] * 1
                this.x += CELL_WIDTH / 2
                this.y += BOARD_HEIGHTS[hoverTypeBet.y] / 2
                break

            case betTypes.Third: // third case, set rectangle to be 4 by 1
                this.alpha = HOVER_ALPHA
                this.displayWidth =  CELL_WIDTH * 4
                this.displayHeight =  BOARD_HEIGHTS[hoverTypeBet.y] * 1
                this.y += BOARD_HEIGHTS[hoverTypeBet.y] / 2
                break

            case betTypes.None: // board corners, make the rectangle not visible
                this.alpha = 0
                break

            default:
                this.displayWidth = 0
                this.displayHeight = 0
        }

        // this is the initial offset
        this.x += 20
        this.y += 10

        // this is common to every single case because of the image shown as hover
        this.displayWidth += 80
        this.displayHeight += 80
    }
}
