// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";

// import "./interfaces/IVault.sol";


contract Vault is ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct Position {
        uint256 size;
        uint256 collateral;
        uint256 averagePrice;
        uint256 entryFundingRate;
        uint256 reserveAmount;
        int256 realisedPnl;
        uint256 lastIncreasedTime;
    }

    // uint256 public constant BASIS_POINTS_DIVISOR = 10000;
    // uint256 public constant FUNDING_RATE_PRECISION = 1000000;
    // uint256 public constant PRICE_PRECISION = 10 ** 30;
    // uint256 public constant MIN_LEVERAGE = 10000; // 1x
    // uint256 public constant USDG_DECIMALS = 18;
    // uint256 public constant MAX_FEE_BASIS_POINTS = 500; // 5%
    // uint256 public constant MAX_LIQUIDATION_FEE_USD = 100 * PRICE_PRECISION; // 100 USD
    // uint256 public constant MIN_FUNDING_RATE_INTERVAL = 1 hours;
    // uint256 public constant MAX_FUNDING_RATE_FACTOR = 10000; // 1%

    // bool public override isInitialized;
    // bool public override isSwapEnabled = true;
    // bool public override isLeverageEnabled = true;

    // IVaultUtils public vaultUtils;

    // address public errorController;

    // address public override router;
    // address public override priceFeed;

    // address public override usdg;
    // address public override gov;

    // uint256 public override whitelistedTokenCount;

    // uint256 public override maxLeverage = 50 * 10000; // 50x

    // uint256 public override liquidationFeeUsd;
    // uint256 public override taxBasisPoints = 50; // 0.5%
    // uint256 public override stableTaxBasisPoints = 20; // 0.2%
    // uint256 public override mintBurnFeeBasisPoints = 30; // 0.3%
    // uint256 public override swapFeeBasisPoints = 30; // 0.3%
    // uint256 public override stableSwapFeeBasisPoints = 4; // 0.04%
    // uint256 public override marginFeeBasisPoints = 10; // 0.1%

    // uint256 public override minProfitTime;
    // bool public override hasDynamicFees = false;

    // uint256 public override fundingInterval = 8 hours;
    // uint256 public override fundingRateFactor;
    // uint256 public override stableFundingRateFactor;
    // uint256 public override totalTokenWeights;

    // bool public includeAmmPrice = true;
    // bool public useSwapPricing = false;

    // bool public override inManagerMode = false;
    // bool public override inPrivateLiquidationMode = false;

    // uint256 public override maxGasPrice;

    // mapping (address => mapping (address => bool)) public override approvedRouters;
    // mapping (address => bool) public override isLiquidator;
    // mapping (address => bool) public override isManager;

    // address[] public override allWhitelistedTokens;

    // mapping (address => bool) public override whitelistedTokens;
    // mapping (address => uint256) public override tokenDecimals;
    // mapping (address => uint256) public override minProfitBasisPoints;
    // mapping (address => bool) public override stableTokens;
    // mapping (address => bool) public override shortableTokens;

    // // tokenBalances is used only to determine _transferIn values
    // mapping (address => uint256) public override tokenBalances;

    // // tokenWeights allows customisation of index composition
    // mapping (address => uint256) public override tokenWeights;

    // // usdgAmounts tracks the amount of USDG debt for each whitelisted token
    // mapping (address => uint256) public override usdgAmounts;

    // // maxUsdgAmounts allows setting a max amount of USDG debt for a token
    // mapping (address => uint256) public override maxUsdgAmounts;

    // // poolAmounts tracks the number of received tokens that can be used for leverage
    // // this is tracked separately from tokenBalances to exclude funds that are deposited as margin collateral
    // mapping (address => uint256) public override poolAmounts;

    // // reservedAmounts tracks the number of tokens reserved for open leverage positions
    // mapping (address => uint256) public override reservedAmounts;

    // // bufferAmounts allows specification of an amount to exclude from swaps
    // // this can be used to ensure a certain amount of liquidity is available for leverage positions
    // mapping (address => uint256) public override bufferAmounts;

    // // guaranteedUsd tracks the amount of USD that is "guaranteed" by opened leverage positions
    // // this value is used to calculate the redemption values for selling of USDG
    // // this is an estimated amount, it is possible for the actual guaranteed value to be lower
    // // in the case of sudden price decreases, the guaranteed value should be corrected
    // // after liquidations are carried out
    // mapping (address => uint256) public override guaranteedUsd;

    // // cumulativeFundingRates tracks the funding rates based on utilization
    // mapping (address => uint256) public override cumulativeFundingRates;
    // // lastFundingTimes tracks the last time funding was updated for a token
    // mapping (address => uint256) public override lastFundingTimes;

    // // positions tracks all open positions
    // mapping (bytes32 => Position) public positions;

    // // feeReserves tracks the amount of fees per token
    // mapping (address => uint256) public override feeReserves;

    // mapping (address => uint256) public override globalShortSizes;
    // mapping (address => uint256) public override globalShortAveragePrices;
    // mapping (address => uint256) public override maxGlobalShortSizes;

    // mapping (uint256 => string) public errors;

    
    // event DirectPoolDeposit(address token, uint256 amount);
    // event IncreasePoolAmount(address token, uint256 amount);
    // event DecreasePoolAmount(address token, uint256 amount);

    // once the parameters are verified to be working correctly,
    // gov should be set to a timelock contract or a governance contract
    constructor() public {
        // gov = msg.sender;
    }

    // function initialize(
    //     address _router,
    //     address _usdg,
    //     address _priceFeed,
    //     uint256 _liquidationFeeUsd,
    //     uint256 _fundingRateFactor,
    //     uint256 _stableFundingRateFactor
    // ) external {
    //     _onlyGov();
    //     _validate(!isInitialized, 1);
    //     isInitialized = true;

    //     router = _router;
    //     usdg = _usdg;
    //     priceFeed = _priceFeed;
    //     liquidationFeeUsd = _liquidationFeeUsd;
    //     fundingRateFactor = _fundingRateFactor;
    //     stableFundingRateFactor = _stableFundingRateFactor;
    // }

    

    // function allWhitelistedTokensLength() external override view returns (uint256) {
    //     return allWhitelistedTokens.length;
    // }

    // function setInManagerMode(bool _inManagerMode) external override {
    //     _onlyGov();
    //     inManagerMode = _inManagerMode;
    // }

    // function setManager(address _manager, bool _isManager) external override {
    //     _onlyGov();
    //     isManager[_manager] = _isManager;
    // }

    // function setGov(address _gov) external {
    //     _onlyGov();
    //     gov = _gov;
    // }

    // function setFundingRate(uint256 _fundingInterval, uint256 _fundingRateFactor, uint256 _stableFundingRateFactor) external override {
    //     _onlyGov();
    //     _validate(_fundingInterval >= MIN_FUNDING_RATE_INTERVAL, 10);
    //     _validate(_fundingRateFactor <= MAX_FUNDING_RATE_FACTOR, 11);
    //     _validate(_stableFundingRateFactor <= MAX_FUNDING_RATE_FACTOR, 12);
    //     fundingInterval = _fundingInterval;
    //     fundingRateFactor = _fundingRateFactor;
    //     stableFundingRateFactor = _stableFundingRateFactor;
    // }

    // function setTokenConfig(
    //     address _token,
    //     uint256 _tokenDecimals,
    //     uint256 _tokenWeight,
    //     uint256 _minProfitBps,
    //     uint256 _maxUsdgAmount,
    //     bool _isStable,
    //     bool _isShortable
    // ) external override {
    //     _onlyGov();
    //     // increment token count for the first time
    //     if (!whitelistedTokens[_token]) {
    //         whitelistedTokenCount = whitelistedTokenCount.add(1);
    //         allWhitelistedTokens.push(_token);
    //     }

    //     uint256 _totalTokenWeights = totalTokenWeights;
    //     _totalTokenWeights = _totalTokenWeights.sub(tokenWeights[_token]);

    //     whitelistedTokens[_token] = true;
    //     tokenDecimals[_token] = _tokenDecimals;
    //     tokenWeights[_token] = _tokenWeight;
    //     minProfitBasisPoints[_token] = _minProfitBps;
    //     maxUsdgAmounts[_token] = _maxUsdgAmount;
    //     stableTokens[_token] = _isStable;
    //     shortableTokens[_token] = _isShortable;

    //     totalTokenWeights = _totalTokenWeights.add(_tokenWeight);

    //     // validate price feed
    //     getMaxPrice(_token);
    // }


    // function addRouter(address _router) external {
    //     approvedRouters[msg.sender][_router] = true;
    // }

    // function removeRouter(address _router) external {
    //     approvedRouters[msg.sender][_router] = false;
    // }

    // // the governance controlling this function should have a timelock
    // function upgradeVault(address _newVault, address _token, uint256 _amount) external {
    //     _onlyGov();
    //     IERC20(_token).safeTransfer(_newVault, _amount);
    // }

    // // deposit into the pool without minting USDG tokens
    // // useful in allowing the pool to become over-collaterised
    // function directPoolDeposit(address _token) external override nonReentrant {
    //     _validate(whitelistedTokens[_token], 14);
    //     uint256 tokenAmount = _transferIn(_token);
    //     _validate(tokenAmount > 0, 15);
    //     _increasePoolAmount(_token, tokenAmount);
    //     emit DirectPoolDeposit(_token, tokenAmount);
    // }

    // function getRedemptionAmount(address _token, uint256 _usdgAmount) public override view returns (uint256) {
    //     uint256 price = getMaxPrice(_token);
    //     uint256 redemptionAmount = _usdgAmount.mul(PRICE_PRECISION).div(price);
    //     return adjustForDecimals(redemptionAmount, usdg, _token);
    // }


    // function adjustForDecimals(uint256 _amount, address _tokenDiv, address _tokenMul) public view returns (uint256) {
    //     uint256 decimalsDiv = _tokenDiv == usdg ? USDG_DECIMALS : tokenDecimals[_tokenDiv];
    //     uint256 decimalsMul = _tokenMul == usdg ? USDG_DECIMALS : tokenDecimals[_tokenMul];
    //     return _amount.mul(10 ** decimalsMul).div(10 ** decimalsDiv);
    // }

    // function tokenToUsdMin(address _token, uint256 _tokenAmount) public override view returns (uint256) {
    //     if (_tokenAmount == 0) { return 0; }
    //     uint256 price = getMinPrice(_token);
    //     uint256 decimals = tokenDecimals[_token];
    //     return _tokenAmount.mul(price).div(10 ** decimals);
    // }

    // function usdToTokenMax(address _token, uint256 _usdAmount) public view returns (uint256) {
    //     if (_usdAmount == 0) { return 0; }
    //     return usdToToken(_token, _usdAmount, getMinPrice(_token));
    // }

    // function usdToTokenMin(address _token, uint256 _usdAmount) public view returns (uint256) {
    //     if (_usdAmount == 0) { return 0; }
    //     return usdToToken(_token, _usdAmount, getMaxPrice(_token));
    // }

    // function usdToToken(address _token, uint256 _usdAmount, uint256 _price) public view returns (uint256) {
    //     if (_usdAmount == 0) { return 0; }
    //     uint256 decimals = tokenDecimals[_token];
    //     return _usdAmount.mul(10 ** decimals).div(_price);
    // }

    

    // function getNextFundingRate(address _token) public override view returns (uint256) {
    //     if (lastFundingTimes[_token].add(fundingInterval) > block.timestamp) { return 0; }

    //     uint256 intervals = block.timestamp.sub(lastFundingTimes[_token]).div(fundingInterval);
    //     uint256 poolAmount = poolAmounts[_token];
    //     if (poolAmount == 0) { return 0; }

    //     uint256 _fundingRateFactor = stableTokens[_token] ? stableFundingRateFactor : fundingRateFactor;
    //     return _fundingRateFactor.mul(reservedAmounts[_token]).mul(intervals).div(poolAmount);
    // }

    // function _transferIn(address _token) private returns (uint256) {
    //     uint256 prevBalance = tokenBalances[_token];
    //     uint256 nextBalance = IERC20(_token).balanceOf(address(this));
    //     tokenBalances[_token] = nextBalance;

    //     return nextBalance.sub(prevBalance);
    // }

    // function _transferOut(address _token, uint256 _amount, address _receiver) private {
    //     IERC20(_token).safeTransfer(_receiver, _amount);
    //     tokenBalances[_token] = IERC20(_token).balanceOf(address(this));
    // }

    // function _updateTokenBalance(address _token) private {
    //     uint256 nextBalance = IERC20(_token).balanceOf(address(this));
    //     tokenBalances[_token] = nextBalance;
    // }

    // // we have this validation as a function instead of a modifier to reduce contract size
    // function _onlyGov() private view {
    //     _validate(msg.sender == gov, 53);
    // }

}
