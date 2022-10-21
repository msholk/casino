// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


interface IHouseVestingWallet {
    event ERC20Released(address indexed token, uint256 amount);

    /**
     * @dev Clone intializer.
     */
    function initialize(
        address _beneficiaryAddress,
        address _housePoolAddress,
        address _houseVestingGlobalsAddress,
        address[] calldata _erc20Tokens,
        uint256[] calldata _balances
    ) external payable;

    /**
     * @dev Setter for the GLP stake pool vault address.
     * 
     * Requirements:
     * 
     * - Only the _ADMIN_ROLE_ can access this function.
     */
    function setHousePoolVault(address _stakeHousePoolVault) external;

    /**
     * @dev Set house minimum vesting globals address.
     */
    function setHouseVestingGlobals(address _houseVestingGlobalsAddress) external;

    /**
     * @dev Getter for the beneficiary address.
     */
    function beneficiary() external view returns (address);

    /**
     * @dev Getter for the total ERC20 token balance (both staked and non-staked).
     */
    function totalSupply(address _token) external view returns (uint256);

    /**
     * @dev Getter for total staked ERC20 token.
     */
    function totalStakedSupply(address _token) external view returns (uint256);

    /**
     * @dev Getter for the start timestamp.
     */
    function start(address _token) external view returns (uint256);

    /**
     * @dev Getter for the vesting duration.
     */
    function duration() external view returns (uint256);

    /**
     * @dev Amount of token already released
     */
    function released(address token) external view returns (uint256);

    /**
     * @dev Release the native token (ether) that have already vested.
     *
     * Emits a {EtherReleased} event.
     */
    function release() external;

    /**
     * @dev Release the tokens that have already vested.
     *
     * Emits a {ERC20Released} event.
     */
    function release(address token) external;

    /**
     * @dev Calculates the amount of ether that has already vested. Default implementation is a linear vesting curve.
     */
    function vestedAmount(uint64 timestamp) external view returns (uint256);

    /**
     * @dev Calculates the amount of tokens that has already vested. Default implementation is a linear vesting curve.
     */
    function vestedAmount(address token, uint64 timestamp) external view returns (uint256);
}
