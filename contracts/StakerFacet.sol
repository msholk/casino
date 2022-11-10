// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "contracts/libraries/constants.sol";
import "hardhat/console.sol";

import "contracts/diamond/libraries/LibDiamond.sol";
import "contracts/libraries/house/LibHLP.sol";
import "contracts/libraries/cashier/CashierStorageLib.sol";
import "contracts/HLP/IHlp.sol";
import "contracts/storage/VaultStorage.sol";
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
      uint256 hlpSupply
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

  function setHLPTokenAddress(address HLPtokenAddress) public {
    LibDiamond.enforceIsContractOwner();
    s.hs.HLPTokenAddress = HLPtokenAddress;
  }

  function getHLPTokenAddress() public view returns (address HLPtokenAddress) {
    return s.hs.HLPTokenAddress;
  }

  function stakeETH() public payable {
    require(s.hs.HLPTokenAddress != address(0), "HLPTokenAddress is not set");
    //console.log("stakeETH()******************************************");
    uint256 stakedValue = msg.value;
    //console.log("recieved:", stakedValue);

    uint256 oldHouseBalance = s.hs.houseBalance;
    s.hs.houseBalance += stakedValue;
    s.hs.revenueBalance += stakedValue;
    uint256 newHouseBalance = oldHouseBalance + stakedValue;

    uint256 hlp2Mint;
    uint256 hlpSupply = IERC20(s.hs.HLPTokenAddress).totalSupply();
    if (hlpSupply == 0 || oldHouseBalance == 0) {
      hlp2Mint = msg.value * 1000;
    } else {
      uint256 OldVsNew = (oldHouseBalance * 1e18) / newHouseBalance;
      hlp2Mint = (hlpSupply * (1e18 - OldVsNew)) / OldVsNew;
    }
    IHlp(s.hs.HLPTokenAddress).mint(msg.sender, hlp2Mint);
  }

  function checkStakerBalance()
    public
    view
    returns (
      uint256 stakerPercent,
      uint256 houseBalance,
      uint256 userbalance,
      uint256 hlpSupply
    )
  {
    hlpSupply = IERC20(s.hs.HLPTokenAddress).totalSupply();
    userbalance = IERC20(s.hs.HLPTokenAddress).balanceOf(msg.sender);
    stakerPercent = 0;
    if (hlpSupply > 0) {
      stakerPercent = (userbalance * 1e18) / hlpSupply;
    }

    return (stakerPercent, s.hs.houseBalance, userbalance, hlpSupply);
  }

  function reclaimHLP(uint256 hlp2Reclaim) public {
    uint256 stakerBalance = IERC20(s.hs.HLPTokenAddress).balanceOf(msg.sender);
    require(
      hlp2Reclaim <= stakerBalance,
      "Not enough HLP balance to cliam this quantity"
    );
    //Pass the HLP to contract's address
    IHlp(s.hs.HLPTokenAddress).burn(msg.sender, hlp2Reclaim);
    IHlp(s.hs.HLPTokenAddress).mint(address(this), hlp2Reclaim);

    ReclaimedHLP memory reclaimedHLP = ReclaimedHLP({
      reclaimedHlpAmount: hlp2Reclaim,
      redeemedHLPAmount: 0,
      timeOfReclaim: block.timestamp
    });
    s.vault.stakers[msg.sender].push(reclaimedHLP);
    s.vault.totalHlpBeingReclaimed += hlp2Reclaim;
  }
}
