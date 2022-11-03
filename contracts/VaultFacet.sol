// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "hardhat/console.sol";
import "./storage/AppStorage.sol";
import "contracts/diamond/libraries/LibDiamond.sol";

contract VaultFacet {
  AppStorage s;

  constructor() {
    //Set to test withoud diamond
    LibDiamond.setContractOwner(msg.sender);
  }

  function test() public returns (bool) {
    return true;
  }
}
