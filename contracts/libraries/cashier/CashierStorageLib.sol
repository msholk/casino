// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./CashierStorage.sol";

library CashierStorageLib {
    function LockBetAmount(
        CashierStorage storage cs,
        uint256 totalBetSumP0,
        address playerAddress
    ) internal {
        uint256 totalBetSumP2 = totalBetSumP0 * 1e2;
        uint256 playerBalanceP2 = cs.playersBalancesPr2[playerAddress];
        require(playerBalanceP2 >= totalBetSumP2, "Balance is insufficient");
        cs.playersLockedBalancesP2[playerAddress] += totalBetSumP2;

        cs.playersBalancesPr2[playerAddress] -= totalBetSumP2;
    }

    function UnlockBetAmount(
        CashierStorage storage cs,
        uint256 totalBetSumP0,
        address playerAddress
    ) internal {
        cs.playersLockedBalancesP2[playerAddress] -= totalBetSumP0 * 1e2;
    }
}
