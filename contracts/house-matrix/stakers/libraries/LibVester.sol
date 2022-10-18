// //SPDX-License-Identifier: MIT
// pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


// library LibVesterERC20Muters is IERC20 {
//     function transfer(address /* to */, uint256 /* amount */) public override returns (bool){
//         revert('VesterERC20Muter: non-transferrable');
//     }

//     function allowance(address /* owner */, address /* spender */) public override returns (uint256){
//         return 0;
//     }

//     function approve(address /* spender */, uint256 /* amount */) public override returns (bool){
//         revert('VesterERC20Muter: non-transferrable');
//     }

//     function transferFrom(
//         address /* from */,
//         address /* to */,
//         uint256 /* amount */
//     ) public override returns (bool){
//         revert('VesterERC20Muter: non-transferrable');
//     }
// }