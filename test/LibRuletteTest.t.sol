// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

import "forge-std/Test.sol";
import "contracts/libraries/roulette/LibRulette.sol";

contract LibRuletteTest is Test {
    // Counter public counter;

    function setUp() public {
        // counter = new Counter();
        // counter.setNumber(0);
    }

    function testIncrement(uint8 winNum) public {
        vm.assume(winNum <= 38 && winNum >= 1);
        for (uint8 betDet = 1; betDet <= 38; betDet++) {
            uint256 winFact = LibRulette.getWinFactor(1, betDet, winNum);
            if (betDet == winNum) {
                assertEq(winFact, 36);
            } else {
                assertEq(winFact, 0);
            }
        }
        vm.expectRevert("Wrong bet detail for bet type 1");
        LibRulette.getWinFactor(1, 0, winNum);
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
