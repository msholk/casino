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

  function withdrawAllPlatformDAI() public {
    LibDiamond.enforceIsContractOwner();

    ////////////////////////////////////////////////////////////////
    uint256 amount = s.platformBalance;
    require(amount > 0, "Your balance iz ZERO");
    require(amount <= address(this).balance);

    payable(msg.sender).transfer(amount);
  }

  function checkPlatformBalance()
    public
    view
    returns (uint256 platformBalance)
  {
    LibDiamond.enforceIsContractOwner();
    return (s.platformBalance);
  }

  function isContractOwner() public view returns (bool) {
    return LibDiamond.isContractOwner();
  }
}
