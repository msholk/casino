// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "./roulette/RouletteLaunch.sol";
struct RouletCroupierStorage {
  mapping(address => RouletteLaunch) playersLaunchedRoulette;
  mapping(uint256 => address) userAddressByRequestId;
}
