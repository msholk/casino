import { ethers } from "ethers";
import { diamondAddress } from "../contracts/diamondAddress";
import playersFacet from "../contracts/PlayersFacet.json";
import stakerFacet from "../contracts/StakerFacet.json";
import adminFacet from "../contracts/AdminFacet.json";

const getStakerBalanceHandler = async (state) => {
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
      console.log("Retrieved balance...", balance);
      state.setPlayerBalance({
        playerBalance: balance.playerBalance,
        priceInStable: balance.priceInStable,
      });
    } else {
      console.log("Ethereum object not found, install Metamask.");
      state.setError("Please install a MetaMask wallet to use our bank.");
    }
  } catch (error) {
    console.log(error);
  }
};
const getPlatformBalanceHandler = async (state) => {
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const adminContaract = new ethers.Contract(
        diamondAddress,
        adminFacet.abi,
        signer
      );
      let balance = await adminContaract.checkPlatformBalance();
      console.log("Retrieved staker balance...", balance);
      state.etPlatformBalance(balance);
    } else {
      console.log("Ethereum object not found, install Metamask.");
      state.setError("Please install a MetaMask wallet to use our bank.");
    }
  } catch (error) {
    console.log(error);
  }
};
/*
{setStakerBalance,setError,setPlayerBalance,setPlatformBalance}
*/
export const checkBalances = (isAdmin, state) => {
  getStakerBalanceHandler(state);
  getPlayerBalanceHandler(state);
  if (!isAdmin) {
    return;
  }
  getPlatformBalanceHandler(state);
};
