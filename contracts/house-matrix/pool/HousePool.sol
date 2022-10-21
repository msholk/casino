// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";

import { LibRoleGlobals as rGlobals } from "../tokens/libraries/LibRoles.sol";


contract HousePool is AccessControl {
    constructor() {
        _setRoleAdmin(rGlobals._GOVERNOR_ROLE_, rGlobals._ADMIN_ROLE_);
        _setRoleAdmin(rGlobals._ADMIN_ROLE_, rGlobals._ADMIN_ROLE_);
        _setRoleAdmin(rGlobals._MINTER_ROLE_, rGlobals._ADMIN_ROLE_);

        _setupRole(rGlobals._ADMIN_ROLE_, _msgSender());
    }

    receive() external payable {}
}