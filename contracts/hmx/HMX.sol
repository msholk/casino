// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../tokens/MintableBaseToken.sol";


contract HMX is MintableBaseToken {
    constructor()
        MintableBaseToken('House Matrix', 'HMX', 0)
    {}
}
