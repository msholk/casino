// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "./BetPoint.sol";

struct RouletteLaunch {
  BetPoint[] betPoints;
  uint256 requestId;
  uint256 lockedHouseAmountEth;
}
