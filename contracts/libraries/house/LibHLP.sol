// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/libraries/AppStorage.sol";
import "contracts/libraries/UniswapV2.sol";
import "hardhat/console.sol";

library LibHLP {
  function LockAmountFromHouse(HouseStorage storage hs, uint256 lockHouseAmount)
    internal
  {
    uint256 lockHouseAmount = lockHouseAmount * 1e6;
    require(
      hs.houseBalance >= lockHouseAmount,
      "House balance is insufficient"
    );

    hs.houseBalance -= lockHouseAmount;
    hs.houseLockedBalance += lockHouseAmount * 1e2;
  }

  function UnlockBalances(HouseStorage storage hs, uint256 lockedHouseAmount)
    internal
  {
    uint256 lockedHouseAmount = lockedHouseAmount * 1e6;
    hs.houseBalance += lockedHouseAmount;
    hs.houseLockedBalance -= lockedHouseAmount * 1e2;
  }

  function transferFromHouse2Cashier(AppStorage storage s, uint256 payDiff)
    internal
  {
    //Amount goform  HLP goes to Cashier
    //We take PLAYER_WINS_COMISSION
    uint256 PLAYER_WINS_COMISSION = 3; //0.0003 0.03%
    uint256 ourComission = (PLAYER_WINS_COMISSION * payDiff * 1e18) / 1e4; //add precision

    s.platformBalance += ourComission;
    uint256 removeFromHouse = (payDiff * 1e6 + ourComission / 1e12);
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

  function transferFromCashierToHouse(AppStorage storage s, uint256 payDiff)
    internal
  {
    // uint256 PLAYER_LOSE_COMISSION = 26; //0.0026 0.26%
    // //Amount goform Cashier goes to HLP
    // //We take PLAYER_LOSE_COMISSION
    // uint256 payDiff = payDiff * 1e18; //add precision
    // uint256 ourComission = (PLAYER_LOSE_COMISSION * payDiff) / 1e4; //add precision
    // s.platformBalance += ourComission;
    // uint256 payDiff = (payDiff - ourComission) / 1e12;
    // s.hs.houseBalance += payDiff; //transfer from Cahsier to HLP
    //console.log(payDiff, payDiff, ourComission, payDiff);
  }
}
