// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

interface IHLP {
    function id() external pure returns (string memory _name);

    function setMinter(address _minter, bool _isActive) external;

    function mint(address _account, uint256 _amount) external;

    function burn(address _account, uint256 _amount) external;
}
