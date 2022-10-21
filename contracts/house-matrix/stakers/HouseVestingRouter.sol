// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "./interfaces/IHouseVestingWallet.sol";

import { LibRoleGlobals as rGlobals } from "../tokens/libraries/LibRoles.sol";


contract HouseVestingRouter is AccessControl {
    event WalletCreated(address indexed walletAddress, address indexed owner);

    address immutable public housePool;
    address immutable public houseVestingWallet;
    address private vestingDurationGlobalsAddress;

    constructor(
        address _housePool,
        address _houseVestingWallet,
        address _vestingDurationGlobalsAddress
    ) {
        _setRoleAdmin(rGlobals._GOVERNOR_ROLE_, rGlobals._GOVERNOR_ROLE_);
        _setupRole(rGlobals._GOVERNOR_ROLE_, _msgSender());

        housePool = _housePool;
        houseVestingWallet = _houseVestingWallet;
        vestingDurationGlobalsAddress = _vestingDurationGlobalsAddress;
    }

    function createHouseVestingWallet(
        address[] calldata _erc20Tokens,
        uint256[] calldata _balances
    ) external {
        address _clone = Clones.clone(houseVestingWallet);

        IHouseVestingWallet(payable(_clone)).initialize(
            _msgSender(), housePool, vestingDurationGlobalsAddress, _erc20Tokens, _balances
        );

        AccessControl(housePool).grantRole(rGlobals._MINTER_ROLE_, _clone);

        emit WalletCreated(_clone, msg.sender);
    }

    /**
     * @dev Grant _GOVERNOR_ROLE_ per {AccessControl:AccessControl-grantRole} and renounce 
     * _GOVERNOR_ROLE_ of _msgSender().
     * .
     * @notice Overrides {AccessControl:AccessControl-grantRole}.
     * @param _role The role to grant.
     * @param _account The account to grant the role to.
     * 
     * Requirements: See {AccessControl:AccessControl-grantRole}
     */
    function grantRole(bytes32 _role, address _account) public override {
        require(_role == rGlobals._GOVERNOR_ROLE_, '_GOVERNOR_ROLE only allowed');

        super.grantRole(_role, _account);
        renounceRole(rGlobals._GOVERNOR_ROLE_, _msgSender());
    }

    function setVestingDurationGlobalsAddress(address _vestingDurationGlobalsAddress)
        external
        onlyRole(rGlobals._GOVERNOR_ROLE_)
    {
        vestingDurationGlobalsAddress = _vestingDurationGlobalsAddress;
    }
}