// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


interface IHouseVestingGlobals {
    function hlpAddress() external pure returns (address);
    
    function daiAddress() external pure returns (address);

    function governor() external pure returns (address);

    function admin() external pure returns (address);

    function distributor() external pure returns (address);    

    function rewardsRouter() external pure returns (address);

    function isStakeToken(address _token) external view returns (bool);

    function getDuration(address _token) public view returns (uint256);

    function getTokens() external pure returns (address[3] memory);

    function hlpDuration() external view returns (uint256);

    function ethDuration() external view returns (uint256);

    function daiDuration() external view returns (uint256);
}