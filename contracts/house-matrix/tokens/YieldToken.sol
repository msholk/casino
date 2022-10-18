// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./BaseToken.sol";


contract YieldToken is BaseToken {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) BaseToken(_name, _symbol, _initialSupply) {}
    
    function transferFrom(
        address _sender,
        address _recipient,
        uint256 _amount
    ) public override returns (bool) {
        bool success = ERC20(address(this)).transferFrom(_sender, _recipient, _amount);

        return success;
    }
}
