// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "contracts/diamond/libraries/LibDiamond.sol";
import "contracts/libraries/AppStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "contracts/libraries/constants.sol";

contract AdminFacet {
    AppStorage s;

    constructor() {
        //Set to test withoud diamond
        LibDiamond.setContractOwner(msg.sender);
    }

    function withdrawAllPlatformDAI() public {
        LibDiamond.enforceIsContractOwner();

        ////////////////////////////////////////////////////////////////
        require(s.platformBalancePr18 > 0, "Your balance iz ZERO");
        IERC20 dai = IERC20(DAI);
        dai.approve(address(this), s.platformBalancePr18);
        dai.transfer(msg.sender, s.platformBalancePr18);
    }

    function checkPlatformBalance()
        public
        view
        returns (uint256 platformBalanceP18, uint256 platformBalanceP2)
    {
        LibDiamond.enforceIsContractOwner();
        return (s.platformBalancePr18, s.platformBalancePr18 / 1e16);
    }
}
