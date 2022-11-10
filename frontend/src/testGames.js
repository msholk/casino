/*
 *       1       2       3       4       5       6       7       8       9       10
 *      1,4     2,5     3,6     4,7     5,8     6,9     7,10    8,11    9,12    10,13
 * +10  11,14   12,15   13,16   14,17   15,18   16,19   17,20   18,21   19,22   20,23
 * +20  21,24   22,25   23,26   24,27   25,28   26,29   27,30   28,31   29,32   30,33
 * +30  31,34   32,35   33,36
 */
function bet2WinFactor(betDet, winNum) {
  var winFactor = 18;
  if (betDet == winNum) {
    return winFactor;
  }
  if (betDet + 3 == winNum) {
    return winFactor;
  }
  return 0;
}
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function getRandomIntInclusive(min, max) {
  return Math.floor(((Math.random() * 1000000) % max) + 1); // The maximum is inclusive and the minimum is inclusive
}
function playManyGeames() {
  let GAMES_TO_PLAY = 10000000;
  let houseBalance = 10000;
  let initHouseBalance = 10000;
  let playerBetsAmount = 100;
  let comission = playerBetsAmount * 0.0526 * 0.3;
  let minB = houseBalance;
  let maxB = houseBalance;
  let revenuBalance = houseBalance;
  let revenue = 0;
  for (let iGame = 0; iGame < GAMES_TO_PLAY; iGame++) {
    let userBetsOn = getRandomIntInclusive(1, 33);
    let rouletteGives = getRandomIntInclusive(1, 38);
    const winFact = bet2WinFactor(userBetsOn, rouletteGives);

    if (winFact) {
      houseBalance -= 17 * playerBetsAmount;
      // const comissionAmount = 17 * playerBetsAmount * 0.0003;
      // houseBalance -= comissionAmount;
      // revenue += comissionAmount;
    } else {
      if (houseBalance >= revenuBalance) {
        houseBalance += playerBetsAmount * 0.7;
        revenue += playerBetsAmount * 0.3;
        revenuBalance = houseBalance;

        // const comissionAmount = playerBetsAmount * 0.00026;
        // houseBalance -= comissionAmount;
        // revenue += comissionAmount;
      } else {
        houseBalance += playerBetsAmount;
      }
    }
    // houseBalance -= comission;
    //   console.log(
    //     `${iGame}: house balance:${houseBalance} ${userBetsOn}:${rouletteGives}`
    //   );
    minB = Math.min(minB, houseBalance);
    maxB = Math.max(maxB, houseBalance);
  }
  let netWin = houseBalance - initHouseBalance;
  let allBetSum = playerBetsAmount * GAMES_TO_PLAY;
  const profitOverAllBets = Math.round((netWin / allBetSum) * 10000) / 100;
  revenue = numberWithCommas(Math.round(revenue));
  houseBalance = numberWithCommas(Math.round(houseBalance));
  minB = numberWithCommas(Math.round(minB));
  maxB = numberWithCommas(Math.round(maxB));

  console.log(
    `minB:${minB}:  maxB:${maxB}  houseBalance:${houseBalance} ${comission} Profit over all bets:${profitOverAllBets}% revenue:${revenue}`
  );
}
for (let index = 0; index < 10; index++) {
  playManyGeames();
}
