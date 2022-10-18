// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./BaseToken.sol";
import "./interfaces/IMintable.sol";


contract MintableBaseToken is BaseToken, IMintable {

    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _initialSupply
    ) 
        BaseToken(_name, _symbol, _initialSupply)
    {
        _setRoleAdmin(rGlobals._MINTER_ROLE_, rGlobals._GOVERNOR_ROLE_);
    }

    function mint(address _account, uint256 _amount) 
        external
        override
        onlyRole(rGlobals._MINTER_ROLE_)
    {
        _mint(_account, _amount);
    }

    function burn(address _account, uint256 _amount)
        external
        override
        onlyRole(rGlobals._MINTER_ROLE_)
    {
        _burn(_account, _amount);
    }
}
