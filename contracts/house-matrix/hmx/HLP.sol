// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../tokens/MintableBaseToken.sol";


contract HLP is MintableBaseToken {
    constructor(uint256 _initialSupply)
        MintableBaseToken('House Matrix LP', 'HLP', _initialSupply)
    {}
}
