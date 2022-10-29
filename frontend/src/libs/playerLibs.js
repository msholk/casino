import { ethers } from "ethers";
import PlayersFacet from "contracts/PlayersFacet.json";
import { diamondAddress } from "contracts/diamondAddress";
import _ from "lodash";

export const playerDepositsFunds = async ({
  inputValue,
  getBalanceHandler,
  setError,
  setBusy,
  clearErrorWithPause,
}) => {
  try {
    if (!_.trim(inputValue.player_deposit).length) {
      return;
    }
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const playerContract = new ethers.Contract(
        diamondAddress,
        PlayersFacet.abi,
        signer
      );

      const txn = await playerContract.depositToCashier({
        value: ethers.utils.parseEther(inputValue.player_deposit),
        gasLimit: 5000000,
      });
      console.log("Depositing money...");
      setBusy("Depositing money...");
      await txn.wait();
      console.log("Deposited money...done", txn.hash);
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
export const withdrawAllPlayersFunds = async ({
  getBalanceHandler,
  setError,
  setBusy,
  clearErrorWithPause,
}) => {
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const playerContract = new ethers.Contract(
        diamondAddress,
        PlayersFacet.abi,
        signer
      );

      let myAddress = await signer.getAddress();
      console.log("provider signer...", myAddress);

      const txn = await playerContract.withdrawPlayerBalance();
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
