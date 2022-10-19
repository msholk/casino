const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { ethers, network } = require('hardhat');
const { assert, expect } = require('chai');
const chai = require('chai');
chai.use(require('chai-as-promised'));

const { deployContract } = require('./shared/fixtures');
const { listenersERC20Transfer } = require('./events/listenersERC20');
const { listenersRoleAdminChanged, listenersRoleGranted, listenersRoleRevoked } = require('./events/listenersAccessControl');
const { listenersPaused, listenersUnpaused } = require('./events/listenersPausable');

const {
    ROLES,
    DEFAULT_TEST_VALUES: { TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY }
} = require('../config');

describe("0 :: BaseToken", function () {
    async function deployBaseTokenFixture() {
        const provider = new ethers.providers.Web3Provider(network.provider);
        const [governor, nonGovernor, admin, nonStakingAccount, whitelistHandler] = await ethers.getSigners();

        const BaseToken_Factory = await ethers.getContractFactory('BaseToken');
        const BaseToken = await BaseToken_Factory.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);
        const receipt = await BaseToken.deployed();
        const transaction = await receipt.deployTransaction.wait()

        return {
            provider,
            governor, nonGovernor, admin, nonStakingAccount, whitelistHandler,
            BaseToken,
            transaction
        };
    }

    describe("0-0 :: Deployment", function () {
        it("0-0-00 :: Should set the correct name, symbol, decimals, and initial supply", async function () {
            const { governor, BaseToken } = await loadFixture(deployBaseTokenFixture);

            await expect(BaseToken.name()).to.eventually.equal('House Matrix', 'BaseToken name is not as expected.');
            await expect(BaseToken.symbol()).to.eventually.equal('HMX', 'BaseToken symbol is not as expected.');
            await expect(BaseToken.decimals()).to.eventually.equal(18, 'Decimals is not as expected.');

            const _totalSupply = await BaseToken.totalSupply();
            expect(_totalSupply.toNumber()).to.equal(INITIAL_SUPPLY, 'BaseToken name is not as expected.');

            await expect(BaseToken.balanceOf(governor.address)).to.eventually.equal(INITIAL_SUPPLY, 'Governor balance should be INITIAL_SUPPLY.')
        });

        it("0-0-01 :: Should set emit a Transfer for initial mint", async function () {
            const { governor, BaseToken, transaction } = await loadFixture(deployBaseTokenFixture);

            const [{ from, to, value }] = await listenersERC20Transfer(transaction, BaseToken);
            expect(from).to.equal(ethers.constants.AddressZero, 'from should be address(0).');
            expect(to).to.equal(governor.address, 'to should be governor.address.');
            expect(value).to.equal(INITIAL_SUPPLY, `value should be ${INITIAL_SUPPLY}.`);
        });

        it("0-0-02 :: Should emit AccessControl events", async function () {
            const { governor, BaseToken, transaction } = await loadFixture(deployBaseTokenFixture);

            // Admin changes
            const adminChanges = await listenersRoleAdminChanged(transaction, BaseToken);
            expect(adminChanges.length).to.equal(4, 'Unexpected number of RoleAdminChanged events emitted.');

            expect(adminChanges[0].role).to.equal(ROLES._GOVERNOR_ROLE_, 'role should be _GOVERNOR_ROLE_.');
            expect(adminChanges[0].previousAdminRole).to.equal(ROLES.DEFAULT, 'previousAdminRole should be DEFAULT.');
            expect(adminChanges[0].newAdminRole).to.equal(ROLES._GOVERNOR_ROLE_, 'newAdminRole should be _GOVERNOR_ROLE_.');

            expect(adminChanges[1].role).to.equal(ROLES._ADMIN_ROLE_, 'role should be _ADMIN_ROLE_.');
            expect(adminChanges[1].previousAdminRole).to.equal(ROLES.DEFAULT, 'previousAdminRole should be DEFAULT.');
            expect(adminChanges[1].newAdminRole).to.equal(ROLES._GOVERNOR_ROLE_, 'newAdminRole should be _GOVERNOR_ROLE_.');
            
            expect(adminChanges[2].role).to.equal(ROLES._WHITELIST_HANDLER_ROLE_, 'role should be _WHITELIST_HANDLER_ROLE_.');
            expect(adminChanges[2].previousAdminRole).to.equal(ROLES.DEFAULT, 'previousAdminRole should be DEFAULT.');
            expect(adminChanges[2].newAdminRole).to.equal(ROLES._GOVERNOR_ROLE_, 'newAdminRole should be _GOVERNOR_ROLE_.');
            
            expect(adminChanges[3].role).to.equal(ROLES._NON_STAKING_ACCOUNT_ROLE_, 'role should be _NON_STAKING_ACCOUNT_ROLE_.');
            expect(adminChanges[3].previousAdminRole).to.equal(ROLES.DEFAULT, 'previousAdminRole should be DEFAULT.');
            expect(adminChanges[3].newAdminRole).to.equal(ROLES._ADMIN_ROLE_, 'newAdminRole should be _ADMIN_ROLE_.');

            // Roles granted
            const roleGrantedChanged = await listenersRoleGranted(transaction, BaseToken);
            expect(roleGrantedChanged.length).to.equal(1, 'Unexpected number of RoleGranted events emitted.');

            expect(roleGrantedChanged[0].role).to.equal(ROLES._GOVERNOR_ROLE_, 'role should be _GOVERNOR_ROLE_');
            expect(roleGrantedChanged[0].account).to.equal(governor.address, 'account should be governor.address.');
            expect(roleGrantedChanged[0].sender).to.equal(governor.address, 'account should be governor.address.');
        });

        it("0-0-03 :: Should have the correct roles and roles' admin assigned", async function () {
            const { governor, BaseToken } = await loadFixture(deployBaseTokenFixture);

            // Get role admin
            await assert.eventually.equal(
                BaseToken.getRoleAdmin(ROLES._GOVERNOR_ROLE_),
                ROLES._GOVERNOR_ROLE_,
                '_GOVERNOR_ROLE_ admin not as expected.'
            );
            await assert.eventually.equal(
                BaseToken.getRoleAdmin(ROLES._ADMIN_ROLE_),
                ROLES._GOVERNOR_ROLE_,
                '_ADMIN_ROLE_ admin not as expected.'
            );
            await assert.eventually.equal(
                BaseToken.getRoleAdmin(ROLES._WHITELIST_HANDLER_ROLE_),
                ROLES._GOVERNOR_ROLE_,
                '_WHITELIST_HANDLER_ROLE_ admin not as expected.'
            );
            await assert.eventually.equal(
                BaseToken.getRoleAdmin(ROLES._NON_STAKING_ACCOUNT_ROLE_),
                ROLES._ADMIN_ROLE_,
                '_NON_STAKING_ACCOUNT_ROLE_ admin not as expected.'
            );

            // Get has role
            await assert.eventually.isTrue(
                BaseToken.hasRole(ROLES._GOVERNOR_ROLE_, governor.address),
                'governor should have _GOVERNOR_ROLE_.'
            );
        });
    });

    describe("0-1 :: Roles", function () {
        it("0-1-00 :: Should allow transfer of governor role by governor", async function () {
            const { governor, nonGovernor: altGovernor, BaseToken } = await loadFixture(deployBaseTokenFixture);

            let tx = await BaseToken.connect(governor).renounceRole(ROLES._GOVERNOR_ROLE_, altGovernor.address);
            tx = await tx.wait();

            let [{ role, account, sender }] = await listenersRoleGranted(tx, BaseToken);
            expect(role).to.equal(ROLES._GOVERNOR_ROLE_, 'role should be _GOVERNOR_ROLE_.');
            expect(account).to.equal(altGovernor.address, 'account should be altGovernor.address.');
            expect(sender).to.equal(governor.address, 'sender should be governor.address.');

            [{ role, account, sender }] = await listenersRoleRevoked(tx, BaseToken);
            expect(role).to.equal(ROLES._GOVERNOR_ROLE_, 'role should be _GOVERNOR_ROLE_.');
            expect(account).to.equal(governor.address, 'account should be governor.address.');
            expect(sender).to.equal(governor.address, 'sender should be governor.address.');
        });

        it("0-1-01 :: Should allow governor to grant admin role", async function () {
            const { governor, nonGovernor, admin, BaseToken } = await loadFixture(deployBaseTokenFixture);

            await expect(
                BaseToken.connect(nonGovernor).grantRole(ROLES._ADMIN_ROLE_, admin.address)
            ).to.be.rejectedWith(/AccessControl: account .* is missing role/);
            await expect(
                BaseToken.hasRole(ROLES._ADMIN_ROLE_, admin.address)
            ).to.eventually.equal(false, 'admin.address should not have _ADMIN_ROLE_');

            let tx = await BaseToken.connect(governor).grantRole(ROLES._ADMIN_ROLE_, admin.address);
            tx = await tx.wait();

            let [{ role, account, sender }] = await listenersRoleGranted(tx, BaseToken);
            expect(role).to.equal(ROLES._ADMIN_ROLE_, 'role should be _ADMIN_ROLE_.');
            expect(account).to.equal(admin.address, 'account should be admin.address.');
            expect(sender).to.equal(governor.address, 'sender should be governor.address.');
            await expect(
                BaseToken.hasRole(ROLES._ADMIN_ROLE_, admin.address)
            ).to.eventually.equal(true, 'admin.address should have _ADMIN_ROLE_');
        });

        it("0-1-02 :: Should allow admin to grant non-staking account role", async function () {
            const { governor, nonGovernor: nonAdmin, admin, nonStakingAccount, BaseToken } = await loadFixture(deployBaseTokenFixture);

            await BaseToken.connect(governor).grantRole(ROLES._ADMIN_ROLE_, admin.address);

            // Revert on nonAdmin granting _NON_STAKING_ACCOUNT_ROLE_
            await expect(
                BaseToken.connect(nonAdmin).grantRole(ROLES._NON_STAKING_ACCOUNT_ROLE_, nonStakingAccount.address)
            ).to.be.rejectedWith(/AccessControl: account .* is missing role/);

            // Grant _NON_STAKING_ACCOUNT_ROLE_ with admin
            let tx = await BaseToken.connect(admin).grantRole(ROLES._NON_STAKING_ACCOUNT_ROLE_, nonStakingAccount.address);
            tx = await tx.wait();

            let [{ role, account, sender }] = await listenersRoleGranted(tx, BaseToken);
            expect(role).to.equal(ROLES._NON_STAKING_ACCOUNT_ROLE_, 'role should be _NON_STAKING_ACCOUNT_ROLE_.');
            expect(account).to.equal(nonStakingAccount.address, 'account should be nonStakingAccount.address.');
            expect(sender).to.equal(admin.address, 'sender should be admin.address.');
            await expect(
                BaseToken.hasRole(ROLES._NON_STAKING_ACCOUNT_ROLE_, nonStakingAccount.address)
            ).to.eventually.equal(true, 'nonStakingAccount.address should have _NON_STAKING_ACCOUNT_ROLE_');

            // Revert on nonAdmin revoking _NON_STAKING_ACCOUNT_ROLE_
            await expect(
                BaseToken.connect(nonAdmin).revokeRole(ROLES._NON_STAKING_ACCOUNT_ROLE_, nonStakingAccount.address)
            ).to.be.rejectedWith(/AccessControl: account .* is missing role/);

            // Revoke _NON_STAKING_ACCOUNT_ROLE_ with admin
            tx = await BaseToken.connect(admin).revokeRole(ROLES._NON_STAKING_ACCOUNT_ROLE_, nonStakingAccount.address);
            tx = await tx.wait();

            [{ role, account, sender }] = await listenersRoleRevoked(tx, BaseToken);
            expect(role).to.equal(ROLES._NON_STAKING_ACCOUNT_ROLE_, 'role should be _NON_STAKING_ACCOUNT_ROLE_.');
            expect(account).to.equal(nonStakingAccount.address, 'account should be nonStakingAccount.address.');
            expect(sender).to.equal(admin.address, 'sender should be admin.address.');
            await expect(
                BaseToken.hasRole(ROLES._NON_STAKING_ACCOUNT_ROLE_, nonStakingAccount.address)
            ).to.eventually.equal(false, 'nonStakingAccount.address should not have _NON_STAKING_ACCOUNT_ROLE_');
        });

        it("0-1-03 :: Should allow governor to grant whitelist handlers role", async function () {
            const { governor, nonGovernor, whitelistHandler, BaseToken } = await loadFixture(deployBaseTokenFixture);
            
            // Revert on nonGovernor granting _WHITELIST_HANDLER_ROLE_
            await expect(
                BaseToken.connect(nonGovernor).grantRole(ROLES._WHITELIST_HANDLER_ROLE_, whitelistHandler.address)
            ).to.be.eventually.rejectedWith(/AccessControl: account .* is missing role/);

            // Grant _WHITELIST_HANDLER_ROLE_ with governor
            await BaseToken.connect(governor).grantRole(ROLES._WHITELIST_HANDLER_ROLE_, whitelistHandler.address);
            await expect(
                BaseToken.hasRole(ROLES._WHITELIST_HANDLER_ROLE_, whitelistHandler.address)
            ).to.be.eventually.equal(true, 'Account should have _WHITELIST_HANDLER_ROLE_.');
            
            // Revert on nonGovernor granting _WHITELIST_HANDLER_ROLE_
            await expect(
                BaseToken.connect(nonGovernor).revokeRole(ROLES._WHITELIST_HANDLER_ROLE_, whitelistHandler.address)
            ).to.be.eventually.rejectedWith(/AccessControl: account .* is missing role/);

            // Revoke _WHITELIST_HANDLER_ROLE_ with governor
            await BaseToken.connect(governor).revokeRole(ROLES._WHITELIST_HANDLER_ROLE_, whitelistHandler.address);
            await expect(
                BaseToken.hasRole(ROLES._WHITELIST_HANDLER_ROLE_, whitelistHandler.address)
            ).to.be.eventually.equal(false, 'Account should not have _WHITELIST_HANDLER_ROLE_.');
        });

        it("0-1-04 :: Should allow admin to manage non-staking accounts", async function () {
            const { governor, nonGovernor: nonAdmin, admin, nonStakingAccount, BaseToken } = await loadFixture(deployBaseTokenFixture);
            
            await BaseToken.connect(governor).grantRole(ROLES._ADMIN_ROLE_, admin.address);

            // Revert on non-admin granting _NON_STAKING_ACCOUNT_ROLE_
            await expect(
                BaseToken.connect(nonAdmin).grantRole(ROLES._NON_STAKING_ACCOUNT_ROLE_, nonStakingAccount.address)
            ).to.be.eventually.rejectedWith(/AccessControl: account .* is missing role/);

            // Grant _NON_STAKING_ACCOUNT_ROLE_ with admin
            await BaseToken.connect(admin).grantRole(ROLES._NON_STAKING_ACCOUNT_ROLE_, nonStakingAccount.address);
            await expect(
                BaseToken.hasRole(ROLES._NON_STAKING_ACCOUNT_ROLE_, nonStakingAccount.address)
            ).to.be.eventually.equal(true, 'Account should have _NON_STAKING_ACCOUNT_ROLE_.');
        });
    });

    describe("0-2 :: ERC20", function () {
        it("0-2-00 :: Should allow transfer of BaseToken", async function () {
            const { governor, nonGovernor, nonStakingAccount: receiver, BaseToken } = await loadFixture(deployBaseTokenFixture);
            const allowance = INITIAL_SUPPLY * 0.5;

            // Allow transfer of own funds
            await BaseToken.connect(governor).transfer(receiver.address, allowance);
            await expect(
                BaseToken.balanceOf(receiver.address)
            ).to.eventually.equal(allowance, 'Transferred balance not as expected.');
        });

        it("0-2-01 :: Should allow transferFrom of approved", async function () {
            const { governor, nonGovernor, nonStakingAccount: receiver, BaseToken } = await loadFixture(deployBaseTokenFixture);
            const allowance = INITIAL_SUPPLY * 0.5;
            await BaseToken.connect(governor).transfer(receiver.address, allowance);

            // Disallow transfer of non-allowed funds
            await expect(BaseToken.connect(governor).transferFrom(
                receiver.address, governor.address, allowance
            )).to.eventually.rejectedWith(/ERC20: insufficient allowance/);

            // Allow transfer of allowance
            await BaseToken.connect(receiver).increaseAllowance(governor.address, allowance);

            await BaseToken.connect(governor).transferFrom(
                receiver.address, nonGovernor.address, allowance
            );
            await expect(
                BaseToken.balanceOf(nonGovernor.address)
            ).to.eventually.equal(allowance, 'nonGovernor balance not as expected.');

            // Disallow transfer of revoked allowance
            await BaseToken.connect(receiver).increaseAllowance(governor.address, allowance);
            await BaseToken.connect(receiver).decreaseAllowance(governor.address, allowance);
            await expect(BaseToken.connect(governor).transferFrom(
                receiver.address, governor.address, allowance
            )).to.eventually.rejectedWith(/ERC20: insufficient allowance/);
        });
    });

    describe("0-3 :: Whitelisting", function () {
        it("0-3-00 :: Should manage a whitelist mode with governor", async function () {
            const { governor, nonGovernor, BaseToken } = await loadFixture(deployBaseTokenFixture);

            // Revert on nonGovernor set whitelist mode
            await expect(
                BaseToken.connect(nonGovernor).setInWhitelistMode(true)
            ).to.eventually.be.rejectedWith(/AccessControl: account .* is missing role/);

            // Set whitelist mode with governor
            let tx = await BaseToken.connect(governor).setInWhitelistMode(true);
            tx = await tx.wait();
            let [{ account }] = await listenersPaused(tx, BaseToken);
            expect(account).to.equal(governor.address, 'BaseToken should emit Paused event triggered by governor.');
            await expect(BaseToken.paused()).to.eventually.equal(true, 'BaseToken should be paused.');

            // Remove whitelist mode with governor
            tx = await BaseToken.connect(governor).setInWhitelistMode(false);
            tx = await tx.wait();
            [{ account }] = await listenersUnpaused(tx, BaseToken);
            expect(account).to.equal(governor.address, 'BaseToken should emit Unpaused event triggered by governor.');
            await expect(BaseToken.paused()).to.eventually.equal(false, 'BaseToken should be unpaused.');
        });

        it("0-3-01 :: Should only allow transfer for whitelist handlers during whitelist mode", async function () {
            const { governor, nonGovernor: receiver, admin: nonWhitelistHandler, whitelistHandler, BaseToken } = await loadFixture(deployBaseTokenFixture);
            const transferAmount = INITIAL_SUPPLY * 0.25;

            await BaseToken.connect(governor).transfer(whitelistHandler.address, transferAmount);
            await BaseToken.connect(governor).setInWhitelistMode(true);
            await BaseToken.connect(governor).grantRole(ROLES._WHITELIST_HANDLER_ROLE_, whitelistHandler.address);

            // Disallow non-whitelisthandler transfer
            await expect(
                BaseToken.connect(governor).transfer(receiver.address, transferAmount)
            ).to.eventually.be.rejectedWith(/AccessControl: account .* is missing role/);

            // Allow whitelisthandler transfer
            let tx = await BaseToken.connect(whitelistHandler).transfer(receiver.address, transferAmount);
            tx = await tx.wait();

            let [{ from, to, value }] = await listenersERC20Transfer(tx, BaseToken);
            expect(from).to.equal(whitelistHandler.address, 'from should be whitelistHandler.address.');
            expect(to).to.equal(receiver.address, 'to should be receiver.address.');
            expect(value).to.equal(transferAmount, `value should be ${transferAmount}.`);
        });

        it("0-3-02 :: Should only allow transferFrom for whitelist handlers during whitelist mode", async function () {
            const { governor, nonGovernor: receiver, admin: nonWhitelistHandler, whitelistHandler, BaseToken } = await loadFixture(deployBaseTokenFixture);
            const transferAmount = INITIAL_SUPPLY * 0.25;

            await BaseToken.connect(governor).setInWhitelistMode(true);
            await BaseToken.connect(governor).grantRole(ROLES._WHITELIST_HANDLER_ROLE_, whitelistHandler.address);

            // Disallow non-whitelisthandler transferFrom
            await BaseToken.connect(governor).increaseAllowance(nonWhitelistHandler.address, transferAmount);
            await expect(
                BaseToken.connect(nonWhitelistHandler).transferFrom(governor.address, receiver.address, transferAmount)
            ).to.eventually.be.rejectedWith(/AccessControl: account .* is missing role/);

            // Allow whitelisthandler transferFrom
            await BaseToken.connect(governor).increaseAllowance(whitelistHandler.address, transferAmount);
            tx = await BaseToken.connect(whitelistHandler).transferFrom(
                governor.address, receiver.address, transferAmount
            );
            tx = await tx.wait();

            [{ from, to, value }] = await listenersERC20Transfer(tx, BaseToken);
            expect(from).to.equal(governor.address, 'from should be whitelistHandler.address.');
            expect(to).to.equal(receiver.address, 'to should be receiver.address.');
            expect(value).to.equal(transferAmount, `value should be ${transferAmount}.`);
        });    
    });

    describe("0-4 :: NonStaking", function () {
        it("0-4-00 :: Non-staked supply should update", async function () {
            const { governor, admin, nonStakingAccount, BaseToken } = await loadFixture(deployBaseTokenFixture);

            await BaseToken.connect(governor).grantRole(ROLES._ADMIN_ROLE_, admin.address);

            // Initial nonStakedSupply
            await expect(BaseToken.nonStakedSupply()).to.be.eventually.equal(0, 'Initial non-staked supply should be zero.');
            let _stakeBalance = (await BaseToken.stakedBalance(governor.address)).toNumber();
            expect(_stakeBalance).to.be.equal(INITIAL_SUPPLY, 'Staked balance not as expected (0).');

            // Update account to non-staked
            await BaseToken.connect(admin).grantRole(ROLES._NON_STAKING_ACCOUNT_ROLE_, governor.address);
            let _accountBalance = (await BaseToken.balanceOf(governor.address)).toNumber();
            let _nonStakedSupply = (await BaseToken.nonStakedSupply()).toNumber();
            let _stakedSupply = (await BaseToken.totalStakedSupply()).toNumber();
            _stakeBalance = (await BaseToken.stakedBalance(governor.address)).toNumber();
            expect(_nonStakedSupply).to.be.equal(_accountBalance, 'Non-staked supply not as expected (1).');
            expect(_stakedSupply).to.be.equal(0, 'Staked supply not as expected (1).');
            expect(_stakeBalance).to.be.equal(0, 'Staked balance not as expected (1).');

            // Transfer balance to staked account
            await BaseToken.connect(governor).transfer(admin.address, INITIAL_SUPPLY*0.5);
            _nonStakedSupply = (await BaseToken.nonStakedSupply()).toNumber();
            _stakedSupply = (await BaseToken.totalStakedSupply()).toNumber();
            _stakeBalance = (await BaseToken.stakedBalance(admin.address)).toNumber();
            expect(_nonStakedSupply).to.be.equal(_accountBalance*0.5, 'Non-staked supply not as expected (2).');
            expect(_stakedSupply).to.be.equal(INITIAL_SUPPLY*0.5, 'Staked supply not as expected (2).');
            expect(_stakeBalance).to.be.equal(INITIAL_SUPPLY*0.5, 'Staked balance not as expected (2).');

            // Transfer balance to non-staked account
            await BaseToken.connect(admin).grantRole(ROLES._NON_STAKING_ACCOUNT_ROLE_, nonStakingAccount.address);
            await BaseToken.connect(admin).transfer(nonStakingAccount.address, INITIAL_SUPPLY*0.25);
            _nonStakedSupply = (await BaseToken.nonStakedSupply()).toNumber();
            _stakedSupply = (await BaseToken.totalStakedSupply()).toNumber();
            _stakeBalance = (await BaseToken.stakedBalance(admin.address)).toNumber();
            expect(_nonStakedSupply).to.be.equal(_accountBalance*0.75, 'Non-staked supply not as expected (3).');
            expect(_stakedSupply).to.be.equal(INITIAL_SUPPLY*0.25, 'Staked supply not as expected (3).');
            expect(_stakeBalance).to.be.equal(INITIAL_SUPPLY*0.25, 'Staked balance not as expected (3).');

            _stakeBalance = (await BaseToken.stakedBalance(nonStakingAccount.address)).toNumber();
            expect(_stakeBalance).to.be.equal(0, 'Staked balance not as expected (4).');
        });
    });
});

