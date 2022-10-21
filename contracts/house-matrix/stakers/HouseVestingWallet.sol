// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

import "../distributors/interfaces/ITimeDistributor.sol";
import "./interfaces/IHouseVestingWallet.sol";
import "./interfaces/IHouseVestingGlobals.sol";

import { LibYieldGlobals as yGlobals } from "../tokens/libraries/LibYieldFarm.sol";
import { LibRoleGlobals as rGlobals } from "../tokens/libraries/LibRoles.sol";


contract HouseVestingWallet is AccessControlEnumerable, Initializable {
    using EnumerableSet for EnumerableSet.AddressSet;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event ERC20Released(address indexed token, uint256 amount);
    
    uint256 public cumulativeRewards;
    uint256 public averageStakedAmounts;
    address private stakeHousePoolVault;
    IHouseVestingGlobals private houseVestingGlobals;

    EnumerableSet.AddressSet public erc20Tokens;
    mapping(address => uint256) private rewards;
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
        houseVestingGlobals = IHouseVestingGlobals(_houseVestingGlobalsAddress);
        
        _setRoleAdmin(rGlobals._GOVERNOR_ROLE_, rGlobals._ADMIN_ROLE_);
        _setRoleAdmin(rGlobals._ADMIN_ROLE_, rGlobals._ADMIN_ROLE_);
        _setRoleAdmin(rGlobals._OWNER_ROLE_, rGlobals._OWNER_ROLE_);
        _setRoleAdmin(rGlobals._REWARDS_ROUTER_ROLE_, rGlobals._ADMIN_ROLE_);

        _setupRole(rGlobals._GOVERNOR_ROLE_, houseVestingGlobals.governor());
        _setupRole(rGlobals._ADMIN_ROLE_, houseVestingGlobals.admin());
        _setupRole(rGlobals._OWNER_ROLE_, _msgSender());
        _setupRole(rGlobals._REWARDS_ROUTER_ROLE_, houseVestingGlobals.rewardsRouter());

        stakeHousePoolVault = _housePoolAddress;

        // Handle ETH deposits
        if (msg.value > 0) {
            _deposit(address(0), msg.value);
        }

        // Handle all other ERC20 deposits
        if (_erc20Tokens.length > 0) {
            for (uint256 i; i < _erc20Tokens.length; i++) {
                require(houseVestingGlobals.isStakeToken(_erc20Tokens[i]), "Invalid token");
                _deposit(_erc20Tokens[i], _balances[i]);
            }
        }
    }

    /**
     * @dev The contract should be able to receive Eth.
     */
    receive() external payable {
        _deposit(address(0), msg.value);
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
        uint256 _totalSupply;
        address[3] memory _tokens = houseVestingGlobals.getTokens();

        for (uint256 i; i < _tokens.length; i++) {
            _totalSupply += balances[_tokens[i]];
        }

        return _totalSupply;
    }

    /**
     * @dev Getter for total staked ERC20 token.
     */
    function totalStakedSupply(address _token) public view returns (uint256) {
        return balances[_token] - releasedBalances[_token];
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
        durationSeconds[_token] = houseVestingGlobals.getDuration(_token);

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
    function release(address _token)
        external
        onlyRole(rGlobals._OWNER_ROLE_)
    {
        uint256 releasable = vestedAmount(_token, uint64(block.timestamp)) - releasedBalances[_token];
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
     * @dev Deposit ERC20 to this wallet.
     */
    function _deposit(address _token, uint256 _amount) internal {
        require(_amount != 0, 'Cannot deposit 0');

        if (_token != address(0)) {
            IERC20(_token).transferFrom(_msgSender(), address(this), _amount);
        }

        erc20Tokens.add(_token);

        balances[_token] += msg.value;
        startTimestamp[_token] = block.timestamp;
        durationSeconds[_token] = houseVestingGlobals.ethDuration();
    }

    function _mint(address _account, uint256 _amount) internal {
        require(_account != address(0), "RewardTracker: mint to the zero address");

        address hlpAddress = houseVestingGlobals.hlpAddress();

        balances[hlpAddress] += _amount;

        emit Transfer(address(0), _account, _amount);
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

        require(houseVestingGlobals.isStakeToken(_token), "RewardTracker: invalid _token");

        // Stake token(s)        
        _token == address(0)
            ? stakeHousePoolVault.transfer(_amount)
            : IERC20(_token).safeTransferFrom(address(this), stakeHousePoolVault, _amount);
        
        releasedBalances[_token] -= _amount;

        __updateRewards(_account, _token);
        _mint(_account, _amount);
    }
    
    function __updateRewards(address _account, address _token) private {
        uint256 _blockReward = ITimeDistributor(houseVestingGlobals.distributor()).distribute();
        uint256 _prevRewards = rewards[_token];

        if (balances[_token] > 0 && _blockReward > 0) {
            rewards[_token] += _blockReward * yGlobals.PRECISION / balances[_token];
        }

        // rewards[_token] can only increase
        // so if cumulativeRewardPerToken is zero, it means there are no rewards yet
        if (rewards[_token] == 0) { return; }

        if (_account != address(0)) {
            uint256 _stakedAmount = totalStakedSupply(_token);
            uint256 _accountReward = _stakedAmount * (rewards[_token] - _prevRewards) / yGlobals.PRECISION;
            releasedBalances[_token] += _accountReward;

            if (releasedBalances[_token] > 0 && _stakedAmount > 0) {
                uint256 _prevCumulativeReward = cumulativeRewards;
                cumulativeRewards += _accountReward;

                averageStakedAmounts = averageStakedAmounts * _prevCumulativeReward / cumulativeRewards
                    + (_stakedAmount * (_accountReward / cumulativeRewards));
            }
        }
    }
}
