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
  const [platformBalance, setPlatformBalance] = useState([0, 0]);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  window.ethers = ethers;
  console.log(diamondAddress);

  provider.getBlockNumber().then((latestBlock) => {
    if (processedEvents.providerIsConnected) {
      return;
    }
    processedEvents.providerIsConnected = true;

    provider
      .getLogs({
        fromBlock: latestBlock - 500,
        address: diamondAddress,
        // topics: [ethers.utils.id("RouletteLaunched(uint256)")],
      })
      .then((result) => {
        const red = (m) => {
          console.log(chalk.red(m));
        };
        // console.log(result);
        _.forEach(result, (res) => {
          // event RouletteStoppedVRFCallReceived();
          // event RouletteStoppedRequestIdRecognized(bool);
          // event RouletteLaunchOfPlayerFound(bool);
          // event RouletteStopped(uint256 requestId, uint256 randomWord, uint256 resultNum)
          if (res.topics[0] == ethers.utils.id("RouletteLaunched(uint256)")) {
            let abi = ["event RouletteLaunched(uint256 requestId)"];
            let iface = new ethers.utils.Interface(abi);
            const parsedEv = iface.parseLog(res);
            red(
              `event RouletteLaunched(requestId:${parsedEv.args.requestId.toString()})`
            );
          } else if (
            res.topics[0] == ethers.utils.id("RouletteStoppedVRFCallReceived()")
          ) {
            let abi = ["event RouletteStoppedVRFCallReceived()"];
            let iface = new ethers.utils.Interface(abi);
            const parsedEv = iface.parseLog(res);
            red(`event RouletteStoppedVRFCallReceived()`);
          } else if (
            res.topics[0] ==
            ethers.utils.id("RouletteStoppedRequestIdRecognized(bool)")
          ) {
            let abi = ["event RouletteStoppedRequestIdRecognized(bool)"];
            let iface = new ethers.utils.Interface(abi);
            const parsedEv = iface.parseLog(res);
            red(
              `event RouletteStoppedRequestIdRecognized(${parsedEv.args[0].toString()})`
            );
          } else if (
            res.topics[0] ==
            ethers.utils.id("RouletteStopped(uint256,uint256,uint256)")
          ) {
            let abi = [
              "event RouletteStopped(uint256 requestId, uint256 randomWord, uint256 resultNum)",
            ];
            let iface = new ethers.utils.Interface(abi);
            const parsedEv = iface.parseLog(res);
            red(
              `event RouletteStopped(
                requestId :${parsedEv.args.requestId.toString()},
                randomWord:${parsedEv.args.randomWord.toString()},
                resultNum :${parsedEv.args.resultNum.toString()})`
            );
          } else if (
            res.topics[0] ==
            ethers.utils.id("RouletteLaunchOfPlayerFound(bool)")
          ) {
            let abi = ["event RouletteLaunchOfPlayerFound(bool)"];
            let iface = new ethers.utils.Interface(abi);
            const parsedEv = iface.parseLog(res);
            console.log(
              `event RouletteLaunchOfPlayerFound(${parsedEv.args[0].toString()})`
            );
          } else {
            console.log(res);
          }
        });
      });

    console.log("latestBlock", latestBlock);
    listenRouletteLaunched(latestBlock);
    // listenRouletteStopped(latestBlock);
  });

  function listenRouletteLaunched(latestBlock) {
    const filter = {
      address: diamondAddress,
      fromBlock: latestBlock,
      topics: [ethers.utils.id("RouletteLaunched(uint256)")],
    };
    let abi = ["event RouletteLaunched(uint256 requestId)"];
    let iface = new ethers.utils.Interface(abi);

    provider.on(filter, (ev) => {
      if (processedEvents[ev.logIndex]) {
        console.log("Skipping event", ev.logIndex);
        return;
      }
      processedEvents[ev.logIndex] = true;
      const parsedEv = iface.parseLog(ev);
      console.log(
        ev.logIndex,
        `event RouletteLaunched(${parsedEv.args.requestId.toString()})`
      );
    });
  }
  function listenRouletteStopped(latestBlock) {
    const filter = {
      address: diamondAddress,
      fromBlock: latestBlock,
      topics: [ethers.utils.id("RouletteStoppedVRFCallReceived()")],
    };
    let abi = ["RouletteStoppedVRFCallReceived()"];
    let iface = new ethers.utils.Interface(abi);

    provider.on(filter, (ev) => {
      if (processedEvents[ev.logIndex]) {
        console.log("Skipping event", ev.logIndex);
        return;
      }
      processedEvents[ev.logIndex] = true;
      const parsedEv = iface.parseLog(ev);
      // console.log("Events", ev, parsedEv.args.requestId.toString());
      console.log(parsedEv);
    });
  }

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
        setPlatformBalance({
          platformBalance: balance.platformBalance,
        });
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const resetRoulette = async () => {
    try {
      if (window.ethereum) {
        const signer = provider.getSigner();
        const rouletteContaract = new ethers.Contract(
          diamondAddress,
          rouletteFacet.abi,
          signer
        );
        await rouletteContaract.resetRoulette();
        console.log("resetRoulette()");
      } else {
        console.log("Ethereum object not found, install Metamask.");
      }
    } catch (error) {
      let message =
        _.get(error, "error.data.message") || _.get(error, "reason");
      if (message) {
        setError(message);
        console.error(message);
      } else {
        setError(error);
      }
      console.log(error);
      clearErrorWithPause();
    }
  };
  const setRouletteContract = () => {
    try {
      if (window.ethereum) {
        const signer = provider.getSigner();
        window.rouletteContaract = new ethers.Contract(
          diamondAddress,
          rouletteFacet.abi,
          signer
        );
        window.BigNumber = ethers.BigNumber;
      } else {
        console.log("Ethereum object not found, install Metamask.");
      }
    } catch (error) {
      let message =
        _.get(error, "error.data.message") || _.get(error, "reason");
      if (message) {
        setError(message);
        console.error(message);
      } else {
        setError(error);
      }
      console.log(error);
      clearErrorWithPause();
    }
  };
  window.setRouletteContract = setRouletteContract;
  const placeBet = async () => {
    try {
      if (window.ethereum) {
        const signer = provider.getSigner();
        const rouletteContaract = new ethers.Contract(
          diamondAddress,
          rouletteFacet.abi,
          signer
        );
        await rouletteContaract.placeBet([
          {
            amount: 1,
            betType: 1,
            betDet: 22,
          },
        ]);
        console.log("Bet is placed");
      } else {
        console.log("Ethereum object not found, install Metamask.");
      }
    } catch (error) {
      let message =
        _.get(error, "error.data.message") || _.get(error, "reason");
      if (message) {
        setError(message);
        console.error(message);
      } else {
        setError(error);
      }
      console.log(error);
      clearErrorWithPause();
    }
  };
  const checkBet = async () => {
    try {
      if (window.ethereum) {
        const signer = provider.getSigner();
        const rouletteContaract = new ethers.Contract(
          diamondAddress,
          rouletteFacet.abi,
          signer
        );
        await rouletteContaract.placeBet([
          {
            amount: 100,
            betType: 1,
            betDet: 22,
          },
        ]);
        console.log("Bet is placed");
      } else {
        console.log("Ethereum object not found, install Metamask.");
      }
    } catch (error) {
      let message =
        _.get(error, "error.data.message") || _.get(error, "reason");
      if (message) {
        setError(message);
        console.error(message);
      } else {
        setError(error);
      }
      console.log(error);
      clearErrorWithPause();
    }
  };
  window.placeBet = placeBet;
  window.resetRoulette = resetRoulette;
  window.checkEv = async () => {
    try {
      if (window.ethereum) {
        const signer = provider.getSigner();
        const rouletteContract = new ethers.Contract(
          diamondAddress,
          rouletteFacet.abi,
          signer
        );
        await rouletteContract.test1();
        console.log("Bet is placed");
      } else {
        console.log("Ethereum object not found, install Metamask.");
      }
    } catch (error) {
      let message =
        _.get(error, "error.data.message") || _.get(error, "reason");
      if (message) {
        setError(message);
        console.error(message);
      } else {
        setError(error);
      }
      console.log(error);
      clearErrorWithPause();
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
          setError,
          setBusy,
        }}
      />
    </main>
  );
}
export default App;
