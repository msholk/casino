// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

struct HouseStorage {
    uint256 houseBalance;
    uint256 houseLockedBalance;
    mapping(address => uint256) stakersPercentages;
    mapping(address => bool) stakerExists;
    address[] stakersList;
}
