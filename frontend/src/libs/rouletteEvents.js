import _ from "lodash";
import chalk from "chalk";

const isUniqueEvents = (ev) => {
  const key = `${ev.transactionhash}-${ev.logIndex}`;
  if (_.get(window, ["uniqueEvents", key])) {
    return false;
  }
  _.set(window, ["uniqueEvents", key], true);
  return true;
};

const listenToRouletteLaunched = async (customerAddress, state) => {
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const rouletteContract = new ethers.Contract(
        diamondAddress,
        rouletteFacet.abi,
        signer
      );
      rouletteContract.removeAllListeners();

      let filterTo = rouletteContract.filters.RouletteLaunched(customerAddress);
      // event RouletteLaunched(address indexed sender, uint256 requestId);
      rouletteContract.once(filterTo, (sender, requestId, ev) => {
        if (!isUniqueEvents(ev)) return;
        const red = (m) => {
          console.log(chalk.red(m));
        };

        red(
          `event RouletteLaunched(
               sender :${sender.toString()},
            requestId :${requestId.toString()}
            )`
        );
        // console.log(ev);
        listenToRouletteStopped(customerAddress, requestId, state);

        state.setRouletteStatus({ status: "LAUNCHED" });
      });
    } else {
      console.log("Ethereum object not found, install Metamask.");
    }
  } catch (error) {
    let message = _.get(error, "error.data.message") || _.get(error, "reason");
    if (message) {
      state.setError(message);
      console.error(message);
    } else {
      state.setError(error);
    }
    console.log(error);
    state.clearErrorWithPause();
  }
};

/*
listenToRouletteStopped(customerAddress,requestId,state)
*/
const listenToRouletteStopped = async (customerAddress, requestId, state) => {
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const rouletteContract = new ethers.Contract(
        diamondAddress,
        rouletteFacet.abi,
        signer
      );
      rouletteContract.removeAllListeners();

      let filterTo = rouletteContract.filters.RouletteStopped(
        customerAddress,
        requestId
      );
      //  event RouletteStopped(address indexed sender,uint256 indexed requestId,uint256 randomWord,uint256 resultNum);
      rouletteContract.once(
        filterTo,
        (sender, requestId, randomWord, resultNum, ev) => {
          if (!isUniqueEvents(ev)) return;

          const red = (m) => {
            console.log(chalk.red(m));
          };

          red(
            `event RouletteStopped(
                 sender :${sender.toString()},
              requestId :${requestId.toString()},
              randomWord:${randomWord.toString()},
              resultNum :${resultNum.toString()},
              )`
          );
          state.setRouletteStatus({ status: "STOPPED", randomWord, resultNum });
          console.log(ev);
        }
      );
    } else {
      console.log("Ethereum object not found, install Metamask.");
    }
  } catch (error) {
    let message = _.get(error, "error.data.message") || _.get(error, "reason");
    if (message) {
      state.setError(message);
      console.error(message);
    } else {
      state.setError(error);
    }
    console.log(error);
    state.clearErrorWithPause();
  }
};

/*
placeBet(customerAddress,{setError,clearErrorWithPause,setRouletteStatus})
*/
export const placeBet = async () => {
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const rouletteContract = new ethers.Contract(
        diamondAddress,
        rouletteFacet.abi,
        signer
      );
      await rouletteContract.placeBet(
        [
          {
            amount: 1,
            betType: 1,
            betDet: 22,
          },
        ],
        0
      );
      state.setRouletteStatus({ status: "LAUNCHING" });
      listenToRouletteLaunched(customerAddress, state);
      console.log("Bet is placed");
    } else {
      console.log("Ethereum object not found, install Metamask.");
    }
  } catch (error) {
    let message = _.get(error, "error.data.message") || _.get(error, "reason");
    if (message) {
      state.setError(message);
      console.error(message);
    } else {
      state.setError(error);
    }
    console.log(error);
    state.clearErrorWithPause();
  }
};
