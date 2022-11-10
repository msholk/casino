// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/storage/AppStorage.sol";
// import "contracts/libraries/UniswapV2.sol";
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
    //Amount goes from  House to Cashier
    s.hs.houseBalance -= removeFromHouse;
  }

  function transferFromCashierToHouse(AppStorage storage s, uint256 payDiffEth)
    internal
  {
    if (s.hs.houseBalance >= s.hs.revenueBalance) {
      //Get 30% from benefit only
      uint256 add2House = (playerBetsAmount * 70) / 100;
      s.hs.houseBalance += add2House;
      s.platformBalance += (payDiffEth - add2House);
      s.hs.revenueBalance = s.hs.houseBalance;
    } else {
      s.hs.houseBalance += payDiffEth;
    }
  }
}
