/* global describe it before ethers */
const { utils } = require("ethers");
const { selectorsToDic } = require('./utils/utils')
const { facetSelectors } = require('./utils/facetSelectors')
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const _ = require("lodash")
const { assert, expect } = require("chai")
const { BigNumber } = require("ethers");
const {
    getSelectors,
    FacetCutAction,
    removeSelectors,
    findAddressPositionInFacets
} = require('../scripts/libraries/diamond.js')
const { deployDiamond } = require('../scripts/deployDiamond.js')
const ZEROS18 = "000000000000000000"

const { diamondInit1, getAccounts, checkFacets1, checkFacets2 } = require('./utils/utils')
describe('DiamondTest', async function () {
    let diamondAddress
    let diamondCutFacet
    let diamondLoupeFacet
    let ownershipFacet
    let playersFacet
    let stakerFacet
    let tx
    let receipt
    let result
    let TokensMock

    const facetAddress = {}
    let vrfInfo = {}

    async function initializeVRF() {
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

        await VRFCoordinatorV2Mock.addConsumer(subscriptionId, diamondAddress)

        vrfInfo = { subscriptionId, vrfCoordinatorAddress, keyHash, VRFCoordinatorV2Mock }
    }

    async function initializeTokensMock() {
        const TokensMockFactory = await ethers.getContractFactory(
            "TokensMock"
        )
        TokensMock = await TokensMockFactory.deploy()
    }

    before(async function () {
        const res = await diamondInit1();
        ({ diamondAddress, diamondCutFacet, diamondLoupeFacet, ownershipFacet, playersFacet, stakerFacet } = res);

        await initializeTokensMock()
        await initializeVRF()

        const player = await ethers.getContractAt('PlayersFacet', diamondAddress)

        const { subscriptionId, vrfCoordinatorAddress, keyHash } = vrfInfo
        await player.setVrfInfo({ subscriptionId, vrfCoordinatorAddress, keyHash })

    })


    describe('Diamond initialization', async () => {
        it('getAccounts', async () => {
            ({ signers, account0, account1, account2 } = await getAccounts())
        })
        it('checkFacets', async () => {
            await checkFacets1({ facetAddress, diamondAddress, diamondCutFacet, diamondLoupeFacet, ownershipFacet, playersFacet, stakerFacet });
            await checkFacets2({ facetAddress, diamondAddress, diamondCutFacet, diamondLoupeFacet, ownershipFacet, playersFacet, stakerFacet });
        })
    });

    describe('Facets & selectors', async () => {
        //don't disable: assign signatures to selectors
        it('facets should have the right function selectors -- call to facetFunctionSelectors function', async () => {
            //In facetSelectors.js we declare the map of required selectors per facet
            //Those functions found in deployment will have their hased signatures assigned
            let selectors = getSelectors(diamondCutFacet)
            result = await diamondLoupeFacet.facetFunctionSelectors(facetAddress.DiamondCutFacet)
            assert.sameMembers(result, selectors)
            assert.sameKeys(facetSelectors.DiamondCutFacet, selectorsToDic(selectors), "DiamondCutFacet expected functions", "DiamondCutFacet deployed functions")
            facetSelectors.DiamondCutFacet = { ...facetSelectors.DiamondCutFacet, ...selectorsToDic(selectors) }

            selectors = getSelectors(diamondLoupeFacet)
            result = await diamondLoupeFacet.facetFunctionSelectors(facetAddress.DiamondLoupeFacet)
            assert.sameMembers(result, selectors)
            assert.sameKeys(facetSelectors.DiamondLoupeFacet, selectorsToDic(selectors), "DiamondLoupeFacet expected functions", "DiamondLoupeFacet deployed functions")
            facetSelectors.DiamondLoupeFacet = { ...facetSelectors.DiamondLoupeFacet, ...selectorsToDic(selectors) }

            selectors = getSelectors(ownershipFacet)
            result = await diamondLoupeFacet.facetFunctionSelectors(facetAddress.OwnershipFacet)
            assert.sameMembers(result, selectors)
            assert.sameKeys(facetSelectors.OwnershipFacet, selectorsToDic(selectors), "OwnershipFacet expected functions", "OwnershipFacet deployed functions")
            facetSelectors.OwnershipFacet = { ...facetSelectors.OwnershipFacet, ...selectorsToDic(selectors) }

            selectors = getSelectors(playersFacet)
            result = await diamondLoupeFacet.facetFunctionSelectors(facetAddress.PlayersFacet)
            assert.sameMembers(result, selectors)
            assert.sameKeys(facetSelectors.PlayersFacet, selectorsToDic(selectors), "PlayersFacet expected functions", "PlayersFacet deployed functions")
            facetSelectors.PlayersFacet = { ...facetSelectors.PlayersFacet, ...selectorsToDic(selectors) }

            console.log("*********************************************************************")
            console.log("Facets selectors with signatures")
            // console.log(facetSelectors)


        })

        it('selectors should be associated to facets correctly -- multiple calls to facetAddress function', async () => {
            let showInConsole = false
            const checkAllFunctionsOfFacet = async (facetKey) => {
                const selectors2Signature = facetSelectors[facetKey]
                if (showInConsole) console.log(`Checking ${facetKey}:`)
                for (let funcSelector in selectors2Signature) {
                    const selectorSignature = selectors2Signature[funcSelector]
                    if (showInConsole) console.log(`\t${selectorSignature}\t${funcSelector}`)
                    assert.equal(
                        facetAddress[facetKey],
                        await diamondLoupeFacet.facetAddress(selectorSignature)
                    )
                }
            }

            checkAllFunctionsOfFacet('DiamondCutFacet')
            checkAllFunctionsOfFacet('DiamondLoupeFacet')
            checkAllFunctionsOfFacet('OwnershipFacet')
            checkAllFunctionsOfFacet('PlayersFacet')
        })
    })

    describe('Deposits and Staking', async () => {
        it("Check contracts's balance is zero", async () => {
            let bal = await TokensMock.daiBalanceOf(diamondAddress)
            expect(bal).eq(0)
        })
        describe('Player`s deposits', async () => {
            it('Check player balance is zero ', async () => {
                const player = await ethers.getContractAt('PlayersFacet', diamondAddress)
                //console.log(player)

                let bal = await player.checkPlayerBalance();
                // console.log(bal)
                expect(bal[0]).eq(BigNumber.from(0))
                // console.log("Player balance", bal)


            })
            it('Player deposits 1 ETH ', async () => {
                const player = await ethers.getContractAt('PlayersFacet', diamondAddress)

                await expect(player.depositETH({ value: utils.parseEther('1.0') }))
                    .not.to.be.reverted;

                let bal = await player.checkPlayerBalance();
                // console.log("Player balance", bal, 1269.96)
                expect(bal[0]).eq(1269.96 * 100) //precision 2

                bal = await TokensMock.daiBalanceOf(diamondAddress)
                expect(bal).eq(utils.parseEther('1269.962651640579957603')) //precision 18
            })
        })

        describe('Stake House Liquidity', async () => {
            it('Staker0 stakes 100ETH', async () => {
                const staker = await ethers.getContractAt('StakerFacet', diamondAddress)
                await expect(staker.stakeETH({ value: utils.parseEther('100.0') }))
                    .not.to.be.reverted;

                let bal = await TokensMock.daiBalanceOf(diamondAddress)
                expect(bal).eq(utils.parseEther('125878.216902836847393662')) //precision 18


                bal = await staker.checkStakerBalance()
                // console.log(bal)
                expect(bal.stakerPercent).eq(utils.parseEther('1')) //1 means 100%
                expect(bal.newHouseBalance).eq(124608.25 * 100) //1 means 100%
            })
            it('Staker1 stakes: 50ETH', async () => {
                const staker = await ethers.getContractAt('StakerFacet', diamondAddress)
                await expect(staker.connect(signers[1]).stakeETH({ value: utils.parseEther('50.0') }))
                    .not.to.be.reverted;

            })
            it('Check diamond balance increased', async () => {
                let bal = await TokensMock.daiBalanceOf(diamondAddress)
                expect(bal).eq(utils.parseEther('186455.148901922781502314')) //precision 18
            })
            it('The first staker should have some 66%', async () => {
                const staker = await ethers.getContractAt('StakerFacet', diamondAddress)
                let bal = await staker.checkStakerBalance()
                //console.log(bal)
                expect(bal.stakerPercent).eq(utils.parseEther('0.672884568840767928')) //1 means 100%
                expect(bal.newHouseBalance).eq(185185.18 * 100) //1 means 100%
            })
            it('The second staker should have some 33%', async () => {
                const staker = await ethers.getContractAt('StakerFacet', diamondAddress)
                let bal = await staker.connect(signers[1]).checkStakerBalance()
                //console.log(bal)
                expect(bal.stakerPercent).eq(utils.parseEther('0.327115431159232072')) //1 means 100%
                expect(bal.newHouseBalance).eq(185185.18 * 100) //1 means 100%
            })
        })



    })
    describe('Playing', async () => {
        let playerBalance
        let houseBalance
        it('Get initial players/house balance ', async () => {
            const player = await ethers.getContractAt('PlayersFacet', diamondAddress)
            let bal = await player.checkPlayerBalance();
            playerBalance = bal[0]

            const staker = await ethers.getContractAt('StakerFacet', diamondAddress)
            bal = await staker.checkStakerBalance()
            houseBalance = bal.newHouseBalance
        })
        it("Place a winning bet: expect emit RouletteLaunched", async () => {
            const player = await ethers.getContractAt('PlayersFacet', diamondAddress)
            await expect(player.placeBet([{
                amount: 100,
                betType: 1,
                betDet: 22
            }, {
                amount: 10,
                betType: 1,
                betDet: 19
            }]))
                .to.emit(player, "RouletteLaunched")
                .withArgs(1) //request id
        })
        it("Wait roulette to stop", async () => {
            const player = await ethers.getContractAt('PlayersFacet', diamondAddress)
            // simulate callback from the oracle network
            // console.log("expecting event");
            const tx = await vrfInfo.VRFCoordinatorV2Mock.fulfillRandomWords(
                1,
                diamondAddress
            )

            await expect(tx)
                .to.emit(player, "RouletteStoppedVRFCallReceived")
                .to.emit(player, "RouletteStopped")
                .withArgs(1, BigNumber.from('78541660797044910968829902406342334108369226379826116161446442989268089806461'), 19)
                .to.emit(player, "RouletteStoppedRequestIdRecognized")
                .withArgs(true)
                .to.emit(player, "RouletteLaunchOfPlayerFound")
                .to.emit(player, 'RouletteStoppedPrizeInfo')
                .withArgs(1, BigNumber.from('78541660797044910968829902406342334108369226379826116161446442989268089806461'), 19,
                    [0, 360, 0, 0, 0, 0, 0, 0, 0, 0])
            /*await expect(tx)
                .to.emit(player, "RouletteStopped")
                .withArgs(1, BigNumber.from('78541660797044910968829902406342334108369226379826116161446442989268089806461'), 19)
                .to.emit(player, 'RouletteStoppedPrizeInfo')
                .withArgs(1, BigNumber.from('78541660797044910968829902406342334108369226379826116161446442989268089806461'), 19,
                    [0, 360, 0, 0, 0, 0, 0, 0, 0, 0])*/
        })
        it('Check player balance increased 250', async () => {
            const player = await ethers.getContractAt('PlayersFacet', diamondAddress)
            let bal = await player.checkPlayerBalance();
            const newBalance = bal[0]
            expect(newBalance - playerBalance).eq(250 * 100) //250.00DAI
            playerBalance = newBalance
        })
        it('Check house liquidity decreased 250+7.5', async () => {
            const staker = await ethers.getContractAt('StakerFacet', diamondAddress)

            bal = await staker.checkStakerBalance()
            const diff = houseBalance - bal.newHouseBalance
            //console.log(houseBalance, bal.newHouseBalance)
            expect(diff / 100).eq(257.50) //1 means 100%
        })
    })

})