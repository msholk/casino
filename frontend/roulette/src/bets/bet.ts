import EventDispatcher from "../events/eventDispatcher"

export default class Bet {
    chipValue: number
    numbers: Array<number> // all the numbers the bet references

    constructor(chipValue: number, numbers: Array<number>) {
        this.chipValue = chipValue
        this.numbers = numbers

        let ed = EventDispatcher.getInstance()
        ed.emit('betPlaced', this.chipValue)

        // CALL BLOKCHAIN BET
    }
    
}
