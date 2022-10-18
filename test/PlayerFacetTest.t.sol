// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

import "forge-std/Test.sol";
import "contracts/facets/PlayersFacet.sol";
import "contracts/constants.sol";

// address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
// address constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
// address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

contract PlayerFacetTest is Test {
    PlayersFacet public player;
    IWETH private weth = IWETH(WETH);
    IERC20 private dai = IERC20(DAI);
    // IERC20 private usdc = IERC20(USDC);
    int256 i = 5;

    function setUp() public {
        player = new PlayersFacet();
        // counter.setNumber(0);
    }

    function testIncrement() public {
        uint256 bal;
        bal = (address(player)).balance;
        assertEq(bal, 5656000000000000000);
        bal = dai.balanceOf(address(player));
        assertEq(bal, 0);
        bal = weth.balanceOf(address(player));
        assertEq(bal, 0);

        bal = player.checkPlayerBalance();
        assertEq(bal, 0);

        player.depositETH{value: 1 ether}();

        bal = (address(player)).balance;
        assertEq(bal, 5656000000000000000);
        bal = dai.balanceOf(address(player));
        assertEq(bal / 1e18, 1272);
        bal = weth.balanceOf(address(player));
        assertEq(bal, 0);
        bal = player.checkPlayerBalance();
        assertEq(bal, 127233);

        // bal = (address(player)).balance;
        // assertEq(bal, 5656000000000000001);

        // bal = dai.balanceOf(address(player));
        // assertEq(bal, 0);
        // bal = weth.balanceOf(address(player));
        // assertEq(bal, 0);

        //player.swap();

        // bal = weth.balanceOf(address(player));
        // assertEq(bal, 0);
        // bal = dai.balanceOf(address(player));
        // assertEq(bal / 1e18, 1272);
        // uint256 res = player.checkPlayerBalnce();
        // assertEq(res, 1);
    }

    // function testSetNumber(uint256 x) public {
    //     counter.setNumber(x);
    //     assertEq(counter.number(), x);
    // }

    // function testCannotAdd() public {
    //     uint256 MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    //     counter.add(MAX_INT);
    //     // vm.expectRevert(bytes("FAIL. Reason: Arithmetic over/underflow"));
    //     vm.expectRevert(stdError.arithmeticError);
    //     //FAIL. Reason: Arithmetic over/underflow
    //     counter.add(1);
    //     // assertEq(counter.number(), x);
    // }
}
