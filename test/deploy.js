
const { diamondInit1 } = require('./utils/utils')
async function main() {
    const res = await diamondInit1();
    const { diamondAddress } = res;
    const admin = await ethers.getContractAt('AdminFacet', diamondAddress)
    const resIsContractOwner = await admin.isContractOwner()
    console.log("resIsContractOwner", resIsContractOwner)
    await saveDiamondAddress(diamondAddress);
    await copyArtifacts();

    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

}

async function copyArtifacts() {
    const fs = require('fs');
    fs.copyFileSync(
        "./artifacts/contracts/PlayersFacet.sol/PlayersFacet.json",
        "./frontend/src/contracts/PlayersFacet.json");
    fs.copyFileSync(
        "./artifacts/contracts/StakerFacet.sol/StakerFacet.json",
        "./frontend/src/contracts/StakerFacet.json");
    fs.copyFileSync(
        "./artifacts/contracts/AdminFacet.sol/AdminFacet.json",
        "./frontend/src/contracts/AdminFacet.json");
}
async function saveDiamondAddress(addr) {
    const fs = require('fs');
    const content = `export const diamondAddress = '${addr}';`;
    try {
        const diamondAddressPath = './frontend/src/contracts/diamondAddress.js'
        fs.writeFileSync(diamondAddressPath, content);
        // file written successfully
        console.log("Diamond address saved to", diamondAddressPath, "as\n", content);
    } catch (err) {
        console.error(err);
    }
    // console.log('AdminFacet deployed to:', AdminFacet.address);
    console.log('Diamond deployed to:', addr);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
