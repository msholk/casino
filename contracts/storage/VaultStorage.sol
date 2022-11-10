// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

struct VaultStorage {
  mapping(address => ReclaimedHLP[]) stakers;
  //Total hlp in reclaiming state
  uint256 totalHlpBeingReclaimed;
}
struct ReclaimedHLP {
  uint256 reclaimedHlpAmount;
  uint256 redeemedHLPAmount;
  uint256 timeOfReclaim;
}
