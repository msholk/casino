// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interfaces/ITimeDistributor.sol";

import { LibRoleGlobals as rGlobals } from "../tokens/libraries/LibRoles.sol";
import { LibTimeDistributorGetters as tdGetters, LibTimeDistributorUpdates as tdUpdates, LibTimeDistributorGlobals } from "./libraries/LibTimeDistributor.sol";

contract TimeDistributor is AccessControl, ITimeDistributor {
    using SafeERC20 for IERC20;

    mapping (address => address) public override rewardTokens;
    mapping (address => uint256) public override tokensPerInterval;
    mapping (address => uint256) public override lastDistributionTime;

    constructor() {
        _setRoleAdmin(rGlobals._GOVERNOR_ROLE_, rGlobals._GOVERNOR_ROLE_);
        _setRoleAdmin(rGlobals._ADMIN_ROLE_, rGlobals._GOVERNOR_ROLE_);

        _setupRole(rGlobals._GOVERNOR_ROLE_, _msgSender());
        _setupRole(rGlobals._ADMIN_ROLE_, _msgSender());
    }

    /**
     * @dev If `_role` is _GOVERNOR_ROLE_, only allow reassignment of the governor's role, else
     * renounce `_role` per {AccessControl:AccessControl-renouncRole}.
     * @notice Overrides {AccessControl:AccessControl-renouncRole}.
     * @param _role The role to reassign.
     * @param _account The account to reassign the role to.
     * 
     * Requirements: See {AccessControl:AccessControl-renounceRole}
     */
    function renounceRole(bytes32 _role, address _account) public override {
        if (_role == rGlobals._GOVERNOR_ROLE_) { grantRole(_role, _account); }
        
        super.renounceRole(_role, _msgSender());
    }

    /**
     * See {ITimeDistributor:ITimeDistributor-getDistributionAmount}.
     */
    function getDistributionAmount(address _receiver) external view returns (uint256) {
        return tdGetters.getDistributionAmount(
            rewardTokens[_receiver],
            tokensPerInterval[_receiver],
            lastDistributionTime[_receiver]
        );
    }

    /**
     * See {ITimeDistributor:ITimeDistributor-setTokensPerInterval}.
     */
    function setTokensPerInterval(address _receiver, uint256 _amount)
        external
        onlyRole(rGlobals._ADMIN_ROLE_)
    {
        if (lastDistributionTime[_receiver] != 0) {
            require(
                tdGetters.getIntervals(lastDistributionTime[_receiver]) == 0,
                "TimeDistributor: pending distribution"
            );
        }

        tokensPerInterval[_receiver] = _amount;
        lastDistributionTime[_receiver] = tdUpdates.updateLastDistributionTime();

        emit TokensPerIntervalChange(_receiver, _amount);
    }

    /**
     * See {ITimeDistributor:ITimeDistributor-setDistribution}.
     */
    function setDistribution(
        address[] calldata _rewardTokens,
        address[] calldata _receivers,
        uint256[] calldata _amounts
    )
        external
        onlyRole(rGlobals._GOVERNOR_ROLE_)
    {
        for (uint256 i = 0; i < _receivers.length; i++) {
            address _receiver = _receivers[i];

            if (lastDistributionTime[_receiver] != 0) {
                require(
                    tdGetters.getIntervals(lastDistributionTime[_receiver]) == 0,
                    "TimeDistributor: pending distribution"
                );
            }

            tokensPerInterval[_receiver] = _amounts[i];
            rewardTokens[_receiver] = _rewardTokens[i];
            lastDistributionTime[_receiver] = tdUpdates.updateLastDistributionTime();

            emit DistributionChange(
                _receiver, tokensPerInterval[_receiver], rewardTokens[_receiver]
            );
        }
    }

    /**
     * See {ITimeDistributor:ITimeDistributor-distribute}.
     */
    function distribute() external returns (uint256) {
        address _receiver = _msgSender();

        if (tdGetters.getIntervals(lastDistributionTime[_receiver]) == 0) { return 0; }

        uint256 _amount = tdGetters.getDistributionAmount(
            rewardTokens[_receiver],
            tokensPerInterval[_receiver],
            lastDistributionTime[_receiver]
        );
        lastDistributionTime[_receiver] = tdUpdates.updateLastDistributionTime();

        if (_amount == 0) { return 0; }

        IERC20(rewardTokens[_receiver]).safeTransfer(_receiver, _amount);

        emit Distribute(_receiver, _amount);

        return _amount;
    }
}
