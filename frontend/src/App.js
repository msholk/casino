import { useState, useEffect } from "react";
import { ethers } from "ethers";
import chalk from "chalk";
import playersFacet from "./contracts/PlayersFacet.json";
import stakerFacet from "./contracts/StakerFacet.json";
import adminFacet from "./contracts/AdminFacet.json";
import rouletteFacet from "./contracts/RouletteFacet.json";
import _ from "lodash";
import { diamondAddress } from "./contracts/diamondAddress";

import {
  CustomerInfo,
  PlayerBlock,
  StakerBlock,
  BusyBlock,
  ErrorBlock,
  AdminPanel,
} from "./components";
let ethInitialized;
let lastAccountConnected = null;
const processedEvents = {};

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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

  window.ethers = ethers;
  console.log(diamondAddress);

  window.resetAll = async () => {
    setRouletteContract();
    await window.rouletteContract.restAll();
  };

  const getcAccounts = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

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
    getPlayerBalanceHandler();
    getStakerBalanceHandler();
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
        getcAccounts();
      } else {
        setError("Please install a MetaMask wallet to use our bank.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIsAdminHandler = async () => {
    try {
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
    }
  };

  const getStakerBalanceHandler = async () => {
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
        setStakerBalance({
          stakerPercent: balance.stakerPercent,
          houseBalance: balance.newHouseBalance,
        });
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getPlayerBalanceHandler = async () => {
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
        setPlayerBalance({
          playerBalance: balance.playerBalance,
          priceInStable: balance.priceInStable,
        });
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getPlatformBalanceHandler = async () => {
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
        setPlatformBalance(balance);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
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
    checkIsAdminHandler();
  });

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
        <PlayerBlock
          {...{
            playerBalance,
            isWalletConnected,
            inputValue,
            handleInputChange,
            getPlayerBalanceHandler,
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
            getStakerBalanceHandler,
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
          getPlatformBalanceHandler,
          clearErrorWithPause,
          setError,
          setBusy,
        }}
      />
    </main>
  );
}
export default App;
