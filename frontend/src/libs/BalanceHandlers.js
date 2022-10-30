import { ethers } from "ethers";
import { diamondAddress } from "../contracts/diamondAddress";
import playersFacet from "../contracts/PlayersFacet.json";
import stakerFacet from "../contracts/StakerFacet.json";
import adminFacet from "../contracts/AdminFacet.json";
import _ from "lodash";

const getStakerBalanceHandler = async (state) => {
  if (window.lastStakerCheck) {
    if (new Date() - window.lastStakerCheck < 500) {
      console.log("Skipping staker", new Date() - window.lastStakerCheck);
      return;
    } else {
      console.log("Continue staker", new Date() - window.lastStakerCheck);
    }
  }
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const stakerContaract = new ethers.Contract(
        diamondAddress,
        stakerFacet.abi,
        signer
      );
      let balance = await stakerContaract.checkStakerBalance();
      console.log("Retrieved staker balance...", balance);
      if (
        _.get(state, "stakerBalance.stakerPercent") &&
        state.stakerBalance.stakerPercent.eq(balance.stakerPercent) &&
        state.stakerBalance.houseBalance.eq(balance.newHouseBalance)
      ) {
        console.log("Skipping update");
        return;
      }
      window.lastStakerCheck = new Date();
      state.setStakerBalance({
        stakerPercent: balance.stakerPercent,
        houseBalance: balance.newHouseBalance,
      });
    } else {
      console.log("Ethereum object not found, install Metamask.");
      state.setError("Please install a MetaMask wallet to use our bank.");
    }
  } catch (error) {
    console.log(error);
  }
};
const getPlayerBalanceHandler = async (state) => {
  if (window.lastPlayerCheck) {
    if (new Date() - window.lastPlayerCheck < 500) {
      console.log("Skipping player", new Date() - window.lastPlayerCheck);
      return;
    } else {
      console.log("Continue player", new Date() - window.lastPlayerCheck);
    }
  }
  // {
  //   return;
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   const signer = provider.getSigner();
  //   const diamond = new ethers.Contract(
  //     diamondAddress,
  //     DiamondLoupeFacet.abi,
  //     signer
  //   );
  //   /*  'facetAddress(bytes4)': null,
  //           'facetAddresses()': null,
  //           'facetFunctionSelectors(address)': null,
  //           'facets()': null,
  //           'supportsInterface(bytes4)': null*=*/
  //   const facets = await diamond.facets();
  //   console.log(facets);
  // }

  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const playerContract = new ethers.Contract(
        diamondAddress,
        playersFacet.abi,
        signer
      );
      let balance = await playerContract.checkPlayerBalance();
      console.log("Retrieved player balance...", balance);
      if (
        state.playerBalance &&
        state.playerBalance.playerBalance.eq(balance.playerBalance) &&
        state.playerBalance.priceInStable.eq(balance.priceInStable)
      ) {
        console.log("Skipping update");
        return;
      }
      window.lastPlayerCheck = new Date();
      state.setPlayerBalance(balance);
    } else {
      console.log("Ethereum object not found, install Metamask.");
      state.setError("Please install a MetaMask wallet to use our bank.");
    }
  } catch (error) {
    console.log(error);
  }
};
const getPlatformBalanceHandler = async (state) => {
  if (window.lastPlatformCheck) {
    if (new Date() - window.lastPlatformCheck < 500) {
      console.log("Skipping platform", new Date() - window.lastPlatformCheck);
      return;
    } else {
      console.log("Continue platform", new Date() - window.lastPlatformCheck);
    }
  }

  try {
    if (window.getPlatformBalanceHandlerLocked) {
      return;
    }
    window.getPlatformBalanceHandlerLocked = true;
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const adminContaract = new ethers.Contract(
        diamondAddress,
        adminFacet.abi,
        signer
      );
      let balance = await adminContaract.checkPlatformBalance();
      console.log("Retrieved platform balance...", balance);
      if (
        state.platformBalance &&
        state.platformBalance.contractBalance.eq(balance.contractBalance) &&
        state.platformBalance.platformBalance.eq(balance.platformBalance)
      ) {
        console.log("Skipping");
        return;
      }
      window.lastPLatformCheck = new Date();
      state.setPlatformBalance(balance);
    } else {
      console.log("Ethereum object not found, install Metamask.");
      state.setError("Please install a MetaMask wallet to use our bank.");
    }
  } catch (error) {
    console.log(error);
  } finally {
    window.getPlatformBalanceHandlerLocked = false;
  }
};
/*
{setStakerBalance,setError,setPlayerBalance,setPlatformBalance}
*/
export const checkBalances = async (isAdmin, state) => {
  await getStakerBalanceHandler(state);
  await getPlayerBalanceHandler(state);

  if (!isAdmin) {
    return;
  }
  await getPlatformBalanceHandler(state);
};
