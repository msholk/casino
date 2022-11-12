import { betInfo, } from "../board/boardConstants";
import MainScene from "../main/mainScene";
import Bet from "./bet";
import { NO_CHIP } from "../chips/chipConstants";
import BoardBet from "../board/boardBet";
import { getBettingNumbers, getBetDetail } from "../lib/betParser";
import EventDispatcher from "../events/eventDispatcher";
import { placeBet } from "../lib/blockchain";

export default class BetManager {
    scene: MainScene
    currentBets: Array<Bet>

    constructor(scene: MainScene) {
        this.scene = scene
        this.currentBets = []

        let ed = EventDispatcher.getInstance()
        ed.on('betConfirmed', async () => {
            if(this.currentBets.length){
                await placeBet(this.formatBets())
            } 
            else{
                // TODO flash message with erro
                console.log('No bets yet!')
                return
            }
        })
    }

    placeBet(bet: betInfo) {
        let chipValue = this.scene.bottomPannelUi.chipContainer.currentValue

        if (chipValue == NO_CHIP) {
            // TODO: flash message with error
            console.log('No chip selected')
            return
        }
        if (chipValue + this.scene.totalBet.totalBetAmmount > this.scene.playerBalance.playerBalance) {
            // TODO: flash message with error
            console.log('Not enough balance')
            return
        }

        let detail = getBetDetail(bet)

        // add the chip to the board
        // TODO: make this animated and somewhat decent looking
        new BoardBet(this.scene, bet)

        this.currentBets.push(new Bet(chipValue, detail, bet.type))
    }


    // parse the bets to a suitable format for the contract method
    formatBets(){
        let ret: Array<any> = []

        for(let bet of this.currentBets){
            ret.push(bet.getDictionaryRepresentation())
        }

        return ret
    }
}
