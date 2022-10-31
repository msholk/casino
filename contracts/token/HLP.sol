// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "./MintableBaseToken.sol";

contract GLP is MintableBaseToken {
    constructor() MintableBaseToken("GMX LP", "GLP") {}

    function id() external pure returns (string memory _name) {
        return "GLP";
    }
}
