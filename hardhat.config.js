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
    excludeContracts: ["Test1Facet", "Test2Facet", "DiamondCutFacet", "DiamondLoupeFacet", "OwnershipFacet"]
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        // Using Alchemy
        url: `https://eth-mainnet.alchemyapi.io/v2/a1H2bvHzNVPb9GP63_v-GpA0KVhbI95Z`, // url to RPC node, ${ALCHEMY_KEY} - must be your API key
        // Using Infura
        // url: `https://mainnet.infura.io/v3/${INFURA_KEY}`, // ${INFURA_KEY} - must be your API key
        blockNumber: 15756193, // a specific block number with which you want to work
      },
    },
  }
};
