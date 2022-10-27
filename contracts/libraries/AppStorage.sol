// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "./cashier/CashierStorageLib.sol";
import "./house/HouseStorage.sol";
import "./roulette/RouletCroupierStorage.sol";
import "./VrfStruct.sol";

struct AppStorage {
  CashierStorage cs;
  HouseStorage hs;
  RouletCroupierStorage rcs;
  VrfStruct vrf;
  uint256 platformBalance;
  bool locked;
  uint256[] myLog;
}
