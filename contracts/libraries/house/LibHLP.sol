// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/libraries/AppStorage.sol";
import "contracts/libraries/UniswapV2.sol";

library LibHLP {
    uint256 constant PLAYER_WINS_COMISSION = 3; //0.0003 0.03%
    uint256 constant PLAYER_LOOSE_COMISSION = 26; //0.0026 0.26%

    function LockMaxWinAmount(HouseStorage storage hs, uint256 totalBetSum)
        internal
    {
        require(
            hs.houseBalance / 1e18 >= totalBetSum * 36,
            "House balance is insufficient"
        );

        hs.houseBalance -= totalBetSum * 36 * 1e18;
        hs.houseLockedBalance += totalBetSum * 36 * 1e18;
    }

    function UnlockBalances(HouseStorage storage hs, uint256 totalBetSum)
        internal
    {
        hs.houseBalance += totalBetSum * 36 * 1e18;
        hs.houseLockedBalance -= totalBetSum * 36 * 1e18;
    }

    function transferFromHLP2Cachier(AppStorage storage s, uint256 payDiff)
        internal
    {
        //Amount goform  HLP goes to Cachier
        //We take PLAYER_WINS_COMISSION
        payDiff = payDiff * 1e18; //add precision
        uint256 ourComission = (PLAYER_WINS_COMISSION * payDiff) / 1e4; //add precision
        s.platformBalance += ourComission;
        payDiff -= ourComission;

        s.hs.houseBalance -= payDiff; //transfer from Cahsier to HLP
        // HLP.withdrawDAI(address(this),payDiff);
    }

    function transferFromCachierToHLP(AppStorage storage s, uint256 payDiff)
        internal
    {
        //Amount goform Cachier goes to HLP
        //We take PLAYER_LOOSE_COMISSION
        payDiff = payDiff * 1e18; //add precision
        uint256 ourComission = (PLAYER_LOOSE_COMISSION * payDiff) / 1e4; //add precision
        s.platformBalance += ourComission;
        payDiff -= ourComission;
        s.hs.houseBalance += payDiff; //transfer from Cahsier to HLP

        // DAI.approve(address(HLP),payDiff);
        // HLP.depositDAI(address(this),payDiff);
    }
}
