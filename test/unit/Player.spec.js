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
        async function deployRandomNumberConsumerFixture() {
            const [deployer] = await ethers.getSigners()

            const LibRuletteFactory = await ethers.getContractFactory(
                "LibRulette"
            )
            const LibRuletteDeployed = await LibRuletteFactory.deploy();
            await LibRuletteDeployed.deployed();

            /**
             * @dev Read more at https://docs.chain.link/docs/chainlink-vrf/
             */
            const BASE_FEE = "100000000000000000"
            const GAS_PRICE_LINK = "1000000000" // 0.000000001 LINK per gas

            const chainId = network.config.chainId

            const VRFCoordinatorV2MockFactory = await ethers.getContractFactory(
                "VRFCoordinatorV2Mock"
            )
            const VRFCoordinatorV2Mock = await VRFCoordinatorV2MockFactory.deploy(
                BASE_FEE,
                GAS_PRICE_LINK
            )

            const fundAmount = networkConfig[chainId]["fundAmount"] || "1000000000000000000"
            const transaction = await VRFCoordinatorV2Mock.createSubscription()
            const transactionReceipt = await transaction.wait(1)
            const subscriptionId = ethers.BigNumber.from(transactionReceipt.events[0].topics[1])
            await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, fundAmount)

            const vrfCoordinatorAddress = VRFCoordinatorV2Mock.address
            const keyHash =
                networkConfig[chainId]["keyHash"] ||
                "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"


            const PlayersFacetFactory = await ethers.getContractFactory(
                "PlayersFacet", {
                libraries: {
                    "LibRulette": LibRuletteDeployed.address
                }
            }
            )
            const PlayersFacet = await PlayersFacetFactory.deploy()
            await VRFCoordinatorV2Mock.addConsumer(subscriptionId, PlayersFacet.address)
            await PlayersFacet.setVrfInfo({ subscriptionId, vrfCoordinatorAddress, keyHash })


            isadded = await VRFCoordinatorV2Mock.consumerIsAdded(subscriptionId, PlayersFacet.address);
            console.log("consumerIsAdded:", subscriptionId, PlayersFacet.address, isadded)

            const TokensMockFactory = await ethers.getContractFactory(
                "TokensMock"
            )
            const TokensMock = await TokensMockFactory.deploy()

            return {
                VRFCoordinatorV2Mock, PlayersFacet,
                TokensMock, vrfInfo: { subscriptionId, vrfCoordinatorAddress, keyHash }
            }
        }

        describe("#requestRandomWords", async function () {
            it("Should successfully request a random number", async function () {
                const { PlayersFacet, TokensMock, vrfInfo, VRFCoordinatorV2Mock } = await loadFixture(
                    deployRandomNumberConsumerFixture
                )
                // console.log(PlayersFacet.address)
                let bal = await ethers.provider.getBalance(PlayersFacet.address);
                expect(bal).eq(0)
                // console.log("PlayersFacet balance", bal)
                bal = await TokensMock.daiBalanceOf(PlayersFacet.address)
                expect(bal).eq(0)
                // console.log("PlayersFacet dai balance", bal)

                let pbal = await PlayersFacet.checkPlayerBalance();
                // console.log(pbal)
                expect(pbal[0]).eq(0)
                // console.log("Player balance", bal)

                await PlayersFacet.depositETH({ value: BigNumber.from(1) });

                // console.log(PlayersFacet.address)
                bal = await ethers.provider.getBalance(PlayersFacet.address);
                // console.log("PlayersFacet balance", bal)
                expect(bal).eq(0)
                bal = await TokensMock.daiBalanceOf(PlayersFacet.address)
                expect(bal).eq(1270)
                // console.log("PlayersFacet dai balance", bal)

                pbal = await PlayersFacet.checkPlayerBalance();
                // console.log("Player balance", bal)
                console.log(pbal)
                expect(pbal[0]).eq(1270)
                expect(pbal[1]).eq(BigNumber.from("783260000000000"))

                await PlayersFacet.withdrawDAI();

                bal = await TokensMock.daiBalanceOf(PlayersFacet.address)
                expect(bal).eq(0)
                // console.log("PlayersFacet dai balance", bal)

                pbal = await PlayersFacet.checkPlayerBalance();
                // console.log("Player balance", bal)
                expect(pbal[0]).eq(0)


                /////////////////////////////////////
                await PlayersFacet.depositETH({ value: BigNumber.from(1) });
                console.log(vrfInfo)

                await PlayersFacet.placeBet([{
                    amount: 100,
                    betType: 1,
                    betDet: 22
                }, {
                    amount: 10,
                    betType: 1,
                    betDet: 19
                }]);

                // simulate callback from the oracle network
                console.log("expecting event");
                const tx = VRFCoordinatorV2Mock.fulfillRandomWords(
                    1,
                    PlayersFacet.address
                )
                await expect(tx)
                    .to.emit(PlayersFacet, "RouletteStopped")
                    .withArgs(1, BigNumber.from('78541660797044910968829902406342334108369226379826116161446442989268089806461'), 19)
                    .to.emit(PlayersFacet, 'RouletteStoppedPrizeInfo')
                    .withArgs(1, BigNumber.from('78541660797044910968829902406342334108369226379826116161446442989268089806461'), 19,
                        [0, 360, 0, 0, 0, 0, 0, 0, 0, 0])
            })
        })
    })
