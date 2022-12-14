//extension from node_modules/diamond-util/src/index.js
/* global ethers */
const _ = require("lodash");
const fs = require("fs");
const chalk = require("chalk");
const FacetCutAction = {
  Add: 0,
  Replace: 1,
  Remove: 2,
};

// eslint-disable-next-line no-unused-vars
function getSignatures(contract) {
  return Object.keys(contract.interface.functions);
}

function getSelectors(contract) {
  const signatures = Object.keys(contract.interface.functions);
  const selectors = signatures.reduce((acc, val) => {
    if (val !== "init(bytes)") {
      acc.push(contract.interface.getSighash(val));
    }
    return acc;
  }, []);
  return selectors;
}

async function deployFacets(facets, deployLibraries) {
  console.log("--");
  const deployed = [];
  for (const facet of facets) {
    if (Array.isArray(facet)) {
      if (typeof facet[0] !== "string") {
        throw Error(
          `Error using facet: facet name must be a string. Bad input: ${facet[0]}`
        );
      }
      if (!(facet[1] instanceof ethers.Contract)) {
        throw Error(
          `Error using facet: facet must be a Contract. Bad input: ${facet[1]}`
        );
      }
      console.log(`Using already deployed ${facet[0]}: ${facet[1].address}`);
      console.log("--");
      deployed.push(facet);
    } else {
      if (typeof facet !== "string") {
        throw Error(
          `Error deploying facet: facet name must be a string. Bad input: ${facet}`
        );
      }

      const libraries = {};
      //Deploy required libs
      if (deployLibraries) {
        const libs2Deploy = deployLibraries[facet];
        if (libs2Deploy) {
          console.log("Will deploy libs ", libs2Deploy, "for facet ", facet);

          for (let lib in libs2Deploy) {
            lib = libs2Deploy[lib];
            console.log("getContractFactory", lib);
            const libFactory = await ethers.getContractFactory(lib);
            const libDeployed = await libFactory.deploy();
            await libDeployed.deployed();

            libraries[lib] = libDeployed.address;
          }
        }
      }

      const facetFactory = await ethers.getContractFactory(facet, {
        libraries,
      });
      console.log(`Deploying ${facet}`);
      const deployedFactory = await facetFactory.deploy();
      await deployedFactory.deployed();
      console.log(`${facet} deployed: ${deployedFactory.address}`);
      console.log("--");
      deployed.push([facet, deployedFactory]);
    }
  }
  return deployed;
}

async function deploy({
  diamondName,
  facets,
  args = [],
  overrides = {},
  deployLibraries,
}) {
  //   console.log(`++++++++++++++++++++++++++++++++++++`);
  if (arguments.length !== 1) {
    throw Error(
      `Requires only 1 map argument. ${arguments.length} arguments used.`
    );
  }
  facets = await deployFacets(facets, deployLibraries);
  const diamondFactory = await ethers.getContractFactory(diamondName);
  const diamondCut = [];
  console.log("--");
  console.log("Setting up diamondCut args");
  console.log("--");
  for (const [name, deployedFacet] of facets) {
    console.log(name);
    console.log(getSignatures(deployedFacet));
    console.log("--");
    diamondCut.push([
      deployedFacet.address,
      FacetCutAction.Add,
      getSelectors(deployedFacet),
    ]);
  }
  console.log("--");
  console.log(`Deploying ${diamondName}`);
  //   console.log(`++++++++++++++++++++++++++++++++++++`, diamondCut);
  console.log(`diamondCut`, diamondCut);
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

  console.log(`${diamondName} deployed: ${deployedDiamond.address}`);
  console.log(`${diamondName} constructor arguments:`);
  console.log(JSON.stringify(constructorArguments, null, 4));
  if (!result.status) {
    console.log(
      "TRANSACTION FAILED!!! -------------------------------------------"
    );
    console.log("See block explorer app for details.");
  }
  console.log("Transaction hash:" + deployedDiamond.deployTransaction.hash);
  console.log("--");
  return deployedDiamond;
}

