// //SPDX-License-Identifier: MIT
// pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/access/AccessControl.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// import "./interfaces/IRewardTracker.sol";
// import "./interfaces/IVester.sol";
// import "../tokens/interfaces/IMintable.sol";

// import { LibRoleGlobals as rGlobals } from "../tokens/libraries/LibRoles.sol";
// import { LibVesterERC20Muters as ERC20Muters } from "./libraries/LibVester.sol";


// contract Vester is AccessControl, ReentrancyGuard, ERC20 {
//     using SafeERC20 for IERC20;
//     using ERC20Muters for IERC20;

//     string public name;
//     string public symbol;
//     uint8 public decimals = 18;

//     uint256 public vestingDuration;

//     address public esToken;
//     address public pairToken;
//     address public claimableToken;

//     address public override rewardTracker;

//     uint256 public override totalSupply;
//     uint256 public pairSupply;

//     bool public hasMaxVestableAmount;

//     mapping (address => uint256) public balances;
//     // mapping (address => uint256) public override pairAmounts;
//     // mapping (address => uint256) public override cumulativeClaimAmounts;
//     // mapping (address => uint256) public override claimedAmounts;
//     mapping (address => uint256) public lastVestingTimes;

//     // mapping (address => uint256) public override transferredAverageStakedAmounts;
//     // mapping (address => uint256) public override transferredCumulativeRewards;
//     // mapping (address => uint256) public override cumulativeRewardDeductions;
//     // mapping (address => uint256) public override bonusRewards;

//     constructor (
//         string memory _name,
//         string memory _symbol,
//         uint256 _vestingDuration,
//         address _esToken,
//         address _pairToken,
//         address __claimableToken,
//         address _rewardTracker
//     ) ERC20(_name, _symbol) {
//         name = _name;
//         symbol = _symbol;

//         vestingDuration = _vestingDuration;

//         esToken = _esToken;
//         pairToken = _pairToken;
//         claimableToken = __claimableToken;

//         rewardTracker = _rewardTracker;

//         if (rewardTracker != address(0)) {
//             hasMaxVestableAmount = true;
//         }

//         _setRoleAdmin(rGlobals._GOVERNOR_ROLE_, rGlobals._GOVERNOR_ROLE_);
//         _setRoleAdmin(rGlobals._ADMIN_ROLE_, rGlobals._GOVERNOR_ROLE_);

//         _setupRole(rGlobals._GOVERNOR_ROLE_, _msgSender());

//         _mint(_msgSender(), 100);
//     }

//     function test() public {
//         vestingDuration = 1;
//     }

//     // // empty implementation, tokens are non-transferrable
//     // function transfer(address /* recipient */, uint256 /* amount */) public override returns (bool) {
//     //     revert("Vester: non-transferrable");
//     // }

//     // // empty implementation, tokens are non-transferrable
//     // function allowance(address /* owner */, address /* spender */) public view virtual override returns (uint256) {
//     //     return 0;
//     // }

//     // // empty implementation, tokens are non-transferrable
//     // function approve(address /* spender */, uint256 /* amount */) public virtual override returns (bool) {
//     //     revert("Vester: non-transferrable");
//     // }

//     // // empty implementation, tokens are non-transferrable
//     // function transferFrom(address /* sender */, address /* recipient */, uint256 /* amount */) public virtual override returns (bool) {
//     //     revert("Vester: non-transferrable");
//     // }

//     // function setHasMaxVestableAmount(bool _hasMaxVestableAmount)
//     //     external
//     //     onlyRole(rGlobals._GOVERNOR_ROLE_)
//     // {
//     //     hasMaxVestableAmount = _hasMaxVestableAmount;
//     // }

//     // function deposit(uint256 _amount) external nonReentrant {
//     //     __deposit(msg.sender, _amount);
//     // }

//     // function depositForAccount(address _account, uint256 _amount)
//     //     external
//     //     nonReentrant
//     //     onlyRole(rGlobals._ADMIN_ROLE_)
//     // {
//     //     __deposit(_account, _amount);
//     // }

//     // function claim() external nonReentrant returns (uint256) {
//     //     return __claim(msg.sender, msg.sender);
//     // }

//     // function claimForAccount(address _account, address _receiver) 
//     //     external 
//     //     override 
//     //     nonReentrant 
//     //     onlyRole(rGlobals._ADMIN_ROLE_)
//     //     returns (uint256)
//     // {
//     //     return __claim(_account, _receiver);
//     // }

//     // // to help users who accidentally send their tokens to this contract
//     // function withdrawToken(address _token, address _account, uint256 _amount)
//     //     external
//     //     onlyRole(rGlobals._GOVERNOR_ROLE_)
//     // {
//     //     IERC20(_token).safeTransfer(_account, _amount);
//     // }

//     // function withdraw() external nonReentrant {
//     //     address account = msg.sender;
//     //     address _receiver = account;
//     //     __claim(account, _receiver);

