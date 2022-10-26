// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
//  https://vrf.chain.link/mumbai/2190
//published at 0xc64af37e244960fc5d0f39596512c89ae6c82659
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

contract VRFFacetMumbaiConstants {
  error OnlyCoordinatorCanFulfill(address have, address want);
  address constant vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;
  VRFCoordinatorV2Interface constant COORDINATOR =
    VRFCoordinatorV2Interface(vrfCoordinator);

  address constant link_token_contract =
    0x326C977E6efc84E512bB9C30f76E30c160eD06FB;

  bytes32 constant keyHash =
    0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;

  uint32 constant callbackGasLimit = 100000;

  uint16 constant requestConfirmations = 3;

  uint32 constant numWords = 1;
  uint64 constant s_subscriptionId = 2190;
}
