// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "contracts/storage/CashierStorage.sol";

library CashierStorageLib {
  function LockBetAmount(
    CashierStorage storage cs,
    uint256 totalBetSum,
    address playerAddress
  ) internal {
    uint256 playerBalance = cs.playersBalances[playerAddress];
    require(playerBalance >= totalBetSum, "Balance is insufficient");
    cs.playersLockedBalances[playerAddress] += totalBetSum;

    cs.playersBalances[playerAddress] -= totalBetSum;
  }

  function PlayerUnlockAll(CashierStorage storage cs, address playerAddress)
    internal
  {
    if (cs.playersLockedBalances[playerAddress] > 0) {
      cs.playersBalances[playerAddress] += cs.playersLockedBalances[
        playerAddress
      ];
      cs.playersLockedBalances[playerAddress] = 0;
    }
  }

  function UnlockBetAmount(
    CashierStorage storage cs,
    uint256 totalBetSum,
    address playerAddress
  ) internal {
    cs.playersLockedBalances[playerAddress] -= totalBetSum;
  }
}
