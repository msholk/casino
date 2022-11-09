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
function getRandomIntInclusive(min, max) {
  return Math.floor(((Math.random() * 1000000) % max) + 1); // The maximum is inclusive and the minimum is inclusive
}
function playManyGeames() {
  let GAMES_TO_PLAY = 10000000;
  let haouseBalance = 10000;
  let initHouseBalance = 10000;
  let playerBetsAmount = 200;
  let comission = playerBetsAmount * 0.0526 * 0.3;
  let minB = haouseBalance;
  let maxB = haouseBalance;
  for (let iGame = 0; iGame < GAMES_TO_PLAY; iGame++) {
    let userBetsOn = getRandomIntInclusive(1, 33);
    let rouletteGives = getRandomIntInclusive(1, 38);
    const winFact = bet2WinFactor(userBetsOn, rouletteGives);
    if (winFact) {
      haouseBalance -= 17;
    } else {
      haouseBalance += 1;
    }
    // haouseBalance -= comission;
    //   console.log(
    //     `${iGame}: house balance:${haouseBalance} ${userBetsOn}:${rouletteGives}`
    //   );
    minB = Math.min(minB, haouseBalance);
    maxB = Math.max(maxB, haouseBalance);
  }
  let netWin = haouseBalance - initHouseBalance;
  let allBetSum = playerBetsAmount * GAMES_TO_PLAY;
  console.log(
    `${Math.floor(minB)}:  ${Math.floor(maxB)}  ${Math.floor(
      haouseBalance
    )} ${comission} Profit over all bets:${
      Math.round((netWin / allBetSum) * 10000) / 100
    }%`
  );
}
for (let index = 0; index < 10; index++) {
  playManyGeames();
}
