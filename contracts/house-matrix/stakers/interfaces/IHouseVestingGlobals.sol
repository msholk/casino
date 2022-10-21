// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


interface IHouseVestingGlobals {
    function governor() external pure returns (address);

    function admin() external pure returns (address);

    function rewardsRouter() external pure returns (address);

    function isStakeToken(address _token) external view returns (bool);

    function getDuration(address _token) external view returns (uint256);

    function hlpAddress() external pure returns (address);

    function hlpDuration() external view returns (uint256);

    function ethDuration() external view returns (uint256);

    function daiDuration() external view returns (uint256);
}