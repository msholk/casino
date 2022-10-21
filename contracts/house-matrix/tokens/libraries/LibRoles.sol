//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


library LibRoleGlobals {
    bytes32 internal constant _ADMIN_ROLE_ = "ADMIN";
    bytes32 internal constant _GOVERNOR_ROLE_ = "GOVERNOR";
    bytes32 internal constant _DISTRIBUTOR_ROLE_ = "DISTRIBUTOR";
    bytes32 internal constant _MINTER_ROLE_ = "MINTER";
    bytes32 internal constant _OWNER_ROLE_ = "OWNER";
    bytes32 internal constant _APPROVED_ROLE_ = "APPROVED";
    bytes32 internal constant _WHITELIST_HANDLER_ROLE_ = "WHITELIST_HANDLER";
    bytes32 internal constant _NON_STAKING_ACCOUNT_ROLE_ = "NON_STAKING_ACCOUNT";
    bytes32 internal constant _YIELD_TOKEN_ROLE_ = "YIELD_TOKEN_ACCOUNT";
    bytes32 internal constant _REWARDS_ROUTER_ROLE_ = "REWARDS_ROUTER";
}
