require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("hardhat-storage-layout");
require("dotenv").config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const MUMBAI_RPC = process.env.MUMBAI_RPC;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "EUR",
    gasPrice: 21,
    enabled: false,
    excludeContracts: [
      "DiamondCutFacet",
      "DiamondLoupeFacet",
      "OwnershipFacet",
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 2100000,
      gasPrice: 8000000000,
      //Will not work with testing on hardhat
      // mining: {
      //   auto: false,
      //   interval: 3000
      // },
      forking: {
        // Using Alchemy
        url: MUMBAI_RPC, // url to RPC node, ${ALCHEMY_KEY} - must be your API key
      },
    },
    mumbai: {
      url: MUMBAI_RPC,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      chainId: 80001,
    },
  },
};
