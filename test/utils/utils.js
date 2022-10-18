const { utils } = require("ethers");
const _ = require("lodash")
const { assert } = require('chai')
require("./BigNum-utils.js")
const { facetSelectors } = require('./facetSelectors')
const getSignature = (stringSignature) => {
    return utils.keccak256(utils.toUtf8Bytes(stringSignature)).substring(0, 10)
}
const selectorsToDic = (selectors) => {
    const dic = {}
    for (var k in selectors.contract.functions) {
        if (_.isString(k) && _.includes(k, "(")) {
            dic[k] = getSignature(k)
        }
    }
    return dic;
}
const sameKeys = (set1, set2, firstSetDescr, SndSetDescr) => {
    for (let k in set1) {
        assert.isOk(_.has(set2, k), `${firstSetDescr} is missing key ${k}`)
    }
    for (let k in set2) {
        assert.isOk(_.has(set1, k), `${SndSetDescr} is missing key ${k}`)
    }
}
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
assert.sameKeys = sameKeys

const logAccountsBalances = async (accountsQnt) => {
    accountsQnt = accountsQnt || 3
    accounts = await ethers.getSigners()
    for (let i = 0; i < accountsQnt; i++) {
        const bal = await accounts[i].getBalance()
        console.log(`${i}: ${bal.toMyCustomBigNumber()}`)
    }
}

const { deployDiamond } = require('../../scripts/deployDiamond.js')
const {
    getSelectors,
    FacetCutAction,
    removeSelectors,
    findAddressPositionInFacets
} = require('../../scripts/libraries/diamond.js')
async function diamondInit1() {
    const diamondAddress = await deployDiamond()
    // console.log("diamondAddress:", diamondAddress)
    const diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)
    const ownershipFacet = await ethers.getContractAt('OwnershipFacet', diamondAddress)
    const stakingFacet = await ethers.getContractAt('StakingFacet', diamondAddress)
    const ticketsFacet = await ethers.getContractAt('TicketsFacet', diamondAddress)
    const erc721Facet = await ethers.getContractAt('ERC721Facet', diamondAddress)

    return { diamondAddress, diamondCutFacet, diamondLoupeFacet, ownershipFacet, stakingFacet, ticketsFacet, erc721Facet }
}
async function getAccounts() {
    const signers = await ethers.getSigners()
    const account0 = await signers[0].getAddress()
    const account1 = await signers[1].getAddress()
    const account2 = await signers[2].getAddress()
    return { signers, account0, account1, account2 }
}
async function checkFacets1(facets) {
    const { facetAddress, diamondAddress, diamondCutFacet, diamondLoupeFacet, ownershipFacet, stakingFacet, ticketsFacet, erc721Facet } = facets;
    //don't disable: fills facetAddress

    const addresses = []
    for (const address of await diamondLoupeFacet.facetAddresses()) {
        addresses.push(address)
    }
    //console.log("facetAddresses", addresses)
    assert.equal(addresses.length, 6)

    facetAddress.DiamondCutFacet = addresses[0]
    facetAddress.DiamondLoupeFacet = addresses[1]
    facetAddress.OwnershipFacet = addresses[2]
    facetAddress.StakingFacet = addresses[3]
    facetAddress.TicketsFacet = addresses[4]
    facetAddress.ERC721Facet = addresses[5]


}
async function checkFacets2(facets) {
    const { facetAddress, diamondAddress, diamondCutFacet, diamondLoupeFacet, ownershipFacet, stakingFacet, ticketsFacet, erc721Facet } = facets;
    //don't disable: fills facetAddress

    //don't disable: assign signatures to selectors

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
    let expected = _.keys(facetSelectors.ERC721Facet)
    let published = _.keys(selectorsToDic(selectors))
    const exludes = [
        'isApprovedForAll(address,address)',
        'setApprovalForAll(address,bool)',
        'supportsInterface(bytes4)'
    ]
    expected = _.filter(expected, e => !_.includes(exludes, e))
    published = _.filter(published, e => !_.includes(exludes, e))
    // console.log(_.difference(expected, published))
    // console.log(_.difference(published, expected))
    assert.sameMembers(expected, published)
    facetSelectors.ERC721Facet = { ...facetSelectors.ERC721Facet, ...selectorsToDic(selectors) }




}

exports.diamondInit1 = diamondInit1
exports.getSignature = getSignature
exports.getAccounts = getAccounts
exports.checkFacets1 = checkFacets1
exports.checkFacets2 = checkFacets2
exports.selectorsToDic = selectorsToDic
exports.logAccountsBalances = logAccountsBalances
exports.ZERO_ADDRESS = ZERO_ADDRESS

