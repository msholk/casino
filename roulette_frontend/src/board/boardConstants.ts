// the board image is on perspective so the cell heigths is not a constant
export const BOARD_HEIGHTS = [48, 93, 98, 103, 58]
// including borders
export const CELL_WIDTH = 90
export const NUM_COLS = 14
export const NUM_ROWS = 5

export const X_INITIAL_OFFSET = 20
export const Y_INITIAL_OFFSET = 10

export const HOVER_ALPHA = 0.5

// whether the user clicked inside a cell or around a border
export enum USER_INPUT_TYPE {
    border,
    cell
}

// all possible bet types
export enum betTypes {
    Straight,
    VerticalSplit,
    HorizontalSplit,
    Corner,
    Zero,
    FullRow,
    FirstHalf, // divided into first half & second half for the backend
    SecondHalf,
    OddsOrEven,
    Third,
    Color,
    None
}

export type betInfo = {
    y: number,
    x: number,
    type: betTypes,
}

