// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

interface IVault {
    function setGov(address _gov) external;

    function setStakerFacet(address _StakerFacet) external;

    function setInManagerMode(bool _inManagerMode) external;

    function hadstaken(address _skater) external view returns (bool);

    function checkWithdrawableHLPAmount(address _skater, uint256 _amount)
        external
        view
        returns (bool);

    function checkWithdrawableAmount(address _skater)
        external
        view
        returns (uint256);

    function hlpPoolDeposit(address _skater, uint256 amountHLPowned)
        external
        payable
        returns (bool);

    function hlpPoolWithdrawSome(address _skater, uint256 amountHLPToWithdraw)
        external
        payable
        returns (bool);

    function hlpPoolWithdrawAsMuchAsYouCan(address _skater)
        external
        payable
        returns (bool, uint256);
}
