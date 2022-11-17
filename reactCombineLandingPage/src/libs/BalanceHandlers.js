import { ethers } from "ethers";
import { diamondAddress } from "../contracts/diamondAddress";
import playersFacet from "../contracts/PlayersFacet.json";
import stakerFacet from "../contracts/StakerFacet.json";
import adminFacet from "../contracts/AdminFacet.json";
import vaultFacet from "../contracts/VaultFacet.json";
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
      const vaultContaract = new ethers.Contract(
        diamondAddress,
        vaultFacet.abi,
        signer
      );
      const playerContract = new ethers.Contract(
        diamondAddress,
        playersFacet.abi,
        signer
      );
      const adminContaract = new ethers.Contract(
        diamondAddress,
        adminFacet.abi,
        signer
      );
      let platformBalance = await adminContaract.checkPlatformBalance();
      let playerBalance = await playerContract.checkPlayerBalance();
      let balance = await stakerContaract.checkStakerBalance();
      let vaultBalance = await vaultContaract.getVaultState();
      console.log("Retrieved staker balance...", balance);
      if (
        _.get(state, "stakerBalance.stakerPercent") &&
        state.stakerBalance.stakerPercent.eq(balance.stakerPercent) &&
        state.stakerBalance.houseBalance.eq(balance.houseBalance)
      ) {
        console.log("Skipping update");
        return;
      }
      window.lastStakerCheck = new Date();
      state.setPlatformBalance(platformBalance);
      state.setPlayerBalance(playerBalance);
      state.setStakerBalance({
        hlpSupply: balance.hlpSupply,
        houseBalance: balance.houseBalance,
        stakerPercent: balance.stakerPercent,
        userbalance: balance.userbalance,
        vault: {
          totalReclaimed: vaultBalance.totalReclaimed,
          totalLeft2Redeem: vaultBalance.totalLeft2Redeem,
          totalReady2Redeem: vaultBalance.totalReady2Redeem,
        },
      });
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
export const checkBalances = async (isAdmin, state) => {
  await getStakerBalanceHandler(state);
};
