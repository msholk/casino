const { ethers } = require('hardhat');


async function deployContract(contractName, args) {
    const contractFactory = await ethers.getContractFactory(contractName);
    return await contractFactory.deploy(...args);
}

module.exports = {
    deployContract
}