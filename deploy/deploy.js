const { diamondInit1 } = require("../test/utils/utils");
const chalk = require("chalk");
const fs = require("fs");
async function main() {
  fs.writeFileSync("deployDic.json", "{}");
  await deployDiamond();
}
async function deployDiamond() {
  console.log(
    chalk.bold.red(
      `******Deploying to network ${hre.network.name}********************`
    )
  );
  if (hre.network.name == "hardhat") {
    await hre.network.provider.send("hardhat_reset");
  }
  const res = await diamondInit1();
  const { diamondAddress } = res;
  const admin = await ethers.getContractAt("AdminFacet", diamondAddress);
  const resIsContractOwner = await admin.isContractOwner();
  console.log("resIsContractOwner", resIsContractOwner);

  await saveDiamondAddress(diamondAddress);
  await copyArtifacts();

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  //Connect with HLP Token
  const HLPAddress = await readHLPAddress();
  const HLPContract = await ethers.getContractAt("HLP", HLPAddress);
  // console.log(stakerAddress, HLPAddress);
  const Staker = await ethers.getContractAt("StakerFacet", diamondAddress);
  await HLPContract.setMinter(diamondAddress, true);
  await HLPContract.clearMaintenance();
  Staker.setHLPTokenAddress(HLPAddress);
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
  saveDiamondAddress(deployedFactory.address);
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

async function copyArtifacts() {
  const fs = require("fs");
  fs.copyFileSync(
    "./artifacts/contracts/PlayersFacet.sol/PlayersFacet.json",
    "./frontend/src/contracts/PlayersFacet.json"
  );
  fs.copyFileSync(
    "./artifacts/contracts/StakerFacet.sol/StakerFacet.json",
    "./frontend/src/contracts/StakerFacet.json"
  );
  fs.copyFileSync(
    "./artifacts/contracts/VaultFacet.sol/VaultFacet.json",
    "./frontend/src/contracts/VaultFacet.json"
  );
  fs.copyFileSync(
    "./artifacts/contracts/AdminFacet.sol/AdminFacet.json",
    "./frontend/src/contracts/AdminFacet.json"
  );
  fs.copyFileSync(
    "./artifacts/contracts/RouletteFacet.sol/RouletteFacet.json",
    "./frontend/src/contracts/RouletteFacet.json"
  );
  fs.copyFileSync(
    "./artifacts/contracts/diamond/facets/DiamondLoupeFacet.sol/DiamondLoupeFacet.json",
    "./frontend/src/contracts/DiamondLoupeFacet.json"
  );
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
