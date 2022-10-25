// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

interface IPlayersFacet {
    function depositETH() external payable;

    function checkPlayerBalance() external view returns (uint256, int256);

    function withdrawDAI() external;
}
