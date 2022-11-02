// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./interfaces/IVault.sol";
import "./interfaces/IHLP.sol";
import "contracts/libraries/constants.sol";
import "hardhat/console.sol";

import "contracts/diamond/libraries/LibDiamond.sol";
import "contracts/libraries/house/LibHLP.sol";
import "contracts/libraries/cashier/CashierStorageLib.sol";

interface IStakerFacet {
    //------------------------------------------------------------------------------------------
    //---------------------------------NOT SURE IF WE KEEP THIS---------------------------------
    //------------------------------------------------------------------------------------------
    // function withdrawAllStakerDAI() external;
    //------------------------------------------------------------------------------------------
    //---------------------------------NOT SURE IF WE KEEP THIS---------------------------------
    //------------------------------------------------------------------------------------------
    function stakeETH() external payable;

    function checkStakerBalance(address _staker)
        external
        view
        returns (uint256 stakerPercent, uint256 stakerHlpBalance);
}

contract StakerFacet is IStakerFacet {
    AppStorage s;
    modifier noReentrant() {
        require(!s.locked, "No re-entrancy");
        s.locked = true;
        _;
        s.locked = false;
    }

    constructor() {
        //Set to test withoud diamond
        LibDiamond.setContractOwner(msg.sender);
    }

    function setHLPTokenAddress(address HLPtokenAddress) public {
        LibDiamond.enforceIsContractOwner();
        s.hlptoken = HLPtokenAddress;
    }

    function stakeETH() public payable {
        uint256 stakedValue = msg.value;
        uint256 oldHouseBalance = s.hs.houseBalance;
        s.hs.houseBalance += stakedValue;
        uint256 hlp2Mint;
        uint256 hlpSupply = IERC20(s.hlptoken).totalSupply();
        if (hlpSupply == 0) {
            hlp2Mint = msg.value * 1000;
        } else {
            uint OldVsNew = oldHouseBalance / (s.hs.houseBalance + msg.value);
            hlp2Mint = (hlpSupply * (1 - OldVsNew)) / OldVsNew;
        }
        IHLP(s.hlptoken).mint(msg.sender, hlp2Mint);
        // IVault(vault).hlpPoolDeposit{value: msg.value}(msg.sender, hlp2Mint);
    }

    function unStakeAllETH() public {
        uint256 userbalance = IERC20(s.hlptoken).balanceOf(msg.sender);
        IHLP(s.hlptoken).burn(msg.sender, userbalance);
        //amount rewards function goes to here.
        (bool success, uint256 amountToBurn) = IVault(
            0x0000000000000000000000000000000000000000
        ).hlpPoolWithdrawAsMuchAsYouCan(msg.sender);
        if (success) {
            IHLP(s.hlptoken).burn(msg.sender, amountToBurn);
        }
    }

    function unSomeStakeETH(uint256 _amount) public {
        uint256 userbalance = IERC20(s.hlptoken).balanceOf(msg.sender);
        require(_amount <= userbalance, "Staker doesn't have enough HLP token");
        bool success = IVault(0x0000000000000000000000000000000000000000)
            .hlpPoolWithdrawSome(msg.sender, _amount);
        if (success) {
            IHLP(s.hlptoken).burn(msg.sender, _amount);
        }
        //amount rewards function goes to here.
    }

    function checkStakerBalance(address _staker)
        public
        view
        returns (uint256 stakerPercent, uint256 stakerHlpBalance)
    {
        uint256 hlpSupply = IERC20(s.hlptoken).totalSupply();
        uint256 userbalance = IERC20(s.hlptoken).balanceOf(_staker);
        uint256 stakersPercentages = userbalance / hlpSupply;

        return (stakersPercentages, userbalance);
    }
    //------------------------------------------------------------------------------------------
    //---------------------------------NOT SURE IF WE KEEP THIS---------------------------------
    //------------------------------------------------------------------------------------------
    // function withdrawAllStakerDAI() public noReentrant {
    //     if (!s.hs.stakerExists[msg.sender]) {
    //         revert("You are not a staker");
    //     }
    //     mapping(address => uint256) storage stakersPercentages = s
    //         .hs
    //         .stakersPercentages;
    //     uint256 stakerPercent = stakersPercentages[msg.sender];
    //     require(stakerPercent > 0, "Your precent iz ZERO");
    //     require(s.hs.houseBalance > 0, "House balance iz ZERO");
    //     uint256 oldHouseBalance = s.hs.houseBalance;
    //     uint256 stakerOldAmount = (oldHouseBalance * stakerPercent) / 1e18;
    //     console.log("stakerOldAmount", stakerOldAmount);
    //     uint256 stakerOldAmountFirstDecimal = ((oldHouseBalance *
    //         stakerPercent) / 1e17) % 10;
    //     console.log("stakerOldAmountFirstDecimal", stakerOldAmountFirstDecimal);
    //     if (stakerOldAmountFirstDecimal >= 5) {
    //         stakerOldAmount++;
    //     }
    //     s.hs.houseBalance -= stakerOldAmount;
    //     uint256 newHouseBalance = s.hs.houseBalance;
    //     console.log("newHouseBalance", newHouseBalance);
    //     stakersPercentages[msg.sender] = 0;
    //     ////////////////////////////////////
    //     address[] storage stakersList = s.hs.stakersList;
    //     uint256 stakersListCount = stakersList.length;
    //     for (uint256 index; index < stakersListCount; ++index) {
    //         address stakerAddress = stakersList[index];
    //         if (newHouseBalance > 0) {
    //             uint256 iStakerPercent = stakersPercentages[stakerAddress];
    //             uint256 iStakerOldAmount = (oldHouseBalance * iStakerPercent) /
    //                 1e18;
    //             uint256 stakerNewPercent = (iStakerOldAmount * 1e18) /
    //                 newHouseBalance;
    //             stakersPercentages[stakerAddress] = stakerNewPercent;
    //         } else {
    //             stakersPercentages[stakerAddress] = 0;
    //         }
    //     }

    //     ////////////////////////////////////////////////////////////////
    //     require(stakerOldAmount > 0, "Your balance iz ZERO");
    //     require(
    //         stakerOldAmount <= address(this).balance,
    //         "Balance is less than platform has"
    //     );
    //     console.log("Withdrawing stakerOldAmount", stakerOldAmount);
    //     console.log("address(this).balance", address(this).balance);
    //     payable(msg.sender).transfer(stakerOldAmount);
    // }
    //------------------------------------------------------------------------------------------
    //---------------------------------NOT SURE IF WE KEEP THIS---------------------------------
    //------------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------------
    //---------------------------------NOT SURE IF WE KEEP THIS---------------------------------
    //------------------------------------------------------------------------------------------
    // function addBalnceToExistingStaker(
    //     uint256 oldHouseBalance,
    //     uint256 stakingValues
    // ) private {
    //     uint256 newBalance = oldHouseBalance + stakingValues;
    //     address[] storage stakersList = s.hs.stakersList;
    //     uint256 stakersListCount = stakersList.length;
    //     mapping(address => uint256) storage stakersPercentages = s
    //         .hs
    //         .stakersPercentages;

    //     uint256 stakersPercentByNow = stakersPercentages[msg.sender];
    //     uint256 stakersBalanceByNow = (stakersPercentByNow * oldHouseBalance) /
    //         1e18;

    //     for (uint256 index; index < stakersListCount; ++index) {
    //         address stakerAddress = stakersList[index];
    //         uint256 stakerPercent = stakersPercentages[stakerAddress];
    //         uint256 stakerOldAmount = (oldHouseBalance * stakerPercent) / 1e18;
    //         uint256 stakerNewPercent = (stakerOldAmount * 1e18) / newBalance;
    //         uint256 stakerNewPercentFirstDecimal = ((stakerOldAmount * 1e19) /
    //             newBalance) % 10;
    //         if (stakerNewPercentFirstDecimal >= 5) {
    //             stakerNewPercent++;
    //         }
    //         stakersPercentages[stakerAddress] = stakerNewPercent;

    //         // //console.log(
    //         //     "Percent change",
    //         //     index,
    //         //     stakerPercent,
    //         //     stakerNewPercent
    //         // );
    //     }

    //     uint256 currentStakerNewBalance = stakingValues + stakersBalanceByNow;
    //     uint256 currentStakerNewPercent = (currentStakerNewBalance * 1e18) /
    //         newBalance;
    //     uint256 currentStakerNewPercentFirstDecimal = ((currentStakerNewBalance *
    //             1e19) / newBalance) % 10;
    //     if (currentStakerNewPercentFirstDecimal >= 5) {
    //         currentStakerNewPercent++;
    //     }

    //     stakersPercentages[msg.sender] = currentStakerNewPercent;
    //     // //console.log("Updated staker", stakersPercentages[msg.sender]);
    // }

    // function addBalanceToNewStaker(
    //     uint256 oldHouseBalance,
    //     uint256 stakingAmount
    // ) private {
    //     uint256 newBalance = oldHouseBalance + stakingAmount;
    //     address[] storage stakersList = s.hs.stakersList;
    //     uint256 stakersListCount = stakersList.length;
    //     mapping(address => uint256) storage stakersPercentages = s
    //         .hs
    //         .stakersPercentages;
    //     //console.log("oldHouseBalance", oldHouseBalance);
    //     //console.log("stakingAmount", stakingAmount);
    //     //console.log("stakersListCount", stakersListCount);
    //     //console.log("newBalance", newBalance);
    //     for (uint256 index; index < stakersListCount; ++index) {
    //         //console.log("   recalculating percent for ", index);
    //         address stakerAddress = stakersList[index];
    //         uint256 stakerPercent = stakersPercentages[stakerAddress];
    //         //console.log("     stakerPercent ", stakerPercent);
    //         uint256 stakerOldAmount = (oldHouseBalance * stakerPercent) / 1e18;
    //         //console.log("     stakerOldAmount ", stakerOldAmount);
    //         uint256 stakerNewPercent = (stakerOldAmount * 1e18) / newBalance;
    //         //console.log("     stakerNewPercent ", stakerNewPercent);
    //         uint256 stakerNewPercentFirstDecimal = ((stakerOldAmount * 1e19) /
    //             newBalance) % 10;

    //         if (stakerNewPercentFirstDecimal >= 5) {
    //             stakerNewPercent++;
    //         }
    //         stakersPercentages[stakerAddress] = stakerNewPercent;

    //         // //console.log(
    //         //     "Percent change",
    //         //     index,
    //         //     stakerPercent,
    //         //     stakerNewPercent
    //         // );
    //     }

    //     s.hs.stakersList.push(msg.sender);
    //     s.hs.stakerExists[msg.sender] = true;
    //     // //console.log(stakingAmount, newBalance);
    //     uint256 currentStakerNewPercent = (stakingAmount * 1e18) / newBalance;
    //     uint256 currentStakerNewPercentFirstDecimal = ((stakingAmount * 1e19) /
    //         newBalance) % 10;
    //     if (currentStakerNewPercentFirstDecimal >= 5) {
    //         currentStakerNewPercent++;
    //     }

    //     //console.log("currentStakerNewPercent", currentStakerNewPercent);

    //     stakersPercentages[msg.sender] = currentStakerNewPercent;
    //     // //console.log("New staker", stakersPercentages[msg.sender]);
    // }

    //------------------------------------------------------------------------------------------
    //---------------------------------NOT SURE IF WE KEEP THIS---------------------------------
    //------------------------------------------------------------------------------------------
}
