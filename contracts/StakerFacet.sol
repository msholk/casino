// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/libraries/UniswapV2.sol";
import "contracts/libraries/constants.sol";
import "hardhat/console.sol";

import "contracts/diamond/libraries/LibDiamond.sol";
import "contracts/libraries/house/LibHLP.sol";
import "contracts/libraries/cashier/CashierStorageLib.sol";

contract StakerFacet {
    AppStorage s;
    uint256 constant PERCENT_PRECISION = 1E18;

    constructor() {
        //Set to test withoud diamond
        // s.hs.houseBalance = 10_000 ;
        LibDiamond.setContractOwner(msg.sender);
    }

    function withdrawAllStakerDAI() public {
        if (!s.hs.stakerExists[msg.sender]) {
            revert("You are not a staker");
        }
        mapping(address => uint256) storage stakersPercentages = s
            .hs
            .stakersPercentages;
        uint256 stakerPercent = stakersPercentages[msg.sender];
        require(stakerPercent > 0, "Your precent iz ZERO");
        require(s.hs.houseBalance > 0, "House balance iz ZERO");
        uint256 oldBalance = s.hs.houseBalance;
        uint256 stakerOldAmount = (oldBalance * stakerPercent) /
            PERCENT_PRECISION;
        s.hs.houseBalance -= oldBalance;
        uint256 newBalance = s.hs.houseBalance;
        stakersPercentages[msg.sender] = 0;
        ////////////////////////////////////
        for (uint256 index; index < stakersListCount; ++index) {
            address stakerAddress = stakersList[index];
            uint256 stakerPercent = stakersPercentages[stakerAddress];
            uint256 stakerOldAmount = (oldBalance * stakerPercent) /
                PERCENT_PRECISION;
            uint256 stakerNewPercent = (stakerOldAmount * PERCENT_PRECISION) /
                newBalance;
            stakersPercentages[stakerAddress] = stakerNewPercent;

            console.log(
                "Percent change",
                index,
                stakerPercent,
                stakerNewPercent
            );
        }

        ////////////////////////////////////////////////////////////////
        require(stakerOldAmount > 0, "Your balance iz ZERO");
        if (stakerOldAmount > 0) {
            IERC20 dai = IERC20(DAI);
            dai.approve(address(this), stakerOldAmount);
            dai.transfer(msg.sender, stakerOldAmount);
            playersBalances[msg.sender] = 0;
        }
    }

    function depositETH() public payable {
        IWETH weth = IWETH(WETH);
        weth.deposit{value: msg.value}();
        IUniswapV2Router router = IUniswapV2Router(UNISWAP_V2_ROUTER);
        weth.approve(address(router), msg.value);

        address[] memory path;
        path = new address[](2);
        path[0] = WETH;
        path[1] = DAI;

        uint256[] memory amounts = router.swapExactTokensForTokens(
            msg.value,
            1,
            path,
            address(this),
            block.timestamp
        );
        uint256 daiAmountOut = amounts[1]; /// 1e16;
        // console.log("PlayersFacet. adding to");
        // console.log(msg.sender);
        // console.log(amounts[1], daiAmountOut);
        uint256 oldBalance = s.hs.houseBalance;
        //uint256 newBalance = oldBalance + daiAmountOut;
        s.hs.houseBalance += daiAmountOut;

        if (!s.hs.stakerExists[msg.sender]) {
            addBalnceToNewStaker(oldBalance, daiAmountOut);
        } else {
            addBalnceToExistingStaker(oldBalance, daiAmountOut);
        }
    }

    function addBalnceToExistingStaker(
        uint256 oldBalance,
        uint256 depositingDAIBalance
    ) private {
        uint256 newBalance = oldBalance + depositingDAIBalance;
        address[] storage stakersList = s.hs.stakersList;
        uint256 stakersListCount = stakersList.length;
        mapping(address => uint256) storage stakersPercentages = s
            .hs
            .stakersPercentages;

        uint256 stakersPercentByNow = stakersPercentages[msg.sender];
        uint256 stakersBalanceByNow = (stakersPercentByNow * oldBalance) /
            PERCENT_PRECISION;

        for (uint256 index; index < stakersListCount; ++index) {
            address stakerAddress = stakersList[index];
            uint256 stakerPercent = stakersPercentages[stakerAddress];
            uint256 stakerOldAmount = (oldBalance * stakerPercent) /
                PERCENT_PRECISION;
            uint256 stakerNewPercent = (stakerOldAmount * PERCENT_PRECISION) /
                newBalance;
            stakersPercentages[stakerAddress] = stakerNewPercent;

            console.log(
                "Percent change",
                index,
                stakerPercent,
                stakerNewPercent
            );
        }

        stakersPercentages[msg.sender] =
            ((depositingDAIBalance + stakersBalanceByNow) * PERCENT_PRECISION) /
            newBalance;
        console.log("Updated staker", stakersPercentages[msg.sender]);
    }

    function addBalnceToNewStaker(
        uint256 oldBalance,
        uint256 depositingDAIBalance
    ) private {
        uint256 newBalance = oldBalance + depositingDAIBalance;
        address[] storage stakersList = s.hs.stakersList;
        uint256 stakersListCount = stakersList.length;
        mapping(address => uint256) storage stakersPercentages = s
            .hs
            .stakersPercentages;
        for (uint256 index; index < stakersListCount; ++index) {
            address stakerAddress = stakersList[index];
            uint256 stakerPercent = stakersPercentages[stakerAddress];
            uint256 stakerOldAmount = (oldBalance * stakerPercent) /
                PERCENT_PRECISION;
            uint256 stakerNewPercent = (stakerOldAmount * PERCENT_PRECISION) /
                newBalance;
            stakersPercentages[stakerAddress] = stakerNewPercent;

            console.log(
                "Percent change",
                index,
                stakerPercent,
                stakerNewPercent
            );
        }

        s.hs.stakersList.push(msg.sender);
        s.hs.stakerExists[msg.sender] = true;
        stakersPercentages[msg.sender] =
            (depositingDAIBalance * PERCENT_PRECISION) /
            newBalance;
        console.log("New staker", stakersPercentages[msg.sender]);
    }

    function checkStakerBalance()
        public
        view
        returns (uint256 stakerPercent, uint256 newHouseBalance)
    {
        if (!s.hs.stakerExists[msg.sender]) {
            return (0, s.hs.houseBalance);
        }

        mapping(address => uint256) storage stakersPercentages = s
            .hs
            .stakersPercentages;
        return (stakersPercentages[msg.sender], s.hs.houseBalance);
    }
}
