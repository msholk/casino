import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { diamondAddress } from "./contracts/diamondAddress";
import { checkBalances } from "./libs/BalanceHandlers";
import { checkIsAdmin } from "./libs/adminLib";
import _ from "lodash";
import {
  CustomerInfo,
  RouletteBlock,
  PlayerBlock,
  StakerBlock,
  BusyBlock,
  ErrorBlock,
  AdminPanel,
} from "./components";
let ethInitialized;
let lastAccountConnected = null;

function App() {
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
  const [playerBalance, setPlayerBalance] = useState([0, 0]);
  const [stakerBalance, setStakerBalance] = useState([0, 0]);
  const [platformBalance, setPlatformBalance] = useState(null);
  const [rouletteStatus, setRouletteStatus] = useState(null);

  window.ethers = ethers;
  console.log(diamondAddress);

  const getAccounts = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (_.get(window, "lastAccounts") == JSON.stringify(accounts)) {
        return;
      }
      _.set(window, "lastAccounts", JSON.stringify(accounts));

      gotAccounts(accounts);
      checkIsAdmin({ isAdmin, setIsAdmin, setError });
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
    if (isAdmin == undefined) return;
    checkBalances(isAdmin, {
      setStakerBalance,
      setError,
      setPlayerBalance,
      setPlatformBalance,
    });
  };
  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        if (!ethInitialized) {
          ethInitialized = true;
          window.ethereum.on("accountsChanged", gotAccounts);
          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });
        }
        getAccounts();
      } else {
        setError("Please install a MetaMask wallet to use our bank.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (event) => {
    setInputValue((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getBalanceHandler();
  });

  const getBalanceHandler = () => {
    if (isAdmin == undefined) return;
    checkBalances(isAdmin, {
      setStakerBalance,
      setError,
      setPlayerBalance,
      setPlatformBalance,
    });
  };
  return (
    <main className="main-container">
      <h2 className="h2">Casino Project 💰</h2>

      <section className="customer-section px-10 pt-5 pb-10">
        <ErrorBlock {...{ error }} />

        <CustomerInfo
          {...{
            isWalletConnected,
            customerAddress,
          }}
        />
        <BusyBlock {...{ busy }} />
        <hr></hr>
        <RouletteBlock
          {...{
            customerAddress,
            setError,
            clearErrorWithPause,
            setRouletteStatus,
            rouletteStatus,
            busy,
            isWalletConnected,
            getBalanceHandler,
          }}
        />
        <hr></hr>
        <PlayerBlock
          {...{
            playerBalance,
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
        <hr></hr>
        <StakerBlock
          {...{
            stakerBalance,
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
      <AdminPanel
        {...{
          busy,
          isWalletConnected,
          isAdmin,
          platformBalance,
          getBalanceHandler,
          clearErrorWithPause,
          setError,
          setBusy,
        }}
      />
    </main>
  );
}
export default App;
