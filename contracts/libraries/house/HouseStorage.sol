// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

struct HouseStorage {
    uint256 houseBalancePr2;
    uint256 houseLockedBalanceP2;
    mapping(address => uint256) stakersPercentagesPr18;
    mapping(address => bool) stakerExists;
    address[] stakersList;
}
