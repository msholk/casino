/* global describe it before ethers */
const { utils } = require("ethers");
const _ = require("lodash");
const { assert, expect } = require("chai");
const { BigNumber } = require("ethers");
const { getAccounts } = require("./utils/utils");

describe("Test HLP", async function () {
  let HLP;

  const facetAddress = {};
  let vrfInfo = {};

  async function deployContract() {
    let contractName = "HLP";
    const libFactory = await ethers.getContractFactory(contractName);
    const libDeployed = await libFactory.deploy();
    await libDeployed.deployed();

    HLP = await ethers.getContractAt(contractName, libDeployed.address);
    return libDeployed.address;
  }

  before(async function () {
    await deployContract();
  });

  describe("Player Deposits", async () => {
    it("check totalSupply is correct", async function () {
      const supply = await HLP.totalSupply();
      assert.equal(supply.toString(), "0");
    });
    it("check name is correct", async function () {
      const name = await HLP.name();
      assert.equal(name.toString(), "House of Matrix HLP token");
      const symbol = await HLP.symbol();
      assert.equal(symbol.toString(), "HLP");
    });
    it("mint 1000", async function () {
      const { signers, account0, account1, account2 } = await getAccounts();
      await HLP.setMinter(account0, true);
      await HLP.mint(account1, 1000);
      expect(await HLP.balanceOf(account1)).eq(1000);
    });
    it("Person 1 Transfer to Person2", async () => {
      const { signers, account0, account1, account2 } = await getAccounts();
      expect(HLP.connect(signers[1]).transfer(account2, 300)).revertedWith(
        "BaseToken maintenance: forbidden msg.sender"
      );
      expect(await HLP.getMaintenance()).eq(true);
      expect(await HLP.toggleMaintenance()).not.to.be.reverted;
      expect(HLP.connect(signers[1]).transfer(account2, 300)).not.to.be
        .reverted;
      expect(await HLP.balanceOf(account1)).eq(700);
      expect(await HLP.balanceOf(account2)).eq(300);
    });
    it("Person 1 Transfer to Gov", async () => {
      const { signers, account0, account1, account2 } = await getAccounts();
      expect(HLP.connect(signers[1]).transfer(account0, 300)).not.to.be
        .reverted;
      expect(await HLP.balanceOf(account0)).eq(300);
      expect(await HLP.burn(account1, 200)).not.to.be.reverted;
    });
  });
});
