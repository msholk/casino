// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/vrf/VrfStructs.sol";
import "contracts/libraries/roulette/RouletteLaunch.sol";
struct RouletCroupierStorage {
    VrfInfoStruct vrfInfo;
    mapping(address => RouletteLaunch) playersLaunchedRoulette;
    mapping(uint256 => address) userAddressByRequestId;
}
