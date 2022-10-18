const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { assert, expect } = require('chai');
const chai = require('chai');
chai.use(require('chai-as-promised'));

const { listenersRoleAdminChanged, listenersRoleGranted, listenersRoleRevoked } = require('./shared/events/listenersAccessControl');
const { listenersDistributionChange, listenersTokensPerIntervalChange } = require('./shared/events/listenersTimeDistributor');

const { ethers, network } = require('hardhat');
const {
    ROLES,
    DEFAULT_TEST_VALUES: { TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY }
} = require('../config');


describe("2 :: TimeDistributor", function () {
    async function deployTimeDistributorFixture() {
        const provider = new ethers.providers.Web3Provider(network.provider);
        const [governor, nonGovernor, admin, nonStakingAccount, whitelistHandler] = await ethers.getSigners();

        const LibTimeDistributorGetters_Factory = await ethers.getContractFactory('LibTimeDistributorGetters');
        const LibTimeDistributorGetters = await LibTimeDistributorGetters_Factory.deploy();
        
        const LibTimeDistributorUpdates_Factory = await ethers.getContractFactory('LibTimeDistributorUpdates');
        const LibTimeDistributorUpdates = await LibTimeDistributorUpdates_Factory.deploy();

        const TimeDistributor_Factory = await ethers.getContractFactory('TimeDistributor',{
            libraries: {
                LibTimeDistributorGetters: LibTimeDistributorGetters.address,
                LibTimeDistributorUpdates: LibTimeDistributorUpdates.address
            }
        });
        const TimeDistributor = await TimeDistributor_Factory.deploy();
        const receipt = await TimeDistributor.deployed();
        const transaction = await receipt.deployTransaction.wait();

        const ITimeDistributor = await ethers.getContractAt("ITimeDistributor", TimeDistributor.address, governor);

        return { governor, nonGovernor, admin, nonStakingAccount, whitelistHandler, provider, TimeDistributor, transaction, ITimeDistributor, LibTimeDistributorUpdates };
    }

    describe("2-0 :: Deployment", function () {
        it("2-0-00 :: Should emit AccessControl events", async function () {
            const { governor, transaction, TimeDistributor } = await loadFixture(deployTimeDistributorFixture);

            // Admin changes
            const adminChanges = await listenersRoleAdminChanged(transaction, TimeDistributor);
            expect(adminChanges.length).to.equal(2, 'Unexpected number of RoleAdminChanged events emitted.');

            expect(adminChanges[0].role).to.equal(ROLES._GOVERNOR_ROLE_, 'role should be _GOVERNOR_ROLE_.');
            expect(adminChanges[0].previousAdminRole).to.equal(ROLES.DEFAULT, 'previousAdminRole should be DEFAULT.');
            expect(adminChanges[0].newAdminRole).to.equal(ROLES._GOVERNOR_ROLE_, 'newAdminRole should be _GOVERNOR_ROLE_.');

            expect(adminChanges[1].role).to.equal(ROLES._ADMIN_ROLE_, 'role should be _ADMIN_ROLE_.');
            expect(adminChanges[1].previousAdminRole).to.equal(ROLES.DEFAULT, 'previousAdminRole should be DEFAULT.');
            expect(adminChanges[1].newAdminRole).to.equal(ROLES._GOVERNOR_ROLE_, 'newAdminRole should be _GOVERNOR_ROLE_.');

            // Roles granted
            const roleGrantedChanged = await listenersRoleGranted(transaction, TimeDistributor);
            expect(roleGrantedChanged.length).to.equal(2, 'Unexpected number of RoleGranted events emitted.');

            expect(roleGrantedChanged[0].role).to.equal(ROLES._GOVERNOR_ROLE_, 'role should be _GOVERNOR_ROLE_');
            expect(roleGrantedChanged[0].account).to.equal(governor.address, 'account should be governor.address.');
            expect(roleGrantedChanged[0].sender).to.equal(governor.address, 'account should be governor.address.');
            
            expect(roleGrantedChanged[1].role).to.equal(ROLES._ADMIN_ROLE_, 'role should be _ADMIN_ROLE_');
            expect(roleGrantedChanged[1].account).to.equal(governor.address, 'account should be governor.address.');
            expect(roleGrantedChanged[1].sender).to.equal(governor.address, 'account should be governor.address.');
        });

        it("2-0-01 :: Should have the correct roles and roles' admin assigned", async function () {
            const { governor, TimeDistributor } = await loadFixture(deployTimeDistributorFixture);

            // Get role admin
            await assert.eventually.equal(
                TimeDistributor.getRoleAdmin(ROLES._GOVERNOR_ROLE_),
                ROLES._GOVERNOR_ROLE_,
                '_GOVERNOR_ROLE_ admin not as expected.'
            );
            await assert.eventually.equal(
                TimeDistributor.getRoleAdmin(ROLES._ADMIN_ROLE_),
                ROLES._GOVERNOR_ROLE_,
                '_ADMIN_ROLE_ admin not as expected.'
            );

            // Get has role
            await assert.eventually.isTrue(
                TimeDistributor.hasRole(ROLES._GOVERNOR_ROLE_, governor.address),
                'governor should have _GOVERNOR_ROLE_.'
            );
            await assert.eventually.isTrue(
                TimeDistributor.hasRole(ROLES._ADMIN_ROLE_, governor.address),
                'governor should have _ADMIN_ROLE_.'
            );
        });
    });

    describe("2-1 :: Roles", function () {
        it("2-1-00 :: Should allow transfer of governor role by governor", async function () {
            const { governor, nonGovernor: altGovernor, TimeDistributor } = await loadFixture(deployTimeDistributorFixture);

            let tx = await TimeDistributor.connect(governor).renounceRole(ROLES._GOVERNOR_ROLE_, altGovernor.address);
            tx = await tx.wait();

            let [{ role, account, sender }] = await listenersRoleGranted(tx, TimeDistributor);
            expect(role).to.equal(ROLES._GOVERNOR_ROLE_, 'role should be _GOVERNOR_ROLE_.');
            expect(account).to.equal(altGovernor.address, 'account should be altGovernor.address.');
            expect(sender).to.equal(governor.address, 'sender should be governor.address.');

            [{ role, account, sender }] = await listenersRoleRevoked(tx, TimeDistributor);
            expect(role).to.equal(ROLES._GOVERNOR_ROLE_, 'role should be _GOVERNOR_ROLE_.');
            expect(account).to.equal(governor.address, 'account should be governor.address.');
            expect(sender).to.equal(governor.address, 'sender should be governor.address.');
        });

        it("2-1-01 :: Should allow governor to grant admin role", async function () {
            const { governor, nonGovernor, admin, TimeDistributor } = await loadFixture(deployTimeDistributorFixture);

            // Disallow non-governor to grant admin role
            await expect(
                TimeDistributor.connect(nonGovernor).grantRole(ROLES._ADMIN_ROLE_, admin.address)
            ).to.eventually.be.rejectedWith(/AccessControl: account .* is missing role/);
            await expect(
                TimeDistributor.hasRole(ROLES._ADMIN_ROLE_, admin.address)
            ).to.eventually.be.equal(false, 'admin.address should not have _ADMIN_ROLE_');

            // Allow governor to grant admin role
            let tx = await TimeDistributor.connect(governor).grantRole(ROLES._ADMIN_ROLE_, admin.address);
            tx = await tx.wait();
            let [{ role, account, sender }] = await listenersRoleGranted(tx, TimeDistributor);
            expect(role).to.equal(ROLES._ADMIN_ROLE_, 'role should be _ADMIN_ROLE_.');
            expect(account).to.equal(admin.address, 'account should be admin.address.');
            expect(sender).to.equal(governor.address, 'sender should be governor.address.');
            await expect(
                TimeDistributor.hasRole(ROLES._ADMIN_ROLE_, admin.address)
            ).to.eventually.be.equal(true, 'admin.address should have _ADMIN_ROLE_');
        });
    });

    describe("2-2 :: Set Distribution", function () {
        it("2-2-00 :: Should set distribution for accounts", async function () {
            const { provider, governor, nonGovernor, admin: receiver1, whitelistHandler: receiver2, TimeDistributor, ITimeDistributor, LibTimeDistributorUpdates } = await loadFixture(deployTimeDistributorFixture);

            const BaseToken_Factory = await ethers.getContractFactory('BaseToken');
            const BaseToken = await BaseToken_Factory.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);
            const receivers = [receiver1.address, receiver2.address];
            const amounts = [20, 30];

            // Allow distribution changes by governor
            let tx = await TimeDistributor.connect(governor).setDistribution(
                [BaseToken.address, BaseToken.address], receivers, amounts
            );
            tx = await tx.wait();

            let _distributionChanges = await listenersDistributionChange(tx, ITimeDistributor);
            expect(_distributionChanges[0].receiver).to.be.equal(receiver1.address, 'Receiver not expected (0).');
            expect(_distributionChanges[0].amount.toNumber()).to.be.equal(20, 'Amount not as expected (0).');
            expect(_distributionChanges[0].rewardToken).to.be.equal(BaseToken.address, 'Reward token not expected (0).');
            
            expect(_distributionChanges[1].receiver).to.be.equal(receiver2.address, 'Receiver not expected (1).');
            expect(_distributionChanges[1].amount.toNumber()).to.be.equal(30, 'Amount not as expected (1).');
            expect(_distributionChanges[1].rewardToken).to.be.equal(BaseToken.address, 'Reward token not expected (1).');

            for (let i in receivers) {
                const _lastDistributionTime = (await provider.getBlock(await provider.getBlockNumber())).timestamp;

                await expect(
                    TimeDistributor.tokensPerInterval(receivers[i])
                ).to.eventually.be.equal(amounts[i], 'Tokens per interval not expected.');
                await expect(
                    TimeDistributor.rewardTokens(receivers[i])
                ).to.eventually.be.equal(BaseToken.address, 'Reward tokens not expected.');
                await expect(
                    TimeDistributor.lastDistributionTime(receivers[i])
                ).to.eventually.be.equal(_lastDistributionTime, 'Tokens per interval not expected.');
            }

            // Disallow distribution changes by non-governor
            await expect(
                TimeDistributor.connect(nonGovernor).setDistribution(
                    [BaseToken.address, BaseToken.address], receivers, amounts
                )
            ).to.eventually.be.rejectedWith(/AccessControl: account .* is missing role/);
        });

        it("2-2-01 :: Should not set distribution for accounts when pending distribution", async function () {
            const { provider, governor, nonGovernor: receiver1, admin, whitelistHandler: receiver2, TimeDistributor, ITimeDistributor, LibTimeDistributorUpdates } = await loadFixture(deployTimeDistributorFixture);

            const BaseToken_Factory = await ethers.getContractFactory('BaseToken');
            const BaseToken = await BaseToken_Factory.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);
            const receivers = [receiver1.address, receiver2.address];
            const amounts = [20, 30];
            
            await TimeDistributor.connect(governor).grantRole(ROLES._ADMIN_ROLE_, admin.address);
            await TimeDistributor.connect(governor).renounceRole(ROLES._ADMIN_ROLE_, governor.address);

            // Disallow tokens per interval changes by governor when pending distribution
            let tx = await TimeDistributor.connect(governor).setDistribution(
                [BaseToken.address, BaseToken.address], receivers, amounts
            );       
            
            const _lastDistributionTime = (await provider.getBlock(await provider.getBlockNumber())).timestamp;
            tx = await network.provider.send("evm_setNextBlockTimestamp", [_lastDistributionTime+100000]);

            await expect(
                TimeDistributor.connect(governor).setDistribution(
                    [BaseToken.address, BaseToken.address], receivers, amounts
                )
            ).to.be.eventually.rejectedWith(/TimeDistributor: pending distributio/);
        });
    });

    describe("2-3 :: Set tokens per interval", function () {
        it("2-3-00 :: Should set tokens per interval for account", async function () {
            const { provider, governor, admin, whitelistHandler: receiver1, TimeDistributor, ITimeDistributor } = await loadFixture(deployTimeDistributorFixture);
            const _amount = 20;

            await TimeDistributor.connect(governor).grantRole(ROLES._ADMIN_ROLE_, admin.address);
            await TimeDistributor.connect(governor).renounceRole(ROLES._ADMIN_ROLE_, governor.address);

            // Disallow tokens per interval change by non-governor
            await expect(
                TimeDistributor.connect(governor).setTokensPerInterval(receiver1.address, _amount)
            ).to.be.eventually.rejectedWith(/AccessControl: account .* is missing role/);

            // Allow tokens per interval change by governor
            let tx = await TimeDistributor.connect(admin).setTokensPerInterval(receiver1.address, _amount);
            tx = await tx.wait();
            const [{ receiver, amount }] = await listenersTokensPerIntervalChange(tx, ITimeDistributor);
            expect(receiver).to.be.equal(receiver1.address, 'Receiver not expected (0).');
            expect(amount.toNumber()).to.be.equal(20, 'Amount not as expected (0).');

            let _lastBlockNumber = await provider.getBlockNumber();
            let _lastBlock = await provider.getBlock(_lastBlockNumber-1);
            let _lastDistributionTime = _lastBlock.timestamp;
            await expect(
                TimeDistributor.tokensPerInterval(receiver1.address)
            ).to.eventually.be.equal(_amount, 'Tokens per interval not expected.');
            await expect(
                TimeDistributor.lastDistributionTime(receiver1.address)
            ).to.eventually.be.equal(_lastDistributionTime, 'Tokens per interval not expected.');
        });

        it("2-3-01 :: Should not set tokens per interval when pending distribution", async function () {
            const { provider, governor, nonGovernor: receiver1, admin, whitelistHandler: receiver2, TimeDistributor, ITimeDistributor, LibTimeDistributorUpdates } = await loadFixture(deployTimeDistributorFixture);

            const BaseToken_Factory = await ethers.getContractFactory('BaseToken');
            const BaseToken = await BaseToken_Factory.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);
            const receivers = [receiver1.address, receiver2.address];
            const amounts = [20, 30];
            
            await TimeDistributor.connect(governor).grantRole(ROLES._ADMIN_ROLE_, admin.address);
            await TimeDistributor.connect(governor).renounceRole(ROLES._ADMIN_ROLE_, governor.address);

            // Disallow tokens per interval changes by governor when pending distribution
            let tx = await TimeDistributor.connect(governor).setDistribution(
                [BaseToken.address, BaseToken.address], receivers, amounts
            );       
            
            const _lastDistributionTime = (await provider.getBlock(await provider.getBlockNumber())).timestamp;
            tx = await network.provider.send("evm_setNextBlockTimestamp", [_lastDistributionTime+100000]);

            await expect(
                TimeDistributor.connect(admin).setTokensPerInterval(receiver1.address, amounts[0])
            ).to.be.eventually.rejectedWith(/TimeDistributor: pending distributio/);
        });
    });

    describe("2-4 :: Distribute reward tokens", function () {
        it("2-4-00 ::: Should distribute reward tokens", async function () {
            const { provider, governor, nonGovernor: receiver1, admin: receiver2, TimeDistributor, ITimeDistributor, LibTimeDistributorUpdates } = await loadFixture(deployTimeDistributorFixture);
            const timeTravelHours = 24;
            const timeTravelSecs = timeTravelHours * 60 * 60;

            // TimeDistributor balance must remain greater than receiver balance
            const receiver1Balance = 10;
            const receiver2Balance = 50;
            const timeDistributorBalance = INITIAL_SUPPLY - (receiver1Balance + receiver2Balance);

            const BaseToken_Factory = await ethers.getContractFactory('BaseToken');
            const BaseToken = await BaseToken_Factory.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);
            
            // TimeDistributor and receiver balance must be nonzero
            await BaseToken.connect(governor).transfer(TimeDistributor.address, timeDistributorBalance);
            await BaseToken.connect(governor).transfer(receiver1.address, receiver1Balance);
            await BaseToken.connect(governor).transfer(receiver2.address, receiver2Balance);
            const receivers = [receiver1.address, receiver2.address];
            const rewards = [5, 3];
            
            // Allow reward token distribution
            await TimeDistributor.connect(governor).setDistribution(
                [BaseToken.address, BaseToken.address], receivers, rewards
            );
            
            // Advance current block timestamp
            const _lastDistributionTime = (await provider.getBlock(await provider.getBlockNumber())).timestamp;
            tx = await network.provider.send("evm_setNextBlockTimestamp", [_lastDistributionTime+timeTravelSecs]);
            
            // Distribute funds to receivers
            await TimeDistributor.connect(receiver1).distribute();
            let _balanceReceiver = await BaseToken.balanceOf(receiver1.address);
            let _expectedBalanceReceiver = receiver1Balance + rewards[0]*timeTravelHours;
            expect(_balanceReceiver).to.be.equal(_expectedBalanceReceiver, 'Balance receiver1 not as expected.');

            await TimeDistributor.connect(receiver2).distribute();
            _balanceReceiver = await BaseToken.balanceOf(receiver2.address);
            _expectedBalanceReceiver = receiver2Balance + rewards[1]*timeTravelHours;
            expect(_balanceReceiver).to.be.equal(_expectedBalanceReceiver, 'Balance receiver2 not as expected.');
        });
    });
});
