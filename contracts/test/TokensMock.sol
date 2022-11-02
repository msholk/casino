//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
// import "contracts/libraries/UniswapV2.sol";
import "contracts/libraries/constants.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWETH is IERC20 {}

contract TokensMock {
  IWETH public weth = IWETH(WETH);
  IERC20 public dai = IERC20(DAI);

  function daiBalanceOf(address addr) public view returns (uint256) {
    return dai.balanceOf(addr);
  }
}
