// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "hardhat/console.sol";
import "./storage/AppStorage.sol";
import "contracts/diamond/libraries/LibDiamond.sol";
import "contracts/storage/VaultStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "contracts/HLP/IHlp.sol";

uint256 constant DELAY_PERIOD = 20; //DAYS
uint256 constant DAY_FRACTION = 10000;

contract VaultFacet {
  AppStorage s;

  constructor() {
    //Set to test withoud diamond
    LibDiamond.setContractOwner(msg.sender);
  }

  function getVaultState()
    public
    view
    returns (
      uint256 totalReclaimed,
      uint256 totalLeft2Redeem,
      uint256 totalReady2Redeem
    )
  {
    ReclaimedHLP[] storage reclaims = s.vault.stakers[msg.sender];
    uint256 reclaimsCnt = reclaims.length;
    for (uint256 index; index < reclaimsCnt; ++index) {
      ReclaimedHLP memory reclaim = reclaims[index];
      totalReclaimed += reclaim.reclaimedHlpAmount;
      totalLeft2Redeem += (reclaim.reclaimedHlpAmount -
        reclaim.redeemedHLPAmount);

      uint256 daysPassed = ((block.timestamp - reclaim.timeOfReclaim) *
        DAY_FRACTION) / (1 days);
      if (daysPassed > 0) {
        uint256 canBeRedeemed = (((daysPassed * 1e18) / DELAY_PERIOD) *
          reclaim.reclaimedHlpAmount) /
          1e18 /
          DAY_FRACTION;
        totalReady2Redeem += (canBeRedeemed - reclaim.redeemedHLPAmount);
      }
    }
  }

  modifier noReentrant() {
    require(!s.locked, "No re-entrancy");
    s.locked = true;
    _;
    s.locked = false;
  }

  function _doRedeem(uint256 redeemHlpAmount) private {
    uint256 hlpSupply = IERC20(s.hs.HLPTokenAddress).totalSupply();
    uint256 redeemPercent = (redeemHlpAmount * 1e18) / hlpSupply;
    uint256 ethAmount = (redeemPercent * s.hs.houseBalance) / 1e18;

    IHlp(s.hs.HLPTokenAddress).burn(address(this), redeemHlpAmount);
    s.vault.totalHlpBeingReclaimed -= redeemHlpAmount;
    s.hs.houseBalance -= ethAmount;
    s.hs.revenueBalance -= ethAmount;
    payable(msg.sender).transfer(ethAmount);
  }

  function _remove(uint256 position, ReclaimedHLP[] storage reclaims) private {
    uint256 Cnt = reclaims.length - 1;
    for (uint256 index = position; index < Cnt; index++) {
      reclaims[index] = reclaims[index + 1];
    }
    reclaims.pop();
  }

  function redeemFromVault() public noReentrant {
    ReclaimedHLP[] storage reclaims = s.vault.stakers[msg.sender];
    uint256 reclaimsCnt = reclaims.length;
    uint256 incompleteReclaims;
    uint256 totalRedeemAmount;
    for (int256 index = 0; index < int256(reclaimsCnt); ++index) {
      ReclaimedHLP storage reclaim = reclaims[uint256(index)];

      uint256 daysPassed = ((block.timestamp - reclaim.timeOfReclaim) *
        DAY_FRACTION) / (1 days);
      if (daysPassed > 0) {
        console.log("Days passed", daysPassed);
        if (daysPassed < DELAY_PERIOD * DAY_FRACTION) {
          uint256 canBeRedeemed = (((daysPassed * 1e18) / DELAY_PERIOD) *
            reclaim.reclaimedHlpAmount) /
            1e18 /
            DAY_FRACTION;
          uint256 redeemHlpAmount = (canBeRedeemed - reclaim.redeemedHLPAmount);

          totalRedeemAmount += redeemHlpAmount;
          reclaim.redeemedHLPAmount += redeemHlpAmount;
          incompleteReclaims++;
        } else {
          uint256 redeemHlpAmount = (reclaim.reclaimedHlpAmount -
            reclaim.redeemedHLPAmount);

          totalRedeemAmount += redeemHlpAmount;
          reclaim.redeemedHLPAmount = reclaim.reclaimedHlpAmount;

          _remove(uint256(index), reclaims);
          --reclaimsCnt;
          --index;
        }
      }
    }
    if (totalRedeemAmount > 0) {
      _doRedeem(totalRedeemAmount);
    }
    if (incompleteReclaims == 0) {
      delete s.vault.stakers[msg.sender];
    }
  }
}
