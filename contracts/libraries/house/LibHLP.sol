// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/libraries/AppStorage.sol";
import "contracts/libraries/UniswapV2.sol";
import "hardhat/console.sol";

library LibHLP {
    uint256 constant PLAYER_LOOSE_COMISSION = 26; //0.0026 0.26%

    function LockMaxWinAmount(HouseStorage storage hs, uint256 totalBetSumP0)
        internal
    {
        uint256 totalBetSumP2 = totalBetSumP0 * 1e2;
        require(
            hs.houseBalancePr2 >= totalBetSumP2 * 36,
            "House balance is insufficient"
        );

        hs.houseBalancePr2 -= totalBetSumP2 * 36;
        hs.houseLockedBalanceP2 += totalBetSumP2 * 36;
    }

    function UnlockBalances(HouseStorage storage hs, uint256 totalBetSumP0)
        internal
    {
        uint256 totalBetSumP2 = totalBetSumP0 * 1e2;
        hs.houseBalancePr2 += totalBetSumP2 * 36;
        hs.houseLockedBalanceP2 -= totalBetSumP2 * 36;
    }

    function transferFromHouse2Cachier(AppStorage storage s, uint256 payDiffP0)
        internal
    {
        //Amount goform  HLP goes to Cachier
        //We take PLAYER_WINS_COMISSION
        uint256 PLAYER_WINS_COMISSION = 3; //0.0003 0.03%
        uint256 ourComissionP18 = (PLAYER_WINS_COMISSION * payDiffP0 * 1e18) /
            1e4; //add precision

        s.platformBalancePr18 += ourComissionP18;
        uint256 removeFromHouseP2 = (payDiffP0 * 1e2 + ourComissionP18 / 1e14);
        // console.log("ourComissionP18", ourComissionP18);
        // console.log("ourComissionP18/14", ourComissionP18 / 1e14);
        // console.log("removeFromHouseP2", removeFromHouseP2);
        // console.log(s.hs.houseBalancePr2, removeFromHouseP2);
        s.hs.houseBalancePr2 -= removeFromHouseP2;
        // console.log(
        //     "ourComissionP18",
        //     ourComissionP18,
        //     payDiffP0,
        //     PLAYER_WINS_COMISSION
        // );
        // console.log(s.hs.houseBalancePr2, removeFromHouseP2);
    }

    function transferFromCachierToHouse(AppStorage storage s, uint256 payDiffP0)
        internal
    {
        //Amount goform Cachier goes to HLP
        //We take PLAYER_LOOSE_COMISSION
        payDiffP0 = payDiffP0 * 1e18; //add precision
        uint256 ourComission = (PLAYER_LOOSE_COMISSION * payDiffP0) / 1e4; //add precision
        s.platformBalancePr18 += ourComission;
        payDiffP0 -= ourComission;
        s.hs.houseBalancePr2 += payDiffP0; //transfer from Cahsier to HLP

        // DAI.approve(address(HLP),payDiff);
        // HLP.depositDAI(address(this),payDiff);
    }
}
