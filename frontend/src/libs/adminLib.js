import { ethers } from "ethers";
import adminFacet from "../contracts/AdminFacet.json";
import { diamondAddress } from "../contracts/diamondAddress";
import _ from "lodash";
export const withdrawAllPlatformFunds = async ({
  getBalanceHandler,
  setError,
  setBusy,
}) => {
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const stakerContract = new ethers.Contract(
        diamondAddress,
        adminFacet.abi,
        signer
      );

      let myAddress = await signer.getAddress();
      console.log("provider signer...", myAddress);

      const txn = await stakerContract.withdrawAllPlatformFunds();
      console.log("Withdrawing money...");
      setBusy("Withdrawing platform's funds...");
      await txn.wait();
      console.log("Money with drew...done", txn.hash);
      setBusy("Updating balance...");
      getBalanceHandler();
    } else {
      console.log("Ethereum object not found, install Metamask.");
      setError("Please install a MetaMask wallet to use our bank.");
    }
  } catch (error) {
    console.log(error);
    setError(error.reason);
    setTimeout(() => {
      setError("");
    }, 3000);
  } finally {
    setBusy("");
  }
};
export const withdrawAllContractFunds = async ({
  getBalanceHandler,
  setError,
  setBusy,
}) => {
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const stakerContract = new ethers.Contract(
        diamondAddress,
        adminFacet.abi,
        signer
      );

      let myAddress = await signer.getAddress();
      console.log("provider signer...", myAddress);

      const txn = await stakerContract.withdrawAllContractFunds();
      console.log("Withdrawing money...");
      setBusy("Withdrawing contract's funds...");
      await txn.wait();
      console.log("Money with drew...done", txn.hash);
      setBusy("Updating balance...");
      getBalanceHandler();
    } else {
      console.log("Ethereum object not found, install Metamask.");
      setError("Please install a MetaMask wallet to use our bank.");
    }
  } catch (error) {
    console.log(error);
    setError(error.reason);
    setTimeout(() => {
      setError("");
    }, 3000);
  } finally {
    setBusy("");
  }
};

export const checkIsAdmin = async ({ isAdmin, setIsAdmin, setError }) => {
  if (_.get(window, "checkIsAdmin_Locked")) {
    return;
  }
  try {
    _.set(window, "checkIsAdmin_Locked", true);
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const adminContract = new ethers.Contract(
        diamondAddress,
        adminFacet.abi,
        signer
      );

      let _isAdmin = await adminContract.isContractOwner();
      if (isAdmin === _isAdmin) {
        return;
      }
      setIsAdmin(_isAdmin);
    } else {
      console.log("Ethereum object not found, install Metamask.");
      setError("Please install a MetaMask wallet to use our bank.");
    }
  } catch (error) {
    console.log(error);
  } finally {
    _.set(window, "checkIsAdmin_Locked", false);
  }
};