function inFacets(selector, facets) {
  for (const facet of facets) {
    if (facet.functionSelectors.includes(selector)) {
      return true;
    }
  }
  return false;
}

async function upgrade({
  diamondAddress,
  diamondCut,
  txArgs = {},
  initFacetName = undefined,
  initArgs,
}) {
  if (arguments.length !== 1) {
    throw Error(
      `Requires only 1 map argument. ${arguments.length} arguments used.`
    );
  }
  const diamondCutFacet = await ethers.getContractAt(
    "DiamondCutFacet",
    diamondAddress
  );
  const diamondLoupeFacet = await ethers.getContractAt(
    "DiamondLoupeFacet",
    diamondAddress
  );
  const existingFacets = await diamondLoupeFacet.facets();
  const facetFactories = new Map();

  console.log("Facet Signatures and Selectors: ");
  for (const facet of diamondCut) {
    const functions = new Map();
    const selectors = [];
    console.log("Facet: " + facet);
    let facetName;
    let contract;
    if (Array.isArray(facet[0])) {
      facetName = facet[0][0];
      contract = facet[0][1];
      if (!(typeof facetName === "string")) {
        throw Error("First value in facet[0] array must be a string.");
      }
      if (!(contract instanceof ethers.Contract)) {
        throw Error(
          "Second value in facet[0] array must be a Contract object."
        );
      }
      facet[0] = facetName;
    } else {
      facetName = facet[0];
      if (!(typeof facetName === "string") && facetName) {
        throw Error("facet[0] must be a string or an array or false.");
      }
    }
    for (const signature of facet[2]) {
      const selector = ethers.utils
        .keccak256(ethers.utils.toUtf8Bytes(signature))
        .slice(0, 10);
      console.log(`Function: ${selector} ${signature}`);
      selectors.push(selector);
      functions.set(selector, signature);
    }
    console.log("");
    if (facet[1] === FacetCutAction.Remove) {
      if (facetName) {
        throw Error(
          `Can't remove functions because facet name must have a false value not ${facetName}.`
        );
      }
      facet[0] = ethers.constants.AddressZero;
      for (const selector of selectors) {
        if (!inFacets(selector, existingFacets)) {
          const signature = functions.get(selector);
          console.log("existingFacets", existingFacets);
          console.log("selector", selector);
          throw Error(
            `Can't remove '${signature}'. It doesn't exist in deployed diamond. Case A`
          );
        }
      }
      facet[2] = selectors;
    } else if (facet[1] === FacetCutAction.Replace) {
      let facetFactory = facetFactories.get(facetName);
      if (!facetFactory) {
        if (contract) {
          facetFactories.set(facetName, contract);
        } else {
          facetFactory = await ethers.getContractFactory(facetName);
          facetFactories.set(facetName, facetFactory);
        }
      }
      for (const signature of facet[2]) {
        if (
          !Object.prototype.hasOwnProperty.call(
            facetFactory.interface.functions,
            signature
          )
        ) {
          throw Error(
            `Can't replace '${signature}'. It doesn't exist in ${facetName} source code.`
          );
        }
      }
      for (const selector of selectors) {
        if (!inFacets(selector, existingFacets)) {
          const signature = functions.get(selector);
          throw Error(
            `Can't replace '${signature}'. It doesn't exist in deployed diamond. Case B`
          );
        }
      }
      facet[2] = selectors;
    } else if (facet[1] === FacetCutAction.Add) {
      let facetFactory = facetFactories.get(facetName);
      if (!facetFactory) {
        if (contract) {
          facetFactories.set(facetName, contract);
        } else {
          facetFactory = await ethers.getContractFactory(facetName);
          facetFactories.set(facetName, facetFactory);
        }
      }
      for (const signature of facet[2]) {
        if (
          !Object.prototype.hasOwnProperty.call(
            facetFactory.interface.functions,
            signature
          )
        ) {
          throw Error(
            `Can't add ${signature}. It doesn't exist in ${facetName} source code.`
          );
        }
      }
      for (const selector of selectors) {
        if (inFacets(selector, existingFacets)) {
          const signature = functions.get(selector);
          throw Error(
            `Can't add '${signature}'. It already exists in deployed diamond.`
          );
        }
      }
      facet[2] = selectors;
    } else {
      console.log(facet);
      throw Error(
        "Incorrect FacetCutAction value. Must be 0, 1 or 2. Value used: " +
          facet[1]
      );
    }
  }
  // deploying new facets
  const alreadDeployed = new Map();
  for (const facet of diamondCut) {
    if (facet[1] !== FacetCutAction.Remove) {
      const existingAddress = alreadDeployed.get(facet[0]);
      if (existingAddress) {
        facet[0] = existingAddress;
        continue;
      }
      console.log(`Deploying ${facet[0]}`);
      const facetFactory = facetFactories.get(facet[0]);
      let deployedFacet = facetFactory;
      if (!(deployedFacet instanceof ethers.Contract)) {
        deployedFacet = await facetFactory.deploy();
        await deployedFacet.deployed();
      }
      facetFactories.set(facet[0], deployedFacet);
      console.log(`${facet[0]} deployed: ${deployedFacet.address}`);
      alreadDeployed.set(facet[0], deployedFacet.address);
      facet[0] = deployedFacet.address;
    }
  }

  console.log("diamondCut arg:");
  console.log(diamondCut);

  let initFacetAddress = ethers.constants.AddressZero;
  let functionCall = "0x";
  if (initFacetName !== undefined) {
    let initFacet = facetFactories.get(initFacetName);
    if (!initFacet) {
      const InitFacet = await ethers.getContractFactory(initFacetName);
      initFacet = await InitFacet.deploy();
      await initFacet.deployed();
      console.log("Deployed init facet: " + initFacet.address);
    } else {
      console.log("Using init facet: " + initFacet.address);
    }
    functionCall = initFacet.interface.encodeFunctionData("init", initArgs);
    console.log("Function call: ");
    console.log(functionCall);
    initFacetAddress = initFacet.address;
  }

  const result = await diamondCutFacet.diamondCut(
    diamondCut,
    initFacetAddress,
    functionCall,
    txArgs
  );
  const receipt = await result.wait();
  if (!receipt.status) {
    console.log(
      "TRANSACTION FAILED!!! -------------------------------------------"
    );
    console.log("See block explorer app for details.");
  }
  console.log("------");
  console.log("Upgrade transaction hash: " + result.hash);
  return result;
}

