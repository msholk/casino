// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/ITimeDistributor.sol";
import "hardhat/console.sol";


library LibTimeDistributorGlobals {
    uint256 public constant DISTRIBUTION_INTERVAL = 1 hours;
}

library LibTimeDistributorGetters {
    function getIntervals(uint256 _lastDistributionTime) public view returns (uint256) {
        return (block.timestamp - _lastDistributionTime) / LibTimeDistributorGlobals.DISTRIBUTION_INTERVAL;
    }

    function getDistributionAmount(
        address _timeDistributionAddress,
        address _receiver
    )
        public
        view
        returns (uint256)
    {
        ITimeDistributor _timeDistribution = ITimeDistributor(_timeDistributionAddress);

        return getDistributionAmount(
            _timeDistribution.rewardTokens(_receiver),
            _timeDistribution.tokensPerInterval(_receiver),
            _timeDistribution.lastDistributionTime(_receiver)
        );
    }
    
    function getDistributionAmount(
        address _rewardToken,
        uint256 _tokensPerInterval,
        uint256 _lastDistributionTime
    )
        public
        view
        returns (uint256)
    {
        if (_tokensPerInterval == 0) { return 0; }

        uint256 _amount = _tokensPerInterval * getIntervals(_lastDistributionTime);

        if (IERC20(_rewardToken).balanceOf(address(this)) < _amount) { return 0; }

        return _amount;
    }
}

library LibTimeDistributorUpdates {
    function updateLastDistributionTime() public view returns (uint256) {
        return (
            block.timestamp / LibTimeDistributorGlobals.DISTRIBUTION_INTERVAL * LibTimeDistributorGlobals.DISTRIBUTION_INTERVAL
        );
    }
}