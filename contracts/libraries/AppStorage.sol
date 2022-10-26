// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/libraries/cashier/CashierStorageLib.sol";
import "contracts/libraries/house/HouseStorage.sol";
import "contracts/libraries/roulette/RouletCroupierStorage.sol";
import "./VrfStruct.sol";

struct AppStorage {
  CashierStorage cs;
  HouseStorage hs;
  RouletCroupierStorage rcs;
  VrfStruct vrf;
  uint256 platformBalance;
  bool locked;
}
