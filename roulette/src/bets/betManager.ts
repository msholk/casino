import { betInfo, } from "../board/boardConstants";
import MainScene from "../main/mainScene";
import Bet from "./bet";
import { NO_CHIP } from "../chips/chipConstants";
import BoardBet from "../board/boardBet";
import { getBetDetail } from "../lib/betParser";
import EventDispatcher from "../utils/eventDispatcher";
import { placeBet } from "../lib/blockchain";
import MessageFlasher from "../utils/flashMessage";

export default class BetManager {
    scene: MainScene
    currentBets: Array<Bet>
    boardBets: Array<BoardBet>

    constructor(scene: MainScene) {
        this.scene = scene
        this.currentBets = []
        this.boardBets = []

        let ed = EventDispatcher.getInstance()
        ed.on('betConfirmed', async () => {
            if (this.currentBets.length) {
                console.log('Apuestas mandadas: ', this.formatBets())
                await placeBet(this.formatBets())
            }
            else {
                scene.messageFlasher.flashMessage(580, 100, 'No bets yet!', undefined, scene.messageFlasher.colors.WARNING)
                console.log('No bets yet!')
                return
            }
        })

        ed.on('rouletteStopped', () => {
            this.cleanBets()
        })
    }

    placeBet(bet: betInfo) {
        let chipValue = this.scene.bottomPannelUi.chipContainer.currentValue

        if (chipValue == NO_CHIP) {
            console.log('No chip selected')
            return
        }
        if (chipValue + this.scene.totalBet.totalBetAmmount > this.scene.playerBalance.playerBalance) {
            this.scene.messageFlasher.flashMessage(440, 100, 'Insufficient funds!', undefined, this.scene.messageFlasher.colors.ERROR)
            console.log('Not enough balance')
            return
        }
        // add the chip to the board
        this.boardBets.push(new BoardBet(this.scene, bet))

        let detail = getBetDetail(bet)
        this.currentBets.push(new Bet(chipValue, detail, bet.type))

    }


    // parse the bets to a suitable format for the contract method
    formatBets() {
        let ret: Array<any> = []

        for (let bet of this.currentBets) {
            ret.push(bet.getDictionaryRepresentation())
        }

        return ret
    }

    cleanBets() {
        for (let boardBet of this.boardBets) {
            boardBet.destroy()
        }
        this.boardBets = []
        this.currentBets = []

        let ed = EventDispatcher.getInstance()
        ed.emit('betFinished')
    }
}
