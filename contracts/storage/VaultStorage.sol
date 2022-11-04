// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

struct VaultStorage {
  mapping(address => ReclaimedGLP[]) stakers;
  //Total glp in reclaiming state
  uint256 totalGlpBeingReclaimed;
}
struct ReclaimedGLP {
  uint256 reclaimedGlpAmount;
  uint256 redeemedGLPAmount;
  uint256 timeOfReclaim;
}
