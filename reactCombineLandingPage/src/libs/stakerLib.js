import { ethers } from "ethers";
import StakerFacet from "contracts/StakerFacet.json";
import vaultFacet from "contracts/VaultFacet.json";
import { diamondAddress } from "contracts/diamondAddress";
import _ from "lodash";
export const reclaimHLP = async ({
  claimAmount,
  getBalanceHandler,
  setError,
  setBusy,
  clearErrorWithPause,
}) => {
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const stakerContract = new ethers.Contract(
        diamondAddress,
        StakerFacet.abi,
        signer
      );

      let myAddress = await signer.getAddress();
      console.log("provider signer...", myAddress);

      const txn = await stakerContract.reclaimHLP(claimAmount);
      console.log("Withdrawing money...");
      setBusy("Withdrawing money...");
      await txn.wait();
      console.log("Money with drew...done", txn.hash);
      setBusy("Updating balance...");
      getBalanceHandler();
    } else {
      console.log("Ethereum object not found, install Metamask.");
      setError("Please install a MetaMask wallet to use our bank.");
    }
  } catch (error) {
    let message = _.get(error, "error.data.message") || _.get(error, "reason");
    if (message) {
      setError(message);
      console.error(message);
    } else {
      setError(error);
    }
    console.log(error);
    clearErrorWithPause();
  } finally {
    setBusy("");
  }
};
export const redeemHLP = async ({
  getBalanceHandler,
  setError,
  setBusy,
  clearErrorWithPause,
}) => {
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const vaultContract = new ethers.Contract(
        diamondAddress,
        vaultFacet.abi,
        signer
      );

      let myAddress = await signer.getAddress();
      console.log("provider signer...", myAddress);

      const txn = await vaultContract.redeemFromVault();
      console.log("Withdrawing money...");
      setBusy("Withdrawing money...");
      await txn.wait();
      console.log("Money with drew...done", txn.hash);
      setBusy("Updating balance...");
      getBalanceHandler();
    } else {
      console.log("Ethereum object not found, install Metamask.");
      setError("Please install a MetaMask wallet to use our bank.");
    }
  } catch (error) {
    let message = _.get(error, "error.data.message") || _.get(error, "reason");
    if (message) {
      setError(message);
      console.error(message);
    } else {
      setError(error);
    }
    console.log(error);
    clearErrorWithPause();
  } finally {
    setBusy("");
  }
};

export const stakeFunds = async ({
  inputValue,
  getBalanceHandler,
  setError,
  setBusy,
}) => {
  try {
    if (!_.trim(inputValue.stake_deposit).length) {
      return;
    }
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const stakerContract = new ethers.Contract(
        diamondAddress,
        StakerFacet.abi,
        signer
      );

      const txn = await stakerContract.stakeETH({
        value: ethers.utils.parseEther(inputValue.stake_deposit),
        gasLimit: 5000000,
      });
      console.log("Depositing money...");
      setBusy("Staking money...");
      await txn.wait();
      console.log("Deposited money...done", txn.hash);
      setBusy("Updating balance...");
      getBalanceHandler();
    } else {
      console.log("Ethereum object not found, install Metamask.");
      setError("Please install a MetaMask wallet to use our bank.");
    }
  } catch (error) {
    console.log(error);
    setError(error.message);
    setTimeout(() => {
      setError("");
    }, 3000);
  } finally {
    setBusy("");
  }
};
