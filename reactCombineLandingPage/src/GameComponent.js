import { useState, useEffect } from "react";
import { BigNumber, ethers } from "ethers";
import { diamondAddress } from "./contracts/diamondAddress";
import { checkBalances } from "./libs/BalanceHandlers";
import { checkIsAdmin } from "./libs/adminLib";
import _ from "lodash";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import {
  CustomerInfo,
  RouletteBlock,
  PlayerBlock,
  StakerBlock,
  BusyBlock,
  ErrorBlock,
  AdminPanel,
} from "./components/index";
let ethInitialized;
let lastAccountConnected = null;

function GameComponent() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(undefined);
  const [inputValue, setInputValue] = useState({
    withdraw: "",
    stake_deposit: "",
    bankName: "",
  });
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState("");
  const [playerBalance, setPlayerBalance] = useState({
    playerBalance: BigNumber.from("0"),
    priceInStable: BigNumber.from("0"),
  });
  const [stakerBalance, setStakerBalance] = useState({
    hlpSupply: BigNumber.from("0"),
    houseBalance: BigNumber.from("0"),
    stakerPercent: BigNumber.from("0"),
    userbalance: BigNumber.from("0"),
  });
  const [platformBalance, setPlatformBalance] = useState({
    contractBalance: BigNumber.from("0"),
    platformBalance: BigNumber.from("0"),
  });
  const [rouletteStatus, setRouletteStatus] = useState(null);

  window.ethers = ethers;
  // console.log(diamondAddress);

  const getAccounts = async (prm) => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (_.get(window, "lastAccounts") == JSON.stringify(accounts)) {
        return;
      }
      _.set(window, "lastAccounts", JSON.stringify(accounts));

      gotAccounts(accounts);
    } catch (e) {
      console.error(error);
    }
  };
  const clearErrorWithPause = () => {
    setTimeout(() => {
      setError("");
    }, 3000);
  };
  const gotAccounts = async (accounts) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();

    let testErr = "Connect your wallet to Mumbai network";
    if (chainId != 80001) {
      //if (chainId != 31337) {
      console.error("chain id", chainId);
      if (error != testErr) {
        setIsWalletConnected(false);
        setError(testErr);
      }
      return;
    } else if (error == testErr) {
      setIsWalletConnected(false);
      setError(null);
      return;
    }

    testErr = "Connect some account";
    if (!accounts.length) {
      if (error != testErr) {
        setIsWalletConnected(false);
        setError(testErr);
      }
      return;
    } else if (error == testErr) {
      setIsWalletConnected(false);
      setError(null);
      return;
    }
    if (!accounts.length) {
      setIsWalletConnected(false);
      return;
    }
    const account = accounts[0];
    setIsWalletConnected(true);
    setCustomerAddress(account);

    console.log("Account Connected: ", account);
    if (lastAccountConnected == account) {
      return;
    }
    lastAccountConnected = account;
  };
  const checkIfWalletIsConnected = async (prm) => {
    if (_.get(window, "checkIfWalletIsConnected_locked")) {
      return;
    }
    _.set(window, "checkIfWalletIsConnected_locked", true);
    try {
      if (window.ethereum) {
        if (!ethInitialized) {
          ethInitialized = true;
          window.ethereum.on("accountsChanged", gotAccounts);
          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });
        }
        await getAccounts(prm);
      } else {
        setError("Please install a MetaMask wallet to use our bank.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    } finally {
      _.set(window, "checkIfWalletIsConnected_locked", false);
    }
  };

  const handleInputChange = (event) => {
    setInputValue((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(async () => {
    const prm = { calledToBalanceHandler: false };
    await checkIfWalletIsConnected(prm);
    if (!isWalletConnected) {
      return;
    }
    if (isAdmin == undefined) {
      checkIsAdmin({ isAdmin, setIsAdmin, setError });
      return;
    }
    await getBalanceHandler();
  });

  const getBalanceHandler = () => {
    if (isAdmin == undefined) return;
    checkBalances(isAdmin, {
      stakerBalance,
      setStakerBalance,
      setError,
      playerBalance,
      setPlayerBalance,
      platformBalance,
      setPlatformBalance,
    });
  };
  return (
    <main className="main-container ">
      {/* <h2 className="h2">Casino Project 💰</h2> */}

      <section className=" customer-section">
        <ErrorBlock {...{ error }} />

        <BusyBlock {...{ busy }} />

        <StakerBlock
          {...{
            stakerBalance,
            customerAddress,
            isWalletConnected,
            inputValue,
            handleInputChange,
            getBalanceHandler,
            setError,
            clearErrorWithPause,
            setBusy,
            busy,
          }}
        />
      </section>
    </main>
  );
}
export default GameComponent;
