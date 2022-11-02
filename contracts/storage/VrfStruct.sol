// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

struct VrfStruct {
  mapping(address => uint256) requests;
  mapping(uint256 => uint256) requests_rand;
}
