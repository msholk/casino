const { diamondInit1 } = require("./utils/utils");
// const LINK_TOKEN_ABI = require("@chainlink/contracts/abi/v0.4/LinkToken.json")
const { BigNumber } = require("ethers");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
  const accounts = await ethers.getSigners();
  const signer = accounts[0];

  // const linkTokenMumbaiAddr = '0x326C977E6efc84E512bB9C30f76E30c160eD06FB'
  // const linkTokenContract = new ethers.Contract(linkTokenMumbaiAddr, LINK_TOKEN_ABI, signer)
  // await linkTokenContract.transfer(signer.address, 1)
  // let balanceBN = await linkTokenContract.balanceOf(signer.address)
  // let balance = balanceBN.toString()
  // console.log("balance", balance, signer.address)

  {
    // const libFactory = await ethers.getContractFactory("LibRulette");
    // const libDeployed = await libFactory.deploy();
    // await libDeployed.deployed();

    const libraries = {
      // LibRulette: libDeployed.address
    };
    const facet = "StakerFacet";
    const facetFactory = await ethers.getContractFactory(facet, {
      libraries,
    });
    console.log(`Deploying ${facet}`);
    const deployedFactory = await facetFactory.deploy();
    await deployedFactory.deployed();
    console.log(`${facet} deployed: ${deployedFactory.address}`);

    try {
      const staker = await ethers.getContractAt(facet, deployedFactory.address);
      staker.stakeETH({ value: 0.01 * 10 ** 18 });
    } catch (e) {
      console.log(e);
    }

    // await linkTokenContract.transfer(
    //   deployedFactory.address,
    //   BigNumber.from("100000000000000000")
    // );
    // await helpers.mine(3);
    // balanceBN = await linkTokenContract.balanceOf(signer.address);
    // balance = balanceBN.toString();
    // console.log("balance of signer", balance, signer.address);
    // balanceBN = await linkTokenContract.balanceOf(deployedFactory.address);
    // balance = balanceBN.toString();
    // console.log("balance of contract", balance, deployedFactory.address);

    // await linkTokenContract.balanceOf(deployedFactory.address);
    // const player = await ethers.getContractAt(facet, deployedFactory.address);

    // await player.topUpSubscription(BigNumber.from("100000000000000000"));
    // await helpers.mine(3);
    // balanceBN = await linkTokenContract.balanceOf(deployedFactory.address);
    // balance = balanceBN.toString();
    // console.log(
    //   "balance of contract after passing to subscription",
    //   balance,
    //   deployedFactory.address
    // );
    // console.log("**************************************");
    // await helpers.mine(10);
    // console.log("**************************************");
    // await player.requestRandomWords();
    // await helpers.mine(1000);
  }
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
