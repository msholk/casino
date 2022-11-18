import {
    BOARD_HEIGHTS, CELL_WIDTH,
    NUM_COLS, NUM_ROWS,
    USER_INPUT_TYPE,
    X_INITIAL_OFFSET,
    Y_INITIAL_OFFSET,
    betTypes,
    betInfo,
} from "../board/boardConstants"
import board from "../board/board.json"


// the x/y info needed to index the board 
type axisBetType = {
    type: number,
    pos: number,
}

// parse the user input to get the info necessary for the backend
// to understand this function, its better to check the roulette_params.pdf
export function getBetDetail(bet: betInfo) {

    let ret: number
    // return an id for out bet depending on the bet
    switch (bet.type) {

        case betTypes.Straight:
            ret = board.board[bet.y][bet.x]
            break

        case betTypes.HorizontalSplit:
            ret = board.board[bet.y][bet.x] - 3
            break

        case betTypes.VerticalSplit:
            let auxVertical = (board.board[bet.y][bet.x] - 1) / 3
            ret = board.board[bet.y][bet.x] - Math.floor(auxVertical)
            break

        case betTypes.Third:
            ret = (bet.x + 1) / 4
            break

        case betTypes.FullRow:
            ret = bet.y
            break

        case betTypes.Corner:
            let auxCorner = (board.board[bet.y][bet.x] / 3 - 1)
            ret = board.board[bet.y][bet.x] - 3 - Math.floor(auxCorner)
            break

        case betTypes.Color:
            ret = bet.x / 2 - 2
            break

        case betTypes.Zero:
            ret = 37
            break

        case betTypes.SecondHalf:
        case betTypes.FirstHalf:
            ret = 0
            break

        case betTypes.OddsOrEven:
            ret = bet.x == 4 ? 1 : 2
            break

        default:
            ret = -1
    }

    console.log(ret)
    return ret
}


// get the numbers the user is betting on, this is not needed for the backend
export function getBettingNumbers(bet: betInfo) {

    // is it a special case (odds, 1-18, full row...)
    let specialCase = bet.y == 0 || bet.y == NUM_ROWS - 1 || bet.x == NUM_COLS - 1
    let numbers: Array<number> = []
    let boardValues = board.board

    // if the user clicked on a numbered cell, create a list with the numbers the user is betting on
    if (!specialCase) {
        switch (bet.type) {
            case betTypes.Straight:
                numbers = [boardValues[bet.y][bet.x]]
                break
            case betTypes.HorizontalSplit:
                numbers = boardValues[bet.y].slice(bet.x - 1, bet.x + 1)
                break
            case betTypes.VerticalSplit:
                numbers = boardValues.slice(bet.y - 1, bet.y + 1).map(i => i[bet.x])
                break
            case betTypes.Corner:
                // slice the array into the 2 by 2 square we are interested in, then flat it out
                numbers = boardValues.slice(bet.y - 1, bet.y + 1).map(i => i.slice(bet.x - 1, bet.x + 1)).flat()
                break
            case betTypes.Zero:
                numbers = [boardValues[bet.y][bet.x]]
                break
        }
    }
    // if the user clicked on a non-numbered cell, get the list from the json file
    else {
        numbers = board.ids[boardValues[bet.y][bet.x]]
    }

    return numbers
}


function getXTypeBet(x: number) {
    let counter = 0
    // number of pixels the user can click on to make a split bet
    let offset = 12
    let cellWithoutOffset = CELL_WIDTH - offset * 2

    x -= X_INITIAL_OFFSET

    while (counter < NUM_COLS) {
        // left border with right offset
        x -= (offset)
        if (x < 0) {
            return { type: USER_INPUT_TYPE.border, pos: counter }
        }

        x -= cellWithoutOffset
        if (x < 0) {
            return { type: USER_INPUT_TYPE.cell, pos: counter }
        }

        x -= offset
        if (x < 0) {
            return { type: USER_INPUT_TYPE.border, pos: counter + 1 }
        }
        counter++
    }

    // this covers the special case of the last border
    return { type: USER_INPUT_TYPE.border, pos: counter - 1 }
}


