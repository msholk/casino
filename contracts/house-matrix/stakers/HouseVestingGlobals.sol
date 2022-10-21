// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


contract HouseVestingGlobals {
    uint256 private constant __yearInSeconds = 365 * 24 * 60 * 60;

    address private constant __hlpAddress = 0x000000000000000000000000000000000000D3ad;
    address private constant __ethAddress = address(0);
    address private constant __daiAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    address private constant __governor = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address private constant __admin = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    address private constant __rewardsRouter = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;

    mapping(address => bool) private __isStakeToken;
    mapping(address => uint256) private __durations;
    
    constructor() {
        __durations[__hlpAddress] = 1 * __yearInSeconds;
        __durations[__ethAddress] = 2 * __yearInSeconds;
        __durations[__daiAddress] = 3 * __yearInSeconds;

        __isStakeToken[__hlpAddress] = true;
        __isStakeToken[__ethAddress] = true;
        __isStakeToken[__daiAddress] = true;
    }

    function governor() external pure returns (address) {
        return __governor;
    }

    function admin() external pure returns (address) {
        return __admin;
    }

    function rewardsRouter() external pure returns (address) {
        return __rewardsRouter;
    }

    function isStakeToken(address _token) external view returns (bool) {
        return __isStakeToken[_token];
    }

    function getDuration(address _token) external view returns (uint256) {
        return __durations[_token];
    }

    function hlpAddress() external pure returns (address) {
        return __hlpAddress;
    }

    function hlpDuration() external view returns (uint256) {
        return __durations[__hlpAddress];
    }

    function ethDuration() external view returns (uint256) {
        return __durations[__ethAddress];
    }

    function daiDuration() external view returns (uint256) {
        return __durations[__daiAddress];
    }
}