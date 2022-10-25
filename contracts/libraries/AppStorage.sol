// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/libraries/cashier/CashierStorageLib.sol";
import "contracts/libraries/house/HouseStorage.sol";
import "contracts/libraries/roulette/RouletCroupierStorage.sol";

struct AppStorage {
  CashierStorage cs;
  HouseStorage hs;
  RouletCroupierStorage rcs;
  uint256 platformBalance;
}
