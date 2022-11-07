import { betInfo, } from "../board/boardConstants";
import MainScene from "../main/mainScene";
import Bet from "./bet";
import { NO_CHIP } from "../chips/chipConstants";
import BoardBet from "../board/boardBet";
import { getBettingNumbers, getBetDetail } from "../lib/betParser";

export default class BetManager {
    scene: MainScene
    currentBets: Array<Bet>

    constructor(scene: MainScene) {
        this.scene = scene
        this.currentBets = []
    }

    placeBet(bet: betInfo) {
        let numbers: Array<number> = []

        if (this.scene.bottomPannelUi.chipContainer.currentValue == NO_CHIP) return

        numbers = getBettingNumbers(bet)

        let detail = getBetDetail(bet)

        // add the chip to the board
        // TODO: make this animated and somewhat decent looking
        new BoardBet(this.scene, bet)

        this.currentBets.push(new Bet(this.scene.bottomPannelUi.chipContainer.currentValue, numbers))
    }
}
