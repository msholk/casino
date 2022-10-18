/* global hre ethers */
// We require the Buidler Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `buidler run <script>` you'll find the Buidler
// Runtime Environment's members available in the global scope.
// eslint-disable-next-line no-unused-vars
// const bre = require('@nomiclabs/buidler')
// const { ethers } = require('ethers')
// import { ethers } from 'ethers'
//npx hardhat run  scripts/deploy.js

const diamond = require('diamond-util')
// const { ethers } = require('ethers')
// const diamond = require('./diamond-util.js')
const { diamondDeploy } = require("./libraries/deploy-diamond-util")

async function main() {
  // Buidler always runs the compile task when running scripts through it.
  // If this runs in a standalone fashion you may want to call compile manually
  // to make sure everything is compiled
  // await bre.run('compile');

  const accounts = await ethers.getSigners()
  const account = await accounts[0].getAddress()

  // eslint-disable-next-line no-unused-vars
  const deployedDiamond = await diamondDeploy({
    diamondName: 'CasinoDiamond',
    facets: [
      'DiamondCutFacet',
      'DiamondLoupeFacet',
      'OwnershipFacet'
    ],
    args: [account]
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
