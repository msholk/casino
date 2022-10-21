// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

import "./interfaces/IHouseVestingWallet.sol";
import "./interfaces/IHouseVestingGlobals.sol";
import { LibRoleGlobals as rGlobals } from "../tokens/libraries/LibRoles.sol";


contract HouseVestingWallet is AccessControlEnumerable, Initializable {
    event ERC20Released(address indexed token, uint256 amount);
    
    address private stakeHousePoolVault;
    address private houseVestingGlobalsAddress;

    address[] private erc20Tokens;
    mapping(address => uint256) private balances;
    mapping(address => uint256) private releasedBalances;
    mapping(address => uint256) private startTimestamp;
    mapping(address => uint256) private durationSeconds;

    function initialize(
        address _beneficiaryAddress,
        address _housePoolAddress,
        address _houseVestingGlobalsAddress,
        address[] calldata _erc20Tokens,
        uint256[] calldata _balances
    )
        external
        payable
        initializer()
    {
        require(_erc20Tokens.length == _balances.length, "VestingWallet: tokens/balances lengths differ");
        
        houseVestingGlobalsAddress = _houseVestingGlobalsAddress;
        IHouseVestingGlobals _vestingDurationGlobals = IHouseVestingGlobals(houseVestingGlobalsAddress);

        _setRoleAdmin(rGlobals._GOVERNOR_ROLE_, rGlobals._ADMIN_ROLE_);
        _setRoleAdmin(rGlobals._ADMIN_ROLE_, rGlobals._ADMIN_ROLE_);
        _setRoleAdmin(rGlobals._OWNER_ROLE_, rGlobals._OWNER_ROLE_);
        _setRoleAdmin(rGlobals._REWARDS_ROUTER_ROLE_, rGlobals._ADMIN_ROLE_);

        _setupRole(rGlobals._GOVERNOR_ROLE_, _vestingDurationGlobals.governor());
        _setupRole(rGlobals._ADMIN_ROLE_, _vestingDurationGlobals.admin());
        _setupRole(rGlobals._OWNER_ROLE_, _msgSender());
        _setupRole(rGlobals._REWARDS_ROUTER_ROLE_, _vestingDurationGlobals.rewardsRouter());

        stakeHousePoolVault = _housePoolAddress;

        // Handle ETH deposits
        if (msg.value > 0) {
            _depositEth(msg.value);
        }

        // Handle all other ERC20 deposits
        if (_erc20Tokens.length > 0) {
            for (uint256 i; i < _erc20Tokens.length; i++) {
                if (_vestingDurationGlobals.isStakeToken(_erc20Tokens[i])) {
                    _depositERC20(_erc20Tokens[i], _balances[i]);
                }
            }
        }
    }

    /**
     * @dev The contract should be able to receive Eth.
     */
    receive() external payable {
        _depositEth(msg.value);
    }

    /**
     * @dev If `_role` is _OWNER_ROLE_, grant role per {AccessControl:AccessControl-grantRole},
     * and renounce _OWNER_ROLE_ of _msgSender().
     * .
     * @notice Overrides {AccessControl:AccessControl-grantRole}.
     * @param _role The role to grant.
     * @param _account The account to grant the role to.
     * 
     * Requirements: See {AccessControl:AccessControl-grantRole}
     */
    function grantRole(bytes32 _role, address _account) public override {
        super.grantRole(_role, _account);

        if (_role == rGlobals._OWNER_ROLE_) {
            renounceRole(rGlobals._OWNER_ROLE_, _msgSender());
        }
    }

    /**
     * @dev If `_role` is _OWNER_ROLE_, only allow reassignment of the owner's role, else
     * renounce `_role` per {AccessControl:AccessControl-renouncRole}.
     * @notice Overrides {AccessControl:AccessControl-renouncRole}.
     * @param _role The role to reassign.
     * @param _account The account to reassign the role to.
     * 
     * Requirements: See {AccessControl:AccessControl-renounceRole}
     */
    function renounceRole(bytes32 _role, address _account) public override {
        if (_role == rGlobals._OWNER_ROLE_) { grantRole(_role, _account); }
        
        super.renounceRole(_role, _msgSender());
    }

    /**
     * @dev Set house stake pool vault address.
     */
    function setHousePoolVault(address _stakeHousePoolVault)
        external
        onlyRole(rGlobals._ADMIN_ROLE_)
    {
        stakeHousePoolVault = _stakeHousePoolVault;
    }

    /**
     * @dev Set house minimum vesting globals address.
     */
    function setHouseVestingGlobals(address _houseVestingGlobalsAddress)
        external
        onlyRole(rGlobals._GOVERNOR_ROLE_)
    {
        houseVestingGlobalsAddress = _houseVestingGlobalsAddress;
    }

    /**
     * @dev See {IHouseVestingWallet:IHouseVestingWallet-beneficiary}
     */
    function beneficiary() external view returns (address) {
        return getRoleMember(rGlobals._OWNER_ROLE_, 0);
    }

    /**
     * @dev Getter for the total ERC20 token balance (both staked and non-staked).
     */
    function totalSupply(address _token) external view returns (uint256) {
        return balances[_token];
    }

    /**
     * @dev Getter for total staked ERC20 token.
     */
    function totalStakedSupply(address _token) external view returns (uint256) {
        return balances[_token] - released[_token];
    }

    /**
     * @dev Getter for the start timestamp.
     */
    function start(address _token) external view returns (uint256) {
        return startTimestamp[_token];
    }

    /**
     * @dev Getter for the vesting duration.
     */
    function duration(address _token) external view returns (uint256) {
        return durationSeconds[_token];
    }

    /**
     * @dev Amount of eth already released
     */
    function released(address _token) external view returns (uint256) {
        return releasedBalances[_token];
    }

    /**
     * @dev Deposit ERC20 tokens.
     */
    function deposit(address _token, uint256 _amount)
        external
        onlyRole(rGlobals._OWNER_ROLE_)
        returns (bool)
    {
        IERC20(_token).safeTransferFrom(_msgSender(), address(this), _amount);

        erc20Tokens.push(_token);

        balances[_token] += _amount;
        releasedBalances[_token] += _amount;
        startTimestamp[_token] = block.timestamp;
        durationSeconds[_token] = IHouseVestingGlobals(houseVestingGlobalsAddress).getDuration(_token);

        return true;
    }

    /**
     * @dev Stake ETH.
     */
    function stake(uint256 _amount) 
        external
        onlyRole(rGlobals._OWNER_ROLE_)
        returns (bool)
    {
        __stake(_msgSender(), address(0), _amount);
        return true;
    }

    /**
     * @dev Stake ERC20 tokens.
     */
    function stake(address _token, uint256 _amount)
        external
        onlyRole(rGlobals._OWNER_ROLE_)
        returns (bool)
    {
        __stake(_msgSender(), _token, _amount);
        return true;
    }

    /**
     * @dev Release the tokens that have already vested.
     *
     * Emits a {ERC20Released} event.
     */
    function release(address _token) external {
        uint256 releasable = vestedAmount(_token, uint64(block.timestamp)) - released[_token];
        releasedBalances[_token] += releasable;
        
        emit ERC20Released(_token, releasable);
        
        SafeERC20.safeTransfer(
            IERC20(_token),
            getRoleMember(rGlobals._OWNER_ROLE_, 0),
            releasable
        );
    }

    /**
     * @dev Calculates the amount of tokens that has already vested. Default implementation is a linear vesting curve.
     */
    function vestedAmount(address _token, uint64 _timestamp) public view returns (uint256) {
        return _vestingSchedule(
            _token,
            IERC20(_token).balanceOf(address(this)) + releasedBalances[_token],
            _timestamp
        );
    }

    /**
     * @dev Deposit ETH to this wallet.
     */
    function _depositEth(uint256 _amount) internal {
        require(_amount != 0, 'Cannot deposit 0');

        balances[address(0)] += _amount;
        startTimestamp[address(0)] = block.timestamp;
        durationSeconds[address(0)] = IHouseVestingGlobals(houseVestingGlobalsAddress).ethDuration();
    }

    /**
     * @dev Deposit ERC20 to this wallet.
     */
    function _depositERC20(address _token, uint256 _amount) internal {
        require(_amount != 0, 'Cannot deposit 0');

        IERC20(_token).transferFrom(_msgSender(), address(this), _amount);

        erc20Tokens.push(_token);

        balances[_token] += msg.value;
        startTimestamp[_token] = block.timestamp;
        durationSeconds[_token] = IHouseVestingGlobals(houseVestingGlobalsAddress).ethDuration();
    }

    /**
     * @dev Virtual implementation of the vesting formula. This returns the amount vested, as a function of time, for
     * an asset given its total historical allocation.
     */
    function _vestingSchedule(address _token, uint256 _totalAllocation, uint64 _timestamp) internal view returns (uint256) {
        if (_timestamp < startTimestamp[_token]) {
            return 0;
        } else if (_timestamp > startTimestamp[_token] + durationSeconds[_token]) {
            return _totalAllocation;
        } else {
            return (_totalAllocation * (_timestamp - startTimestamp[_token])) / durationSeconds[_token];
        }
    }

    /**
     * @dev Stake tokens.
     */
    function __stake(address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardTracker: invalid _amount");

        IHouseVestingGlobals houseVestingGlobals = IHouseVestingGlobals(houseVestingGlobalsAddress);
        require(houseVestingGlobals.isStakeToken(_token), "RewardTracker: invalid _token");

        // Stake token(s)        
        _token == address(0)
            ? houseVestingGlobalsAddress.transfer(_amount)
            : IERC20(_token).safeTransferFrom(address(this), stakeHousePoolVault, _amount);
        
        releasedBalances[_token] -= _amount;

        __updateRewards(_account);
    }
    
    function __updateRewards(address _account) private {
        // uint256 blockReward = IRewardDistributor(distributor).distribute();

        // uint256 supply = totalSupply;
        // uint256 _cumulativeRewardPerToken = cumulativeRewardPerToken;
        // if (supply > 0 && blockReward > 0) {
        //     _cumulativeRewardPerToken = _cumulativeRewardPerToken.add(blockReward.mul(PRECISION).div(supply));
        //     cumulativeRewardPerToken = _cumulativeRewardPerToken;
        // }

        // // cumulativeRewardPerToken can only increase
        // // so if cumulativeRewardPerToken is zero, it means there are no rewards yet
        // if (_cumulativeRewardPerToken == 0) {
        //     return;
        // }

        // if (_account != address(0)) {
        //     uint256 stakedAmount = stakedAmounts[_account];
        //     uint256 accountReward = stakedAmount.mul(_cumulativeRewardPerToken.sub(previousCumulatedRewardPerToken[_account])).div(PRECISION);
        //     uint256 _claimableReward = claimableReward[_account].add(accountReward);

        //     claimableReward[_account] = _claimableReward;
        //     previousCumulatedRewardPerToken[_account] = _cumulativeRewardPerToken;

        //     if (_claimableReward > 0 && stakedAmounts[_account] > 0) {
        //         uint256 nextCumulativeReward = cumulativeRewards[_account].add(accountReward);

        //         averageStakedAmounts[_account] = averageStakedAmounts[_account].mul(cumulativeRewards[_account]).div(nextCumulativeReward)
        //             .add(stakedAmount.mul(accountReward).div(nextCumulativeReward));

        //         cumulativeRewards[_account] = nextCumulativeReward;
        //     }
        // }
    }
}