describe("0 :: HMX", function () {
    async function deployBaseTokenFixture() {
        const [governor] = await ethers.getSigners();

        const HMX_Factory = await ethers.getContractFactory('HMX');
        const HMX = await HMX_Factory.deploy();

        return { governor, HMX };
    }

    describe("0-5 :: Deployment", function () {
        it("0-5-00 :: Should set the correct name, symbol, decimals, and initial supply", async function () {
            const { governor, HMX } = await loadFixture(deployBaseTokenFixture);

            await expect(HMX.name()).to.eventually.equal('House Matrix', 'BaseToken name is not as expected.');
            await expect(HMX.symbol()).to.eventually.equal('HMX', 'BaseToken symbol is not as expected.');
            await expect(HMX.decimals()).to.eventually.equal(18, 'Decimals is not as expected.');

            const _totalSupply = await HMX.totalSupply();
            expect(_totalSupply.toNumber()).to.equal(0, 'BaseToken name is not as expected.');

            await expect(HMX.balanceOf(governor.address)).to.eventually.equal(0, 'Governor balance should be INITIAL_SUPPLY.')
        });
    });
});

describe("0 :: HLP", function () {
    async function deployBaseTokenFixture() {
        const [governor] = await ethers.getSigners();

        const HLP_Factory = await ethers.getContractFactory('HLP');
        const HLP = await HLP_Factory.deploy(INITIAL_SUPPLY);

        return { governor, HLP };
    }

    describe("0-6 :: Deployment", function () {
        it("0-5-00 :: Should set the correct name, symbol, decimals, and initial supply", async function () {
            const { governor, HLP } = await loadFixture(deployBaseTokenFixture);

            await expect(HLP.name()).to.eventually.equal('House Matrix LP', 'BaseToken name is not as expected.');
            await expect(HLP.symbol()).to.eventually.equal('HLP', 'BaseToken symbol is not as expected.');
            await expect(HLP.decimals()).to.eventually.equal(18, 'Decimals is not as expected.');

            const _totalSupply = await HLP.totalSupply();
            expect(_totalSupply.toNumber()).to.equal(INITIAL_SUPPLY, 'BaseToken name is not as expected.');

            await expect(HLP.balanceOf(governor.address)).to.eventually.equal(INITIAL_SUPPLY, 'Governor balance should be INITIAL_SUPPLY.')
        });
    });
});

