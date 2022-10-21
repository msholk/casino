const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { ethers, network } = require('hardhat');
const { assert, expect } = require('chai');
const chai = require('chai');
chai.use(require('chai-as-promised'));

const { deployContract } = require('./shared/fixtures');
const { listenersWalletCreated } = require('../unit/events/listenersHouseVestingRouter');

const {
    ROLES,
    DEFAULT_TEST_VALUES: { TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY }
} = require('../../config');

describe("4 :: HouseVesting", function () {
    async function deployBaseTokenFixture() {
        const provider = new ethers.providers.Web3Provider(network.provider);
        const [governor, nonGovernor, admin, owner] = await ethers.getSigners();

        const HouseVestingWallet_Factory = await ethers.getContractFactory('HouseVestingWallet');
        const HouseVestingWallet = await HouseVestingWallet_Factory.deploy()
        
        const HouseVestingRouter_Factory = await ethers.getContractFactory('HouseVestingRouter');
        const HouseVestingRouter = await HouseVestingRouter_Factory.deploy(HouseVestingWallet.address);

        return {
            provider,
            governor, nonGovernor, admin, owner,
            HouseVestingWallet, HouseVestingRouter,
        };
    }

    describe("4-0 :: Deployment", function () {
        it("4-0-00 :: Should set the correct name, symbol, decimals, and initial supply", async function () {
            const {
                provider,
                governor, nonGovernor, admin, owner,
                HouseVestingWallet, HouseVestingRouter,
            } = await loadFixture(deployBaseTokenFixture);

            let tx = await HouseVestingRouter.createHouseVestingWallet(
                [ethers.constants.AddressZero],
                [0],
                [10]
            );
            tx = await tx.wait();

            let [{ walletAddress, walletOwner }] = await listenersWalletCreated(tx, HouseVestingRouter);
            console.log(walletAddress);
            console.log(walletOwner);



            // await expect(BaseToken.name()).to.eventually.equal('House Matrix', 'BaseToken name is not as expected.');
            // await expect(BaseToken.symbol()).to.eventually.equal('HMX', 'BaseToken symbol is not as expected.');
            // await expect(BaseToken.decimals()).to.eventually.equal(18, 'Decimals is not as expected.');

            // const _totalSupply = await BaseToken.totalSupply();
            // expect(_totalSupply.toNumber()).to.equal(INITIAL_SUPPLY, 'BaseToken name is not as expected.');

            // await expect(BaseToken.balanceOf(governor.address)).to.eventually.equal(INITIAL_SUPPLY, 'Governor balance should be INITIAL_SUPPLY.')
        });
    });
});
