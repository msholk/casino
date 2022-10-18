// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Token is Ownable, ERC20 {
    uint8 private decimals__ = 18;

    /**
     * @dev Sets the values for {name}, {symbol}, and {initialSupply}, initializes
     * {decimals} with a default value of 18.
     *
     * To select a different value for {decimals}, use {constructor(_decimals)}.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor() ERC20('Token', 'TOKEN') {}

    function decimals() public view override returns (uint8) {
        return decimals__;
    }

    function setDecimals(uint8 _decimals) external onlyOwner() {
        renounceOwnership();
        decimals__ = _decimals;
    }

    function mint(address _account, uint256 _amount) external onlyOwner() {
        renounceOwnership();
        _mint(_account, _amount);
    }
}