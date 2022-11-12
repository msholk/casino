import MainScene from "../main/mainScene"
import { betInfo, BOARD_HEIGHTS, CELL_WIDTH, betTypes, NUM_COLS } from "./boardConstants"

export default class BoardBet extends Phaser.GameObjects.Image {

    constructor(scene: MainScene, bet: betInfo) {
        let x = bet.x * CELL_WIDTH
        let y = 0
        for (let i = 0; i < bet.y; i++) {
            y += BOARD_HEIGHTS[i]
        }

        // normalize the coordinates to use the container coordinate system
        x = (x - scene.board.board.width / 2)
        y = (y - scene.board.board.height / 2)

        super(scene, x, y, `${scene.bottomPannelUi.chipContainer.currentValue}_chip`)

        this.setScale(0.20)

        let xOffset = 20
        let yOffset = 15

        switch (bet.type) {
            case betTypes.FullRow:
            case betTypes.Straight:

                x += CELL_WIDTH / 2 + xOffset
                y += BOARD_HEIGHTS[bet.y] / 2 + yOffset
                
                if (bet.x >= NUM_COLS - 2){
                    let perspectiveOffset: number
                    if (bet.y > 2) perspectiveOffset = 20
                    else if ( bet.y < 2) perspectiveOffset = -20
                    else perspectiveOffset = 0
                    x += perspectiveOffset
                }

                break

            case betTypes.SecondHalf:
            case betTypes.FirstHalf:
            case betTypes.Color:
            case betTypes.HorizontalSplit:
            case betTypes.OddsOrEven:
                x += xOffset
                y += BOARD_HEIGHTS[bet.y] / 2 + yOffset
                break

            case betTypes.VerticalSplit:
                x += CELL_WIDTH / 2 + xOffset
                y += yOffset
                break

            case betTypes.Corner:
                x += xOffset
                y += yOffset
                break

            case betTypes.Zero:
                x += CELL_WIDTH / 2 + xOffset
                break

            case betTypes.Third:
                x += CELL_WIDTH + xOffset * 2
                y += BOARD_HEIGHTS[bet.y] / 2
        }
        this.setX(x).setY(y).setAlpha(0.7)

        scene.board.add(this)
    }
}
