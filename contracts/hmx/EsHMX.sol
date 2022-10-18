// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../tokens/MintableBaseToken.sol";


contract EsHMX is MintableBaseToken {
    constructor() MintableBaseToken('Escrowed HMX', 'EsHMX', 0) {}
}
