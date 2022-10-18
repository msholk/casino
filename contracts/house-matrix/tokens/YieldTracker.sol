//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./interfaces/IYieldTracker.sol";
import "../distributors/interfaces/ITimeDistributor.sol";

import { LibRoleGlobals as rGlobals } from "./libraries/LibRoles.sol";
import { LibYieldTracker as yTracker, LibYieldGlobals as yGlobals } from "./libraries/LibYieldFarm.sol";


/**
 * @title YieldTracker
 * @notice Deposit liquidity tokens to earn rewards tokens over time.
 * @dev Staking pool where tokens are staked for rewards tokens.
 * 
 * A Distributor contract decides how much reward tokens a staking pool can earn over time.
 */
contract YieldTracker is AccessControl, ReentrancyGuard, IYieldTracker {
    address public yieldToken;
    address public distributor;

    mapping (address => uint256) public previousCumulatedRewardPerToken;
    mapping (address => uint256) public claimableReward;

    constructor(address _yieldToken) {
        _setRoleAdmin(rGlobals._GOVERNOR_ROLE_, rGlobals._GOVERNOR_ROLE_);
        _setRoleAdmin(rGlobals._DISTRIBUTOR_ROLE_, rGlobals._GOVERNOR_ROLE_);
        _setRoleAdmin(rGlobals._YIELD_TOKEN_ROLE_, rGlobals._GOVERNOR_ROLE_);
        
        yieldToken = _yieldToken;

        _setupRole(rGlobals._GOVERNOR_ROLE_, _msgSender());
        _setupRole(rGlobals._YIELD_TOKEN_ROLE_, yieldToken);
    }

    /**
     * See {IYieldTracker:IYieldTracker-setDistributor}.
     */
    function setDistributor(address _distributor) external onlyRole(rGlobals._GOVERNOR_ROLE_) {
        distributor = _distributor;
    }

    /**
     * See {IYieldTracker:IYieldTracker-claim}.
     */
    function claim(address _account, address _receiver)
        external
        onlyRole(rGlobals._YIELD_TOKEN_ROLE_)
        returns (uint256)
    {
        yTracker.updateRewards(
            _account,
            distributor,
            yieldToken,
            previousCumulatedRewardPerToken,
            claimableReward
        );
        
        return yTracker.claim(
            _account,
            _receiver,
            distributor,
            previousCumulatedRewardPerToken
        );
    }

    /**
     * See {IYieldTracker:IYieldTracker-getTokensPerInterval}.
     */
    function getTokensPerInterval() external view returns (uint256) {
        return ITimeDistributor(distributor).tokensPerInterval(address(this));
    }

    function claimable(address _account) external view returns (uint256) {
        return yTracker.claimable(
            _account,
            distributor,
            yieldToken,
            previousCumulatedRewardPerToken[_account],
            claimableReward[_account]
        );
    }

    /**
     * See {IYieldTracker:IYieldTracker-updateRewards}.
     */
    function updateRewards(address _account) external nonReentrant {
        yTracker.updateRewards(
            _account,
            distributor,
            yieldToken,
            previousCumulatedRewardPerToken,
            claimableReward
        );
    }
}