//     //     uint256 claimedAmount = cumulativeClaimAmounts[account];
//     //     uint256 balance = balances[account];
//     //     uint256 totalVested = balance.add(claimedAmount);
//     //     require(totalVested > 0, "Vester: vested amount is zero");

//     //     if (hasPairToken()) {
//     //         uint256 pairAmount = pairAmounts[account];
//     //         __burnPair(account, pairAmount);
//     //         IERC20(pairToken).safeTransfer(_receiver, pairAmount);
//     //     }

//     //     IERC20(esToken).safeTransfer(_receiver, balance);
//     //     _burn(account, balance);

//     //     delete cumulativeClaimAmounts[account];
//     //     delete claimedAmounts[account];
//     //     delete lastVestingTimes[account];

//     //     emit Withdraw(account, claimedAmount, balance);
//     // }

//     // function transferStakeValues(address _sender, address _receiver)
//     //     external
//     //     override
//     //     nonReentrant
//     //     onlyRole(rGlobals._ADMIN_ROLE_)
//     // {
//     //     transferredAverageStakedAmounts[_receiver] = getCombinedAverageStakedAmount(_sender);
//     //     transferredAverageStakedAmounts[_sender] = 0;

//     //     uint256 transferredCumulativeReward = transferredCumulativeRewards[_sender];
//     //     uint256 cumulativeReward = IRewardTracker(rewardTracker).cumulativeRewards(_sender);

//     //     transferredCumulativeRewards[_receiver] = transferredCumulativeReward.add(cumulativeReward);
//     //     cumulativeRewardDeductions[_sender] = cumulativeReward;
//     //     transferredCumulativeRewards[_sender] = 0;

//     //     bonusRewards[_receiver] = bonusRewards[_sender];
//     //     bonusRewards[_sender] = 0;
//     // }

//     // function setTransferredAverageStakedAmounts(address _account, uint256 _amount)
//     //     external
//     //     override
//     //     nonReentrant
//     //     onlyRole(rGlobals._ADMIN_ROLE_)
//     // {
//     //     transferredAverageStakedAmounts[_account] = _amount;
//     // }

//     // function setTransferredCumulativeRewards(address _account, uint256 _amount)
//     //     external
//     //     override
//     //     nonReentrant
//     //     onlyRole(rGlobals._ADMIN_ROLE_)
//     // {
//     //     transferredCumulativeRewards[_account] = _amount;
//     // }

//     // function setCumulativeRewardDeductions(address _account, uint256 _amount)
//     //     external
//     //     override
//     //     nonReentrant
//     //     onlyRole(rGlobals._ADMIN_ROLE_)
//     // {
//     //     cumulativeRewardDeductions[_account] = _amount;
//     // }

//     // function setBonusRewards(address _account, uint256 _amount)
//     //     external
//     //     override
//     //     nonReentrant
//     //     onlyRole(rGlobals._ADMIN_ROLE_)
//     // {
//     //     bonusRewards[_account] = _amount;
//     // }

//     // function claimable(address _account) public override view returns (uint256) {
//     //     uint256 amount = cumulativeClaimAmounts[_account].sub(claimedAmounts[_account]);
//     //     uint256 nextClaimable = __getNextClaimableAmount(_account);
//     //     return amount.add(nextClaimable);
//     // }

//     // function getMaxVestableAmount(address _account) public override view returns (uint256) {
//     //     if (!hasRewardTracker()) { return 0; }

//     //     uint256 transferredCumulativeReward = transferredCumulativeRewards[_account];
//     //     uint256 bonusReward = bonusRewards[_account];
//     //     uint256 cumulativeReward = IRewardTracker(rewardTracker).cumulativeRewards(_account);
//     //     uint256 maxVestableAmount = cumulativeReward.add(transferredCumulativeReward).add(bonusReward);

//     //     uint256 cumulativeRewardDeduction = cumulativeRewardDeductions[_account];

//     //     if (maxVestableAmount < cumulativeRewardDeduction) {
//     //         return 0;
//     //     }

//     //     return maxVestableAmount.sub(cumulativeRewardDeduction);
//     // }

//     // function getCombinedAverageStakedAmount(address _account) public override view returns (uint256) {
//     //     uint256 cumulativeReward = IRewardTracker(rewardTracker).cumulativeRewards(_account);
//     //     uint256 transferredCumulativeReward = transferredCumulativeRewards[_account];
//     //     uint256 totalCumulativeReward = cumulativeReward.add(transferredCumulativeReward);
//     //     if (totalCumulativeReward == 0) { return 0; }

//     //     uint256 averageStakedAmount = IRewardTracker(rewardTracker).averageStakedAmounts(_account);
//     //     uint256 transferredAverageStakedAmount = transferredAverageStakedAmounts[_account];

