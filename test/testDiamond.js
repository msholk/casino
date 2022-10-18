/* global describe it before ethers */
const { utils } = require("ethers");
const { selectorsToDic } = require('./utils/utils')
const { facetSelectors } = require('./utils/facetSelectors')
const _ = require("lodash")

const {
    getSelectors,
    FacetCutAction,
    removeSelectors,
    findAddressPositionInFacets
} = require('../scripts/libraries/diamond.js')
const { deployDiamond } = require('../scripts/deployDiamond.js')
const { assert } = require('chai')
const { diamondInit1, getAccounts, checkFacets1, checkFacets2 } = require('./utils/utils')
describe('DiamondTest', async function () {
    let diamondAddress
    let diamondCutFacet
    let diamondLoupeFacet
    let ownershipFacet
    let stakingFacet
    let ticketsFacet
    let erc721Facet
    let tx
    let receipt
    let result

    const facetAddress = {}
    let test1FacetAddress
    let test2FacetAddress

    before(async function () {
        const res = await diamondInit1();
        ({ diamondAddress, diamondCutFacet, diamondLoupeFacet, ownershipFacet, stakingFacet, ticketsFacet, erc721Facet } = res);
    })


    describe('Diamond initialization', async () => {
        it('getAccounts', async () => {
            ({ signers, account0, account1, account2 } = await getAccounts())
        })
        it('checkFacets', async () => {
            await checkFacets1({ facetAddress, diamondAddress, diamondCutFacet, diamondLoupeFacet, ownershipFacet, stakingFacet, ticketsFacet, erc721Facet });
            await checkFacets2({ facetAddress, diamondAddress, diamondCutFacet, diamondLoupeFacet, ownershipFacet, stakingFacet, ticketsFacet, erc721Facet });
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

            selectors = getSelectors(stakingFacet)
            result = await diamondLoupeFacet.facetFunctionSelectors(facetAddress.StakingFacet)
            assert.sameMembers(result, selectors)
            assert.sameKeys(facetSelectors.StakingFacet, selectorsToDic(selectors), "StakingFacet expected functions", "StakingFacet deployed functions")
            facetSelectors.StakingFacet = { ...facetSelectors.StakingFacet, ...selectorsToDic(selectors) }


            selectors = getSelectors(ticketsFacet)
            result = await diamondLoupeFacet.facetFunctionSelectors(facetAddress.TicketsFacet)
            assert.sameMembers(result, selectors)
            assert.sameKeys(facetSelectors.TicketsFacet, selectorsToDic(selectors), "TicketsFacet expected functions", "TicketsFacet deployed functions")
            facetSelectors.TicketsFacet = { ...facetSelectors.TicketsFacet, ...selectorsToDic(selectors) }


            selectors = getSelectors(erc721Facet)
            result = await diamondLoupeFacet.facetFunctionSelectors(facetAddress.ERC721Facet)

            //console.log(result, selectors)
            //assert.sameMembers(result, selectors)
            console.log("***********************************************************")
            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
            let expected = _.keys(facetSelectors.ERC721Facet)
            let published = _.keys(selectorsToDic(selectors))
            const exludes = [
                'isApprovedForAll(address,address)',
                'setApprovalForAll(address,bool)',
                'supportsInterface(bytes4)'
            ]
            expected = _.filter(expected, e => !_.includes(exludes, e))
            published = _.filter(published, e => !_.includes(exludes, e))

            assert.sameMembers(expected, published)

            // console.log(_.keys(facetSelectors.ERC721Facet))
            // console.log(_.keys(selectorsToDic(selectors)))
            // console.log('Publisheded extra')
            // console.log(_.difference(published, expected))
            // console.log('Missing')
            // console.log(_.difference(expected, published))
            //assert.sameKeys(facetSelectors.ERC721Facet, selectorsToDic(selectors), "ERC721Facet expected functions", "ERC721Facet deployed functions")
            facetSelectors.ERC721Facet = { ...facetSelectors.ERC721Facet, ...selectorsToDic(selectors) }

            console.log("*********************************************************************")
            console.log("Facets selectors with signatures")
            console.log(facetSelectors)


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
            checkAllFunctionsOfFacet('StakingFacet')
            checkAllFunctionsOfFacet('TicketsFacet')
        })
    })

    describe('Diamond generic tests', async function () {
        it('should add test1 functions', async () => {
            const Test1Facet = await ethers.getContractFactory('Test1Facet')
            const test1Facet = await Test1Facet.deploy()
            await test1Facet.deployed()
            test1FacetAddress = test1Facet.address
            const selectors = getSelectors(test1Facet).remove(['supportsInterface(bytes4)'])
            tx = await diamondCutFacet.diamondCut(
                [{
                    facetAddress: test1Facet.address,
                    action: FacetCutAction.Add,
                    functionSelectors: selectors
                }],
                ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
            receipt = await tx.wait()
            if (!receipt.status) {
                throw Error(`Diamond upgrade failed: ${tx.hash}`)
            }
            result = await diamondLoupeFacet.facetFunctionSelectors(test1Facet.address)
            assert.sameMembers(result, selectors)
        })

        it('should test function call', async () => {
            const test1Facet = await ethers.getContractAt('Test1Facet', diamondAddress)
            //console.log(test1Facet)
            await test1Facet.test1Func10()
        })

        it('should replace supportsInterface function', async () => {
            const Test1Facet = await ethers.getContractFactory('Test1Facet')
            const selectors = getSelectors(Test1Facet).get(['supportsInterface(bytes4)'])

            tx = await diamondCutFacet.diamondCut(
                [{
                    facetAddress: test1FacetAddress,
                    action: FacetCutAction.Replace,
                    functionSelectors: selectors
                }],
                ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
            receipt = await tx.wait()
            if (!receipt.status) {
                throw Error(`Diamond upgrade failed: ${tx.hash}`)
            }
            result = await diamondLoupeFacet.facetFunctionSelectors(test1FacetAddress)
            assert.sameMembers(result, getSelectors(Test1Facet))
        })

        it('should add test2 functions', async () => {
            const Test2Facet = await ethers.getContractFactory('Test2Facet')
            const test2Facet = await Test2Facet.deploy()
            await test2Facet.deployed()
            test2FacetAddress = test2Facet.address
            const selectors = getSelectors(test2Facet)
            tx = await diamondCutFacet.diamondCut(
                [{
                    facetAddress: test2Facet.address,
                    action: FacetCutAction.Add,
                    functionSelectors: selectors
                }],
                ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
            receipt = await tx.wait()
            if (!receipt.status) {
                throw Error(`Diamond upgrade failed: ${tx.hash}`)
            }
            result = await diamondLoupeFacet.facetFunctionSelectors(test2Facet.address)
            assert.sameMembers(result, selectors)
        })

        it('should remove some test2 functions', async () => {
            const test2Facet = await ethers.getContractAt('Test2Facet', diamondAddress)
            const functionsToKeep = ['test2Func1()', 'test2Func5()', 'test2Func6()', 'test2Func19()', 'test2Func20()']
            const selectors = getSelectors(test2Facet).remove(functionsToKeep)
            tx = await diamondCutFacet.diamondCut(
                [{
                    facetAddress: ethers.constants.AddressZero,
                    action: FacetCutAction.Remove,
                    functionSelectors: selectors
                }],
                ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
            receipt = await tx.wait()
            if (!receipt.status) {
                throw Error(`Diamond upgrade failed: ${tx.hash}`)
            }
            result = await diamondLoupeFacet.facetFunctionSelectors(test2FacetAddress)
            assert.sameMembers(result, getSelectors(test2Facet).get(functionsToKeep))
        })

        it('should remove some test1 functions', async () => {
            const test1Facet = await ethers.getContractAt('Test1Facet', diamondAddress)
            const functionsToKeep = ['test1Func2()', 'test1Func11()', 'test1Func12()']
            const selectors = getSelectors(test1Facet).remove(functionsToKeep)
            tx = await diamondCutFacet.diamondCut(
                [{
                    facetAddress: ethers.constants.AddressZero,
                    action: FacetCutAction.Remove,
                    functionSelectors: selectors
                }],
                ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
            receipt = await tx.wait()
            if (!receipt.status) {
                throw Error(`Diamond upgrade failed: ${tx.hash}`)
            }
            result = await diamondLoupeFacet.facetFunctionSelectors(test1FacetAddress)
            assert.sameMembers(result, getSelectors(test1Facet).get(functionsToKeep))
        })

        it('remove all functions and facets except \'diamondCut\' and \'facets\'', async () => {
            let selectors = []
            let facets = await diamondLoupeFacet.facets()
            for (let i = 0; i < facets.length; i++) {
                selectors.push(...facets[i].functionSelectors)
            }
            selectors = removeSelectors(selectors, ['facets()', 'diamondCut(tuple(address,uint8,bytes4[])[],address,bytes)'])
            tx = await diamondCutFacet.diamondCut(
                [{
                    facetAddress: ethers.constants.AddressZero,
                    action: FacetCutAction.Remove,
                    functionSelectors: selectors
                }],
                ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
            receipt = await tx.wait()
            if (!receipt.status) {
                throw Error(`Diamond upgrade failed: ${tx.hash}`)
            }
            facets = await diamondLoupeFacet.facets()
            assert.equal(facets.length, 2)
            assert.equal(facets[0][0], facetAddress.DiamondCutFacet)
            assert.sameMembers(facets[0][1], ['0x1f931c1c'])
            assert.equal(facets[1][0], facetAddress.DiamondLoupeFacet)
            assert.sameMembers(facets[1][1], ['0x7a0ed627'])
        })

        it('add most functions and facets', async () => {
            const diamondLoupeFacetSelectors = getSelectors(diamondLoupeFacet).remove(['supportsInterface(bytes4)'])
            const Test1Facet = await ethers.getContractFactory('Test1Facet')
            const Test2Facet = await ethers.getContractFactory('Test2Facet')
            // Any number of functions from any number of facets can be added/replaced/removed in a
            // single transaction
            const cut = [
                {
                    facetAddress: facetAddress.DiamondLoupeFacet,
                    action: FacetCutAction.Add,
                    functionSelectors: diamondLoupeFacetSelectors.remove(['facets()'])
                },
                {
                    facetAddress: facetAddress.OwnershipFacet,
                    action: FacetCutAction.Add,
                    functionSelectors: getSelectors(ownershipFacet)
                },
                {
                    facetAddress: test1FacetAddress,
                    action: FacetCutAction.Add,
                    functionSelectors: getSelectors(Test1Facet)
                },
                {
                    facetAddress: test2FacetAddress,
                    action: FacetCutAction.Add,
                    functionSelectors: getSelectors(Test2Facet)
                }
            ]
            tx = await diamondCutFacet.diamondCut(cut, ethers.constants.AddressZero, '0x', { gasLimit: 8000000 })
            receipt = await tx.wait()
            if (!receipt.status) {
                throw Error(`Diamond upgrade failed: ${tx.hash}`)
            }
            const facets = await diamondLoupeFacet.facets()
            const facetAddresses = await diamondLoupeFacet.facetAddresses()
            assert.equal(facetAddresses.length, 5)
            assert.equal(facets.length, 5)
            //console.log(facetAddress, facetAddresses, test1FacetAddress, test2FacetAddress)

            assert.equal(facets[0][0], facetAddresses[0], 'first facet')
            assert.equal(facets[1][0], facetAddresses[1], 'second facet')
            assert.equal(facets[2][0], facetAddresses[2], 'third facet')
            assert.equal(facets[3][0], facetAddresses[3], 'fourth facet')
            assert.equal(facets[4][0], facetAddresses[4], 'fifth facet')
            assert.sameMembers(facets[findAddressPositionInFacets(facetAddress.DiamondCutFacet, facets)][1], getSelectors(diamondCutFacet))
            assert.sameMembers(facets[findAddressPositionInFacets(facetAddress.DiamondLoupeFacet, facets)][1], diamondLoupeFacetSelectors)
            assert.sameMembers(facets[findAddressPositionInFacets(facetAddress.OwnershipFacet, facets)][1], getSelectors(ownershipFacet))
            assert.sameMembers(facets[findAddressPositionInFacets(test1FacetAddress, facets)][1], getSelectors(Test1Facet))
            assert.sameMembers(facets[findAddressPositionInFacets(test2FacetAddress, facets)][1], getSelectors(Test2Facet))
        })
    })
})