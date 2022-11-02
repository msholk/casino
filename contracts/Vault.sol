// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "./libraries/math/SafeMath.sol";
import "./libraries/token/IERC20.sol";
import "./libraries/token/SafeERC20.sol";
import "./libraries/utils/ReentrancyGuard.sol";

// import "./interfaces/IVault.sol";
error Wrong__Amount();
error None__Staked();

contract Vault is ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 public totalStaker;
    address[] public stakers;
    address public StakerFacet;

    struct HlpStaker {
        address staker;
        uint256 amountstake;
        uint256 amountHLPowned;
        uint256 revenueprofit;
        uint256 time;
    }

    mapping(uint256 => HlpStaker) public HlpStakers;

    event hlpPoolDeposited(
        address indexed staker,
        uint256 indexed amount,
        uint256 indexed time
    );
    event hlpPoolWithdrawed(
        address indexed staker,
        uint256 indexed amount,
        uint256 indexed time
    );

    constructor() {}


    modifier FromStakerFacet() {
        require(msg.sender == StakerFacet, "Wrong StakerFacet");
        _;
    }

    function setStakerFacet(address _StakerFacet) public {
        StakerFacet = _StakerFacet;
    }

    function findSkaterId(address _skater) internal view returns (uint256) {
        for (uint256 i = 0; i < totalStaker + 1; i++) {
            if (HlpStakers[i].staker == _skater) {
                return i;
            }
        }
    }

    function hadstaken(address _skater) public view returns (bool) {
        for (uint256 i = 0; i < totalStaker + 1; i++) {
            if (HlpStakers[i].staker == _skater) {
                return (true);
            }
        }
        return (false);
    }

    function checkWithdrawableHLPAmount(address _skater, uint256 _amount)
        public
        view
        returns (bool)
    {
        uint256 StakerId = findSkaterId(_skater);
        uint256 secondsPassed = block.timestamp - HlpStakers[StakerId].time;

        uint256 day = 86400;
        uint256 dayPassed = secondsPassed / (day);

        // people can withdraw 5% of their whole staked amount daily,
        // which means they can withdraw their full amount after 20 days.
        uint256 amountWithdrawable = (HlpStakers[StakerId].amountHLPowned *
            (dayPassed)) / 20;
        if (_amount <= amountWithdrawable) {
            return (true);
        } else {
            return (false);
        }
    }

    function checkWithdrawableAmount(address _skater)
        public
        view
        returns (uint256)
    {
        uint256 StakerId = findSkaterId(_skater);
        uint256 secondsPassed = block.timestamp - HlpStakers[StakerId].time;

        uint256 day = 86400;
        uint256 dayPassed = secondsPassed / (day);

        // people can withdraw 5% of their whole staked amount daily,
        // which means they can withdraw their full amount after 20 days.
        uint256 amountWithdrawable = (HlpStakers[StakerId].amountstake *
            (dayPassed)) / 20;
        return (amountWithdrawable);
    }

    function hlpPoolDeposit(address _skater, uint256 amountHLPowned)
        external
        payable
        nonReentrant
        FromStakerFacet
        returns (bool)
    {
        uint256 tokenAmount = msg.value;
        if (tokenAmount <= 0) revert Wrong__Amount();
        if (hadstaken(_skater) == true) {
            uint256 StakerId = findSkaterId(_skater);
            HlpStakers[totalStaker].staker = _skater;
            HlpStakers[StakerId].amountstake += tokenAmount;
            HlpStakers[StakerId].time = block.timestamp;
            HlpStakers[StakerId].amountHLPowned += amountHLPowned;
        } else {
            totalStaker++;
            HlpStakers[totalStaker].staker = _skater;
            HlpStakers[totalStaker].amountstake += tokenAmount;
            HlpStakers[totalStaker].time = block.timestamp;
            HlpStakers[totalStaker].amountHLPowned += amountHLPowned;
        }

        emit hlpPoolDeposited(_skater, tokenAmount, block.timestamp);

        return (true);
    }

    function hlpPoolWithdrawSome(address _skater, uint256 amountHLPToWithdraw)
        external
        payable
        nonReentrant
        FromStakerFacet
        returns (bool)
    {
        if (hadstaken(_skater) == false) revert None__Staked();
        if (amountHLPToWithdraw <= 0) revert Wrong__Amount();

        if (checkWithdrawableHLPAmount(_skater, amountHLPToWithdraw) == false)
            revert Wrong__Amount();
        uint256 StakerId = findSkaterId(_skater);
        uint256 amountCanSend = checkWithdrawableAmount(_skater);
        uint256 amountToSend = (HlpStakers[StakerId].amountstake *
            amountHLPToWithdraw) / HlpStakers[StakerId].amountHLPowned;
        if (amountToSend <= amountCanSend) {
            HlpStakers[StakerId].amountstake -= amountToSend;
            HlpStakers[StakerId].amountHLPowned -= amountHLPToWithdraw;
            // in case we charge commission
            uint256 commissionNumerator = 100;
            uint256 commissionDenominator = 100;
            uint256 afterCommission = (amountToSend * commissionNumerator) /
                commissionDenominator;
            (bool callSuccess, ) = payable(_skater).call{
                value: afterCommission
            }("");

            require(callSuccess, "Call failed");
            emit hlpPoolWithdrawed(_skater, afterCommission, block.timestamp);
            return (true);
        } else {
            return (false);
        }
    }

    function hlpPoolWithdrawAsMuchAsYouCan(address _skater)
        external
        payable
        nonReentrant
        FromStakerFacet
        returns (bool, uint256)
    {
        if (hadstaken(_skater) == false) revert None__Staked();

        uint256 StakerId = findSkaterId(_skater);
        uint256 amountCanSend = checkWithdrawableAmount(_skater);
        HlpStakers[StakerId].amountstake -= amountCanSend;
        uint256 amountToBurn = (HlpStakers[StakerId].amountHLPowned *
            amountCanSend) / HlpStakers[StakerId].amountstake;

        HlpStakers[StakerId].amountHLPowned -= amountToBurn;
        // in case we charge commission
        uint256 commissionNumerator = 100;
        uint256 commissionDenominator = 100;
        uint256 afterCommission = (amountCanSend * commissionNumerator) /
            commissionDenominator;
        (bool callSuccess, ) = payable(_skater).call{value: afterCommission}(
            ""
        );
        require(callSuccess, "Call failed");
        emit hlpPoolWithdrawed(_skater, afterCommission, block.timestamp);
        return (true, amountToBurn);
    }
}
