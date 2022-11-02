/* global describe it before ethers */
const { utils } = require("ethers");
const _ = require("lodash");
const { assert, expect } = require("chai");
const { BigNumber } = require("ethers");
const { getAccounts } = require("./utils/utils");

describe("Test GLP", async function () {
  let GLP;

  const facetAddress = {};
  let vrfInfo = {};

  async function deployContract() {
    let contractName = "GLP";
    const libFactory = await ethers.getContractFactory(contractName);
    const libDeployed = await libFactory.deploy();
    await libDeployed.deployed();

    GLP = await ethers.getContractAt(contractName, libDeployed.address);
    return libDeployed.address;
  }

  before(async function () {
    await deployContract();
  });

  describe("Player Deposits", async () => {
    it("check totalSupply is correct", async function () {
      const supply = await GLP.totalSupply();
      assert.equal(supply.toString(), "0");
    });
    it("check name is correct", async function () {
      const name = await GLP.name();
      assert.equal(name.toString(), "House of Matrix GLP token");
      const symbol = await GLP.symbol();
      assert.equal(symbol.toString(), "GLP");
    });
    it("mint 1000", async function () {
      const { signers, account0, account1, account2 } = await getAccounts();
      await GLP.setMinter(account0, true);
      await GLP.mint(account1, 1000);
      expect(await GLP.balanceOf(account1)).eq(1000);
    });
    it("Person 1 Transfer to Person2", async () => {
      const { signers, account0, account1, account2 } = await getAccounts();
      expect(GLP.connect(signers[1]).transfer(account2, 300)).revertedWith(
        "BaseToken maintenance: forbidden msg.sender"
      );
      expect(await GLP.getMaintenance()).eq(true);
      expect(await GLP.toggleMaintenance()).not.to.be.reverted;
      expect(GLP.connect(signers[1]).transfer(account2, 300)).not.to.be
        .reverted;
      expect(await GLP.balanceOf(account1)).eq(700);
      expect(await GLP.balanceOf(account2)).eq(300);
    });
    it("Person 1 Transfer to Gov", async () => {
      const { signers, account0, account1, account2 } = await getAccounts();
      expect(GLP.connect(signers[1]).transfer(account0, 300)).not.to.be
        .reverted;
      expect(await GLP.balanceOf(account0)).eq(300);
      expect(await GLP.burn(account1, 200)).not.to.be.reverted;
    });
  });
});
