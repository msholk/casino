const { diamondInit1 } = require("../test/utils/utils");
const { copyArtifacts } = require("./copyArtifacts");
const contractName = "HLP";
let deployedFactory;
async function main() {
  await deploySingleContract();
  await copyArtifacts();

  const HLP = await ethers.getContractAt(contractName, deployedFactory.address);
  const signers = await ethers.getSigners();
  await HLP.setMinter(signers[0].getAddress(), true);
  await HLP.toggleMaintenance();
}

async function deploySingleContract() {
  const facetFactory = await ethers.getContractFactory(contractName, {
    libraries: {},
  });
  console.log(`Deploying ${contractName}`);
  deployedFactory = await facetFactory.deploy();
  await deployedFactory.deployed();
  console.log(`${contractName} deployed: ${deployedFactory.address}`);
  saveCntractAddress(deployedFactory.address);
}

async function saveCntractAddress(addr) {
  const fs = require("fs");
  const content = `export const ${contractName}Address = '${addr}';`;
  try {
    const contractAddressPath = `./frontend/src/contracts/${contractName}Address.js`;
    fs.writeFileSync(contractAddressPath, content);
    // file written successfully
    console.log(
      "Contract address saved to",
      contractAddressPath,
      "as\n",
      content
    );
  } catch (err) {
    console.error(err);
  }
  // console.log('AdminFacet deployed to:', AdminFacet.address);
  console.log("COntract deployed to:", addr);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
