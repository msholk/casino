// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "contracts/libraries/constants.sol";
import "hardhat/console.sol";

import "contracts/diamond/libraries/LibDiamond.sol";
import "contracts/libraries/house/LibHLP.sol";
import "contracts/libraries/cashier/CashierStorageLib.sol";
import "contracts/GLP/IGLP.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IStakerFacet {
  //function withdrawAllStakerDAI() external;

  function stakeETH() external payable;

  function checkStakerBalance()
    external
    view
    returns (
      uint256 stakerPercent,
      uint256 houseBalance,
      uint256 userbalance,
      uint256 glpSupply
    );
}

contract StakerFacet is IStakerFacet {
  AppStorage s;

  modifier noReentrant() {
    require(!s.locked, "No re-entrancy");
    s.locked = true;
    _;
    s.locked = false;
  }

  constructor() {
    //Set to test withoud diamond
    LibDiamond.setContractOwner(msg.sender);
  }

  function setGLPTokenAddress(address GLPtokenAddress) public {
    LibDiamond.enforceIsContractOwner();
    s.hs.GLPTokenAddress = GLPtokenAddress;
  }

  function stakeETH() public payable {
    require(s.hs.GLPTokenAddress != address(0), "GLPTokenAddress is not set");
    //console.log("stakeETH()******************************************");
    uint256 stakedValue = msg.value;
    //console.log("recieved:", stakedValue);

    uint256 oldHouseBalance = s.hs.houseBalance;
    s.hs.houseBalance += stakedValue;
    uint256 newHouseBalance = oldHouseBalance + stakedValue;

    uint256 glp2Mint;
    uint256 glpSupply = IERC20(s.hs.GLPTokenAddress).totalSupply();
    if (glpSupply == 0 || oldHouseBalance == 0) {
      glp2Mint = msg.value * 1000;
    } else {
      uint256 OldVsNew = (oldHouseBalance * 1e18) / newHouseBalance;
      console.log("oldHouseBalance", oldHouseBalance);
      console.log("newHouseBalance", newHouseBalance);
      console.log("OldVsNew", OldVsNew);
      console.log("glpSupply", glpSupply);
      glp2Mint = (glpSupply * (1e18 - OldVsNew)) / OldVsNew;
    }
    IGLP(s.hs.GLPTokenAddress).mint(msg.sender, glp2Mint);
  }

  function checkStakerBalance()
    public
    view
    returns (
      uint256 stakerPercent,
      uint256 houseBalance,
      uint256 userbalance,
      uint256 glpSupply
    )
  {
    glpSupply = IERC20(s.hs.GLPTokenAddress).totalSupply();
    userbalance = IERC20(s.hs.GLPTokenAddress).balanceOf(msg.sender);
    stakerPercent = (userbalance * 1e18) / glpSupply;

    return (stakerPercent, s.hs.houseBalance, userbalance, glpSupply);
  }
}
