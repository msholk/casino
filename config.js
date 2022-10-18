const { ethers } = require('ethers');

module.exports = {
    BLOCK_NUMBER: 10000000,
    GMX_TOKEN: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    DEFAULT_TEST_VALUES: {
        TOKEN_NAME: 'House Matrix',
        TOKEN_SYMBOL: 'HMX',
        INITIAL_SUPPLY: 1000
    },
    ROLES: {
        DEFAULT: ethers.utils.hexZeroPad("0x00", 32),
        _ADMIN_ROLE_: ethers.utils.formatBytes32String("ADMIN"),
        _GOVERNOR_ROLE_: ethers.utils.formatBytes32String("GOVERNOR"),
        _DISTRIBUTOR_ROLE_: ethers.utils.formatBytes32String("DISTRIBUTOR"),
        _MINTER_ROLE_: ethers.utils.formatBytes32String("MINTER"),
        _WHITELIST_HANDLER_ROLE_: ethers.utils.formatBytes32String("WHITELIST_HANDLER"),
        _NON_STAKING_ACCOUNT_ROLE_: ethers.utils.formatBytes32String("NON_STAKING_ACCOUNT"),
        _YIELD_TOKEN_ACCOUNT_ROLE_: ethers.utils.formatBytes32String("YIELD_TOKEN_ACCOUNT"),
    },
    CHAINID_TO_NETWORK: {
        '31337': 'LocalHost',
        '1': 'ETH Mainnet',
        '5': 'Goerli'
    },
    ETHERSCAN: {
        '31337': "https://etherscan.io/",
        '1': "https://etherscan.io/",
        '5': "https://goerli.etherscan.io/"
    }
}