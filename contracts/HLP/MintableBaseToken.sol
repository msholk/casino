// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "./BaseToken.sol";
import "./IMintable.sol";

contract MintableBaseToken is BaseToken, IMintable {
  mapping(address => bool) public isMinter;

  constructor(string memory _name, string memory _symbol)
    BaseToken(_name, _symbol)
  {}

  modifier onlyMinter() {
    require(isMinter[msg.sender], "MintableBaseToken: forbidden");
    _;
  }

  function setMinter(address _minter, bool _isActive) external virtual onlyGov {
    isMinter[_minter] = _isActive;
  }

  function mint(address _account, uint256 _amount) external virtual onlyMinter {
    _mint(_account, _amount);
  }

  function burn(address _account, uint256 _amount) external virtual onlyMinter {
    _burn(_account, _amount);
  }
}
