// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

// import "hardhat/console.sol";

// From Open Zeppelin contracts: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Strings.sol

/**
 * @dev String operations.
 */
library LibRulette {
    function getWinFactor(
        uint8 betType,
        uint8 betDet,
        uint8 winNum
    ) public pure returns (uint8) {
        require(winNum >= 1 && winNum <= 38, "Wrong winnum");
        require(betType >= 1 && betType <= 12, "Wrong betType");
        if (betType == 1) {
            return uint8(bet1WinFactor(betDet, winNum));
        }
        if (betType == 2) {
            return uint8(bet2WinFactor(betDet, winNum));
        }
        if (betType == 3) {
            return uint8(bet3WinFactor(betDet, winNum));
        }
        if (betType == 4) {
            return uint8(bet4WinFactor(betDet, winNum));
        }
        if (betType == 5) {
            return uint8(bet5WinFactor(winNum));
        }
        if (betType == 6) {
            return uint8(bet6WinFactor(betDet, winNum));
        }
        if (betType == 7) {
            return uint8(bet7WinFactor(betDet, winNum));
        }
        if (betType == 8) {
            return uint8(bet8WinFactor(betDet, winNum));
        }
        if (betType == 9) {
            return uint8(bet9WinFactor(winNum));
        }
        if (betType == 10) {
            return uint8(bet10WinFactor(winNum));
        }
        if (betType == 11) {
            return uint8(bet11WinFactor(betDet, winNum));
        }
        if (betType == 12) {
            return uint8(bet12WinFactor(betDet, winNum));
        }
        return 0;
    }

    /// @notice Single number bet pays 35 to 1. Also called “straight up.” x36
    /// @dev 37-zero; 38- double zero
    /// @param betDet - bets falls on number 1-38 when 37-zero; 38- double zero
    /// @return Win factor
    function bet1WinFactor(uint256 betDet, uint256 winNum)
        private
        pure
        returns (uint256)
    {
        require(betDet >= 1 && betDet <= 38, "Wrong bet detail for bet type 1");
        uint256 winFactor = 36;
        if (betDet == winNum) {
            return winFactor;
        }
        return 0;
    }

    /// @notice Double number bet pays 17 to 1. Also called a “split.”  x18
    /// @dev 37-zero; 38- double zero
    /// @param betDet - falls in [1,33]
    /// @return Win factor
    /*
     *       1       2       3       4       5       6       7       8       9       10
     *      1,4     2,5     3,6     4,7     5,8     6,9     7,10    8,11    9,12    10,13
     * +10  11,14   12,15   13,16   14,17   15,18   16,19   17,20   18,21   19,22   20,23
     * +20  21,24   22,25   23,26   24,27   25,28   26,29   27,30   28,31   29,32   30,33
     * +30  31,34   32,35   33,36
     */
    function bet2WinFactor(uint256 betDet, uint256 winNum)
        private
        pure
        returns (uint256)
    {
        require(
            betDet >= 1 && betDet <= 33,
            "Wrong bet detail for Double number bet"
        );
        uint256 winFactor = 18;
        if (betDet == winNum) {
            return winFactor;
        }
        if (betDet + 3 == winNum) {
            return winFactor;
        }
        return 0;
    }

    /// @notice Three number bet pays 11 to 1. Also called a “street.” x12
    /// @dev
    /// @param betDet - falls in [1,12] specifies the row
    /// @return Win factor
    function bet3WinFactor(uint256 betDet, uint256 winNum)
        private
        pure
        returns (uint256)
    {
        require(
            betDet >= 1 && betDet <= 12,
            "Wrong bet detail for Three number bet"
        );
        uint256 winFactor = 12;
        if (betDet * 3 == winNum) {
            return winFactor;
        }
        if (betDet * 3 - 1 == winNum) {
            return winFactor;
        }
        if (betDet * 3 - 2 == winNum) {
            return winFactor;
        }

        return 0;
    }

    /// @notice Four number bet pays 8 to 1. Also called a “corner bet.” X 9
    /// @dev
    /// @param betDet - falls in [1,22]
    /// @return Win factor
    /*
     *            1          2           3           4          5            6           7           8           9          10
     *         1,2,4,5    2,3,5,6     4,5,7,8     5,6,8,9    7,8,10,11   8,9,11,12  10,11,13,14 11,12,14,15 13,14,16,17 14,15,17,18
     * +10  16,17,19,20 17,18,20,21 19,20,22,23 20,21,23,24 22,23,25,26 23,24,26,27 25,26,28,29 26,27,29,30 28,29,31,32 29,30,32,33
     * +20  31,32,34,35 32,33,35,36
     */
    function bet4WinFactor(uint256 betDet, uint256 winNum)
        private
        pure
        returns (uint256)
    {
        require(
            betDet >= 1 && betDet <= 22,
            "Wrong bet detail for Four number bet"
        );
        uint8[23] memory firstNums = [
            0,
            1,
            2,
            4,
            5,
            7,
            8,
            10,
            11,
            13,
            14,
            16,
            17,
            19,
            20,
            22,
            23,
            25,
            26,
            28,
            29,
            31,
            32
        ];
        uint256 firstNum = firstNums[betDet];
        uint256 winFactor = 9;
        if (firstNum == winNum) {
            return winFactor;
        }
        if (firstNum + 1 == winNum) {
            return winFactor;
        }
        if (firstNum + 3 == winNum) {
            return winFactor;
        }
        if (firstNum + 4 == winNum) {
            return winFactor;
        }

        return 0;
    }

    /// @notice Five number bet pays 6 to 1. Only one specific bet which includes the following numbers: 0-00-1-2-3. X 7
    /// @dev 37-zero, 38-double zero
    /// @param
    /// @return Win factor
    function bet5WinFactor(uint256 winNum) private pure returns (uint256) {
        uint256 winFactor = 7;
        if (winNum <= 3) {
            return winFactor;
        }
        if (winNum >= 37 && winNum <= 38) {
            return winFactor;
        }
        return 0;
    }

    /// @notice Six number bets pays 5 to 1. Example: 7, 8, 9, 10, 11, 12. Also called a “line.” X6
    /// @dev
    /// @param betDet - falls in [1,11]
    /// @return Win factor
    /*
     *         1      2       3        4        5        6        7        8        9        10       11
     *       1,2,3  4,5,6   7,8,9   10,11,12 13,14,15 16,17,18 19,20,21 22,23,24 25,26,27 28,29,30 31,32,33
     *       4,5,6  7,8,9  10,11,12 13,14,15 16,17,18 19,20,21 22,23,24 25,26,27 28,29,30 31,32,33 34,35,36
     */
    function bet6WinFactor(uint256 betDet, uint256 winNum)
        private
        pure
        returns (uint256)
    {
        require(
            betDet >= 1 && betDet <= 11,
            "Wrong bet detail for Six number bets"
        );

        uint256 winFactor = 6;
        uint256 bet3 = betDet * 3;

        uint256[6] memory checkNums = [
            bet3,
            bet3 - 1,
            bet3 - 2,
            bet3 + 1,
            bet3 + 2,
            bet3 + 3
        ];

        for (uint256 index = 0; index < 6; index++) {
            if (checkNums[index] == winNum) {
                return winFactor;
            }
        }

        return 0;
    }

    /// @notice Twelve numbers or dozens (first, second, third dozen) pays 2 to 1. X 3
    /// @dev
    /// @param betDet - falls in [1,3]
    /// @return Win factor
    /*
     *         1      2       3
     *       1-12   13-24   25-36
     */
    function bet7WinFactor(uint256 betDet, uint256 winNum)
        private
        pure
        returns (uint256)
    {
        require(betDet >= 1 && betDet <= 3, "Wrong bet detail for dozens bet ");

        uint256 winFactor = 3;

        if (betDet == 1 && winNum >= 1 && winNum <= 12) {
            return winFactor;
        }
        if (betDet == 2 && winNum >= 13 && winNum <= 24) {
            return winFactor;
        }
        if (betDet == 3 && winNum >= 25 && winNum <= 36) {
            return winFactor;
        }

        return 0;
    }

    /// @notice Column bet (12 numbers in a row) pays 2 to 1. X 3
    /// @dev
    /// @param betDet - falls in [1,3]
    /// @return Win factor
    /*
     *  1-1,4,7,10,13,16,19,22,25,28,31,34
     *  2-2,5,8,11,14,17,20,23,26,29,32,35
     *  3-3,6,9,12,15,18,21,24,27,30,33,36
     */
    function bet8WinFactor(uint256 betDet, uint256 winNum)
        private
        pure
        returns (uint256)
    {
        require(betDet >= 1 && betDet <= 3, "Wrong bet detail for Column bet");

        uint256 winFactor = 3;
        uint8[12] memory checkNums;
        if (betDet == 1) {
            checkNums = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
        } else if (betDet == 2) {
            checkNums = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
        } else if (betDet == 3) {
            checkNums = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
        }
        for (uint256 index = 0; index < 6; index++) {
            if (checkNums[index] == winNum) {
                return winFactor;
            }
        }
        return 0;
    }

    /// @notice 18 numbers (1-18) pays even money. X 2
    /// @dev
    /// @return Win factor
    function bet9WinFactor(uint256 winNum) private pure returns (uint256) {
        uint256 winFactor = 2;
        if (winNum >= 1 && winNum <= 18) {
            return winFactor;
        }
        return 0;
    }

    /// @notice 18 numbers (19-36) pays even money. X 2
    /// @dev
    /// @return Win factor
    function bet10WinFactor(uint256 winNum) private pure returns (uint256) {
        uint256 winFactor = 2;
        if (winNum >= 19 && winNum <= 36) {
            return winFactor;
        }
        return 0;
    }

    /// @notice Red or black pays even money. X 2
    /// @dev
    /// @return Win factor
    /*
     *  1-red:   1,3,5,7,9,12,14,16,18,19,21,23 25,27,30,32,34,36
     *  2-black: 2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35
     */
    function bet11WinFactor(uint256 betDet, uint256 winNum)
        private
        pure
        returns (uint256)
    {
        require(
            betDet >= 1 && betDet <= 2,
            "Wrong bet detail for bet Red or Black"
        );
        uint256 winFactor = 2;
        uint8[18] memory checkNums;
        if (betDet == 1) {
            checkNums = [
                1,
                3,
                5,
                7,
                9,
                12,
                14,
                16,
                18,
                19,
                21,
                23,
                25,
                27,
                30,
                32,
                34,
                36
            ];
        } else if (betDet == 2) {
            checkNums = [
                2,
                4,
                6,
                8,
                10,
                11,
                13,
                15,
                17,
                20,
                22,
                24,
                26,
                28,
                29,
                31,
                33,
                35
            ];
        }
        for (uint256 index = 0; index < 6; index++) {
            if (checkNums[index] == winNum) {
                return winFactor;
            }
        }
        return 0;
    }

    /// @notice Odd or even bets pay even money. X 2
    /// @dev
    /// @return Win factor
    /*
     *  1-even:2,4,6,8,   10,12,14,16,18,20,22,24,26,28,30,32,34,36
     *  2-odd: 1,3,5,7,9, 11,13,15,17,19,21,23,25,27,29,31,33,35
     */
    function bet12WinFactor(uint256 betDet, uint256 winNum)
        private
        pure
        returns (uint256)
    {
        require(
            betDet >= 1 && betDet <= 2,
            "Wrong bet detail for bet Red or Black"
        );
        uint256 winFactor = 2;

        if (betDet == 1) {
            if (winNum % 2 == 0) {
                return winFactor;
            }
            return 0;
        } else if (betDet == 2) {
            if (winNum % 2 == 0) {
                return 0;
            }
            return winFactor;
        }

        return 0;
    }
}
