// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "./MintableBaseToken.sol";

contract GMX is MintableBaseToken {
    constructor() public MintableBaseToken("GMX LP", "GMX", 0) {}

    function id() external pure returns (string memory _name) {
        return "GMX";
    }
}
