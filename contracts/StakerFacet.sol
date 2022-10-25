// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "contracts/libraries/constants.sol";
import "hardhat/console.sol";

import "contracts/diamond/libraries/LibDiamond.sol";
import "contracts/libraries/house/LibHLP.sol";
import "contracts/libraries/cashier/CashierStorageLib.sol";

interface IStakerFacet {
  function withdrawAllStakerDAI() external;

  function stakeETH() external payable;

  function checkStakerBalance()
    external
    view
    returns (uint256 stakerPercent, uint256 newHouseBalance);
}

contract StakerFacet is IStakerFacet {
  AppStorage s;
  bool internal locked;

  modifier noReentrant() {
    require(!locked, "No re-entrancy");
    locked = true;
    _;
    locked = false;
  }

  constructor() {
    //Set to test withoud diamond
    LibDiamond.setContractOwner(msg.sender);
  }

  function withdrawAllStakerDAI() public noReentrant {
    if (!s.hs.stakerExists[msg.sender]) {
      revert("You are not a staker");
    }
    mapping(address => uint256) storage stakersPercentages = s
      .hs
      .stakersPercentages;
    uint256 stakerPercent = stakersPercentages[msg.sender];
    require(stakerPercent > 0, "Your precent iz ZERO");
    require(s.hs.houseBalance > 0, "House balance iz ZERO");
    uint256 oldHouseBalance = s.hs.houseBalance;
    uint256 stakerOldAmount = (oldHouseBalance * stakerPercent) / 1e18;
    console.log("stakerOldAmount", stakerOldAmount);
    uint256 stakerOldAmountFirstDecimal = ((oldHouseBalance * stakerPercent) /
      1e17) % 10;
    console.log("stakerOldAmountFirstDecimal", stakerOldAmountFirstDecimal);
    if (stakerOldAmountFirstDecimal >= 5) {
      stakerOldAmount++;
    }
    s.hs.houseBalance -= stakerOldAmount;
    uint256 newHouseBalance = s.hs.houseBalance;
    console.log("newHouseBalance", newHouseBalance);
    stakersPercentages[msg.sender] = 0;
    ////////////////////////////////////
    address[] storage stakersList = s.hs.stakersList;
    uint256 stakersListCount = stakersList.length;
    for (uint256 index; index < stakersListCount; ++index) {
      address stakerAddress = stakersList[index];
      if (newHouseBalance > 0) {
        uint256 iStakerPercent = stakersPercentages[stakerAddress];
        uint256 iStakerOldAmount = (oldHouseBalance * iStakerPercent) / 1e18;
        uint256 stakerNewPercent = (iStakerOldAmount * 1e18) / newHouseBalance;
        stakersPercentages[stakerAddress] = stakerNewPercent;
      } else {
        stakersPercentages[stakerAddress] = 0;
      }
    }

    ////////////////////////////////////////////////////////////////
    require(stakerOldAmount > 0, "Your balance iz ZERO");
    require(
      stakerOldAmount <= address(this).balance,
      "Balance is less than platform has"
    );
    console.log("Withdrawing stakerOldAmount", stakerOldAmount);
    console.log("address(this).balance", address(this).balance);
    payable(msg.sender).transfer(stakerOldAmount);
  }

  function stakeETH() public payable {
    //console.log("stakeETH()******************************************");
    uint256 stakedValue = msg.value;
    //console.log("recieved:", stakedValue);

    uint256 oldHouseBalance = s.hs.houseBalance;
    s.hs.houseBalance += stakedValue;

    if (!s.hs.stakerExists[msg.sender]) {
      //console.log("New staaker");
      addBalanceToNewStaker(oldHouseBalance, stakedValue);
    } else {
      //console.log("Existing staker");
      addBalnceToExistingStaker(oldHouseBalance, stakedValue);
    }
  }

  function addBalnceToExistingStaker(
    uint256 oldHouseBalance,
    uint256 stakingValues
  ) private {
    uint256 newBalance = oldHouseBalance + stakingValues;
    address[] storage stakersList = s.hs.stakersList;
    uint256 stakersListCount = stakersList.length;
    mapping(address => uint256) storage stakersPercentages = s
      .hs
      .stakersPercentages;

    uint256 stakersPercentByNow = stakersPercentages[msg.sender];
    uint256 stakersBalanceByNow = (stakersPercentByNow * oldHouseBalance) /
      1e18;

    for (uint256 index; index < stakersListCount; ++index) {
      address stakerAddress = stakersList[index];
      uint256 stakerPercent = stakersPercentages[stakerAddress];
      uint256 stakerOldAmount = (oldHouseBalance * stakerPercent) / 1e18;
      uint256 stakerNewPercent = (stakerOldAmount * 1e18) / newBalance;
      uint256 stakerNewPercentFirstDecimal = ((stakerOldAmount * 1e19) /
        newBalance) % 10;
      if (stakerNewPercentFirstDecimal >= 5) {
        stakerNewPercent++;
      }
      stakersPercentages[stakerAddress] = stakerNewPercent;

      // //console.log(
      //     "Percent change",
      //     index,
      //     stakerPercent,
      //     stakerNewPercent
      // );
    }

    uint256 currentStakerNewBalance = stakingValues + stakersBalanceByNow;
    uint256 currentStakerNewPercent = (currentStakerNewBalance * 1e18) /
      newBalance;
    uint256 currentStakerNewPercentFirstDecimal = ((currentStakerNewBalance *
      1e19) / newBalance) % 10;
    if (currentStakerNewPercentFirstDecimal >= 5) {
      currentStakerNewPercent++;
    }

    stakersPercentages[msg.sender] = currentStakerNewPercent;
    // //console.log("Updated staker", stakersPercentages[msg.sender]);
  }

  function addBalanceToNewStaker(uint256 oldHouseBalance, uint256 stakingAmount)
    private
  {
    uint256 newBalance = oldHouseBalance + stakingAmount;
    address[] storage stakersList = s.hs.stakersList;
    uint256 stakersListCount = stakersList.length;
    mapping(address => uint256) storage stakersPercentages = s
      .hs
      .stakersPercentages;
    //console.log("oldHouseBalance", oldHouseBalance);
    //console.log("stakingAmount", stakingAmount);
    //console.log("stakersListCount", stakersListCount);
    //console.log("newBalance", newBalance);
    for (uint256 index; index < stakersListCount; ++index) {
      //console.log("   recalculating percent for ", index);
      address stakerAddress = stakersList[index];
      uint256 stakerPercent = stakersPercentages[stakerAddress];
      //console.log("     stakerPercent ", stakerPercent);
      uint256 stakerOldAmount = (oldHouseBalance * stakerPercent) / 1e18;
      //console.log("     stakerOldAmount ", stakerOldAmount);
      uint256 stakerNewPercent = (stakerOldAmount * 1e18) / newBalance;
      //console.log("     stakerNewPercent ", stakerNewPercent);
      uint256 stakerNewPercentFirstDecimal = ((stakerOldAmount * 1e19) /
        newBalance) % 10;

      if (stakerNewPercentFirstDecimal >= 5) {
        stakerNewPercent++;
      }
      stakersPercentages[stakerAddress] = stakerNewPercent;

      // //console.log(
      //     "Percent change",
      //     index,
      //     stakerPercent,
      //     stakerNewPercent
      // );
    }

    s.hs.stakersList.push(msg.sender);
    s.hs.stakerExists[msg.sender] = true;
    // //console.log(stakingAmount, newBalance);
    uint256 currentStakerNewPercent = (stakingAmount * 1e18) / newBalance;
    uint256 currentStakerNewPercentFirstDecimal = ((stakingAmount * 1e19) /
      newBalance) % 10;
    if (currentStakerNewPercentFirstDecimal >= 5) {
      currentStakerNewPercent++;
    }

    //console.log("currentStakerNewPercent", currentStakerNewPercent);

    stakersPercentages[msg.sender] = currentStakerNewPercent;
    // //console.log("New staker", stakersPercentages[msg.sender]);
  }

  function checkStakerBalance()
    public
    view
    returns (uint256 stakerPercent, uint256 newHouseBalance)
  {
    if (!s.hs.stakerExists[msg.sender]) {
      return (0, s.hs.houseBalance);
    }

    mapping(address => uint256) storage stakersPercentages = s
      .hs
      .stakersPercentages;

    //console.log("checkStakerBalance()********************************");

    //console.log("s.hs.houseBalance", s.hs.houseBalance);
    return (stakersPercentages[msg.sender], s.hs.houseBalance);
  }
}
