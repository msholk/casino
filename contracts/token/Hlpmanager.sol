// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";

import "../interfaces/IVault.sol";
import "../interfaces/IHLP.sol";
import "../interfaces/IHlpManager.sol";
import "../interfaces/IMintable.sol";
import "./Governable.sol";

contract HLPmanager is ReentrancyGuard, Governable, IHlpManager {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 public constant PRICE_PRECISION = 10**30;
    uint256 public constant USDG_DECIMALS = 18;
    uint256 public constant hlp_PRECISION = 10**18;
    uint256 public constant MAX_COOLDOWN_DURATION = 48 hours;
    uint256 public constant BASIS_POINTS_DIVISOR = 10000;

    address public vault;
    address public hlp;

    uint256 public cooldownDuration;
    mapping(address => uint256) public lastAddedAt;

    uint256 public aumAddition;
    uint256 public aumDeduction;

    bool public inPrivateMode;
    mapping(address => bool) public isHandler;

    event AddLiquidity(
        address account,
        address token,
        uint256 amount,
        uint256 hlpSupply,
        uint256 mintAmount
    );

    event RemoveLiquidity(
        address account,
        address token,
        uint256 hlpAmount,
        uint256 aumInUsdg,
        uint256 hlpSupply,
        uint256 usdgAmount,
        uint256 amountOut
    );

    constructor(address _hlp, address _vault) public {
        gov = msg.sender;
        // usdg = _usdg;
        hlp = _hlp;
        vault = _vault;
    }

    // function setInPrivateMode(bool _inPrivateMode) external onlyGov {
    //     inPrivateMode = _inPrivateMode;
    // }

    // function setHandler(address _handler, bool _isActive) external onlyGov {
    //     isHandler[_handler] = _isActive;
    // }

    // function setCooldownDuration(uint256 _cooldownDuration)
    //     external
    //
    //     onlyGov
    // {
    //     require(
    //         _cooldownDuration <= MAX_COOLDOWN_DURATION,
    //         "hlpManager: invalid _cooldownDuration"
    //     );
    //     cooldownDuration = _cooldownDuration;
    // }

    // function setAumAdjustment(uint256 _aumAddition, uint256 _aumDeduction)
    //     external
    //     onlyGov
    // {
    //     aumAddition = _aumAddition;
    //     aumDeduction = _aumDeduction;
    // }

    // function addLiquidity(
    //     address _token,
    //     uint256 _amount,
    //     uint256 _minUsdg,
    //     uint256 _minhlp
    // ) external  nonReentrant returns (uint256) {
    //     if (inPrivateMode) {
    //         revert("hlpManager: action not enabled");
    //     }
    //     return
    //         _addLiquidity(
    //             msg.sender,
    //             msg.sender,
    //             _token,
    //             _amount,
    //             // _minUsdg,
    //             _minhlp
    //         );
    // }

    // function addLiquidityForAccount(
    //     address _fundingAccount,
    //     address _account,
    //     address _token,
    //     uint256 _amount,
    //     uint256 _minUsdg,
    //     uint256 _minhlp
    // ) external  nonReentrant returns (uint256) {
    //     _validateHandler();
    //     return
    //         _addLiquidity(
    //             _fundingAccount,
    //             _account,
    //             _token,
    //             _amount,
    //             // _minUsdg,
    //             _minhlp
    //         );
    // }

    // function removeLiquidity(
    //     address _tokenOut,
    //     uint256 _hlpAmount,
    //     uint256 _minOut,
    //     address _receiver
    // ) external  nonReentrant returns (uint256) {
    //     if (inPrivateMode) {
    //         revert("hlpManager: action not enabled");
    //     }
    //     return
    //         _removeLiquidity(
    //             msg.sender,
    //             _tokenOut,
    //             _hlpAmount,
    //             _minOut,
    //             _receiver
    //         );
    // }

    // function removeLiquidityForAccount(
    //     address _account,
    //     address _tokenOut,
    //     uint256 _hlpAmount,
    //     uint256 _minOut,
    //     address _receiver
    // ) external  nonReentrant returns (uint256) {
    //     _validateHandler();
    //     return
    //         _removeLiquidity(
    //             _account,
    //             _tokenOut,
    //             _hlpAmount,
    //             _minOut,
    //             _receiver
    //         );
    // }

    // function getPrice(bool _maximise) external view returns (uint256) {
    //     uint256 supply = IERC20(hlp).totalSupply();
    //     return aum.mul(hlp_PRECISION).div(supply);
    // }

    function _addLiquidity(address _account, uint256 _amount)
        external
        payable
        returns (uint256)
    {
        require(_amount > 0, "hlpManager: invalid _amount");

        // // calculate aum before buyUSDG
        // uint256 aumInUsdg = getAumInUsdg(true);
        uint256 hlpSupply = IERC20(hlp).totalSupply();
        uint glp2Mint;
        
        // IERC20(hlp).safeTransferFrom(_fundingAccount, address(this), _amount);
        // // uint256 usdgAmount = vault.buyUSDG(_token, address(this));
        // // require(usdgAmount >= _minUsdg, "hlpManager: insufficient USDG output");

        // // uint256 mintAmount = aumInUsdg == 0
        // //     ? usdgAmount
        // //     : usdgAmount.mul(hlpSupply).div(aumInUsdg);
        // // require(mintAmount >= _minhlp, "hlpManager: insufficient hlp output");

        // IMintable(hlp).mint(_account, 10);

        // lastAddedAt[_account] = block.timestamp;

        // emit AddLiquidity(
        //     _account,
        //     _token,
        //     _amount,
        //     // aumInUsdg,
        //     hlpSupply,
        //     // usdgAmount,
        //     10
        // );

        // return 10;
    }

    // function _removeLiquidity(
    //     address _account,
    //     address _tokenOut,
    //     uint256 _hlpAmount,
    //     uint256 _minOut,
    //     address _receiver
    // ) private returns (uint256) {
    //     require(_hlpAmount > 0, "hlpManager: invalid _hlpAmount");
    //     require(
    //         lastAddedAt[_account].add(cooldownDuration) <= block.timestamp,
    //         "hlpManager: cooldown duration not yet passed"
    //     );

    //     // calculate aum before sellUSDG
    //     // uint256 aumInUsdg = getAumInUsdg(false);
    //     uint256 hlpSupply = IERC20(hlp).totalSupply();

    //     uint256 usdgAmount = _hlpAmount.mul(aumInUsdg).div(hlpSupply);
    //     uint256 usdgBalance = IERC20(usdg).balanceOf(address(this));
    //     if (usdgAmount > usdgBalance) {
    //         IUSDG(usdg).mint(address(this), usdgAmount.sub(usdgBalance));
    //     }

    //     IMintable(hlp).burn(_account, _hlpAmount);

    //     IERC20(usdg).transfer(address(this), usdgAmount);
    //     // uint256 amountOut = vault.sellUSDG(_tokenOut, _receiver);
    //     require(amountOut >= _minOut, "hlpManager: insufficient output");

    //     emit RemoveLiquidity(
    //         _account,
    //         _tokenOut,
    //         _hlpAmount,
    //         aumInUsdg,
    //         hlpSupply,
    //         usdgAmount,
    //         amountOut
    //     );

    //     return amountOut;
    // }

    //     function _validateHandler() private view {
    //         require(isHandler[msg.sender], "hlpManager: forbidden");
    //     }
}
