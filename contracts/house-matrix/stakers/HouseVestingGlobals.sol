// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./interfaces/IHouseVestingGlobals.sol";


contract HouseVestingGlobals is IHouseVestingGlobals {
    address public constant hlpAddress = 0x000000000000000000000000000000000000D3ad;
    address private constant ethAddress = address(0);
    address public constant daiAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    address public constant governor = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address public constant admin = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    address public constant distributor = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    address public constant rewardsRouter = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;

    function isStakeToken(address _token) external pure returns (bool) {
        return _token == hlpAddress || _token == ethAddress || _token == daiAddress;
    }

    function getDuration(address _token) public pure returns (uint256) {
        uint256 _monthInSeconds = 30 * 24 * 60 * 60;


        if (_token == hlpAddress) { return 0; }
        else if (_token == ethAddress) { return 2 * _monthInSeconds; }
        else if (_token == daiAddress) { return 2 * _monthInSeconds; }

        return 0;
    }

    function getTokens() external pure returns (address[3] memory) {
        return [hlpAddress, ethAddress, daiAddress];
    }

    function hlpDuration() external pure returns (uint256) {
        return getDuration(hlpAddress);
    }

    function ethDuration() external pure returns (uint256) {
        return getDuration(ethAddress);
    }

    function daiDuration() external pure returns (uint256) {
        return getDuration(daiAddress);
    }
}