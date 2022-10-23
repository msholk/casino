/* global describe it before ethers */
const { utils } = require("ethers");
const { selectorsToDic } = require('./utils/utils')
const { facetSelectors } = require('./utils/facetSelectors')
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { assert, expect } = require("chai")
const {
    getSelectors,
    FacetCutAction,
    removeSelectors,
    findAddressPositionInFacets
} = require('../scripts/libraries/diamond.js')

const { diamondInit1, getAccounts, checkFacets1, checkFacets2 } = require('./utils/utils')
describe('DiamondTest', async function () {
    let diamondAddress
    let diamondCutFacet
    let diamondLoupeFacet
    let ownershipFacet
    let playersFacet
    let stakerFacet
    let adminFacet
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
        ({ diamondAddress, diamondCutFacet, diamondLoupeFacet, ownershipFacet, playersFacet, stakerFacet, adminFacet } = res);

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
            await checkFacets1({ facetAddress, diamondAddress, diamondCutFacet, diamondLoupeFacet, ownershipFacet, playersFacet, stakerFacet, adminFacet });
            await checkFacets2({ facetAddress, diamondAddress, diamondCutFacet, diamondLoupeFacet, ownershipFacet, playersFacet, stakerFacet, adminFacet });
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

    describe('Stake House Liquidity', async () => {
        it('Staker0 stakes 100ETH', async () => {
            const staker = await ethers.getContractAt('StakerFacet', diamondAddress)
            await expect(staker.stakeETH({ value: utils.parseEther('100.0') }))
                .not.to.be.reverted;


        })
        it('Staker1 stakes: 50ETH', async () => {
            const staker = await ethers.getContractAt('StakerFacet', diamondAddress)
            await expect(staker.connect(signers[1]).stakeETH({ value: utils.parseEther('50.0') }))
                .not.to.be.reverted;

        })
    })
    describe('Finalize', async () => {
        it('******************************************', async () => {
            console.log("\n\n")
            console.log('******************************************')
            console.log("diamond is deployed at ", diamondAddress)
            console.log("signers[0] ", signers[0].address)
            console.log("signers[1] ", signers[1].address)
        })
    })


})