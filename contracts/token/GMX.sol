// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "./MintableBaseToken.sol";

contract GMX is MintableBaseToken {
    constructor() MintableBaseToken("GMX LP", "GMX") {}

    function id() external pure returns (string memory _name) {
        return "GMX";
    }
}
