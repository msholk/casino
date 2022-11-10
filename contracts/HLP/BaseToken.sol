// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

// import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";

contract BaseToken is IERC20 {
  //   using SafeMath for uint256;

  string public name;
  string public symbol;
  uint8 public constant decimals = 18;

  uint256 public override totalSupply;
  address public gov;

  bool public maintenancestate = true;
  uint256 public migrationTime;

  mapping(address => uint256) public balances;
  mapping(address => mapping(address => uint256)) public allowances;

  mapping(address => bool) public admins;

  // only checked when maintenancestate is true
  // this can be used to block the AMM pair as a recipient
  // and protect liquidity providers during a migration
  // by disabling the selling of BaseToken
  mapping(address => bool) public blockedRecipients;

  // only checked when maintenancestate is true
  // this can be used for:
  // - only allowing tokens to be transferred by the distribution contract
  // during the initial distribution phase, this would prevent token buyers
  // from adding liquidity before the initial liquidity is seeded
  // - only allowing removal of BaseToken liquidity and no other actions
  // during the migration phase
  mapping(address => bool) public allowedMsgSenders;

  modifier onlyGov() {
    require(msg.sender == gov, "BaseToken: forbidden");
    _;
  }

  modifier onlyAdmin() {
    require(admins[msg.sender], "BaseToken: forbidden");
    _;
  }

  constructor(string memory _name, string memory _symbol)
  // uint256 _initialSupply
  {
    name = _name;
    symbol = _symbol;
    gov = msg.sender;
    admins[msg.sender] = true;
    // _mint(msg.sender, _initialSupply);
  }

  function toggleMaintenance() external onlyAdmin {
    maintenancestate = !maintenancestate;
  }

  function clearMaintenance() external onlyAdmin {
    maintenancestate = false;
  }

  function setMaintenance() external onlyAdmin {
    maintenancestate = true;
  }

  function getMaintenance() external view returns (bool) {
    return maintenancestate;
  }

  function addBlockedRecipient(address _recipient) external onlyGov {
    blockedRecipients[_recipient] = true;
  }

  function removeBlockedRecipient(address _recipient) external onlyGov {
    blockedRecipients[_recipient] = false;
  }

  function addMsgSender(address _msgSender) external onlyGov {
    allowedMsgSenders[_msgSender] = true;
  }

  function removeMsgSender(address _msgSender) external onlyGov {
    allowedMsgSenders[_msgSender] = false;
  }

  // to help users who accidentally send their tokens to this contract
  function withdrawToken(
    address _token,
    address _account,
    uint256 _amount
  ) external onlyGov {
    IERC20(_token).transfer(_account, _amount);
  }

  function balanceOf(address _account)
    external
    view
    override
    returns (uint256)
  {
    return balances[_account];
  }

  function transfer(address _recipient, uint256 _amount)
    external
    override
    returns (bool)
  {
    _transfer(msg.sender, _recipient, _amount);
    return true;
  }

  function allowance(address _owner, address _spender)
    external
    view
    override
    returns (uint256)
  {
    return allowances[_owner][_spender];
  }

  function approve(address _spender, uint256 _amount)
    external
    override
    returns (bool)
  {
    _approve(msg.sender, _spender, _amount);
    return true;
  }

  function transferFrom(
    address _sender,
    address _recipient,
    uint256 _amount
  ) external override returns (bool) {
    uint256 currentAllowance = allowances[_sender][msg.sender];
    require(
      currentAllowance >= _amount,
      "BaseToken: transfer amount exceeds allowance"
    );
    uint256 nextAllowance = currentAllowance - _amount;
    _approve(_sender, msg.sender, nextAllowance);
    _transfer(_sender, _recipient, _amount);
    return true;
  }

  function _transfer(
    address _sender,
    address _recipient,
    uint256 _amount
  ) private {
    require(_sender != address(0), "BaseToken: transfer from the zero address");
    require(
      _recipient != address(0),
      "BaseToken: transfer to the zero address"
    );

    if (maintenancestate) {
      require(
        allowedMsgSenders[msg.sender],
        "BaseToken maintenance: forbidden msg.sender"
      );
      require(
        !blockedRecipients[_recipient],
        "BaseToken maintenance: forbidden recipient"
      );
    }

    require(
      balances[_sender] >= _amount,
      "BaseToken: transfer amount exceeds balance"
    );
    balances[_sender] = balances[_sender] - _amount;
    balances[_recipient] = balances[_recipient] + _amount;

    emit Transfer(_sender, _recipient, _amount);
  }

  function _mint(address _account, uint256 _amount) internal {
    require(_account != address(0), "BaseToken: mint to the zero address");

    totalSupply = totalSupply + _amount;
    balances[_account] = balances[_account] + _amount;

    emit Transfer(address(0), _account, _amount);
  }

  function _approve(
    address _owner,
    address _spender,
    uint256 _amount
  ) private {
    require(_owner != address(0), "BaseToken: approve from the zero address");
    require(_spender != address(0), "BaseToken: approve to the zero address");

    allowances[_owner][_spender] = _amount;

    emit Approval(_owner, _spender, _amount);
  }

  function _burn(address _owner, uint256 _amount) internal {
    require(_owner != address(0), "ERC20: burn from the zero address");

    uint256 accountBalance = balances[_owner];
    require(accountBalance >= _amount, "ERC20: burn amount exceeds balance");
    unchecked {
      balances[_owner] = accountBalance - _amount;
      // Overflow not possible: amount <= accountBalance <= totalSupply.
      totalSupply -= _amount;
    }

    emit Transfer(_owner, address(0), _amount);
  }
}
