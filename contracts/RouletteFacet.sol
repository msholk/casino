// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./VRFContract.sol";
import "contracts/libraries/roulette/BetPointPrm.sol";
import "contracts/libraries/roulette/RouletteLaunchLib.sol";
import "contracts/libraries/house/LibHLP.sol";

contract RouletteFacet is VRFContract {
  event RouletteLaunched(address indexed sender, uint256 requestId);
  event RouletteStopped(
    address indexed sender,
    uint256 indexed requestId,
    uint256 randomWord,
    uint256 resultNum
  );
  event RouletteStoppedVRFCallReceived(uint256 indexed requestId);
  event RouletteStoppedRequestIdRecognized(uint256 indexed requestId);
  event RouletteStoppedRequestIdNotRecognized(uint256 indexed requestId);
  event RouletteLaunchOfPlayerFound(uint256 indexed requestId);
  event RouletteLaunchOfPlayerNotFound(uint256 indexed requestId);
  event RouletteStoppedPrizeInfo(
    address indexed sender,
    uint256 indexed requestId,
    uint256 randomWord,
    uint256 resultNum,
    uint256[10] winByPosition
  );
  uint256 constant CHIPS_IN_ETH = 1000;

  function chipsToEth(uint256 chips) private pure returns (uint256 eth) {
    return (chips * 1e18) / CHIPS_IN_ETH;
  }

  function ethToChips(uint256 eth) private pure returns (uint256 chips) {
    return (eth * CHIPS_IN_ETH) / 1e18;
  }

  function restAll() public {
    delete s;
    delete s.cs;
    delete s.hs;
    delete s.rcs;
    delete s.vrf;
    delete s.platformBalance;
    delete s.locked;
    delete s.myLog;
  }

  function resetRoulette() public {
    s.vrf.requests[msg.sender] = 0;
    delete s.vrf.requests[msg.sender];
    delete s.rcs.playersLaunchedRoulette[msg.sender];
    LibHLP.HouseUnlockAll(s.hs);
    CashierStorageLib.PlayerUnlockAll(s.cs, msg.sender);
  }

  function testGetAmounts()
    public
    view
    returns (
      uint256 houseLocked,
      uint256 playerLocked,
      uint256 requestId,
      uint256 playerBalance,
      uint256 stakerPercent,
      uint256 houseBalance,
      uint256 platformBalance
    )
  {
    return (
      s.hs.houseLockedBalance,
      s.cs.playersLockedBalances[msg.sender],
      s.rcs.playersLaunchedRoulette[msg.sender].requestId,
      s.cs.playersBalances[msg.sender],
      s.hs.stakersPercentages[msg.sender],
      s.hs.houseBalance,
      s.platformBalance
    );
  }

  function placeBet(BetPointPrm[] calldata betPoints, uint256 s_requestId)
    public
  {
    delete s.myLog;
    resetRoulette();
    RouletteLaunchLib.checkRouletteIsUnlockedForPlayer(s.rcs, betPoints);

    uint256 playerBalance = s.cs.playersBalances[msg.sender];
    uint256 playerBalanceChips = ethToChips(playerBalance);
    require(playerBalanceChips >= 1, "Balance is insufficient");
    uint256 totalBetChipsChips = RouletteLaunchLib.getTotalBetSum(betPoints);

    uint256 lockHouseAmountInChips = LibRulette.getRequiredHouseLockAmount(
      betPoints
    );
    uint256 lockHouseAmountInEth = chipsToEth(lockHouseAmountInChips);
    console.log("Locking total:", lockHouseAmountInEth);

    LibHLP.LockAmountFromHouse(s.hs, lockHouseAmountInEth);
    CashierStorageLib.LockBetAmount(
      s.cs,
      chipsToEth(totalBetChipsChips),
      msg.sender
    );
    // //console.log("**********************************");

    RouletteLaunch storage rl = s.rcs.playersLaunchedRoulette[msg.sender];
    RouletteLaunchLib.storeBetPoints(rl, betPoints);
    rl.lockedHouseAmountEth = lockHouseAmountInEth;

    requestRandomWords(s_requestId);

    // //console.log(
    //     "Placing the bet",
    //     rl.requestId,
    //     msg.sender,
    //     userAddressByRequestId[rl.requestId]
    // );
    emit RouletteLaunched(msg.sender, rl.requestId);
  }

  function testFulfillRandomWords(
    uint256 requestId,
    uint256[] memory randomWords
  ) public {
    fulfillRandomWords(requestId, randomWords);
  }

  function getLogCount() public view returns (uint256) {
    return s.myLog.length;
  }

  function getLog() public view returns (uint256[] memory content) {
    return s.myLog;
  }

  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
    internal
    override
  {
    s.myLog.push(1003);
    s.myLog.push(requestId);

    // s_randomWords = randomWords;
    // myLog.push("fulfillRandomWords");
    // myLog.push(string(abi.encodePacked("requestId:", requestId)));
    // myLog.push(string(abi.encodePacked(randomWords[0])));
    console.log("fulfillRandomWords", requestId, randomWords[0]);
    emit RouletteStoppedVRFCallReceived(requestId);

    uint256 resultnum = (randomWords[0] % 38) + 1;

    uint8 resultnum8 = uint8(resultnum);
    // myLog.push(string(abi.encodePacked("resultnum8:", requestId)));

    // //console.log(
    //     "emitting RouletteStopped",
    //     requestId,
    //     randomWords[0],
    //     resultnum
    // );
    address playerAddress = s.rcs.userAddressByRequestId[requestId];
    emit RouletteStopped(playerAddress, requestId, randomWords[0], resultnum);
    s.myLog.push(1004);
    s.myLog.push(uint256(uint160(playerAddress)));

    if (playerAddress == address(0)) {
      s.myLog.push(1006);
      // myLog.push("player not found for this address");
      //request not registered
      //console.log("playerAddress is empty");
      emit RouletteStoppedRequestIdNotRecognized(requestId);
      return;
    }
    // myLog.push("player is found ");
    s.myLog.push(1007);
    delete s.rcs.userAddressByRequestId[requestId];
    emit RouletteStoppedRequestIdRecognized(requestId);

    RouletteLaunch memory rl = s.rcs.playersLaunchedRoulette[playerAddress];
    s.myLog.push(1008);
    if (rl.requestId != requestId) {
      // s.myLog.push("rl.requestId != requestId ");
      // s.myLog.push(string(abi.encodePacked(rl.requestId)));
      s.myLog.push(1009);
      s.myLog.push(rl.requestId);
      emit RouletteLaunchOfPlayerNotFound(requestId);
      //   //console.log("rl.requestId != requestId");
      return; //Don't revert
    }
    s.myLog.push(1010);
    //console.log("emitting RouletteLaunchOfPlayerFound(true)");
    emit RouletteLaunchOfPlayerFound(requestId);
    // myLog.push("RouletteLaunchOfPlayer Found ");
    s.rcs.playersLaunchedRoulette[playerAddress].requestId = 0;
    s.vrf.requests_rand[requestId] = randomWords[0];

    delete s.rcs.playersLaunchedRoulette[playerAddress];
    uint256 totalBetChips;
    uint256 totalWinChips;
    uint256 betPointQnt = rl.betPoints.length;
    uint256[10] memory winByPosition;
    s.myLog.push(1011);
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
    s.myLog.push(1012);
    //console.log("Betpoints calculated");

    //unlock balances
    LibHLP.UnlockBalances(s.hs, rl.lockedHouseAmountEth);
    CashierStorageLib.UnlockBetAmount(
      s.cs,
      chipsToEth(totalBetChips),
      playerAddress
    );
    s.myLog.push(1013);
    int256 payDiffChips = int256(totalBetChips);

    if (totalWinChips > 0) {
      s.myLog.push(1014);
      console.log(
        "Player wins",
        totalWinChips,
        s.cs.playersBalances[playerAddress]
      );
      s.cs.playersBalances[playerAddress] += chipsToEth(totalWinChips); //keeps in Cahsier
      console.log("Updated balance", s.cs.playersBalances[playerAddress]);
      payDiffChips -= int256(totalWinChips);
    }
    s.myLog.push(1015);

    if (payDiffChips < 0) {
      s.myLog.push(1016);
      console.log("payDiffChips", uint256(-payDiffChips));
      //console.log("House=>Cashier", uint256(-payDiffChips));
      //player wins amount
      //transfer from HLP to Cashier
      LibHLP.transferFromHouse2Cashier(s, chipsToEth(uint256(-payDiffChips)));
    } else if (payDiffChips > 0) {
      //player lost all
      //transfer from to Cashier to HLP
      s.myLog.push(1017);
      LibHLP.transferFromCashierToHouse(s, chipsToEth(uint256(payDiffChips)));
    }

    emit RouletteStoppedPrizeInfo(
      playerAddress,
      requestId,
      randomWords[0],
      resultnum,
      winByPosition
    );
    s.myLog.push(1018);
  }
}
