import EventDispatcher from "../events/eventDispatcher"

export default class Bet {
    chipValue: number
    detail: number
    betType: number

    constructor(chipValue: number, detail: number, betType: number) {
        this.chipValue = chipValue
        this.detail = detail
        this.betType = betType

        let ed = EventDispatcher.getInstance()
        ed.emit('betPlaced', this.chipValue)
    }

    getDictionaryRepresentation() {
        return {
            amount: this.chipValue,
            betType: this.betType,
            betDet: this.detail,
        }
    }

}
