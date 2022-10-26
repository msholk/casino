// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./CashierStorage.sol";

library CashierStorageLib {
  function LockBetAmount(
    CashierStorage storage cs,
    uint256 totalBetSum,
    address playerAddress
  ) internal {
    uint256 totalBetSum = totalBetSum * 1e2;
    uint256 playerBalance = cs.playersBalances[playerAddress];
    require(playerBalance >= totalBetSum, "Balance is insufficient");
    cs.playersLockedBalances[playerAddress] += totalBetSum;

    cs.playersBalances[playerAddress] -= totalBetSum;
  }

  function UnlockBetAmount(
    CashierStorage storage cs,
    uint256 totalBetSum,
    address playerAddress
  ) internal {
    cs.playersLockedBalances[playerAddress] -= totalBetSum * 1e2;
  }
}