function getYTypeBet(y: number) {
    let counter = 0
    // number of pixels de user can click on to make a split bet
    let offset = 8

    y -= Y_INITIAL_OFFSET

    while (counter < NUM_ROWS) {
        // left border with right offset
        y -= (offset)
        if (y < 0) {
            return { type: USER_INPUT_TYPE.border, pos: counter }
        }

        let cellWithoutOffset = BOARD_HEIGHTS[counter] - offset * 2
        y -= cellWithoutOffset
        if (y < 0) {
            return { type: USER_INPUT_TYPE.cell, pos: counter }
        }

        y -= offset
        if (y < 0) {
            return { type: USER_INPUT_TYPE.border, pos: counter + 1 }
        }
        counter++
    }

    // this covers the special case of the last border
    return { type: USER_INPUT_TYPE.border, pos: counter - 1 }
}


// Main function to get all the type of bet the user selected based on where he clicked
export function getTypeBet(x: number, y: number) {
    let xType: axisBetType = getXTypeBet(x)
    let yType: axisBetType = getYTypeBet(y)

    let ret: betInfo = { x: xType.pos, y: yType.pos, type: betTypes.None }


    // don't do anything for the corners
    if ((xType.pos == 0 && yType.pos == 0) ||
        (xType.pos >= NUM_COLS - 1 && yType.pos == 0) ||
        (xType.pos == 0 && yType.pos >= NUM_ROWS - 1) ||
        (xType.pos >= NUM_COLS - 1 && yType.pos >= NUM_ROWS - 1)) {

        return ret
    }


    // if its the first row, user is betting thirds
    else if (yType.pos == 0) {
        // this is needed because if the pos is multiple of 4, 4/4 will be one and the rectangle will jump one square right
        if (xType.pos % 4 == 0) {
            ret.x = (Math.floor(xType.pos / 4) - 1) * 4 + 3
        } else {
            ret.x = Math.floor(xType.pos / 4) * 4 + 3
        }

        ret.type = betTypes.Third
        return ret
    }


    // if its the first column, user is betting on 0
    else if (xType.pos == 0) {
        ret.y = 2 // set the y pos so that the hover rectangle is centered
        ret.type = betTypes.Zero
        return ret
    }


    // if its the last row, user is playing odds, colors...
    else if (yType.pos >= NUM_ROWS - 1) {
        if (yType.pos == NUM_ROWS) ret.y-- // keep the pos inside the board

        // this is needed because if the pos is multiple of 2, 2/2 will be one and the rectangle will jump one square right
        if (xType.pos % 2 == 0) {
            ret.x = (Math.floor(xType.pos / 2) - 1) * 2 + 2
        } else {
            ret.x = Math.floor(xType.pos / 2) * 2 + 2
        }

        // Decide the specific case the user is betting on depending on the X position
        switch (ret.x / 2) {
            case 1:
                ret.type = betTypes.FirstHalf
                break
            case 2:
            case 5:
                ret.type = betTypes.OddsOrEven
                break
            case 3:
            case 4:
                ret.type = betTypes.Color
                break
            case 6:
                ret.type = betTypes.SecondHalf
                break
        }

        // same shape as a horizontal split
        return ret
    }


    // if its the last column, user is playing full rows
    else if (xType.pos >= NUM_COLS - 1) {
        if (xType.pos == NUM_COLS) ret.x-- // keep the pos inside the board
        ret.type = betTypes.FullRow
        return ret
    }


    // plain cell
    else if (xType.type == USER_INPUT_TYPE.cell && yType.type == USER_INPUT_TYPE.cell) {
        ret.type = betTypes.Straight
        return ret
    }


    // vertical split
    else if (xType.type == USER_INPUT_TYPE.cell && yType.type == USER_INPUT_TYPE.border) {
        if (yType.pos == 1) {
            ret.type = betTypes.Straight
        } else {
            ret.type = betTypes.VerticalSplit
        }

        return ret
    }


    // horizontal split
    else if (xType.type == USER_INPUT_TYPE.border && yType.type == USER_INPUT_TYPE.cell) {
        if (xType.pos == 1 || xType.pos == NUM_COLS - 1) {
            ret.type = betTypes.Straight
        } else {
            ret.type = betTypes.HorizontalSplit
        }

        return ret
    }


    // corner
    else if (xType.type == USER_INPUT_TYPE.border && yType.type == USER_INPUT_TYPE.border) {
        if (xType.pos == 1) {
            ret.type = betTypes.VerticalSplit
        } else {
            ret.type = betTypes.Corner
        }
        return ret
    }

    return ret
}
