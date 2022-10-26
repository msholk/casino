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
describe("Player test", async function () {
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
  let Player;

  const facetAddress = {};
  let vrfInfo = {};

  async function deployContract() {
    let contractName = "PlayersFacet";
    const libFactory = await ethers.getContractFactory(contractName);
    const libDeployed = await libFactory.deploy();
    await libDeployed.deployed();

    Player = await ethers.getContractAt(contractName, libDeployed.address);
    return libDeployed.address;
  }

  before(async function () {
    await deployContract();
  });

  describe("Player Deposits", async () => {
    it("Player deposits 1 NATIVE", async () => {
      await expect(Player.depositToCashier({ value: utils.parseEther("1.0") }))
        .not.to.be.reverted;

      bal = await Player.checkPlayerBalance();
      //   // console.log(bal)
      expect(bal.playerBalance).eq(utils.parseEther("1")); //1 means 100%
      expect(bal.priceInStable).gt(399847); //1 means 100%
    });

    it("Withdraw funds", async () => {
      await expect(Player.withdrawPlayerBalance()).not.to.be.reverted;
      let bal = await Player.checkPlayerBalance();
      //console.log(bal)
      expect(bal.playerBalance).eq(0); //1 means 100%
    });
  });
});
