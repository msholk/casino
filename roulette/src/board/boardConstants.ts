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
    Zero = 0,
    Straight = 1,
    HorizontalSplit = 2,
    FullColumn = 3,
    Corner = 4,
    FiveNumbers = 5,
    DoubleColumn = 6,
    Third = 7,
    FullRow = 8,
    FirstHalf = 9, // divided into first half & second half for the backend
    SecondHalf = 10,
    Color = 11,
    OddsOrEven = 12,
    VerticalSplit = 13,
    None = 14
}

export type betInfo = {
    y: number,
    x: number,
    type: betTypes,
}

