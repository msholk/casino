// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IYieldTracker {
    /**
     * @dev Emitted when an account claims <Token> rewards.
     * @param receiver Account claiming.
     * @param amount Amount of <Token> claimed.
     */
    event Claim(address receiver, uint256 amount);

    /**
     * @dev Set the Distributor contract address for this staking pool. The distributor contract
     * calculates how much <Token> rewards this contract receives, and stores <Token> for
     * distribution.
     * @param _distributor The address of the Distributor contract.
     * 
     * Requirements:
     * 
     * - Only the account with _GOVERNOR_ROLE_ can access this function.
     */
    function setDistributor(address _distributor) external;


    function claim(address _account, address _receiver) external returns (uint256);
    function getTokensPerInterval() external view returns (uint256);
    function claimable(address _account) external view returns (uint256);
    function updateRewards(address _account) external;
}