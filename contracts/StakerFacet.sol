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
        // s.hs.houseBalancePr2 = 10_000 ;
        LibDiamond.setContractOwner(msg.sender);
    }

    function withdrawAllStakerDAI() public {
        if (!s.hs.stakerExists[msg.sender]) {
            revert("You are not a staker");
        }
        mapping(address => uint256) storage stakersPercentagesPr18 = s
            .hs
            .stakersPercentagesPr18;
        uint256 stakerPercent = stakersPercentagesPr18[msg.sender];
        require(stakerPercent > 0, "Your precent iz ZERO");
        require(s.hs.houseBalancePr2 > 0, "House balance iz ZERO");
        uint256 oldBalance = s.hs.houseBalancePr2;
        uint256 stakerOldAmount = (oldBalance * stakerPercent) /
            PERCENT_PRECISION;
        s.hs.houseBalancePr2 -= oldBalance;
        uint256 newBalance = s.hs.houseBalancePr2;
        stakersPercentagesPr18[msg.sender] = 0;
        ////////////////////////////////////
        address[] storage stakersList = s.hs.stakersList;
        uint256 stakersListCount = stakersList.length;
        for (uint256 index; index < stakersListCount; ++index) {
            address stakerAddress = stakersList[index];
            uint256 iStakerPercent = stakersPercentagesPr18[stakerAddress];
            uint256 iStakerOldAmount = (oldBalance * iStakerPercent) /
                PERCENT_PRECISION;
            uint256 stakerNewPercent = (iStakerOldAmount * PERCENT_PRECISION) /
                newBalance;
            stakersPercentagesPr18[stakerAddress] = stakerNewPercent;

            // console.log(
            //     "Percent change",
            //     index,
            //     iStakerPercent,
            //     stakerNewPercent
            // );
        }

        ////////////////////////////////////////////////////////////////
        require(stakerOldAmount > 0, "Your balance iz ZERO");
        if (stakerOldAmount > 0) {
            IERC20 dai = IERC20(DAI);
            dai.approve(address(this), stakerOldAmount);
            dai.transfer(msg.sender, stakerOldAmount);
        }
    }

    function stakeETH() public payable {
        IWETH weth = IWETH(WETH);
        weth.deposit{value: msg.value}();
        IUniswapV2Router router = IUniswapV2Router(UNISWAP_V2_ROUTER);
        weth.approve(address(router), msg.value);

        address[] memory path;
        path = new address[](2);
        path[0] = WETH; //_tokenIn;
        path[1] = DAI; //_tokenOut

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
        uint256 daiPrecision2 = daiAmountOut / 1e16;

        uint256 leftOver = daiAmountOut - daiPrecision2 * 1e16;
        //uint256 newBalance = oldBalance + daiAmountOut;
        uint256 oldBalanceP2 = s.hs.houseBalancePr2;
        s.hs.houseBalancePr2 += daiPrecision2;
        s.platformBalancePr18 += leftOver;

        if (!s.hs.stakerExists[msg.sender]) {
            addBalnceToNewStaker(oldBalanceP2, daiPrecision2);
        } else {
            addBalnceToExistingStaker(oldBalanceP2, daiPrecision2);
        }
    }

    function addBalnceToExistingStaker(
        uint256 oldBalanceP2,
        uint256 depositingDAIBalanceP2
    ) private {
        uint256 newBalanceP2 = oldBalanceP2 + depositingDAIBalanceP2;
        address[] storage stakersList = s.hs.stakersList;
        uint256 stakersListCount = stakersList.length;
        mapping(address => uint256) storage stakersPercentagesPr18 = s
            .hs
            .stakersPercentagesPr18;

        uint256 stakersPercentByNowP18 = stakersPercentagesPr18[msg.sender];
        uint256 stakersBalanceByNowP18 = (stakersPercentByNowP18 *
            oldBalanceP2) / 100;

        for (uint256 index; index < stakersListCount; ++index) {
            address stakerAddress = stakersList[index];
            uint256 stakerPercentP18 = stakersPercentagesPr18[stakerAddress];
            uint256 stakerOldAmountP18 = (oldBalanceP2 * stakerPercentP18) /
                100;
            uint256 stakerNewPercentP18 = (stakerOldAmountP18 * 100) /
                newBalanceP2;
            uint256 stakerNewPercentFirstDecimal = ((stakerOldAmountP18 *
                1000) / newBalanceP2) % 10;
            if (stakerNewPercentFirstDecimal >= 5) {
                stakerNewPercentP18++;
            }
            stakersPercentagesPr18[stakerAddress] = stakerNewPercentP18;

            // console.log(
            //     "Percent change",
            //     index,
            //     stakerPercentP18,
            //     stakerNewPercentP18
            // );
        }

        uint256 currentStakerNewBalanceP18 = depositingDAIBalanceP2 *
            1e16 +
            stakersBalanceByNowP18;
        uint256 currentStakerNewPercentP18 = (currentStakerNewBalanceP18 *
            1e18) /
            newBalanceP2 /
            1e16;
        uint256 currentStakerNewPercentFirstDecimal = ((currentStakerNewBalanceP18 *
                1e19) /
                newBalanceP2 /
                1e16) % 10;
        if (currentStakerNewPercentFirstDecimal >= 5) {
            currentStakerNewPercentP18++;
        }

        stakersPercentagesPr18[msg.sender] = currentStakerNewPercentP18;
        // console.log("Updated staker", stakersPercentagesPr18[msg.sender]);
    }

    function addBalnceToNewStaker(
        uint256 oldBalanceP2,
        uint256 depositingDAIBalanceP2
    ) private {
        uint256 newBalanceP2 = oldBalanceP2 + depositingDAIBalanceP2;
        address[] storage stakersList = s.hs.stakersList;
        uint256 stakersListCount = stakersList.length;
        mapping(address => uint256) storage stakersPercentagesPr18 = s
            .hs
            .stakersPercentagesPr18;
        for (uint256 index; index < stakersListCount; ++index) {
            address stakerAddress = stakersList[index];
            uint256 stakerPercentPr18 = stakersPercentagesPr18[stakerAddress];
            uint256 stakerOldAmountP18 = (oldBalanceP2 * stakerPercentPr18) /
                1e2;
            uint256 stakerNewPercentP18 = (stakerOldAmountP18 * 100) /
                newBalanceP2;
            uint256 stakerNewPercentFirstDecimal = ((stakerOldAmountP18 *
                1000) / newBalanceP2) % 10;
            if (stakerNewPercentFirstDecimal >= 5) {
                stakerNewPercentP18++;
            }
            stakersPercentagesPr18[stakerAddress] = stakerNewPercentP18;

            // console.log(
            //     "Percent change",
            //     index,
            //     stakerPercentPr18,
            //     stakerNewPercentP18
            // );
        }

        s.hs.stakersList.push(msg.sender);
        s.hs.stakerExists[msg.sender] = true;
        // console.log(depositingDAIBalanceP2, newBalanceP2);
        uint256 currentStakerNewPercentP18 = (depositingDAIBalanceP2 * 1e18) /
            newBalanceP2;
        uint256 currentStakerNewPercentFirstDecimal = ((depositingDAIBalanceP2 *
            1e19) / newBalanceP2) % 10;
        if (currentStakerNewPercentFirstDecimal >= 5) {
            currentStakerNewPercentP18++;
        }

        stakersPercentagesPr18[msg.sender] = currentStakerNewPercentP18;
        // console.log("New staker", stakersPercentagesPr18[msg.sender]);
    }

    function checkStakerBalance()
        public
        view
        returns (uint256 stakerPercent, uint256 newHouseBalance)
    {
        if (!s.hs.stakerExists[msg.sender]) {
            return (0, s.hs.houseBalancePr2);
        }

        mapping(address => uint256) storage stakersPercentagesPr18 = s
            .hs
            .stakersPercentagesPr18;
        return (stakersPercentagesPr18[msg.sender], s.hs.houseBalancePr2);
    }
}
