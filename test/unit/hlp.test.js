const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("HLP Unit Tests", function () {
      let nftMarketplace, nftMarketplaceContract, basicNft, basicNftContract;
      const PRICE = ethers.utils.parseEther("0.1");
      const TOKEN_ID = 0;

      beforeEach(async () => {
        accounts = await ethers.getSigners(); // could also do with getNamedAccounts
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(["all"]);
        HLPcontract = await ethers.getContract("HLP");
        HLPContract = HLPcontract.connect(deployer);
      });
      describe("token infos check", function () {
        it("check totalSupply is correct", async function () {
          const supply = await HLPContract.totalSupply();
          assert.equal(supply.toString(), "100000000");
        });
        it("check name is correct", async function () {
          const name = await HLPContract.name();
          assert.equal(name.toString(), "HLP");
          const symbol = await HLPContract.symbol();
          assert.equal(symbol.toString(), "HLP");
        });
      });
      describe("maintenancestates toggle transfer function", function () {
        it("maintenancestates is false", async function () {
          expect(await HLPContract.transfer(user.address, 10000)).to.emit(
            "Transfer"
          );
        });
        it("maintenancestates is true", async function () {
          await HLPContract.maintenance();
          await expect(
            HLPContract.transfer(user.address, 10000)
          ).to.be.revertedWith("HLP: forbidden msg.sender");
        });
      });
    });