describe("0 :: EsHMX", function () {
    async function deployBaseTokenFixture() {
        const [governor] = await ethers.getSigners();

        const EsHMX_Factory = await ethers.getContractFactory('EsHMX');
        const EsHMX = await EsHMX_Factory.deploy();

        return { governor, EsHMX };
    }

    describe("0-7 :: Deployment", function () {
        it("0-7-00 :: Should set the correct name, symbol, decimals, and initial supply", async function () {
            const { governor, EsHMX } = await loadFixture(deployBaseTokenFixture);

            await expect(EsHMX.name()).to.eventually.equal('Escrowed HMX', 'BaseToken name is not as expected.');
            await expect(EsHMX.symbol()).to.eventually.equal('EsHMX', 'BaseToken symbol is not as expected.');
            await expect(EsHMX.decimals()).to.eventually.equal(18, 'Decimals is not as expected.');

            const _totalSupply = await EsHMX.totalSupply();
            expect(_totalSupply.toNumber()).to.equal(0, 'BaseToken name is not as expected.');

            await expect(EsHMX.balanceOf(governor.address)).to.eventually.equal(0, 'Governor balance should be INITIAL_SUPPLY.')
        });
    });
});

describe("0 :: Token", function () {
    async function deployVesterFixture() {
        const [governor] = await ethers.getSigners();

        Token = await deployContract('Token', []);
    
        return { governor, Token }
    }

    describe("0-8 :: Deployment", function () {
        it("0-8-00 :: Should only allow decimals changed once", async function () {
            const { governor, Token } = await loadFixture(deployVesterFixture);
            const decimals = 8;

            await expect(Token.name()).to.be.eventually.equal('Token', 'Token name not as expected.');
            await expect(Token.symbol()).to.be.eventually.equal('TOKEN', 'Token symbol not as expected.');
            await expect(Token.decimals()).to.be.eventually.equal(18, 'Token default decimals not as expected.');
            
            await Token.connect(governor).setDecimals(decimals);
            await expect(Token.decimals()).to.be.eventually.equal(decimals, 'Token changed decimals not as expected.');

            await expect(Token.connect(governor).setDecimals(18)).to.be.eventually.rejectedWith(/Ownable: caller is not the owner/);
        });

        it("0-8-01 :: Should only allow decimals before minting", async function () {
            const { governor, Token } = await loadFixture(deployVesterFixture);
            const decimals = 8;
            
            await Token.connect(governor).mint(governor.address, INITIAL_SUPPLY);
            await expect(Token.connect(governor).setDecimals(decimals)).to.be.eventually.rejectedWith(/Ownable: caller is not the owner/);
        });
    });
})
