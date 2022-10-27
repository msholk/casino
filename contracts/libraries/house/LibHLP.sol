// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/libraries/AppStorage.sol";
import "contracts/libraries/UniswapV2.sol";
import "hardhat/console.sol";

library LibHLP {
  function HouseUnlockAll(HouseStorage storage hs) internal {
    if (hs.houseLockedBalance > 0) {
      hs.houseBalance += hs.houseLockedBalance;
      hs.houseLockedBalance = 0;
    }
  }

  function LockAmountFromHouse(
    HouseStorage storage hs,
    uint256 lockHouseAmountInEth
  ) internal {
    require(
      hs.houseBalance >= lockHouseAmountInEth,
      "House balance is insufficient"
    );

    hs.houseBalance -= lockHouseAmountInEth;
    hs.houseLockedBalance += lockHouseAmountInEth;
  }

  function UnlockBalances(HouseStorage storage hs, uint256 lockedHouseAmountEth)
    internal
  {
    hs.houseBalance += lockedHouseAmountEth;
    hs.houseLockedBalance -= lockedHouseAmountEth;
  }

  function transferFromHouse2Cashier(AppStorage storage s, uint256 payDiffEth)
    internal
  {
    //Amount goform  HLP goes to Cashier
    //We take PLAYER_WINS_COMISSION
    uint256 PLAYER_WINS_COMISSION = 3; //0.0003 0.03%
    uint256 ourComission = (PLAYER_WINS_COMISSION * payDiffEth) / 1e4; //add precision

    s.platformBalance += ourComission;
    uint256 removeFromHouse = (payDiffEth + ourComission);
    // console.log("ourComission", ourComission);
    // console.log("ourComission/14", ourComission / 1e14);
    // console.log("removeFromHouse", removeFromHouse);
    // console.log(s.hs.houseBalance, removeFromHouse);
    s.hs.houseBalance -= removeFromHouse;
    // console.log(
    //     "ourComission",
    //     ourComission,
    //     payDiff,
    //     PLAYER_WINS_COMISSION
    // );
    // console.log(s.hs.houseBalance, removeFromHouse);
  }

  function transferFromCashierToHouse(AppStorage storage s, uint256 payDiffEth)
    internal
  {
    uint256 PLAYER_LOSE_COMISSION = 26; //0.0026 0.26%
    //Amount from Cashier goes to HLP
    //We take PLAYER_LOSE_COMISSION
    uint256 ourComission = (PLAYER_LOSE_COMISSION * payDiffEth) / 1e4; //add precision
    s.platformBalance += ourComission;

    s.hs.houseBalance += payDiffEth - ourComission; //transfer from Cahsier to HLP
    // console.log(payDiff, payDiff, ourComission, payDiff);
  }
}
