const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { ethers, network } = require('hardhat');
const { assert, expect } = require('chai');
const chai = require('chai');
chai.use(require('chai-as-promised'));

const { deployContract } = require('./shared/fixtures');

const {
    ROLES,
    DEFAULT_TEST_VALUES: { TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY }
} = require('../../config');

describe("3 :: Vester", function () {
    async function deployVesterFixture() {
        const provider = new ethers.providers.Web3Provider(network.provider);
        const [governor, nonGovernor, minter, admin, nonStakingAccount, whitelistHandler] = await ethers.getSigners();

        HMX = await deployContract('HMX', []);
        EsHMX = await deployContract('EsHMX', []);
        bnHMX = await deployContract('MintableBaseToken', ['Bonus HMX', 'bnHMX', 0]);
        eth = await deployContract('Token', []);

        await HMX.connect(governor).grantRole(ROLES._MINTER_ROLE_, minter.address);
        await EsHMX.connect(governor).grantRole(ROLES._MINTER_ROLE_, minter.address);

        // const Vester_Factory = await ethers.getContractFactory('Vester');
        // const Vester = await Vester_Factory.deploy(
        // );
        // const receipt = await Vester.deployed();
        // const transaction = await receipt.deployTransaction.wait()
    
        return {
            provider,
            governor, nonGovernor, minter, admin, nonStakingAccount, whitelistHandler,
            HMX, EsHMX, bnHMX, eth,
            // Vester,
            // transaction
        }
    }

    describe("3-0 :: Deployment", function () {
        it("3-0-00 :: Verify minters", async function () {
            const { minter, HMX, EsHMX } = await loadFixture(deployVesterFixture);
            
            await expect(
                HMX.hasRole(ROLES._MINTER_ROLE_, minter.address)
            ).to.be.eventually.equal(true, 'minter.address should be HMX minter.');
            await expect(
                EsHMX.hasRole(ROLES._MINTER_ROLE_, minter.address)
            ).to.be.eventually.equal(true, 'minter.address should be EsHMX minter.');
        });
    });
})