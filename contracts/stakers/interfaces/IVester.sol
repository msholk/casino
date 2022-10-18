// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IVester {
    event Claim(address receiver, uint256 amount);
    event Deposit(address account, uint256 amount);
    event Withdraw(address account, uint256 claimedAmount, uint256 balance);
    event PairTransfer(address indexed from, address indexed to, uint256 value);

    // function rewardTracker() external view returns (address);

    // function claimForAccount(address _account, address _receiver) external returns (uint256);
    // function claimable(address _account) external view returns (uint256);

    // function pairAmounts(address _account) external view returns (uint256);
    // function cumulativeClaimAmounts(address _account) external view returns (uint256);
    // function claimedAmounts(address _account) external view returns (uint256);

    // function getVestedAmount(address _account) external view returns (uint256);
    
    // function transferredAverageStakedAmounts(address _account) external view returns (uint256);
    // function transferredCumulativeRewards(address _account) external view returns (uint256);
    // function cumulativeRewardDeductions(address _account) external view returns (uint256);
    // function bonusRewards(address _account) external view returns (uint256);

    // function transferStakeValues(address _sender, address _receiver) external;
    // function setTransferredAverageStakedAmounts(address _account, uint256 _amount) external;
    // function setTransferredCumulativeRewards(address _account, uint256 _amount) external;
    // function setCumulativeRewardDeductions(address _account, uint256 _amount) external;
    // function setBonusRewards(address _account, uint256 _amount) external;

    // function getMaxVestableAmount(address _account) external view returns (uint256);
    // function getCombinedAverageStakedAmount(address _account) external view returns (uint256);
}