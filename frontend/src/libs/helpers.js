const resetRoulette = async () => {
  try {
    if (window.ethereum) {
      const signer = provider.getSigner();
      const rouletteContract = new ethers.Contract(
        diamondAddress,
        rouletteFacet.abi,
        signer
      );
      await rouletteContract.resetRoulette();
      console.log("resetRoulette()");
    } else {
      console.log("Ethereum object not found, install Metamask.");
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
  }
};
const setRouletteContract = () => {
  try {
    if (window.ethereum) {
      const signer = provider.getSigner();
      window.rouletteContract = new ethers.Contract(
        diamondAddress,
        rouletteFacet.abi,
        signer
      );
      window.BigNumber = ethers.BigNumber;
    } else {
      console.log("Ethereum object not found, install Metamask.");
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
  }
};
window.setRouletteContract = setRouletteContract;
