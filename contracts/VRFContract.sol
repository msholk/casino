// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
//  https://vrf.chain.link/mumbai/2190
//published at 0xc64af37e244960fc5d0f39596512c89ae6c82659
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "contracts/libraries/AppStorage.sol";
import "./VRFFacetMumbaiConstants.sol";

contract VRFContract is VRFFacetMumbaiConstants {
  AppStorage s;

  // rawFulfillRandomness is called by VRFCoordinator when it receives a valid VRF
  // proof. rawFulfillRandomness then calls fulfillRandomness, after validating
  // the origin of the call
  function rawFulfillRandomWords(
    uint256 requestId,
    uint256[] memory randomWords
  ) external {
    if (msg.sender != vrfCoordinator) {
      revert OnlyCoordinatorCanFulfill(msg.sender, vrfCoordinator);
    }
    fulfillRandomWords(requestId, randomWords);
  }

  // Assumes the subscription is funded sufficiently.
  function requestRandomWords() public {
    //require(authorized[msg.sender], "not authorized");

    // Will revert if subscription is not set and funded.
    uint256 s_requestId = COORDINATOR.requestRandomWords(
      keyHash,
      s_subscriptionId,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );

    s.vrf.requests[msg.sender] = s_requestId;
    s.rcs.userAddressByRequestId[s_requestId] = msg.sender;
    s.rcs.playersLaunchedRoulette[msg.sender].requestId = s_requestId;

    // requests_sender[s_requestId] = msg.sender;
  }

  function getReqID() public view returns (uint256) {
    return s.vrf.requests[msg.sender];
  }

  function getRnd() public view returns (uint256) {
    uint256 reqId = s.vrf.requests[msg.sender];
    if (reqId == 0) return 333; //no request is made for sender
    uint256 rndNum = s.vrf.requests_rand[reqId];
    if (rndNum == 0) return 334; //request is made, waiting for chainlink
    return rndNum;
  }

  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
    internal
    virtual
  {
    // s_randomWords = randomWords;
    s.vrf.requests_rand[requestId] = randomWords[0];
  }
}
