### Project description

This poroject is a dApp: Decentralized Casino that allows everyone to stake money, form part of the House and enjoy the benefits.

The Staker deposits the funds and the House receives 70% of the revenue.
The rest 30% goes to HMX: the platform, the governance and maintenence.

When Staker claims back the deposited funds, they first go to the Vault for linear delayed liberation for 20 days.
When the funds gets liberated, the Staker can redeem it.

### Run demo on local machine

`cd reactCombineLandingPage yarn yarn start`

### Vrf Subscription

https://vrf.chain.link/mumbai/2190

### Solidity Files Structure

In our project we are using cutting edge technology like Ethereum Improvement Proposal:2535. Which is called Diamond: Multi-Facet Proxy, We create a modular smart contract system that can be extended and updated after deployment without changing the main deployment address.

---

####Utility facets
#####Facet : DiamondCutFacet

`diamondCut((address,uint8,bytes4[])[],address,bytes)` updates diamond

#####Facet : DiamondLoupeFacet

This facet is used to query diamond for actual facets and associated functions.

1. `facetAddress(bytes4)`
2. `facetAddresses()`
3. `facetFunctionSelectors(address)`
4. `facets()`
5. `supportsInterface(bytes4)`

#####Facet : OwnershipFacet

1. `owner()`
2. `transferOwnership(address)`

---

####Functional facets
#####Facet : PlayersFacet

1. `checkPlayerBalance()`
2. `depositToCashier()`
3. `withdrawPlayerBalance()`
4. `withdrawPlayerBalanceAmount(uint256)`

#####Facet : StakerFacet

1. `checkStakerBalance()`
2. `getHLPTokenAddress()`
3. `reclaimHLP(uint256)`
4. `setHLPTokenAddress(address)`
5. `stakeETH()`

#####Facet : AdminFacet

1. `checkPlatformBalance()`
2. `isContractOwner()`
3. `withdrawAllPlatformFunds()`

#####Facet : RouletteFacet
Controls the gamve and VRF repsonses.

1. `getReqID()`
2. `getRnd()`
3. `placeBet((uint256,uint8,uint8)[],uint256)`
4. `rawFulfillRandomWords(uint256,uint256[])`
5. `testFulfillRandomWords(uint256,uint256[])`
6. `testGetAmounts()`

#####Facet : VaultFacet
Used to control reclaiming and redeeming staked funds.

1. `getVaultState()`
2. `redeemFromVault()`

### Running tests

###### Test Staker

`npx hardhat test test/testStaker.js`

###### Test Player

`npx hardhat test test/testPlayer.js`

###### Test Diamond

`npx hardhat test test/testDiamond.js`

### Deployment to MUMBAI

###### Deploy HLP Token

`yarn hardhat run deploy/deployHLP.js --network mumbai`

###### Deploy Staker

`yarn hardhat run deploy/deployStaker.js --network mumbai`

###### Deploy diamond

Deploy HLP first
`yarn hardhat run deploy/deploy.js --network mumbai`

###### Cut diamond: update a module

`yarn hardhat run deploy/Cut.js --network mumbai`
The script shpuld be adjsuted in accordance to what module we want to update.

### Run frontend

`cd frontend`
`npm run start`

yarn hardhat run test/deployHLP.js
