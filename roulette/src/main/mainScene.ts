import Board from '../board/board'
import ChipPointer from '../chips/chipPointer'
import BetManager from '../bets/betManager'

import EventDispatcher from '../utils/eventDispatcher'

import BottomPannelUi from '../ui/bottomPannel'
import Cashier from '../cashier/cashier'
import TotalBet from '../bets/totalBet'
import PlayerBalance from '../cashier/playerBalance'
import MessageFlasher from '../utils/flashMessage'
import Roulette from '../roulette/roulette'


export default class MainScene extends Phaser.Scene {
    bottomPannelUi: BottomPannelUi

    chipPointer: ChipPointer
    board: Board
    betManager: BetManager
    cashier: Cashier
    totalBet: TotalBet
    playerBalance: PlayerBalance
    messageFlasher: MessageFlasher
    roulette: Roulette

    constructor() {
        super({ key: 'MainScene' })
    }

    create() {
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'bg')
        // this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'rouletteShadow')

        this.bottomPannelUi = new BottomPannelUi(this, 0, 960)
        this.add.existing(this.bottomPannelUi)

        this.board = new Board(this, 1245, 600)
        this.add.existing(this.board)

        this.chipPointer = new ChipPointer(this)
        this.add.existing(this.chipPointer)

        this.totalBet = new TotalBet(this, 700, 240)
        this.add.existing(this.totalBet).createFromCache('totalBet')

        this.playerBalance = new PlayerBalance(this, 1240, 240)
        this.add.existing(this.playerBalance).createFromCache('playerBalance')

        this.cashier = new Cashier(this, 800, 320)
        this.add.existing(this.cashier).createFromCache('cashier')
        this.cashier.addListener('click') // listen to clicks since adding this on the constructor doesn't work

        // add roulette image
        this.roulette = new Roulette(this, 300, 500)
        this.add.existing(this.roulette)

        this.messageFlasher = new MessageFlasher(this)
        this.betManager = new BetManager(this)


        let ed = EventDispatcher.getInstance()
        ed.on('chipChanged', (chipValue: number) => {
            this.chipPointer.update(chipValue)
        }, this)
    }

    update() {
        // check if the mouse is on board
        if (this.board.mouseOnBoard) {
            let xPointer = this.game.input.pointers[0].x
            let yPointer = this.game.input.pointers[0].y
            this.board.update(xPointer, yPointer)
        }


    }
}
