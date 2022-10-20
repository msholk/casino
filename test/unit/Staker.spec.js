const { network, ethers } = require("hardhat")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { networkConfig, developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")
const { BigNumber } = require("ethers");
const { ZERO_ADDRESS } = require('../utils/utils')

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random Number Consumer Unit Tests", async function () {
        // We define a fixture to reuse the same setup in every test.
        // We use loadFixture to run this setup once, snapshot that state,
        // and reset Hardhat Network to that snapshot in every test.
        async function deployStakerFacet() {
            const [deployer] = await ethers.getSigners()

            const StakerFacetFactory = await ethers.getContractFactory(
                "StakerFacet"
            )
            const StakerFacet = await StakerFacetFactory.deploy()

            return { StakerFacet }
        }

        describe("Stakers", async function () {
            it("Deposit Ether", async function () {
                const { StakerFacet } = await loadFixture(
                    deployStakerFacet
                )
                const signers = await ethers.getSigners()

                await StakerFacet.depositETH({ value: BigNumber.from(1) })
                const PRCNT_PRECISION = 16

                let res = await StakerFacet.checkStakerBalance()
                let stakerPercent = ethers.utils.formatEther(res.stakerPercent) * 10 ** 18 / (10 ** PRCNT_PRECISION)
                expect(stakerPercent).to.equal(100)
                expect(res.newHouseBalance).to.equal(1270)
                console.log(`${res.newHouseBalance}DAI`, `${stakerPercent}%`)


                await StakerFacet.connect(signers[1])
                    .depositETH({ value: BigNumber.from(2) });

                res = await StakerFacet.checkStakerBalance()
                stakerPercent = ethers.utils.formatEther(res.stakerPercent) * 10 ** 18 / (10 ** PRCNT_PRECISION)
                expect(stakerPercent).to.equal(33.33333333333333)
                expect(res.newHouseBalance).to.equal(3810)
                console.log(`${res.newHouseBalance}DAI`, `${stakerPercent}%`)


                res = await StakerFacet.connect(signers[1]).checkStakerBalance()
                stakerPercent = ethers.utils.formatEther(res.stakerPercent) * 10 ** 18 / (10 ** PRCNT_PRECISION)
                expect(stakerPercent).to.equal(66.66666666666666)
                expect(res.newHouseBalance).to.equal(3810)
                console.log(`${res.newHouseBalance}DAI`, `${stakerPercent}%`)


                await StakerFacet.connect(signers[0])
                    .depositETH({ value: BigNumber.from(1) });


                const expectePercent = 49.980314960629926
                res = await StakerFacet.checkStakerBalance()
                stakerPercent = ethers.utils.formatEther(res.stakerPercent) * 10 ** 18 / (10 ** PRCNT_PRECISION)
                expect(stakerPercent).to.equal(expectePercent)
                expect(res.newHouseBalance).to.equal(5080)
                console.log(`${res.newHouseBalance}DAI`, `${stakerPercent}%`)


                res = await StakerFacet.connect(signers[1]).checkStakerBalance()
                stakerPercent = ethers.utils.formatEther(res.stakerPercent) * 10 ** 18 / (10 ** PRCNT_PRECISION)
                expect(stakerPercent).to.equal(expectePercent)
                expect(res.newHouseBalance).to.equal(5080)
                console.log(`${res.newHouseBalance}DAI`, `${stakerPercent}%`)

                const lostPrcnt = 100 - expectePercent * 2
                console.log("Does not belongs to none", `${lostPrcnt}%`)




            })
        })
    })
