/* global describe it before ethers */
const { utils } = require("ethers");
const { selectorsToDic } = require("./utils/utils");
const { facetSelectors } = require("./utils/facetSelectors");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const _ = require("lodash");
const { assert, expect } = require("chai");
const { BigNumber } = require("ethers");
const {
  getSelectors,
  FacetCutAction,
  removeSelectors,
  findAddressPositionInFacets,
} = require("../scripts/libraries/diamond.js");
const { deployDiamond } = require("../scripts/deployDiamond.js");
const ZEROS18 = "000000000000000000";

const {
  diamondInit1,
  getAccounts,
  checkFacets1,
  checkFacets2,
} = require("./utils/utils");
describe("Staking test", async function () {
  let diamondAddress;
  let diamondCutFacet;
  let diamondLoupeFacet;
  let ownershipFacet;
  let playersFacet;
  let stakerFacet;
  let adminFacet;
  let tx;
  let receipt;
  let result;
  let TokensMock;
  let Staker;

  const facetAddress = {};
  let vrfInfo = {};

  async function deployContract() {
    let contractName = "StakerFacet";
    const libFactory = await ethers.getContractFactory(contractName);
    const libDeployed = await libFactory.deploy();
    await libDeployed.deployed();

    Staker = await ethers.getContractAt(contractName, libDeployed.address);
    return libDeployed.address;
  }

  before(async function () {
    await deployContract();
  });

  describe("Stake House Liquidity", async () => {
    xit("The first staker should have some 66%", async () => {
      let bal = await Staker.checkStakerBalance();
      //console.log(bal)
      expect(bal.stakerPercent).eq(0); //1 means 100%
      expect(bal.newHouseBalance).eq(0); //1 means 100%
    });
    it("Staker0 stakes 1ETH", async () => {
      await expect(Staker.stakeETH({ value: utils.parseEther("1.0") })).not.to
        .be.reverted;

      bal = await Staker.checkStakerBalance();
      //   // console.log(bal)
      expect(bal.stakerPercent).eq(utils.parseEther("1")); //1 means 100%
      expect(bal.newHouseBalance).eq(utils.parseEther("1")); //1 means 100%
    });
    it("Staker1 stakes: 2ETH", async () => {
      const signers = await ethers.getSigners();
      await expect(
        Staker.connect(signers[1]).stakeETH({ value: utils.parseEther("2.0") })
      ).not.to.be.reverted;
    });

    it("The first staker should have some 33%", async () => {
      let bal = await Staker.checkStakerBalance();
      //console.log(bal)
      expect(bal.stakerPercent).eq(utils.parseEther("0.333333333333333333")); //1 means 100%
      expect(bal.newHouseBalance).eq(utils.parseEther("3")); //1 means 100%
    });
    it("The second staker should have some 33%", async () => {
      const signers = await ethers.getSigners();
      let bal = await Staker.connect(signers[1]).checkStakerBalance();
      //console.log(bal)
      expect(bal.stakerPercent).eq(utils.parseEther("0.666666666666666667")); //1 means 100%
      expect(bal.newHouseBalance).eq(utils.parseEther("3")); //1 means 100%
    });
    it("Withdraw funds", async () => {
      await expect(Staker.withdrawAllStakerDAI()).not.to.be.reverted;
      let bal = await Staker.checkStakerBalance();
      //console.log(bal)
      expect(bal.stakerPercent).eq(0); //1 means 100%
      expect(bal.newHouseBalance).eq(utils.parseEther("2.000000000000000001")); //1 means 100%
    });
  });
});
