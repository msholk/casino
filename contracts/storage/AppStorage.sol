// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/libraries/cashier/CashierStorageLib.sol";
import "./HouseStorage.sol";
import "./RouletCroupierStorage.sol";
import "./VrfStruct.sol";
import "./VaultStorage.sol";

struct AppStorage {
  CashierStorage cs;
  HouseStorage hs;
  RouletCroupierStorage rcs;
  VrfStruct vrf;
  uint256 platformBalance;
  bool locked;
  VaultStorage vault;
}
