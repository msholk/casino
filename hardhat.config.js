require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require('hardhat-storage-layout');
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  gasReporter: {
    currency: 'EUR',
    gasPrice: 21,
    enabled: false,
    excludeContracts: ["DiamondCutFacet", "DiamondLoupeFacet", "OwnershipFacet"]
  },
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
};
