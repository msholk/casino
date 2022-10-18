// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./interfaces/IBaseToken.sol";
import "./interfaces/IYieldTracker.sol";

import { LibRoleGlobals as rGlobals } from "./libraries/LibRoles.sol";


contract BaseToken is AccessControl, Pausable, ERC20, IBaseToken {  
    uint256 public override nonStakedSupply;

    address[] public yieldTrackers;

    constructor(
        string memory _name, string memory _symbol, uint256 _initialSupply
    ) 
        ERC20(_name, _symbol)
    {
        _setRoleAdmin(rGlobals._GOVERNOR_ROLE_, rGlobals._GOVERNOR_ROLE_);
        _setRoleAdmin(rGlobals._ADMIN_ROLE_, rGlobals._GOVERNOR_ROLE_);
        _setRoleAdmin(rGlobals._WHITELIST_HANDLER_ROLE_, rGlobals._GOVERNOR_ROLE_);
        _setRoleAdmin(rGlobals._NON_STAKING_ACCOUNT_ROLE_, rGlobals._ADMIN_ROLE_);

        _setupRole(rGlobals._GOVERNOR_ROLE_, _msgSender());

        _mint(_msgSender(), _initialSupply);
    }

    /**
     * @dev If `_role` is _NON_STAKING_ACCOUNT_ROLE_, grant role per _addNonStakingAccount, else
     * grant per {AccessControl:AccessControl-grantRole}.
     * @notice Overrides {AccessControl:AccessControl-grantRole}.
     * @param _role The role to grant.
     * @param _account The account to grant the role to.
     * 
     * Requirements: See {AccessControl:AccessControl-grantRole}
     */
    function grantRole(bytes32 _role, address _account) public override {
        if (_role == rGlobals._NON_STAKING_ACCOUNT_ROLE_) {
            _addNonStakingAccount(_account);
        } else {
            super.grantRole(_role, _account);
        }
    }

    /**
     * @dev If `_role` is _NON_STAKING_ACCOUNT_ROLE_, revoke role per _removeNonStakingAccount,
     * else revoke per {AccessControl:AccessControl-revokeRole}.
     * @notice Overrides {AccessControl:AccessControl-revokeRole}.
     * @param _role The role to revoke.
     * @param _account The account to revoke the role from.
     * 
     * Requirements: See {AccessControl:AccessControl-revokeRole}
     */
    function revokeRole(bytes32 _role, address _account) public override {
        if (_role == rGlobals._NON_STAKING_ACCOUNT_ROLE_) {
            _removeNonStakingAccount(_account);
        } else {
            super.revokeRole(_role, _account);
        }
    }

    /**
     * @dev If `_role` is _GOVERNOR_ROLE_, only allow reassignment of the governor's role, else
     * renounce `_role` per {AccessControl:AccessControl-renouncRole}.
     * @notice Overrides {AccessControl:AccessControl-renouncRole}.
     * @param _role The role to reassign.
     * @param _account The account to reassign the role to.
     * 
     * Requirements: See {AccessControl:AccessControl-renounceRole}
     */
    function renounceRole(bytes32 _role, address _account) public override {
        if (_role == rGlobals._GOVERNOR_ROLE_) { grantRole(_role, _account); }
        
        super.renounceRole(_role, _msgSender());
    }

    /**
     * See {IBaseToken:IBaseToken-totalStakedSupply}
     */
    function totalStakedSupply() external view returns (uint256) {
        return totalSupply() - nonStakedSupply;
    }

    /**
     * See {IBaseToken:IBaseToken-stakedBalance}
     */
    function stakedBalance(address _account) external view returns (uint256) {
        return hasRole(rGlobals._NON_STAKING_ACCOUNT_ROLE_, _account) ? 0 : balanceOf(_account);
    }

    /**
     * See {IBaseToken:IBaseToken-setYieldTrackers}.
     */
    function setYieldTrackers(address[] memory _yieldTrackers)
        external
        onlyRole(rGlobals._GOVERNOR_ROLE_)
    {
        yieldTrackers = _yieldTrackers;
    }

    /**
     * @dev Set this contract to paused.
     * @param _inWhitelistMode The boolean flag for pausing/unpausing the contract (true=
     * pause, false=unpause).
     * 
     * Requirements:
     * 
     * - Only the account with _GOVERNOR_ROLE_ can access this function.
     */
    function setInWhitelistMode(bool _inWhitelistMode)
        external
        onlyRole(rGlobals._GOVERNOR_ROLE_)
    {
        _inWhitelistMode ? _pause() : _unpause();
    }

    /**
     * See {IBaseToken:IBaseToken-recoverClaim}.
     */
    function recoverClaim(address _account, address _receiver)
        external
        onlyRole(rGlobals._ADMIN_ROLE_)
    {
        for (uint256 i = 0; i < yieldTrackers.length; i++) {
            address yieldTracker = yieldTrackers[i];
            IYieldTracker(yieldTracker).claim(_account, _receiver);
        }
    }

    /**
     * See {IBaseToken:IBaseToken-claim}.
     */
    function claim(address _receiver) external {
        for (uint256 i = 0; i < yieldTrackers.length; i++) {
            address yieldTracker = yieldTrackers[i];
            IYieldTracker(yieldTracker).claim(msg.sender, _receiver);
        }
    }

    /**
     * @dev Transfer `_amount` tokens from `_sender` to `_recipient`. If `msg.sender` does not
     * have the _WHITELIST_HANDLER_ROLE_, envoke the ERC20._spendAllowance function to update the token
     * `_sender`'s allowance for the `msg.sender` based on spent `_amount`.
     * @notice Overrides existing {ERC20:ERC20-transferFrom} function.
     * @param _sender The account sending the tokens.
     * @param _recipient The account receiving the tokens.
     * @param _amount The amount of tokens to transfer.
     * @return bool A flag to report the success of the transfer.
     * 
     * Requirements: See {ERC20:ERC20-_transfer} and {ERC20:ERC20-_spendAllowance}._amount
     * 
     * Emits {ERC20:ERC20-Approve} and/or {ERC20:ERC20-Transfer} events.
     */
    function transferFrom(address _sender, address _recipient, uint256 _amount)
        public
        virtual
        override(ERC20, IERC20)
        returns (bool)
    {
        if (!hasRole(rGlobals._WHITELIST_HANDLER_ROLE_, _msgSender())) {
            _spendAllowance(_sender, msg.sender, _amount);
        }

        _transfer(_sender, _recipient, _amount);
        return true;
    }

    /**
     * @dev Add `_account` as a non-staking account.
     * @param _account The address to add as a non-staking account.
     * 
     * Requirements:
     * 
     * - Only the account with _NON_STAKING_ACCOUNT_ROLE_ admin can grant a non-staking account 
     * role.
     */
    function _addNonStakingAccount(address _account) internal {
        __updateRewards(_account);
        super.grantRole(rGlobals._NON_STAKING_ACCOUNT_ROLE_, _account);
        nonStakedSupply += balanceOf(_account);
    }

    /**
     * @dev Remove `_account` as a non-staking account.
     * @param _account The address to remove as a non-staking account.
     * 
     * Requirements:
     * 
     * - Only the account with _NON_STAKING_ACCOUNT_ROLE_ admin can revoke a non-staking account 
     * role.
     */
    function _removeNonStakingAccount(address _account) internal {
        __updateRewards(_account);
        super.revokeRole(rGlobals._NON_STAKING_ACCOUNT_ROLE_, _account);
        nonStakedSupply -= balanceOf(_account);
    }

    /**
     * @dev Before token transfer, update `_from` and `_to` balances of tokens.
     * @notice Overrides existing {ERC20:ERC20-_beforeTokenTransfer} function.
     * @param _from The account transferring the tokens.
     * @param _to The account receiving the tokens.
     * 
     * Requirements:
     * 
     * - If paused, only the account with _HANDLER_ROLE_ can access this function.
     */
    function _beforeTokenTransfer(address _from, address _to, uint256) internal override {
        if (paused()) { _checkRole(rGlobals._WHITELIST_HANDLER_ROLE_); }

        if (_from != address(0)) {
            __updateRewards(_from);
        }

        if (_to != address(0)) {
            __updateRewards(_to);
        }
    } 

    /**
     * @dev After token transfer, if `_from` and/or `_to` are non-staking accounts, update the
     * `nonStakedSupply` with the `_amount` as needed.
     * @notice Overrides existing {ERC20:ERC20-_afterTokenTransfer} function.
     * @param _from The account transferring the tokens.
     * @param _to The account receiving the tokens.
     * @param _amount The amount of tokens transferred.
     * 
     * Requirements: None
     */
    function _afterTokenTransfer(address _from, address _to, uint256 _amount) internal override {
        if (_from != address(0) && hasRole(rGlobals._NON_STAKING_ACCOUNT_ROLE_, _from)) {
            nonStakedSupply -= _amount;
        }
        
        if (_to != address(0) && hasRole(rGlobals._NON_STAKING_ACCOUNT_ROLE_, _to)) {
            nonStakedSupply += _amount;
        }
    }

    /**
     * @dev Update the token balance of `_account`.
     * @notice See {LibYieldFarm:LibYieldTracker-updateRewards}.
     * @param _account The address mapped to the balance to update.
     * 
     * Requirements: None
     */
    function __updateRewards(address _account) private {
        for (uint256 i = 0; i < yieldTrackers.length; i++) {
            IYieldTracker(yieldTrackers[i]).updateRewards(_account);
        }
    }
}
