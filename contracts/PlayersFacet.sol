// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/storage/AppStorage.sol";
import "contracts/libraries/constants.sol";
import "hardhat/console.sol";
import "contracts/diamond/libraries/LibDiamond.sol";
// import "contracts/libraries/house/LibHLP.sol";
// import "contracts/vrf/VrfStructs.sol";
// import "contracts/libraries/cashier/CashierStorageLib.sol";
// import "contracts/libraries/roulette/LibRulette.sol";
// import "contracts/libraries/roulette/BetPointPrm.sol";
// import "contracts/libraries/roulette/RouletteLaunchLib.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";

contract PlayersFacet {
  AppStorage s;

  constructor() {
    //Set to test withoud diamond
    LibDiamond.setContractOwner(msg.sender);
  }

  function depositToCashier() public payable {
    uint256 depositedAmount = msg.value;
    s.cs.playersBalances[msg.sender] += depositedAmount;
  }

  // @title Getb player balance in USD and current price of (1)MATIC in USD
  function checkPlayerBalance()
    public
    view
    returns (uint256 playerBalance, int256 priceInStable)
  {
    AggregatorV3Interface priceFeed = AggregatorV3Interface(NATIVE_TO_STABLE);
    (
      ,
      /*uint80 roundID*/
      int256 price, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
      ,
      ,

    ) = priceFeed.latestRoundData();
    // //console.log(s.cs.playersBalances[msg.sender], uint256(price));
    return (s.cs.playersBalances[msg.sender], price);
  }

  modifier noReentrant() {
    require(!s.locked, "No re-entrancy");
    s.locked = true;
    _;
    s.locked = false;
  }

  function withdrawPlayerBalance() public noReentrant {
    mapping(address => uint256) storage playersBalances = s.cs.playersBalances;
    uint256 balance = playersBalances[msg.sender];

    require(balance > 0, "Your balance iz ZERO");
    require(
      balance <= address(this).balance,
      "Balance is less than platform has"
    );
    s.cs.playersBalances[msg.sender] = 0;
    payable(msg.sender).transfer(balance);
  }

  function withdrawPlayerBalanceAmount(uint256 amount) public noReentrant {
    mapping(address => uint256) storage playersBalances = s.cs.playersBalances;
    uint256 balance = playersBalances[msg.sender];

    require(balance > 0, "Your balance is ZERO");
    require(amount <= balance, "Your balance is insufficient");
    require(
      amount <= address(this).balance,
      "Amount is bigger than platform has"
    );
    s.cs.playersBalances[msg.sender] = balance - amount;
    payable(msg.sender).transfer(amount);
  }
}
