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
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract PlayersFacet is VRFConsumerBaseV2 {
  AppStorage s;
  // Mumbai coordinator. For other networks,
  // see https://docs.chain.link/docs/vrf-contracts/#configurations
  address constant vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;
  address constant link_token_contract =
    0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
  bytes32 constant keyhash =
    0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;

  // VRFCoordinatorV2Interface COORDINATOR;

  constructor() VRFConsumerBaseV2(vrfCoordinator) {
    //Set to test withoud diamond
    LibDiamond.setContractOwner(msg.sender);
  }

  function subscribe() public {
    VRFCoordinatorV2Interface COORDINATOR = VRFCoordinatorV2Interface(
      vrfCoordinator
    );
    VrfInfoStruct storage vrfInfo = s.rcs.vrfInfo;
    vrfInfo.subscriptionId = COORDINATOR.createSubscription();
    // Add this contract as a consumer of its own subscription.
    COORDINATOR.addConsumer(vrfInfo.subscriptionId, address(this));
    console.log("Subscription id", vrfInfo.subscriptionId);
    console.log("Consumer addr", address(this));

    LinkTokenInterface LINKTOKEN = LinkTokenInterface(link_token_contract);
    uint256 linkBalance = LINKTOKEN.balanceOf(address(this));
    console.log("linkBalance", linkBalance);
    if (linkBalance == 0) {
      revert("Transfer me some LINK tokens");
    }
    LINKTOKEN.transferAndCall(
      address(COORDINATOR),
      linkBalance,
      abi.encode(vrfInfo.subscriptionId)
    );

    console.log("Requesting number.....");
    uint256 s_requestId = COORDINATOR.requestRandomWords(
      keyhash,
      vrfInfo.subscriptionId,
      /*REQUEST_CONFIRMATIONS*/
      3,
      /*CALLBACK_GAS_LIMIT*/
      1000000,
      /*NUM_WORDS*/
      1
    );
    console.log("Requesting number.....", s_requestId);
  }

  // error OnlyCoordinatorCanFulfill(address have, address want);

  function depositETH() public payable {
    /*IWETH weth = IWETH(WETH);
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
        //@audit-issue when testing on hardat the result is 1270, when using foundry, it is a bigint that could be remove 16 decimals
        uint256 daiAmountOut = amounts[1]; /// 1e16;
        // //console.log("PlayersFacet. adding to");
        // //console.log("swapExactTokensForTokens ******************************");
        // //console.log(amounts[0]);
        // //console.log(amounts[1]);
        uint256 daiPrecision2 = daiAmountOut / 1e16;

        uint256 leftOver = daiAmountOut - daiPrecision2 * 1e16;
        ////console.log(daiPrecision2, leftOver);
        s.cs.playersBalancesPr2[msg.sender] += daiPrecision2;
        s.platformBalance += leftOver;*/
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
    // //console.log(s.cs.playersBalancesPr2[msg.sender], uint256(price));
    return (s.cs.playersBalancesPr2[msg.sender], price);
  }

  function withdrawDAI() public {
    /*mapping(address => uint256) storage playersBalancesPr2 = s
            .cs
            .playersBalancesPr2;
        uint256 balance = playersBalancesPr2[msg.sender] * 1e16;
        if (balance > 0) {
            IERC20 dai = IERC20(DAI);
            dai.approve(address(this), balance);
            dai.transfer(msg.sender, balance);
            playersBalancesPr2[msg.sender] = 0;
        }*/
  }

  function setVrfInfo(VrfInfoStruct calldata _vrfInfo) public {
    LibDiamond.enforceIsContractOwner();
    VrfInfoStruct storage vrfInfo = s.rcs.vrfInfo;
    vrfInfo.subscriptionId = _vrfInfo.subscriptionId;
    vrfInfo.vrfCoordinatorAddress = _vrfInfo.vrfCoordinatorAddress;
    vrfInfo.keyHash = _vrfInfo.keyHash;
    //COORDINATOR.addConsumer(s_subscriptionId, address(this));
    //console.log(
    //     "PlayersFacet(vrfInfo.vrfCoordinatorAddress)",
    //     vrfInfo.vrfCoordinatorAddress
    // );
  }

  function placeBet(BetPointPrm[] calldata betPoints) public {
    RouletteLaunchLib.checkRouletteIsUnlockedForPlayer(s.rcs, betPoints);

    uint256 playerBalance = s.cs.playersBalancesPr2[msg.sender];
    require(playerBalance >= 100, "Balance is empty");
    uint256 totalBetSum = RouletteLaunchLib.getTotalBetSum(betPoints);

    uint256 lockHouseAmount = LibRulette.getRequiredHouseLockAmount(betPoints);
    console.log("Locking total:", lockHouseAmount);
    LibHLP.LockAmountFromHouse(s.hs, lockHouseAmount);
    CashierStorageLib.LockBetAmount(s.cs, totalBetSum, msg.sender);
    // //console.log("**********************************");

    RouletteLaunch storage rl = s.rcs.playersLaunchedRoulette[msg.sender];
    RouletteLaunchLib.storeBetPoints(rl, betPoints);
    rl.lockedHouseAmount = lockHouseAmount;

    rl.requestId = launchRoulette();
    s.rcs.userAddressByRequestId[rl.requestId] = msg.sender;
    // //console.log(
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

    require(vrfInfo.vrfCoordinatorAddress != address(0x0), "vrfInfo not set");
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

  // // rawFulfillRandomness is called by VRFCoordinator when it receives a valid VRF
  // // proof. rawFulfillRandomness then calls fulfillRandomness, after validating
  // // the origin of the call
  // function rawFulfillRandomWords(
  //     uint256 requestId,
  //     uint256[] memory randomWords
  // ) external {
  //     console.log("rawFulfillRandomWords", requestId, randomWords[0]);
  //     if (msg.sender != s.rcs.vrfInfo.vrfCoordinatorAddress) {
  //         revert OnlyCoordinatorCanFulfill(
  //             msg.sender,
  //             s.rcs.vrfInfo.vrfCoordinatorAddress
  //         );
  //     }
  //     console.log("rawFulfillRandomWords", requestId, randomWords[0]);
  //     fulfillRandomWords(requestId, randomWords);
  // }

  event RouletteStopped(
    uint256 requestId,
    uint256 randomWord,
    uint256 resultNum
  );
  event RouletteStoppedVRFCallReceived();
  event RouletteStoppedRequestIdRecognized(bool);
  event RouletteLaunchOfPlayerFound(bool);
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
    override
  {
    console.log("fulfillRandomWords", requestId, randomWords[0]);
    emit RouletteStoppedVRFCallReceived();

    uint256 resultnum = randomWords[0] % 38;
    if (resultnum == 0) {
      resultnum = 38;
    }
    uint8 resultnum8 = uint8(resultnum);
    emit RouletteStopped(requestId, randomWords[0], resultnum);
    // //console.log(
    //     "emitting RouletteStopped",
    //     requestId,
    //     randomWords[0],
    //     resultnum
    // );
    address playerAddress = s.rcs.userAddressByRequestId[requestId];

    if (playerAddress == address(0)) {
      //request not registered
      //console.log("playerAddress is empty");
      emit RouletteStoppedRequestIdRecognized(false);
      return;
    }
    delete s.rcs.userAddressByRequestId[requestId];
    emit RouletteStoppedRequestIdRecognized(true);

    RouletteLaunch memory rl = s.rcs.playersLaunchedRoulette[playerAddress];
    if (rl.requestId != requestId) {
      emit RouletteLaunchOfPlayerFound(false);
      //console.log("rl.requestId != requestId");
      return; //Don't revert
    }
    //console.log("emitting RouletteLaunchOfPlayerFound(true)");
    emit RouletteLaunchOfPlayerFound(true);

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
      //console.log(
      //     "returned winfactor",
      //     index,
      //     totalBetSum,
      //     totalWinSum
      // );
    }
    //console.log("Betpoints calculated");

    //unlock balances
    LibHLP.UnlockBalances(s.hs, rl.lockedHouseAmount);
    CashierStorageLib.UnlockBetAmount(s.cs, totalBetSum, playerAddress);
    int256 payDiff = int256(totalBetSum);

    if (totalWinSum > 0) {
      //console.log(
      //     "Player wins",
      //     totalWinSum * 1e2,
      //     s.cs.playersBalancesPr2[playerAddress]
      // );
      s.cs.playersBalancesPr2[playerAddress] += totalWinSum * 1e2; //keeps in Cahsier
      payDiff -= int256(totalWinSum);
    }

    if (payDiff < 0) {
      //console.log("House=>Cashier", uint256(-payDiff));
      //player wins amount
      //transfer from HLP to Cashier
      LibHLP.transferFromHouse2Cashier(s, uint256(-payDiff));
    } else if (payDiff > 0) {
      //player lost all
      //transfer from to Cashier to HLP
      LibHLP.transferFromCashierToHouse(s, uint256(payDiff));
    }
    /*  //console.log("payDiff", payDiff);
        //console.log("emitting RouletteStoppedPrizeInfo");*/
    emit RouletteStoppedPrizeInfo(
      requestId,
      randomWords[0],
      resultnum,
      winByPosition
    );
  }
}
