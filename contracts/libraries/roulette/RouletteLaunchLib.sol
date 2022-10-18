// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/libraries/roulette/BetPointPrm.sol";
import "contracts/libraries/roulette/RouletCroupierStorage.sol";
import "contracts/libraries/roulette/LibRulette.sol";

library RouletteLaunchLib {
    function checkRouletteIsUnlockedForPlayer(
        RouletCroupierStorage storage rcs,
        BetPointPrm[] calldata betPoints
    ) internal view {
        require(
            betPoints.length > 0 && betPoints.length <= 10,
            "Too many bets"
        );
        require(
            rcs.playersLaunchedRoulette[msg.sender].requestId == 0,
            "Roulette is launched. No more bets."
        );
    }

    function storeBetPoints(
        RouletteLaunch storage rl,
        BetPointPrm[] calldata betPoints
    ) internal {
        for (uint256 index = 0; index < betPoints.length; index++) {
            BetPointPrm calldata p = betPoints[index];
            BetPoint memory bp;
            bp.amount = p.amount;
            bp.betDet = p.betDet;
            bp.betType = p.betType;
            rl.betPoints.push(bp);
        }
    }

    function getTotalBetSum(BetPointPrm[] calldata betPoints)
        internal
        pure
        returns (uint256 totalBetSum)
    {
        for (uint256 index = 0; index < betPoints.length; index++) {
            BetPointPrm calldata p = betPoints[index];
            totalBetSum += p.amount;
            //check bet param is correct
            LibRulette.getWinFactor(p.betType, p.betDet, p.betDet);
        }
    }
}
