const { diamondInit1 } = require("../test/utils/utils");
const copyArtifacts = require("./copyArtifacts");
async function main() {
  await deploySingleFacet();
  await copyArtifacts();
}

async function deploySingleFacet() {
  const libraries = {};
  {
    const lib = "LibRulette";
    const libFactory = await ethers.getContractFactory(lib);
    const libDeployed = await libFactory.deploy();
    await libDeployed.deployed();

    libraries[lib] = libDeployed.address;
  }

  const facet = "RouletteFacet";
  const facetFactory = await ethers.getContractFactory(facet, {
    libraries,
  });
  console.log(`Deploying ${facet}`);
  const deployedFactory = await facetFactory.deploy();
  await deployedFactory.deployed();
  console.log(`${facet} deployed: ${deployedFactory.address}`);
  saveDiamondAddress(deployedFactory.address);
}

async function saveDiamondAddress(addr) {
  const fs = require("fs");
  const content = `export const diamondAddress = '${addr}';`;
  try {
    const diamondAddressPath = "./frontend/src/contracts/diamondAddress.js";
    fs.writeFileSync(diamondAddressPath, content);
    // file written successfully
    console.log(
      "Diamond address saved to",
      diamondAddressPath,
      "as\n",
      content
    );
  } catch (err) {
    console.error(err);
  }
  // console.log('AdminFacet deployed to:', AdminFacet.address);
  console.log("Diamond deployed to:", addr);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
