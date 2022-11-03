// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

struct VaultStorage {
  mapping(address => ReclaimedGLP[]) stakers;
  uint256 totalReclaimedGlpAmount;
}
struct ReclaimedGLP {
  uint256 reclaimedGlpAmount;
  uint256 redeemedGLPAmount;
  uint256 timeOfReclaim;
}