//     //     return averageStakedAmount
//     //         .mul(cumulativeReward)
//     //         .div(totalCumulativeReward)
//     //         .add(
//     //             transferredAverageStakedAmount.mul(transferredCumulativeReward).div(totalCumulativeReward)
//     //         );
//     // }

//     // function getPairAmount(address _account, uint256 _esAmount) public view returns (uint256) {
//     //     if (!hasRewardTracker()) { return 0; }

//     //     uint256 combinedAverageStakedAmount = getCombinedAverageStakedAmount(_account);
//     //     if (combinedAverageStakedAmount == 0) {
//     //         return 0;
//     //     }

//     //     uint256 maxVestableAmount = getMaxVestableAmount(_account);
//     //     if (maxVestableAmount == 0) {
//     //         return 0;
//     //     }

//     //     return _esAmount.mul(combinedAverageStakedAmount).div(maxVestableAmount);
//     // }

//     // function hasRewardTracker() public view returns (bool) {
//     //     return rewardTracker != address(0);
//     // }

//     // function hasPairToken() public view returns (bool) {
//     //     return pairToken != address(0);
//     // }

//     // function getTotalVested(address _account) public view returns (uint256) {
//     //     return balances[_account].add(cumulativeClaimAmounts[_account]);
//     // }

//     // function balanceOf(address _account) public view override returns (uint256) {
//     //     return balances[_account];
//     // }

//     // function getVestedAmount(address _account) public override view returns (uint256) {
//     //     uint256 balance = balances[_account];
//     //     uint256 cumulativeClaimAmount = cumulativeClaimAmounts[_account];
//     //     return balance.add(cumulativeClaimAmount);
//     // }

//     // function __mintPair(address _account, uint256 _amount) private {
//     //     require(_account != address(0), "Vester: mint to the zero address");

//     //     pairSupply = pairSupply.add(_amount);
//     //     pairAmounts[_account] = pairAmounts[_account].add(_amount);

//     //     emit PairTransfer(address(0), _account, _amount);
//     // }

//     // function __burnPair(address _account, uint256 _amount) private {
//     //     require(_account != address(0), "Vester: burn from the zero address");

//     //     pairAmounts[_account] = pairAmounts[_account].sub(_amount, "Vester: burn amount exceeds balance");
//     //     pairSupply = pairSupply.sub(_amount);

//     //     emit PairTransfer(_account, address(0), _amount);
//     // }

//     // function __deposit(address _account, uint256 _amount) private {
//     //     require(_amount > 0, "Vester: invalid _amount");

//     //     __updateVesting(_account);

//     //     IERC20(esToken).safeTransferFrom(_account, address(this), _amount);

//     //     _mint(_account, _amount);

//     //     if (hasPairToken()) {
//     //         uint256 pairAmount = pairAmounts[_account];
//     //         uint256 nextPairAmount = getPairAmount(_account, balances[_account]);
//     //         if (nextPairAmount > pairAmount) {
//     //             uint256 pairAmountDiff = nextPairAmount.sub(pairAmount);
//     //             IERC20(pairToken).safeTransferFrom(_account, address(this), pairAmountDiff);
//     //             __mintPair(_account, pairAmountDiff);
//     //         }
//     //     }

//     //     if (hasMaxVestableAmount) {
//     //         uint256 maxAmount = getMaxVestableAmount(_account);
//     //         require(getTotalVested(_account) <= maxAmount, "Vester: max vestable amount exceeded");
//     //     }

//     //     emit Deposit(_account, _amount);
//     // }

//     // function __updateVesting(address _account) private {
//     //     uint256 amount = __getNextClaimableAmount(_account);
//     //     lastVestingTimes[_account] = block.timestamp;

//     //     if (amount == 0) {
//     //         return;
//     //     }

//     //     // transfer claimableAmount from balances to cumulativeClaimAmounts
//     //     _burn(_account, amount);
//     //     cumulativeClaimAmounts[_account] = cumulativeClaimAmounts[_account].add(amount);

//     //     IMintable(esToken).burn(address(this), amount);
//     // }

//     // function __getNextClaimableAmount(address _account) private view returns (uint256) {
//     //     uint256 timeDiff = block.timestamp.sub(lastVestingTimes[_account]);

//     //     uint256 balance = balances[_account];
//     //     if (balance == 0) { return 0; }

//     //     uint256 vestedAmount = getVestedAmount(_account);
//     //     uint256 claimableAmount = vestedAmount.mul(timeDiff).div(vestingDuration);

//     //     if (claimableAmount < balance) {
//     //         return claimableAmount;
//     //     }

//     //     return balance;
//     // }

//     // function __claim(address _account, address _receiver) private returns (uint256) {
//     //     __updateVesting(_account);
//     //     uint256 amount = claimable(_account);
//     //     claimedAmounts[_account] = claimedAmounts[_account].add(amount);
//     //     IERC20(claimableToken).safeTransfer(_receiver, amount);
//     //     emit Claim(_account, amount);
//     //     return amount;
//     // }
// }