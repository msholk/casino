import React from "react";
import { ethers } from "ethers";
import PlayersFacet from "contracts/PlayersFacet.json";
import { diamondAddress } from "contracts/diamondAddress";
import { MDBInputGroup, MDBBtn } from "mdb-react-ui-kit";
import _ from "lodash";
import { stableCoinName, nativeCoinName } from "../constants";
/*
PlayersFacet: {
        'checkPlayerBalance()': null,
        'depositToCashier()': null,
        'rawFulfillRandomWords(uint256,uint256[])': null,
        'setVrfInfo((uint64,address,bytes32))': null,
        'withdrawDAI()': null
    },*/
export class PlayerBlock extends React.PureComponent {
  getPLayerBalance() {
    const { playerBalance } = this.props;
    if (!_.get(playerBalance, "playerBalance")) return "0.00";
    return (playerBalance.playerBalance.toString() * 1) / 10 ** 18;
  }
  getPLayerChips() {
    const { playerBalance } = this.props;
    if (!_.get(playerBalance, "playerBalance")) return "0.00";
    return Math.floor(
      ((playerBalance.playerBalance.toString() * 1) / 10 ** 18) * 1000
    );
  }
  getPriceInStable() {
    const { playerBalance } = this.props;
    if (!_.get(playerBalance, "priceInStable")) return "0.00";
    return playerBalance.priceInStable.toString() / 10 ** 8;
  }
  render() {
    const {
      handleInputChange,
      inputValue,
      busy,
      isWalletConnected,
      playerBalance,
    } = this.props;
    if (busy || !isWalletConnected) {
      return null;
    }
    console.log(playerBalance);

    return (
      <>
        <div className="mt-1">
          <div>
            <span className="mr-5">
              <strong>
                Player balance: {this.getPLayerBalance()} {nativeCoinName}
              </strong>
            </span>
          </div>
          <span className="mr-5">
            <strong>Player chips: {this.getPLayerChips()} Chips</strong>
          </span>
          <div className="fs11">
            1 MATIC={this.getPriceInStable()} {stableCoinName}
          </div>
        </div>
        <section>
          <div className="bg-white border rounded-5 p-2 mw-330">
            <MDBInputGroup className="mb-3 mw-300">
              <input
                type="text"
                className="form-control"
                onChange={handleInputChange}
                name="player_deposit"
                placeholder={"0.0000 " + nativeCoinName}
                value={inputValue.player_deposit}
              />
              <MDBBtn
                className="moveMoneyButton"
                outline
                onClick={(e) => {
                  this.playerDepositsFunds(e);
                }}
              >
                Deposit funds In {nativeCoinName}
              </MDBBtn>
            </MDBInputGroup>
          </div>
          <div className="bg-white border rounded-5 p-2 mw-330">
            <MDBBtn
              className="moveMoneyButton"
              outline
              onClick={(e) => {
                this.withdrawAllPlayersFunds(e);
              }}
            >
              Withdraw All
            </MDBBtn>
          </div>
        </section>
      </>
    );
  }

  async playerDepositsFunds(event) {
    const {
      inputValue,
      getBalanceHandler,
      setError,
      setBusy,
      clearErrorWithPause,
    } = this.props;
    try {
      if (!_.trim(inputValue.player_deposit).length) {
        return;
      }
      event.preventDefault();
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
    } finally {
      setBusy("");
    }
  }
  async withdrawAllPlayersFunds(event) {
    const { getBalanceHandler, setError, setBusy, clearErrorWithPause } =
      this.props;
    try {
      event.preventDefault();
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
    } finally {
      setBusy("");
    }
  }
}
