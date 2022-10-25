// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

struct CashierStorage {
  mapping(address => uint256) playersBalancesPr2;
  mapping(address => uint256) playersLockedBalances;
}
