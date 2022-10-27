// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/diamond/libraries/LibDiamond.sol";
import "contracts/libraries/AppStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "contracts/libraries/constants.sol";

contract AdminFacet {
  AppStorage s;

  constructor() {
    //Set to test withoud diamond
    LibDiamond.setContractOwner(msg.sender);
  }

  function withdrawAllPlatformFunds() public {
    LibDiamond.enforceIsContractOwner();

    ////////////////////////////////////////////////////////////////
    uint256 amount = s.platformBalance;
    require(amount > 0, "Your balance is ZERO");
    require(
      amount <= address(this).balance,
      "Your balance is more than contract has"
    );

    payable(msg.sender).transfer(amount);
  }

  function withdrawAllContractFunds() public {
    LibDiamond.enforceIsContractOwner();

    payable(msg.sender).transfer(address(this).balance);
  }

  function checkPlatformBalance()
    public
    view
    returns (uint256 platformBalance, uint256 contractBalance)
  {
    LibDiamond.enforceIsContractOwner();
    return (s.platformBalance, address(this).balance);
  }

  function isContractOwner() public view returns (bool) {
    return LibDiamond.isContractOwner();
  }
}
