const facetSelectors = {
    DiamondCutFacet: {
        'diamondCut((address,uint8,bytes4[])[],address,bytes)': '0x1f931c1c'
    },
    DiamondLoupeFacet: {
        'facetAddress(bytes4)': null,
        'facetAddresses()': null,
        'facetFunctionSelectors(address)': null,
        'facets()': null,
        'supportsInterface(bytes4)': null
    },
    OwnershipFacet: {
        'owner()': null,
        'transferOwnership(address)': null,
    },
    StakingFacet: {
        'setPoolContract(address)': null,
        'bulkFrens(address[])': null,
        'claimTickets(uint256[],uint256[])': null,
        'frens(address)': null,
        'migrateFrens(address)': null,
        'poolTokensRate()': null,
        'stakePoolTokens(uint256)': null,
        'staked(address)': null,
        'ticketCost(uint256)': null,
        'updateAccounts(address[])': null,
        'updatePoolTokensRate(uint256)': null,
        'withdrawPoolStake(uint256)': null
    },
    TicketsFacet: {
        'balanceOf(address,uint256)': null,
        'balanceOfAll(address)': null,
        'balanceOfBatch(address[],uint256[])': null,
        'isApprovedForAll(address,address)': null,
        'migrateTickets((address,uint256[],uint256[])[])': null,
        'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)': null,
        'safeTransferFrom(address,address,uint256,uint256,bytes)': null,
        'setApprovalForAll(address,bool)': null,
        'setBaseURI(string)': null,
        'totalSupplies()': null,
        'totalSupply(uint256)': null,
        'uri(uint256)': null
    },
    ERC721Facet: {
        'tokensCostInTickes(uint256)': null,
        "acquireTokenForTickets(uint256)": null,
        "initialize(string,string,uint256)": null,
        'approve(address,uint256)': null,
        'balanceOf(address)': null,
        'getApproved(uint256)': null,
        'nftIsApprovedForAll(address,address)': null,
        // 'isApprovedForAll(address,address)': null,
        'name()': null,
        'ownerOf(uint256)': null,
        'safeTransferFrom(address,address,uint256)': null,
        'safeTransferFrom(address,address,uint256,bytes)': null,
        'nftSetApprovalForAll(address,bool)': null,
        // 'setApprovalForAll(address,bool)': null,
        'nftSupportsInterface(bytes4)': null,
        // 'supportsInterface(bytes4)': null,
        'symbol()': null,
        'tokenURI(uint256)': null,
        'transferFrom(address,address,uint256)': null
    }

}

exports.facetSelectors = facetSelectors