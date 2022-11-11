const { diamondInit1 } = require("../test/utils/utils");
const copyArtifacts = require("./copyArtifacts");
let stakerAddress;
async function main() {
  await deployStakerFacet();
  await copyArtifacts();

  const HLPAddress = await readHLPAddress();
  const HLPContract = await ethers.getContractAt("HLP", HLPAddress);
  // console.log(stakerAddress, HLPAddress);
  const Staker = await ethers.getContractAt("StakerFacet", stakerAddress);
  await HLPContract.setMinter(stakerAddress, true);
  await HLPContract.clearMaintenance();
  Staker.setHLPTokenAddress(HLPAddress);
}

async function readHLPAddress() {
  const fs = require("fs");
  const content = `export const HLPAddress = '`;
  try {
    const diamondAddressPath = "./frontend/src/contracts/HLPAddress.js";
    let res = fs.readFileSync(diamondAddressPath, {
      encoding: "utf8",
      flag: "r",
    });
    // file written successfully
    res = res.replace(content, "");
    res = res.replace("';", "");
    console.log(res);
    return res;
  } catch (err) {
    console.error(err);
  }
  // console.log('AdminFacet deployed to:', AdminFacet.address);
  //console.log("Diamond deployed to:", addr);
}

async function deployStakerFacet() {
  const facet = "StakerFacet";
  const facetFactory = await ethers.getContractFactory(facet, {
    libraries: {},
  });
  console.log(`Deploying ${facet}`);
  const deployedFactory = await facetFactory.deploy();
  await deployedFactory.deployed();
  console.log(`${facet} deployed: ${deployedFactory.address}`);
  stakerAddress = deployedFactory.address;
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
