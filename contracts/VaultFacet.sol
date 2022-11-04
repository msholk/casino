// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "hardhat/console.sol";
import "./storage/AppStorage.sol";
import "contracts/diamond/libraries/LibDiamond.sol";
import "contracts/storage/VaultStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "contracts/GLP/IGLP.sol";

uint256 constant DELAY_PERIOD = 20; //DAYS

contract VaultFacet {
  AppStorage s;

  constructor() {
    //Set to test withoud diamond
    LibDiamond.setContractOwner(msg.sender);
  }

  function test() public returns (bool) {
    return true;
  }

  /*struct ReclaimedGLP {
  uint256 reclaimedGlpAmount;
  uint256 redeemedGLPAmount;
  uint256 timeOfReclaim;
}*/
  function getVaultState()
    public
    view
    returns (
      uint256 totalReclaimed,
      uint256 totalLeft2Redeem,
      uint256 totalReady2Redeem
    )
  {
    ReclaimedGLP[] storage reclaims = s.vault.stakers[msg.sender];
    uint256 reclaimsCnt = reclaims.length;
    for (uint256 index; index < reclaimsCnt; ++index) {
      ReclaimedGLP memory reclaim = reclaims[index];
      totalReclaimed += reclaim.reclaimedGlpAmount;
      totalLeft2Redeem += (reclaim.reclaimedGlpAmount -
        reclaim.redeemedGLPAmount);

      uint256 daysPassed = (block.timestamp - reclaim.timeOfReclaim) / (1 days);
      if (daysPassed > 0) {
        uint256 canBeRedeemed = (((daysPassed * 1e18) / DELAY_PERIOD) *
          reclaim.reclaimedGlpAmount) / 1e18;
        totalReady2Redeem += (canBeRedeemed - reclaim.redeemedGLPAmount);
      }
    }
  }

  modifier noReentrant() {
    require(!s.locked, "No re-entrancy");
    s.locked = true;
    _;
    s.locked = false;
  }

  function _doRedeem(uint256 redeemGlpAmount) private {
    uint256 glpSupply = IERC20(s.hs.GLPTokenAddress).totalSupply();
    uint256 redeemPercent = (redeemGlpAmount * 1e18) / glpSupply;
    uint256 ethAmount = (redeemPercent * s.hs.houseBalance) / 1e18;

    payable(msg.sender).transfer(ethAmount);
    IGLP(s.hs.GLPTokenAddress).burn(address(this), redeemGlpAmount);
    s.vault.totalGlpBeingReclaimed -= redeemGlpAmount;
  }

  function _remove(uint256 position, ReclaimedGLP[] storage reclaims) private {
    uint256 Cnt = reclaims.length - 1;
    for (uint256 index = position; index < Cnt; index++) {
      reclaims[index] = reclaims[index + 1];
    }
    reclaims.pop();
  }

  function redeemFromVault() public noReentrant {
    ReclaimedGLP[] storage reclaims = s.vault.stakers[msg.sender];
    uint256 reclaimsCnt = reclaims.length;
    uint256 incompleteReclaims;

    for (int256 index = 0; index < int256(reclaimsCnt); ++index) {
      ReclaimedGLP storage reclaim = reclaims[uint256(index)];

      uint256 daysPassed = (block.timestamp - reclaim.timeOfReclaim) / (1 days);
      if (daysPassed > 0) {
        console.log("Days passed", daysPassed);
        if (daysPassed < DELAY_PERIOD) {
          uint256 canBeRedeemed = (((daysPassed * 1e18) / DELAY_PERIOD) *
            reclaim.reclaimedGlpAmount) / 1e18;
          uint256 redeemGlpAmount = (canBeRedeemed - reclaim.redeemedGLPAmount);

          _doRedeem(redeemGlpAmount);
          reclaim.redeemedGLPAmount += redeemGlpAmount;
          incompleteReclaims++;
        } else {
          uint256 redeemGlpAmount = (reclaim.reclaimedGlpAmount -
            reclaim.redeemedGLPAmount);

          _doRedeem(redeemGlpAmount);
          reclaim.redeemedGLPAmount = reclaim.reclaimedGlpAmount;

          _remove(uint256(index), reclaims);
          --reclaimsCnt;
          --index;
        }
      }
    }
    if (incompleteReclaims == 0) {
      delete s.vault.stakers[msg.sender];
    }
  }
}
