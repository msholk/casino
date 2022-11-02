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
  let GLP;
  let GLPAddress;

  const facetAddress = {};
  let vrfInfo = {};

  async function deployGLP() {
    const contractName = "GLP";
    const facetFactory = await ethers.getContractFactory(contractName, {
      libraries: {},
    });
    console.log(`Deploying ${contractName}`);
    deployedFactory = await facetFactory.deploy();
    await deployedFactory.deployed();
    console.log(`${contractName} deployed: ${deployedFactory.address}`);
    GLPAddress = deployedFactory.address;
    GLP = await ethers.getContractAt(contractName, deployedFactory.address);
  }

  async function deployContract() {
    let contractName = "StakerFacet";
    const libFactory = await ethers.getContractFactory(contractName);
    const libDeployed = await libFactory.deploy();
    await libDeployed.deployed();

    Staker = await ethers.getContractAt(contractName, libDeployed.address);
    return libDeployed.address;
  }

  before(async function () {
    const stakerAddress = await deployContract();
    await deployGLP();

    const signers = await ethers.getSigners();
    await GLP.setMinter(signers[0].getAddress(), true);
    await GLP.setMinter(stakerAddress, true);
    await GLP.toggleMaintenance();
    Staker.setGLPTokenAddress(GLPAddress);
  });

  describe("Stake House Liquidity", async () => {
    it("Staker0 stakes 1ETH", async () => {
      await expect(Staker.stakeETH({ value: utils.parseEther("1.0") })).not.to
        .be.reverted;

      bal = await Staker.checkStakerBalance();
      console.log(bal);
      expect(bal.stakerPercent).eq(utils.parseEther("1")); //1 means 100%
      expect(bal.houseBalance).eq(utils.parseEther("1")); //1 means 100%
      expect(bal.userbalance).eq(utils.parseEther("1000"));
      expect(bal.glpSupply).eq(utils.parseEther("1000")); //1 means 100%
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
      expect(bal.houseBalance).eq(utils.parseEther("3")); //1 means 100%
      expect(bal.userbalance).eq(utils.parseEther("1000"));
      expect(bal.glpSupply).eq(utils.parseEther("3000.000000000000003")); //1 means 100%
    });
    it("The second staker should have some 66%", async () => {
      const signers = await ethers.getSigners();
      let bal = await Staker.connect(signers[1]).checkStakerBalance();
      //console.log(bal)
      expect(bal.stakerPercent).eq(utils.parseEther("0.666666666666666666")); //1 means 100%
      expect(bal.houseBalance).eq(utils.parseEther("3")); //1 means 100%
      expect(bal.userbalance).eq(utils.parseEther("2000.000000000000003"));
      expect(bal.glpSupply).eq(utils.parseEther("3000.000000000000003")); //1 means 100%
    });
    xit("Withdraw funds", async () => {
      await expect(Staker.withdrawAllStakerDAI()).not.to.be.reverted;
      let bal = await Staker.checkStakerBalance();
      //console.log(bal)
      expect(bal.stakerPercent).eq(0); //1 means 100%
      expect(bal.houseBalance).eq(utils.parseEther("2.000000000000000001")); //1 means 100%
    });
  });
});
