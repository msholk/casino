/* global describe it before ethers */
const { utils } = require("ethers");
const { selectorsToDic } = require("./utils/utils");
const { facetSelectors } = require("./utils/facetSelectors");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const _ = require("lodash");
const { assert, expect } = require("chai");
const { BigNumber } = require("ethers");
const {
  getSelectors,
  FacetCutAction,
  removeSelectors,
  findAddressPositionInFacets,
} = require("../scripts/libraries/diamond.js");
const { deployDiamond } = require("../scripts/deployDiamond.js");
const ZEROS18 = "000000000000000000";

const {
  diamondInit1,
  getAccounts,
  checkFacets1,
  checkFacets2,
} = require("./utils/utils");
describe("DiamondTest", async function () {
  let diamondAddress;
  let diamondCutFacet;
  let diamondLoupeFacet;
  let ownershipFacet;
  let playersFacet;
  let stakerFacet;
  let adminFacet;
  let tx;
  let receipt;
  let result;
  let TokensMock;
  let rouletteFacet;

  const facetAddress = {};
  let vrfInfo = {};

  async function initializeVRF() {
    /**
     * @dev Read more at https://docs.chain.link/docs/chainlink-vrf/
     */
    const BASE_FEE = "100000000000000000";
    const GAS_PRICE_LINK = "1000000000"; // 0.000000001 LINK per gas

    const chainId = network.config.chainId;

    const VRFCoordinatorV2MockFactory = await ethers.getContractFactory(
      "VRFCoordinatorV2Mock"
    );
    const VRFCoordinatorV2Mock = await VRFCoordinatorV2MockFactory.deploy(
      BASE_FEE,
      GAS_PRICE_LINK
    );

    const fundAmount =
      networkConfig[chainId]["fundAmount"] || "1000000000000000000";
    const transaction = await VRFCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transaction.wait(1);
    const subscriptionId = ethers.BigNumber.from(
      transactionReceipt.events[0].topics[1]
    );
    await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, fundAmount);

    const vrfCoordinatorAddress = VRFCoordinatorV2Mock.address;
    const keyHash =
      networkConfig[chainId]["keyHash"] ||
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc";

    await VRFCoordinatorV2Mock.addConsumer(subscriptionId, diamondAddress);

    vrfInfo = {
      subscriptionId,
      vrfCoordinatorAddress,
      keyHash,
      VRFCoordinatorV2Mock,
    };
  }

  async function initializeTokensMock() {
    const TokensMockFactory = await ethers.getContractFactory("TokensMock");
    TokensMock = await TokensMockFactory.deploy();
  }

  before(async function () {
    const res = await diamondInit1();
    ({
      diamondAddress,
      diamondCutFacet,
      diamondLoupeFacet,
      ownershipFacet,
      playersFacet,
      stakerFacet,
      adminFacet,
      rouletteFacet,
    } = res);

    await initializeTokensMock();
    await initializeVRF();

    const { subscriptionId, vrfCoordinatorAddress, keyHash } = vrfInfo;
    //await player.setVrfInfo({ subscriptionId, vrfCoordinatorAddress, keyHash });
  });

  describe("Diamond initialization", async () => {
    it("getAccounts", async () => {
      ({ signers, account0, account1, account2 } = await getAccounts());
    });
    it("checkFacets", async () => {
      await checkFacets1({
        facetAddress,
        diamondAddress,
        diamondCutFacet,
        diamondLoupeFacet,
        ownershipFacet,
        playersFacet,
        stakerFacet,
        adminFacet,
        rouletteFacet,
      });
      await checkFacets2({
        facetAddress,
        diamondAddress,
        diamondCutFacet,
        diamondLoupeFacet,
        ownershipFacet,
        playersFacet,
        stakerFacet,
        adminFacet,
        rouletteFacet,
      });
    });
  });

  describe("Facets & selectors", async () => {
    //don't disable: assign signatures to selectors
    it("facets should have the right function selectors -- call to facetFunctionSelectors function", async () => {
      //In facetSelectors.js we declare the map of required selectors per facet
      //Those functions found in deployment will have their hased signatures assigned
      let selectors = getSelectors(diamondCutFacet);
      result = await diamondLoupeFacet.facetFunctionSelectors(
        facetAddress.DiamondCutFacet
      );
      assert.sameMembers(result, selectors);
      assert.sameKeys(
        facetSelectors.DiamondCutFacet,
        selectorsToDic(selectors),
        "DiamondCutFacet expected functions",
        "DiamondCutFacet deployed functions"
      );
      facetSelectors.DiamondCutFacet = {
        ...facetSelectors.DiamondCutFacet,
        ...selectorsToDic(selectors),
      };

      selectors = getSelectors(diamondLoupeFacet);
      result = await diamondLoupeFacet.facetFunctionSelectors(
        facetAddress.DiamondLoupeFacet
      );
      assert.sameMembers(result, selectors);
      assert.sameKeys(
        facetSelectors.DiamondLoupeFacet,
        selectorsToDic(selectors),
        "DiamondLoupeFacet expected functions",
        "DiamondLoupeFacet deployed functions"
      );
      facetSelectors.DiamondLoupeFacet = {
        ...facetSelectors.DiamondLoupeFacet,
        ...selectorsToDic(selectors),
      };

      selectors = getSelectors(ownershipFacet);
      result = await diamondLoupeFacet.facetFunctionSelectors(
        facetAddress.OwnershipFacet
      );
      assert.sameMembers(result, selectors);
      assert.sameKeys(
        facetSelectors.OwnershipFacet,
        selectorsToDic(selectors),
        "OwnershipFacet expected functions",
        "OwnershipFacet deployed functions"
      );
      facetSelectors.OwnershipFacet = {
        ...facetSelectors.OwnershipFacet,
        ...selectorsToDic(selectors),
      };

      selectors = getSelectors(playersFacet);
      result = await diamondLoupeFacet.facetFunctionSelectors(
        facetAddress.PlayersFacet
      );
      assert.sameMembers(result, selectors);
      assert.sameKeys(
        facetSelectors.PlayersFacet,
        selectorsToDic(selectors),
        "PlayersFacet expected functions",
        "PlayersFacet deployed functions"
      );
      facetSelectors.PlayersFacet = {
        ...facetSelectors.PlayersFacet,
        ...selectorsToDic(selectors),
      };

      console.log(
        "*********************************************************************"
      );
      console.log("Facets selectors with signatures");
      // console.log(facetSelectors)
    });

    it("selectors should be associated to facets correctly -- multiple calls to facetAddress function", async () => {
      let showInConsole = false;
      const checkAllFunctionsOfFacet = async (facetKey) => {
        const selectors2Signature = facetSelectors[facetKey];
        if (showInConsole) console.log(`Checking ${facetKey}:`);
        for (let funcSelector in selectors2Signature) {
          const selectorSignature = selectors2Signature[funcSelector];
          if (showInConsole)
            console.log(`\t${selectorSignature}\t${funcSelector}`);
          assert.equal(
            facetAddress[facetKey],
            await diamondLoupeFacet.facetAddress(selectorSignature)
          );
        }
      };

      checkAllFunctionsOfFacet("DiamondCutFacet");
      checkAllFunctionsOfFacet("DiamondLoupeFacet");
      checkAllFunctionsOfFacet("OwnershipFacet");
      checkAllFunctionsOfFacet("PlayersFacet");
    });
  });

  describe("Deposits and Staking", async () => {
    it("Check contracts's balance is zero", async () => {
      let bal = await TokensMock.daiBalanceOf(diamondAddress);
      expect(bal).eq(0);
    });
    describe("Player`s deposits 1ETH", async () => {
      it("Check player balance is zero ", async () => {
        const player = await ethers.getContractAt(
          "PlayersFacet",
          diamondAddress
        );
        //console.log(player)

        let bal = await player.checkPlayerBalance();
        // console.log(bal)
        expect(bal[0]).eq(BigNumber.from(0));
        // console.log("Player balance", bal)
      });
      it("Player deposits 1 ETH ", async () => {
        const player = await ethers.getContractAt(
          "PlayersFacet",
          diamondAddress
        );

        await expect(
          player.depositToCashier({ value: utils.parseEther("1.0") })
        ).not.to.be.reverted;

        let bal = await player.checkPlayerBalance();
        expect(bal[0]).eq(utils.parseEther("1.0"));

        bal = await ethers.provider.getBalance(diamondAddress);
        expect(bal).eq(utils.parseEther("1.0"));
      });
    });

    describe("Stake House Liquidity", async () => {
      it("Staker0 stakes 100ETH", async () => {
        const staker = await ethers.getContractAt(
          "StakerFacet",
          diamondAddress
        );
        await expect(staker.stakeETH({ value: utils.parseEther("100.0") })).not
          .to.be.reverted;

        let bal = await ethers.provider.getBalance(diamondAddress);
        expect(bal).eq(utils.parseEther("101.0")); //precision 18

        bal = await staker.checkStakerBalance();
        // console.log(bal)
        expect(bal.stakerPercent).eq(utils.parseEther("1")); //1 means 100%
        expect(bal.newHouseBalance).eq(utils.parseEther("100.0")); //1 means 100%
      });
      it("Staker1 stakes: 50ETH", async () => {
        const staker = await ethers.getContractAt(
          "StakerFacet",
          diamondAddress
        );
        await expect(
          staker
            .connect(signers[1])
            .stakeETH({ value: utils.parseEther("50.0") })
        ).not.to.be.reverted;
      });
      it("Check diamond balance increased", async () => {
        let bal = await ethers.provider.getBalance(diamondAddress);
        expect(bal).eq(utils.parseEther("151")); //precision 18
      });
      it("The first staker should have some 66%", async () => {
        const staker = await ethers.getContractAt(
          "StakerFacet",
          diamondAddress
        );
        let bal = await staker.checkStakerBalance();
        //console.log(bal)
        expect(bal.stakerPercent).eq(utils.parseEther("0.666666666666666667")); //1 means 100%
        expect(bal.newHouseBalance).eq(utils.parseEther("150")); //1 means 100%
      });
      it("The second staker should have some 33%", async () => {
        const staker = await ethers.getContractAt(
          "StakerFacet",
          diamondAddress
        );
        let bal = await staker.connect(signers[1]).checkStakerBalance();
        //console.log(bal)
        expect(bal.stakerPercent).eq(utils.parseEther("0.333333333333333333")); //1 means 100%
        expect(bal.newHouseBalance).eq(utils.parseEther("150")); //1 means 100%
      });
    });
  });

  describe("Playing", async () => {
    let playerBalance;
    let houseBalance;
    let requestId = 1;
    it("Get initial players/house balance ", async () => {
      const rouletteFacet = await ethers.getContractAt(
        "RouletteFacet",
        diamondAddress
      );
      const lockedAmounts = await rouletteFacet.testGetAmounts();
      console.log(lockedAmounts);
      expect(lockedAmounts.houseLocked).eq(utils.parseEther("0"));
      expect(lockedAmounts.playerLocked).eq(utils.parseEther("0"));
      expect(lockedAmounts.requestId).eq(0);
      expect(lockedAmounts.playerBalance).eq(utils.parseEther("1"));
      expect(lockedAmounts.stakerPercent).eq(
        utils.parseEther("0.666666666666666667")
      );
      expect(lockedAmounts.houseBalance).eq(utils.parseEther("150"));
      expect(lockedAmounts.platformBalance).eq(0);
    });
    xdescribe("Playing and winning", async () => {
      it("Place a winning bet: expect emit RouletteLaunched", async () => {
        const rouletteFacet = await ethers.getContractAt(
          "RouletteFacet",
          diamondAddress
        );
        await expect(
          rouletteFacet.placeBet(
            [
              {
                amount: 100,
                betType: 1,
                betDet: 36,
              },
              {
                amount: 10,
                betType: 1,
                betDet: 19,
              },
            ],
            31
          )
        )
          .to.emit(rouletteFacet, "RouletteLaunched")
          .withArgs(31); //request id
      });
      it("Check locked amounts", async () => {
        const rouletteFacet = await ethers.getContractAt(
          "RouletteFacet",
          diamondAddress
        );
        const lockedAmounts = await rouletteFacet.testGetAmounts();
        console.log(lockedAmounts);
        expect(lockedAmounts.houseLocked).eq(utils.parseEther("3.5"));
        expect(lockedAmounts.playerLocked).eq(utils.parseEther("0.11"));
        expect(lockedAmounts.requestId).eq(31);
        expect(lockedAmounts.playerBalance).eq(utils.parseEther("0.89"));
        expect(lockedAmounts.stakerPercent).eq(
          utils.parseEther("0.666666666666666667")
        );
        expect(lockedAmounts.houseBalance).eq(utils.parseEther("146.5")); //150-3.5
        expect(lockedAmounts.platformBalance).eq(0);
      });
      it("Stopping roulette", async () => {
        const rouletteFacet = await ethers.getContractAt(
          "RouletteFacet",
          diamondAddress
        );

        //Sending wrong request
        let tx = await rouletteFacet.testFulfillRandomWords(32, [7984651]);
        await expect(tx).to.emit(
          rouletteFacet,
          "RouletteStoppedRequestIdNotRecognized"
        );

        //Sending correct requestid
        const theRandom = 89806461;
        tx = await rouletteFacet.testFulfillRandomWords(31, [theRandom]);
        const requestId = 31;
        const winNumber = 36;
        await expect(tx)
          .to.emit(rouletteFacet, "RouletteStoppedVRFCallReceived")
          .to.emit(rouletteFacet, "RouletteStopped")
          .withArgs(requestId, theRandom, winNumber);

        await expect(tx)
          .to.emit(rouletteFacet, "RouletteStoppedRequestIdRecognized")
          .to.emit(rouletteFacet, "RouletteLaunchOfPlayerFound");

        await expect(tx)
          .to.emit(rouletteFacet, "RouletteStoppedPrizeInfo")
          .withArgs(
            requestId,
            theRandom,
            winNumber,
            [3600, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          );
      });
      it("Checking balances after the bet", async () => {
        const rouletteFacet = await ethers.getContractAt(
          "RouletteFacet",
          diamondAddress
        );
        const lockedAmounts = await rouletteFacet.testGetAmounts();
        console.log(lockedAmounts);
        expect(lockedAmounts.houseLocked).eq(utils.parseEther("0"));
        expect(lockedAmounts.playerLocked).eq(utils.parseEther("0"));
        expect(lockedAmounts.requestId).eq(0);
        expect(lockedAmounts.playerBalance).eq(utils.parseEther("4.49"));
        expect(lockedAmounts.stakerPercent).eq(
          utils.parseEther("0.666666666666666667")
        );
        //house pays 150-3.490000000000000000 + comission 0.001047000000000000
        expect(lockedAmounts.houseBalance).eq(utils.parseEther("146.508953"));
        expect(lockedAmounts.platformBalance).eq(utils.parseEther("0.001047"));
      });
    });
    describe("Playing and losing", async () => {
      it("Place a losing bet: expect emit RouletteLaunched", async () => {
        const rouletteFacet = await ethers.getContractAt(
          "RouletteFacet",
          diamondAddress
        );
        await expect(
          rouletteFacet.placeBet(
            [
              {
                amount: 100,
                betType: 1,
                betDet: 36,
              },
              {
                amount: 10,
                betType: 1,
                betDet: 19,
              },
            ],
            31
          )
        )
          .to.emit(rouletteFacet, "RouletteLaunched")
          .withArgs(31); //request id
      });
      it("Check locked amounts", async () => {
        const rouletteFacet = await ethers.getContractAt(
          "RouletteFacet",
          diamondAddress
        );
        const lockedAmounts = await rouletteFacet.testGetAmounts();
        console.log(lockedAmounts);
        expect(lockedAmounts.houseLocked).eq(utils.parseEther("3.5"));
        expect(lockedAmounts.playerLocked).eq(utils.parseEther("0.11"));
        expect(lockedAmounts.requestId).eq(31);
        expect(lockedAmounts.playerBalance).eq(utils.parseEther("0.89"));
        expect(lockedAmounts.stakerPercent).eq(
          utils.parseEther("0.666666666666666667")
        );
        expect(lockedAmounts.houseBalance).eq(utils.parseEther("146.5"));
        expect(lockedAmounts.platformBalance).eq(0);
      });
      it("Stopping roulette", async () => {
        const rouletteFacet = await ethers.getContractAt(
          "RouletteFacet",
          diamondAddress
        );

        //Sending correct requestid
        const theRandom = 19;
        tx = await rouletteFacet.testFulfillRandomWords(31, [theRandom]);
        const requestId = 31;
        const winNumber = 20; //must lose
        await expect(tx)
          .to.emit(rouletteFacet, "RouletteStoppedVRFCallReceived")
          .to.emit(rouletteFacet, "RouletteStopped")
          .withArgs(requestId, theRandom, winNumber);

        await expect(tx)
          .to.emit(rouletteFacet, "RouletteStoppedRequestIdRecognized")
          .to.emit(rouletteFacet, "RouletteLaunchOfPlayerFound");

        await expect(tx)
          .to.emit(rouletteFacet, "RouletteStoppedPrizeInfo")
          .withArgs(
            requestId,
            theRandom,
            winNumber,
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          );
      });
      it("Checking lock balances after the bet", async () => {
        const rouletteFacet = await ethers.getContractAt(
          "RouletteFacet",
          diamondAddress
        );
        const lockedAmounts = await rouletteFacet.testGetAmounts();
        console.log(lockedAmounts);
        expect(lockedAmounts.houseLocked).eq(utils.parseEther("0"));
        expect(lockedAmounts.playerLocked).eq(utils.parseEther("0"));
        expect(lockedAmounts.requestId).eq(0);
        expect(lockedAmounts.playerBalance).eq(utils.parseEther("0.89")); //1-0.11
        expect(lockedAmounts.stakerPercent).eq(
          utils.parseEther("0.666666666666666667")
        );
        //house receives 150+0.110000000000000000 - 0.000286000000000000
        expect(lockedAmounts.houseBalance).eq(utils.parseEther("150.109714"));
        expect(lockedAmounts.platformBalance).eq(utils.parseEther("0.000286"));
      });
    });
  });
  xdescribe("Platformadmin", async () => {
    let playerBalance;

    it("Check platfrom balance is 2.67", async () => {
      const adminFacet = await ethers.getContractAt(
        "AdminFacet",
        diamondAddress
      );
      let bal = await adminFacet.checkPlatformBalance();
      expect(bal.platformBalanceP2 / 100).eq(2.67);
    });
    it("Check platfrom access allowed only to owner", async () => {
      const adminFacet = await ethers.getContractAt(
        "AdminFacet",
        diamondAddress
      );
      await expect(
        adminFacet.connect(signers[1]).checkPlatformBalance()
      ).revertedWith("LibDiamond: Must be contract owner");
    });
    it("Withdraw balance", async () => {
      let bal = await TokensMock.daiBalanceOf(signers[0].address);
      expect(bal).eq(0);

      const adminFacet = await ethers.getContractAt(
        "AdminFacet",
        diamondAddress
      );
      await expect(adminFacet.withdrawAllPlatformDAI()).not.to.be.reverted;
      let bal2 = await TokensMock.daiBalanceOf(signers[0].address);
      console.log(bal2);
      expect(Math.floor(bal2 / 10 ** 16) / 100).eq(2.67);
    });
  });
});
