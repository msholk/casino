// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./VRFContract.sol";
import "contracts/libraries/roulette/BetPointPrm.sol";
import "contracts/libraries/roulette/RouletteLaunchLib.sol";
import "contracts/libraries/house/LibHLP.sol";

contract RouletteFacet is VRFContract {
  event RouletteLaunched(uint256 requestId);
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
  uint256 constant CHIPS_IN_ETH = 1000;

  function test1() public {
    emit RouletteLaunched(1);
    emit RouletteLaunched(2);
    emit RouletteLaunched(3);
    emit RouletteLaunched(4);
  }

  function placeBet(BetPointPrm[] calldata betPoints) public {
    RouletteLaunchLib.checkRouletteIsUnlockedForPlayer(s.rcs, betPoints);

    uint256 playerBalance = s.cs.playersBalances[msg.sender];
    uint256 playerBalanceChips = (playerBalance * CHIPS_IN_ETH) / 10**15;
    require(playerBalanceChips >= 1, "Balance is insufficient");
    uint256 totalBetChips = RouletteLaunchLib.getTotalBetSum(betPoints);

    uint256 lockHouseAmountInChips = LibRulette.getRequiredHouseLockAmount(
      betPoints
    );
    uint256 lockHouseAmountInEth = lockHouseAmountInChips / CHIPS_IN_ETH;
    console.log("Locking total:", lockHouseAmountInEth);

    LibHLP.LockAmountFromHouse(s.hs, lockHouseAmountInEth);
    CashierStorageLib.LockBetAmount(
      s.cs,
      totalBetChips / CHIPS_IN_ETH,
      msg.sender
    );
    // //console.log("**********************************");

    RouletteLaunch storage rl = s.rcs.playersLaunchedRoulette[msg.sender];
    RouletteLaunchLib.storeBetPoints(rl, betPoints);
    rl.lockedHouseAmountEth = lockHouseAmountInEth;

    requestRandomWords();

    // //console.log(
    //     "Placing the bet",
    //     rl.requestId,
    //     msg.sender,
    //     userAddressByRequestId[rl.requestId]
    // );
    emit RouletteLaunched(rl.requestId);
  }

  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
    internal
    override
  {
    // s_randomWords = randomWords;
    s.vrf.requests_rand[requestId] = randomWords[0];

    console.log("fulfillRandomWords", requestId, randomWords[0]);
    emit RouletteStoppedVRFCallReceived();

    uint256 resultnum = (randomWords[0] % 38) + 1;

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
    uint256 totalBetChips;
    uint256 totalWinChips;
    uint256 betPointQnt = rl.betPoints.length;
    uint256[10] memory winByPosition;
    for (uint256 index; index < betPointQnt; ++index) {
      BetPoint memory p = rl.betPoints[index];
      totalBetChips += p.amount;
      //check bet param

      uint256 winFact = LibRulette.getWinFactor(
        p.betType,
        p.betDet,
        resultnum8
      );

      if (winFact > 0) {
        uint256 won = (p.amount * winFact);
        totalWinChips += won;
        p.won = won;
        winByPosition[index] = won;
      }
      //console.log(
      //     "returned winfactor",
      //     index,
      //     totalBetChips,
      //     totalWinChips
      // );
    }
    //console.log("Betpoints calculated");

    //unlock balances
    LibHLP.UnlockBalances(s.hs, rl.lockedHouseAmountEth);
    CashierStorageLib.UnlockBetAmount(
      s.cs,
      totalBetChips / CHIPS_IN_ETH,
      playerAddress
    );
    int256 payDiffChips = int256(totalBetChips);

    if (totalWinChips > 0) {
      //console.log(
      //     "Player wins",
      //     totalWinChips * 1e2,
      //     s.cs.playersBalances[playerAddress]
      // );
      s.cs.playersBalances[playerAddress] += totalWinChips / CHIPS_IN_ETH; //keeps in Cahsier
      payDiffChips -= int256(totalWinChips);
    }

    if (payDiffChips < 0) {
      //console.log("House=>Cashier", uint256(-payDiffChips));
      //player wins amount
      //transfer from HLP to Cashier
      LibHLP.transferFromHouse2Cashier(
        s,
        uint256(-payDiffChips) / CHIPS_IN_ETH
      );
    } else if (payDiffChips > 0) {
      //player lost all
      //transfer from to Cashier to HLP
      LibHLP.transferFromCashierToHouse(
        s,
        uint256(payDiffChips) / CHIPS_IN_ETH
      );
    }
    /*  //console.log("payDiffChips", payDiffChips);
        //console.log("emitting RouletteStoppedPrizeInfo");*/
    emit RouletteStoppedPrizeInfo(
      requestId,
      randomWords[0],
      resultnum,
      winByPosition
    );
  }
}
