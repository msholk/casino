// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./roulette_related/VRFContract.sol";
import "./diamond/libraries/LibDiamond.sol";
import "./libraries/roulette/BetPointPrm.sol";
import "./libraries/roulette/RouletteLaunchLib.sol";
import "./libraries/house/LibHLP.sol";
import "hardhat/console.sol";

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

  function testGetAmounts()
    public
    view
    returns (
      uint256 houseLocked,
      uint256 playerLocked,
      uint256 requestId,
      uint256 playerBalance,
      uint256 houseBalance,
      uint256 platformBalance,
      uint256 revenueBalance
    )
  {
    return (
      s.hs.houseLockedBalance,
      s.cs.playersLockedBalances[msg.sender],
      s.rcs.playersLaunchedRoulette[msg.sender].requestId,
      s.cs.playersBalances[msg.sender],
      s.hs.houseBalance,
      s.platformBalance,
      s.hs.revenueBalance
    );
  }

  function placeBet(BetPointPrm[] calldata betPoints, uint256 s_requestId)
    public
  {
    RouletteLaunchLib.checkRouletteIsUnlockedForPlayer(s.rcs, betPoints);

    uint256 playerBalance = s.cs.playersBalances[msg.sender];
    uint256 playerBalanceChips = ethToChips(playerBalance);
    require(playerBalanceChips >= 1, "Balance is insufficient");
    uint256 totalBetChipsChips = RouletteLaunchLib.getTotalBetSum(betPoints);

    uint256 lockHouseAmountInChips = LibRulette.getRequiredHouseLockAmount(
      betPoints
    );
    uint256 lockHouseAmountInEth = chipsToEth(lockHouseAmountInChips);
    // console.log("Locking total:", lockHouseAmountInEth);

    LibHLP.LockAmountFromHouse(s.hs, lockHouseAmountInEth);
    CashierStorageLib.LockBetAmount(
      s.cs,
      chipsToEth(totalBetChipsChips),
      msg.sender
    );

    RouletteLaunch storage rl = s.rcs.playersLaunchedRoulette[msg.sender];
    RouletteLaunchLib.storeBetPoints(rl, betPoints);
    rl.lockedHouseAmountEth = lockHouseAmountInEth;

    requestRandomWords(s_requestId);

    emit RouletteLaunched(msg.sender, rl.requestId);
  }

  function testFulfillRandomWords(
    uint256 requestId,
    uint256[] memory randomWords
  ) public {
    LibDiamond.enforceIsContractOwner();
    fulfillRandomWords(requestId, randomWords);
  }

  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
    internal
    override
  {
    // console.log("fulfillRandomWords", requestId, randomWords[0]);
    emit RouletteStoppedVRFCallReceived(requestId);

    uint256 resultnum = (randomWords[0] % 38) + 1;

    uint8 resultnum8 = uint8(resultnum);

    address playerAddress = s.rcs.userAddressByRequestId[requestId];
    emit RouletteStopped(playerAddress, requestId, randomWords[0], resultnum);

    if (playerAddress == address(0)) {
      emit RouletteStoppedRequestIdNotRecognized(requestId);
      return;
    }

    delete s.rcs.userAddressByRequestId[requestId];
    emit RouletteStoppedRequestIdRecognized(requestId);

    RouletteLaunch memory rl = s.rcs.playersLaunchedRoulette[playerAddress];

    if (rl.requestId != requestId) {
      emit RouletteLaunchOfPlayerNotFound(requestId);

      return; //Don't revert
    }
    emit RouletteLaunchOfPlayerFound(requestId);
    s.rcs.playersLaunchedRoulette[playerAddress].requestId = 0;
    s.vrf.requests_rand[requestId] = randomWords[0];

    delete s.rcs.playersLaunchedRoulette[playerAddress];
    uint256 totalBetChips;
    uint256 totalWinChips;
    uint256 betPointQnt = rl.betPoints.length;
    uint256[10] memory winByPosition;
    for (uint256 index; index < betPointQnt; ++index) {
      BetPoint memory p = rl.betPoints[index];
      console.log("Revising bet position", index, p.betType, p.betDet);
      totalBetChips += p.amount;
      console.log(" .  totalBetChips", p.amount);
      //check bet param

      uint256 winFact = LibRulette.getWinFactor(
        p.betType,
        p.betDet,
        resultnum8
      );
      console.log(" .  winFact", winFact);

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

    //unlock balances
    LibHLP.UnlockBalances(s.hs, rl.lockedHouseAmountEth);
    CashierStorageLib.UnlockBetAmount(
      s.cs,
      chipsToEth(totalBetChips),
      playerAddress
    );
    int256 payDiffChips = int256(totalBetChips);

    if (totalWinChips > 0) {
      console.log(
        "Player wins",
        totalWinChips,
        s.cs.playersBalances[playerAddress]
      );
      s.cs.playersBalances[playerAddress] += chipsToEth(totalWinChips); //keeps in Cahsier
      console.log("Updated balance", s.cs.playersBalances[playerAddress]);
      payDiffChips -= int256(totalWinChips);
    }

    if (payDiffChips < 0) {
      //console.log("House=>Cashier", uint256(-payDiffChips));
      //player wins amount
      //transfer from HLP to Cashier
      LibHLP.transferFromHouse2Cashier(s, chipsToEth(uint256(-payDiffChips)));
    } else if (payDiffChips > 0) {
      //player lost all
      //transfer from to Cashier to HLP
      LibHLP.transferFromCashierToHouse(s, chipsToEth(uint256(payDiffChips)));
    }

    console.log("RouletteStoppedPrizeInfo", winByPosition[0], winByPosition[1]);

    emit RouletteStoppedPrizeInfo(
      playerAddress,
      requestId,
      randomWords[0],
      resultnum,
      winByPosition
    );
  }
}
