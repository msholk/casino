// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../interfaces/IYieldToken.sol";
import "../interfaces/IYieldTracker.sol";
import "../../distributors/interfaces/ITimeDistributor.sol";


library LibYieldGlobals {
    uint256 public constant PRECISION = 1e30;
}


library LibYieldTracker {
    using SafeERC20 for IERC20;
    
    /**
     * @dev Emitted when an account claims <Token> rewards.
     * @param receiver Account claiming.
     * @param amount Amount of <Token> claimed.
     */
    event Claim(address receiver, uint256 amount);

    function claim(
        address _account,
        address _receiver,
        address _distributor,
        mapping (address => uint256) storage claimableReward
    ) 
        public
        returns (uint256)
    {
        uint256 _tokenAmount = claimableReward[_account];
        claimableReward[_account] = 0;

        address _rewardToken = ITimeDistributor(_distributor).rewardTokens(address(this));
        IERC20(_rewardToken).safeTransfer(_receiver, _tokenAmount);

        emit Claim(_account, _tokenAmount);

        return _tokenAmount;
    }

    /**
     * @dev View to estimate the claimable reward for `_account`.
     * @notice Source at https://github.com/trusttoken/contracts-pre22/blob/main/contracts/truefi/TrueFarm.sol
     * @return claimable Claimable rewards for account.
     * 
     * Requirements: None
     */
    function claimable(
        address _account,
        address _distributor,
        address _yieldToken,
        uint256 _prevCumulatedReward,
        uint256 _claimableReward       
    ) public view returns (uint256) {
        uint256 _stakedBalance = IYieldToken(_yieldToken).stakedBalance(_account);

        if (_stakedBalance == 0) {
            return _claimableReward;
        }

        uint256 _pendingRewards = ITimeDistributor(_distributor).getDistributionAmount(address(this)) * LibYieldGlobals.PRECISION;
        uint256 _totalStaked = IYieldToken(_yieldToken).totalStakedSupply();
        uint256 _nextCumulativeRewardPerToken = _prevCumulatedReward + (_pendingRewards / _totalStaked);

        return _claimableReward + (
            _stakedBalance * (
                _nextCumulativeRewardPerToken - _prevCumulatedReward
            ) / LibYieldGlobals.PRECISION
        );
    }

    /**
     * @dev Update state and get reward tokens from `_distributor`.
     */
    function updateRewards(
        address _account,
        address _distributor,
        address _yieldToken,
        mapping (address => uint256) storage _cumulativeReward,
        mapping (address => uint256) storage _claimableReward       
    ) public {
        uint256 _blockReward;

        if(_distributor != address(0)) {
            _blockReward = ITimeDistributor(_distributor).distribute();
        }

        uint256 _totalStaked = IYieldToken(_yieldToken).totalStakedSupply();
        uint256 _prevCumulatedReward = _cumulativeReward[_account];

        // Only update cumulativeRewardPerToken when there are stakers
        // i.e. when _totalStaked > 0
        //
        // If _blockReward == 0, then there will be no change to cumulativeRewardPerToken.
        if (_totalStaked > 0 && _blockReward > 0) {
            _cumulativeReward[_account] += (
                _blockReward * LibYieldGlobals.PRECISION / _totalStaked
            );
        }

        // cumulativeRewardPerToken can only increase, so if cumulativeRewardPerToken is zero, 
        // there are no rewards yet.
        if (_cumulativeReward[_account] == 0) {
            return;
        } 

        if (_account != address(0)) {
            uint256 _stakedBalance = IYieldToken(_yieldToken).stakedBalance(_account);

            _claimableReward[_account] += (
                _stakedBalance * (
                    _cumulativeReward[_account] - _prevCumulatedReward
                ) / LibYieldGlobals.PRECISION
            );
        }
    }
}