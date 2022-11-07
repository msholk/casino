import Board from '../board/board'
import FakeRngScore from '../blockchain/fakeRngScore'
import ChipPointer from '../chips/chipPointer'
import BetManager from '../bets/betManager'

import EventDispatcher from '../events/eventDispatcher'

import BottomPannelUi from '../ui/bottomPannel'
import TopPannelUi from '../ui/topPannel'


export default class MainScene extends Phaser.Scene {
    bottomPannelUi: BottomPannelUi
    topPannelUi: TopPannelUi

    chipPointer: ChipPointer
    fakeRngScore: FakeRngScore
    board: Board
    betManager: BetManager

    constructor() {
        super({ key: 'MainScene' })
    }

    create() {
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'bg')

        this.topPannelUi = new TopPannelUi(this, 0, 40)
        this.add.existing(this.topPannelUi)
        this.bottomPannelUi = new BottomPannelUi(this, 0, 960)
        this.add.existing(this.bottomPannelUi)


        this.fakeRngScore = new FakeRngScore(this, 200, 200, {font: "74px Arial Black", color: "#fff"})
        this.add.existing(this.fakeRngScore)

        this.board = new Board(this, 1250, 600)
        this.add.existing(this.board)

        this.chipPointer = new ChipPointer(this)
        this.add.existing(this.chipPointer)
        
        this.betManager = new BetManager(this)

        let ed = EventDispatcher.getInstance()
        ed.on('chipChanged', (chipValue: number) => {
            this.chipPointer.update(chipValue)
        }, this)
    }

    update() {
        // check if the mouse is on board
        if(this.board.mouseOnBoard){
            let xPointer = this.game.input.pointers[0].x
            let yPointer = this.game.input.pointers[0].y
            this.board.update(xPointer, yPointer)
        }
    }

    spinRoulette(){
        this.fakeRngScore.generateResult()
    }
}
