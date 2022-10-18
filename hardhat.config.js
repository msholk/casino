require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { BLOCK_NUMBER } = require('./config');

module.exports = {
  defaultNetwork: 'hardhat',
  chainId: 31337,
  networks: {
    hardhat: {
      forking: {
        url: process.env.ARBITRUM_MAINNET_API_URL,
        blockNumber: BLOCK_NUMBER
      }
    },
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBISCAN_API_KEY,
    }
  },
  solidity: "0.8.17",
  // solidity: {
  //   version: "0.8.5",
  //   settings: {
  //     optimizer: {
  //       enabled: true,
  //       runs: 1
  //     }
  //   }
  // }
}