async function upgradeWithNewFacets({
  diamondAddress,
  facetNames,
  selectorsToRemove = [],
  initFacetName = undefined,
  initArgs = [],
  libraries: {},
  librariesAddresses: {},
}) {
  console.log(arguments);
  if (arguments.length !== 1) {
    throw Error(
      `Requires only 1 map argument. ${arguments.length} arguments used.`
    );
  }
  const diamondCutFacet = await ethers.getContractAt(
    "DiamondCutFacet",
    diamondAddress
  );
  const diamondLoupeFacet = await ethers.getContractAt(
    "DiamondLoupeFacet",
    diamondAddress
  );

  const diamondCut = [];
  const existingFacets = await diamondLoupeFacet.facets();
  const undeployed = [];
  const deployed = [];
  for (const name of facetNames) {
    console.log(name);
    let theLibs = {};
    if (_.get(arguments, [0, "libraries", name])) {
      const libs2Deploy = _.get(arguments, [0, "libraries", name]) || [];
      for (let lib2Deploy in libs2Deploy) {
        lib2Deploy = libs2Deploy[lib2Deploy];
        const libFactory = await ethers.getContractFactory(lib2Deploy);
        const libDeployed = await libFactory.deploy();
        await libDeployed.deployed();
        theLibs[lib2Deploy] = libDeployed.address;
        console.log(
          chalk.red(`Library deployed ${lib2Deploy}: ${libDeployed.address}`)
        );
      }
    } else if (_.get(arguments, [0, "librariesAddresses", name])) {
      theLibs = _.get(arguments, [0, "librariesAddresses", name]);
    }
    const facetFactory = await ethers.getContractFactory(name, {
      libraries: theLibs,
    });
    undeployed.push([name, facetFactory]);
  }

  if (selectorsToRemove.length > 0) {
    // check if any selectorsToRemove are already gone
    for (const selector of selectorsToRemove) {
      if (!inFacets(selector, existingFacets)) {
        throw Error("Function selector to remove is already gone.");
      }
    }
    diamondCut.push([
      ethers.constants.AddressZeo,
      FacetCutAction.Remove,
      selectorsToRemove,
    ]);
  }

  for (const [name, facetFactory] of undeployed) {
    console.log(`Deploying ${name}`);
    deployed.push([name, await facetFactory.deploy()]);
  }
  let addressDic = await readDeployDic();
  for (const [name, deployedFactory] of deployed) {
    await deployedFactory.deployed();
    console.log("--");
    console.log(`${name} deployed: ${deployedFactory.address}`);
    addressDic[deployedFactory.address] = name;
    const add = [];
    const replace = [];
    for (const selector of getSelectors(deployedFactory)) {
      if (!inFacets(selector, existingFacets)) {
        add.push(selector);
      } else {
        replace.push(selector);
      }
    }
    let signatures = getSignatures(deployedFactory);

    for (let sig in signatures) {
      sig = signatures[sig];
      //   console.log(sig);
      addressDic[deployedFactory.interface.getSighash(sig)] = sig;
      //   console.log("\t", sig, "\t\t", deployedFacet.interface.getSighash(sig));
    }

    if (add.length > 0) {
      diamondCut.push([deployedFactory.address, FacetCutAction.Add, add]);
    }
    if (replace.length > 0) {
      diamondCut.push([
        deployedFactory.address,
        FacetCutAction.Replace,
        replace,
      ]);
    }
  }
  console.log("diamondCut arg:");
  console.log(diamondCut);
  console.log("------");

  let initFacetAddress = ethers.constants.AddressZero;
  let functionCall = "0x";
  if (initFacetName !== undefined) {
    let initFacet;
    for (const [name, deployedFactory] of deployed) {
      if (name === initFacetName) {
        initFacet = deployedFactory;
        break;
      }
    }
    if (!initFacet) {
      const InitFacet = await ethers.getContractFactory(initFacetName);
      initFacet = await InitFacet.deploy();
      await initFacet.deployed();
      console.log("Deployed init facet: " + initFacet.address);
    } else {
      console.log("Using init facet: " + initFacet.address);
    }
    functionCall = initFacet.interface.encodeFunctionData("init", initArgs);
    console.log("Function call: ");
    console.log(functionCall);
    initFacetAddress = initFacet.address;
  }

  const result = await diamondCutFacet.diamondCut(
    diamondCut,
    initFacetAddress,
    functionCall
  );
  console.log("------");
  console.log("Upgrade transaction hash: " + result.hash);

  fs.writeFileSync("deployDic.json", JSON.stringify(addressDic, null, 2));
  return result;
}

async function readDeployDic() {
  let json = fs.readFileSync("deployDic.json");
  return JSON.parse(json);
}
exports.FacetCutAction = FacetCutAction;
exports.upgrade = upgrade;
exports.upgradeWithNewFacets = upgradeWithNewFacets;
exports.getSelectors = getSelectors;
exports.deployFacets = deployFacets;
exports.deploy = deploy;
exports.inFacets = inFacets;
exports.upgrade = upgrade;
