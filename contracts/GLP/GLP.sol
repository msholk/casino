// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "./MintableBaseToken.sol";

contract GLP is MintableBaseToken {
  constructor() MintableBaseToken("House of Matrix Liquidity token", "HLP") {}

  function id() external pure returns (string memory _name) {
    return "GLP";
  }

  function setMinter(address _minter, bool _isActive)
    external
    override
    onlyGov
  {
    isMinter[_minter] = _isActive;
  }

  function mint(address _account, uint256 _amount)
    external
    override
    onlyMinter
  {
    _mint(_account, _amount);
  }

  function burn(address _account, uint256 _amount)
    external
    override
    onlyMinter
  {
    _burn(_account, _amount);
  }
}
