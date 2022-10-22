// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/libraries/AppStorage.sol";
import "contracts/libraries/UniswapV2.sol";
import "hardhat/console.sol";

library LibHLP {
    function LockAmountFromHouse(
        HouseStorage storage hs,
        uint256 lockHouseAmountP0
    ) internal {
        uint256 lockHouseAmountP6 = lockHouseAmountP0 * 1e6;
        require(
            hs.houseBalanceP6 >= lockHouseAmountP6,
            "House balance is insufficient"
        );

        hs.houseBalanceP6 -= lockHouseAmountP6;
        hs.houseLockedBalanceP2 += lockHouseAmountP0 * 1e2;
    }

    function UnlockBalances(
        HouseStorage storage hs,
        uint256 lockedHouseAmountP0
    ) internal {
        uint256 lockedHouseAmountP6 = lockedHouseAmountP0 * 1e6;
        hs.houseBalanceP6 += lockedHouseAmountP6;
        hs.houseLockedBalanceP2 -= lockedHouseAmountP0 * 1e2;
    }

    function transferFromHouse2Cashier(AppStorage storage s, uint256 payDiffP0)
        internal
    {
        //Amount goform  HLP goes to Cashier
        //We take PLAYER_WINS_COMISSION
        uint256 PLAYER_WINS_COMISSION = 3; //0.0003 0.03%
        uint256 ourComissionP18 = (PLAYER_WINS_COMISSION * payDiffP0 * 1e18) /
            1e4; //add precision

        s.platformBalancePr18 += ourComissionP18;
        uint256 removeFromHouseP6 = (payDiffP0 * 1e6 + ourComissionP18 / 1e12);
        // console.log("ourComissionP18", ourComissionP18);
        // console.log("ourComissionP18/14", ourComissionP18 / 1e14);
        // console.log("removeFromHouseP6", removeFromHouseP6);
        // console.log(s.hs.houseBalanceP6, removeFromHouseP6);
        s.hs.houseBalanceP6 -= removeFromHouseP6;
        // console.log(
        //     "ourComissionP18",
        //     ourComissionP18,
        //     payDiffP0,
        //     PLAYER_WINS_COMISSION
        // );
        // console.log(s.hs.houseBalanceP6, removeFromHouseP6);
    }

    function transferFromCashierToHouse(AppStorage storage s, uint256 payDiffP0)
        internal
    {
        uint256 PLAYER_LOSE_COMISSION = 26; //0.0026 0.26%
        //Amount goform Cashier goes to HLP
        //We take PLAYER_LOSE_COMISSION
        uint256 payDiffP18 = payDiffP0 * 1e18; //add precision
        uint256 ourComissionP18 = (PLAYER_LOSE_COMISSION * payDiffP18) / 1e4; //add precision
        s.platformBalancePr18 += ourComissionP18;
        uint256 payDiffP6 = (payDiffP18 - ourComissionP18) / 1e12;
        s.hs.houseBalanceP6 += payDiffP6; //transfer from Cahsier to HLP

        //console.log(payDiffP0, payDiffP18, ourComissionP18, payDiffP6);
    }
}
