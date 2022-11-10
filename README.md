### Install

Install solidity project
`yarn install`
Install front end part:
`cd frontend`
`yarn install`

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

### Vrf Subscription

https://vrf.chain.link/mumbai/2190
