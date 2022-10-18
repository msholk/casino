// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ITimeDistributor {
    /**
     * @dev Emitted when `_amount` reward tokens are transferred to account `_receiver`.
     */
    event Distribute(address receiver, uint256 amount);

    /**
     * @dev Emitted when distribution mappings are changed.
     */
    event DistributionChange(address receiver, uint256 amount, address rewardToken);

    /**
     * @dev Emitted when the `_amount` of reward tokens per interval are changed for the account
     * `_receiver`.
     */
    event TokensPerIntervalChange(address receiver, uint256 amount);

    /**
     * @dev Get the mapped reward tokens to the `_receiver` account.
     */
    function rewardTokens(address _receiver) external view returns (address);

    /**
     * @dev Get the mapped tokens per interval to the `_receiver` account.
     */
    function tokensPerInterval(address _receiver) external view returns (uint256);

    /**
     * @dev Get the mapped last distribution time to the `_receiver` account.
     */
    function lastDistributionTime(address _receiver) external view returns (uint256);

    /**
     * @dev Get the calculated distribution amount where:
     *      amount = (tokens per interval) * (number of intervals since last distribution time)
     * @return uint256 The total distribution amount.
     * 
     * Requirements: None
     */
    function getDistributionAmount(address _receiver) external view returns (uint256);

    /**
     * @dev Set the `_amount` of reward tokens per interval for the account `_receiver`.
     * 
     * Requirements:
     * 
     * - Only the account with _ADMIN_ROLE_ can access this function.
     * - The `_receiver` cannot have a pending distribution.
     * 
     * Emits {TokensPerIntervalChanged} event.
     */
    function setTokensPerInterval(address _reciever, uint256 _amount) external;

    /**
     * @dev Set the distribution `_amounts` of each `_receivers` `_rewardTokens`.
     * 
     * Requirements:
     * 
     * - Only the account with _GOVERNOR_ROLE_ can access this function.
     * - No receiver in `_receivers` can have a pending distribution.
     * 
     * Emits {DistributionChange} event.
     */
    function setDistribution(
        address[] calldata _rewardTokens,
        address[] calldata _receivers,
        uint256[] calldata _amounts
    ) external;

    /**
     * @dev Distribute reward tokens to `msg.sender`.
     * @return The amount of reward tokens distributed to `msg.sender`.
     * 
     * Requirements: None
     * 
     * Emits {Distribute} event.
     */
    function distribute() external returns (uint256);
}
