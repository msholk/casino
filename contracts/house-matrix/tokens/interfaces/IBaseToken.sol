// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

interface IBaseToken is IERC20 {
    /**
     * @dev Return the total supply of non-staked BaseToken.
     *
     * Requirements: None
     */
    function nonStakedSupply() external view returns (uint256);

    /**
     * @dev Return the total supply of staked BaseToken.
     *
     * Requirements: None
     */
    function totalStakedSupply() external view returns (uint256);

    /**
     * @dev Return the total balance of `_account`'s staked BaseToken.
     * @param _account The account address to query the staked balance.
     *
     * Requirements: None
     */
    function stakedBalance(address _account) external view returns (uint256);

    /**
     * @dev Set the contracts that track and distribute the accumulated reward tokens'
     * accumulated by staking tokens in the liquidity pools.
     * @param _yieldTrackers The contract addresses of the yield tracker.
     *
     * Requirements:
     *
     * - Only the account with _GOVERNOR_ROLE_ can access this function.
     */
    function setYieldTrackers(address[] calldata _yieldTrackers) external;

    /**
     * @dev Set the flag for private transfer mode. This mode enables whitelist only
     * transfers.
     * @param _inPrivateTransferMode The flag defining private transfer mode.
     *
     * Requirements:
     *
     * - Only the account with _GOVERNOR_ROLE_ can access this function.
     */
    function setInWhitelistMode(bool _inPrivateTransferMode) external;

    /**
     * @dev Recover reward tokens claim on the behalf of `_account` for `_receiver`.
     * @param _account The address mapped to the claim reward.
     * @param _receiver The address to receive the claim reward.
     *
     * Requirements:
     *
     * - Only the account with _GOVERNOR_ROLE_ can access this function.
     */
    function recoverClaim(address _account, address _receiver) external;

    /**
     * @dev Recover reward tokens claim on the behalf of `msg.sender` for `_receiver`.
     * @param _receiver The address to receive the claim reward.
     *
     * Requirements: None
     */
    function claim(address _receiver) external;
}
