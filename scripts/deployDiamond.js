

const { diamondDeploy } = require("./libraries/deploy-diamond-util")
async function deployDiamond() {
    // Buidler always runs the compile task when running scripts through it.
    // If this runs in a standalone fashion you may want to call compile manually
    // to make sure everything is compiled
    // await bre.run('compile');

    const accounts = await ethers.getSigners()
    const account = await accounts[0].getAddress()

    // eslint-disable-next-line no-unused-vars
    const deployedDiamond = await diamondDeploy({
        diamondName: 'CasinoDiamond',
        facets: [
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet'
        ],
        args: [account],
        // excludes: {
        //     ERC721Facet: [
        //         'isApprovedForAll(address,address)',
        //         'setApprovalForAll(address,bool)',
        //         'supportsInterface(bytes4)'
        //     ]
        // }
    })
    return deployedDiamond.address
}

exports.deployDiamond = deployDiamond