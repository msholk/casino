// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/libraries/UniswapV2.sol";
import "contracts/libraries/constants.sol";
import "hardhat/console.sol";

import "contracts/diamond/libraries/LibDiamond.sol";
import "contracts/libraries/house/LibHLP.sol";
import "contracts/vrf/VrfStructs.sol";
import "contracts/libraries/cashier/CashierStorageLib.sol";
import "contracts/libraries/roulette/LibRulette.sol";
import "contracts/libraries/roulette/BetPointPrm.sol";
import "contracts/libraries/roulette/RouletteLaunchLib.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PlayersFacet {
    AppStorage s;

    constructor() {
        //Set to test withoud diamond
        // s.hs.houseBalance = 10_000 ;
        LibDiamond.setContractOwner(msg.sender);
    }

    error OnlyCoordinatorCanFulfill(address have, address want);

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
        //@audit-issue when testing on hardat the result is 1270, when using foundry, it is a bigint that could be remove 16 decimals
        uint256 daiAmountOut = amounts[1]; /// 1e16;
        // console.log("PlayersFacet. adding to");
        // console.log(msg.sender);
        // console.log(amounts[1], daiAmountOut);
        s.cs.playersBalances[msg.sender] += daiAmountOut;
    }

    // @title Getb player balance in DAI and current price of (1)DAI in ETH
    function checkPlayerBalance() public view returns (uint256, int256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(DAI_ETH);
        (
            ,
            /*uint80 roundID*/
            int256 price, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
            ,
            ,

        ) = priceFeed.latestRoundData();
        return (s.cs.playersBalances[msg.sender], price);
    }

    function withdrawDAI() public {
        mapping(address => uint256) storage playersBalances = s
            .cs
            .playersBalances;
        uint256 balance = playersBalances[msg.sender];
        if (balance > 0) {
            IERC20 dai = IERC20(DAI);
            dai.approve(address(this), balance);
            dai.transfer(msg.sender, balance);
            playersBalances[msg.sender] = 0;
        }
    }

    function setVrfInfo(VrfInfoStruct calldata _vrfInfo) public {
        LibDiamond.enforceIsContractOwner();
        VrfInfoStruct storage vrfInfo = s.rcs.vrfInfo;
        vrfInfo.subscriptionId = _vrfInfo.subscriptionId;
        vrfInfo.vrfCoordinatorAddress = _vrfInfo.vrfCoordinatorAddress;
        vrfInfo.keyHash = _vrfInfo.keyHash;
        console.log(
            "PlayersFacet(vrfInfo.vrfCoordinatorAddress)",
            vrfInfo.vrfCoordinatorAddress
        );
    }

    function placeBet(BetPointPrm[] calldata betPoints) public {
        RouletteLaunchLib.checkRouletteIsUnlockedForPlayer(s.rcs, betPoints);

        uint256 playerBalance = s.cs.playersBalances[msg.sender];
        require(playerBalance >= 1, "Balance is empty");
        uint256 totalBetSum = RouletteLaunchLib.getTotalBetSum(betPoints);

        LibHLP.LockMaxWinAmount(s.hs, totalBetSum);
        CashierStorageLib.LockBetAmount(s.cs, totalBetSum, msg.sender);
        // console.log("**********************************");

        RouletteLaunch storage rl = s.rcs.playersLaunchedRoulette[msg.sender];
        RouletteLaunchLib.storeBetPoints(rl, betPoints);

        rl.requestId = launchRoulette();
        s.rcs.userAddressByRequestId[rl.requestId] = msg.sender;
        // console.log(
        //     "Placing the bet",
        //     rl.requestId,
        //     msg.sender,
        //     userAddressByRequestId[rl.requestId]
        // );
        emit RouletteLaunched(rl.requestId);
    }

    event RouletteLaunched(uint256 requestId);

    /**
     * @notice Requests randomness
     * Assumes the subscription is funded sufficiently; "Words" refers to unit of data in Computer Science
     */
    function launchRoulette() private returns (uint256) {
        uint32 CALLBACK_GAS_LIMIT = 1000000;

        // The default is 3, but you can set this higher.
        uint16 REQUEST_CONFIRMATIONS = 3;

        // For this example, retrieve 2 random values in one request.
        // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
        uint32 NUM_WORDS = 1;
        // Will revert if subscription is not set and funded.
        VrfInfoStruct storage vrfInfo = s.rcs.vrfInfo;

        require(
            vrfInfo.vrfCoordinatorAddress != address(0x0),
            "vrfInfo not set"
        );
        VRFCoordinatorV2Interface COORDINATOR = VRFCoordinatorV2Interface(
            vrfInfo.vrfCoordinatorAddress
        );
        uint256 s_requestId = COORDINATOR.requestRandomWords(
            vrfInfo.keyHash,
            vrfInfo.subscriptionId,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );

        return s_requestId;
    }

    // rawFulfillRandomness is called by VRFCoordinator when it receives a valid VRF
    // proof. rawFulfillRandomness then calls fulfillRandomness, after validating
    // the origin of the call
    function rawFulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) external {
        if (msg.sender != s.rcs.vrfInfo.vrfCoordinatorAddress) {
            revert OnlyCoordinatorCanFulfill(
                msg.sender,
                s.rcs.vrfInfo.vrfCoordinatorAddress
            );
        }
        fulfillRandomWords(requestId, randomWords);
    }

    event RouletteStopped(
        uint256 requestId,
        uint256 randomWord,
        uint256 resultNum
    );
    event RouletteStoppedPrizeInfo(
        uint256 requestId,
        uint256 randomWord,
        uint256 resultNum,
        uint256[10] winByPosition
    );

    /**
     * @notice Callback function used by VRF Coordinator
     *
     * @param requestId - id of the request
     * @param randomWords - array of random results from VRF Coordinator
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
    {
        uint256 resultnum = randomWords[0] % 38;
        if (resultnum == 0) {
            resultnum = 38;
        }
        uint8 resultnum8 = uint8(resultnum);
        emit RouletteStopped(requestId, randomWords[0], resultnum);
        console.log("emitting RouletteStopped");
        address playerAddress = s.rcs.userAddressByRequestId[requestId];

        if (playerAddress == address(0)) {
            //request not registered
            console.log("playerAddress is empty");
            return;
        }
        delete s.rcs.userAddressByRequestId[requestId];

        RouletteLaunch memory rl = s.rcs.playersLaunchedRoulette[playerAddress];
        if (rl.requestId != requestId) {
            console.log("rl.requestId != requestId");
            return; //Don't revert
        }
        delete s.rcs.playersLaunchedRoulette[playerAddress];
        uint256 totalBetSum;
        uint256 totalWinSum;
        uint256 betPointQnt = rl.betPoints.length;
        uint256[10] memory winByPosition;
        for (uint256 index; index < betPointQnt; ++index) {
            BetPoint memory p = rl.betPoints[index];
            totalBetSum += p.amount;
            //check bet param

            uint256 winFact = LibRulette.getWinFactor(
                p.betType,
                p.betDet,
                resultnum8
            );

            if (winFact > 0) {
                uint256 won = (p.amount * winFact);
                totalWinSum += won;
                p.won = won;
                winByPosition[index] = won;
            }
            console.log("returned winfactor", index, totalBetSum, totalWinSum);
        }

        //unlock balances
        LibHLP.UnlockBalances(s.hs, totalBetSum);
        CashierStorageLib.UnlockBetAmount(s.cs, totalBetSum, playerAddress);
        int256 payDiff = int256(totalBetSum);

        if (totalWinSum > 0) {
            s.cs.playersBalances[playerAddress] += totalWinSum; //keeps in Cahsier
            payDiff -= int256(totalWinSum);
        }
        if (payDiff < 0) {
            //player wins amount
            //transfer from HLP to Cachier
            LibHLP.transferFromHLP2Cachier(s, uint256(-payDiff));
        } else if (payDiff > 0) {
            //player lost all
            //transfer from to Cachier to HLP
            LibHLP.transferFromCachierToHLP(s, uint256(payDiff));
        }
        console.log("emitting RouletteStoppedPrizeInfo");
        emit RouletteStoppedPrizeInfo(
            requestId,
            randomWords[0],
            resultnum,
            winByPosition
        );
    }
}
