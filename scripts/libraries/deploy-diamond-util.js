const _ = require("lodash");

// const diamond = require('diamond-util')
const diamond = require("./diamond-util");
const { FacetCutAction } = diamond;

function getSelectors(contract, exludes) {
  const signatures = Object.keys(contract.interface.functions);

  const selectors = signatures.reduce((acc, val) => {
    if (val !== "init(bytes)" && !_.includes(exludes, val)) {
      acc.push(contract.interface.getSighash(val));
    }
    return acc;
  }, []);
  return selectors;
}
const log = {
  constructorArguments: false,
};
function getSignatures(contract, exludes) {
  let keys = Object.keys(contract.interface.functions);
  keys = _.filter(keys, (value) => {
    return !_.includes(exludes, value);
  });
  return keys;
}
async function diamondDeploy({
  diamondName,
  facets,
  args = [],
  overrides = {},
  excludes,
  deployLibraries,
}) {
  /*
    deployLibraries:{
        facetName:["Lib1","Lib2"]
    }
    */
  if (arguments.length !== 1) {
    throw Error(
      `Requires only 1 map argument. ${arguments.length} arguments used.`
    );
  }
  facets = await diamond.deployFacets(facets, deployLibraries);
  console.log("Deploying diamond:", diamondName);
  const diamondFactory = await ethers.getContractFactory(diamondName);
  const diamondCut = [];
  console.log("--");
  if (log.constructorArguments) {
    console.log("Setting up diamondCut args");
    console.log("--");
  }
  function TheSignature(funcName, signature) {
    this.funcName = funcName;
    this.signature = signature;
  }
  let addressDic = {};
  for (const [name, deployedFacet] of facets) {
    console.log(`Facet name:${name}`, deployedFacet.address);
    addressDic[deployedFacet.address] = name;
    const exludeSignatures = _.get(excludes, name) || [];
    let signatures = getSignatures(deployedFacet, exludeSignatures);
    let signaturesList = [];
    for (let sig in signatures) {
      sig = signatures[sig];
      //   console.log(sig);
      signaturesList.push(
        new TheSignature(sig, deployedFacet.interface.getSighash(sig))
      );
      addressDic[deployedFacet.interface.getSighash(sig)] = sig;
      //   console.log("\t", sig, "\t\t", deployedFacet.interface.getSighash(sig));
    }
    console.table(signaturesList);
    // console.log(getSignatures(deployedFacet, exludeSignatures));
    // console.log(deployedFacet.interface.getSighash(val));
    // console.log(getSelectors(deployedFacet, exludeSignatures))
    // console.log(deployedFacet);
    console.log("--");
    diamondCut.push([
      deployedFacet.address,
      FacetCutAction.Add,
      getSelectors(deployedFacet, exludeSignatures),
    ]);
  }
  console.log("diamondCut++++++++++++++++++", diamondCut);
  const fs = require("fs");
  fs.writeFileSync("deployDic.json", JSON.stringify(addressDic, null, 2));
  console.log("--");
  // console.log(`Deploying ${diamondName}`)
  const constructorArguments = [diamondCut];
  if (args.length > 0) {
    constructorArguments.push(args);
  }

  const deployedDiamond = await diamondFactory.deploy(
    ...constructorArguments,
    overrides
  );
  await deployedDiamond.deployed();
  const result = await deployedDiamond.deployTransaction.wait();
  // await console.log('okokokokokokokok')
  // console.log(`${diamondName} deployed: ${deployedDiamond.address} ***************************`)
  if (log.constructorArguments) {
    console.log(`${diamondName} constructor arguments:`);
    console.log(JSON.stringify(constructorArguments, null, 4));
  }
  if (!result.status) {
    console.log(
      "TRANSACTION FAILED!!! -------------------------------------------"
    );
    console.log("See block explorer app for details.");
  }
  // console.log('Transaction hash:' + deployedDiamond.deployTransaction.hash)
  console.log(diamondName, "deployed at", deployedDiamond.address);
  return deployedDiamond;
}

exports.diamondDeploy = diamondDeploy;
