// SPDX-License-Identifier: MIT
// An example of a consumer contract that relies on a subscription for funding.
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
struct VrfInfoStruct {
    uint64 subscriptionId;
    address vrfCoordinatorAddress;
    bytes32 keyHash;
}
