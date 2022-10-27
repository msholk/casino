import React from "react";
import { ethers } from "ethers";
import StakerFacet from "contracts/StakerFacet.json";
import { diamondAddress } from "contracts/diamondAddress";
import { MDBInputGroup, MDBBtn } from "mdb-react-ui-kit";
import _ from "lodash";
import { stableCoinName, nativeCoinName } from "../constants";

/*
StakerFacet: {
         'checkStakerBalance()': null,
        'stakeETH()': null,
        'withdrawAllStakerDAI()': null
    },*/
export class StakerBlock extends React.PureComponent {
  getStakerPerecent() {
    const { stakerBalance } = this.props;
    if (!_.get(stakerBalance, "stakerPercent")) return "0.00";
    return stakerBalance.stakerPercent.toString() / 10 ** 16;
  }
  getHouseBalance() {
    const { stakerBalance } = this.props;
    if (!_.get(stakerBalance, "houseBalance")) return "0.00";

    return stakerBalance.houseBalance.toString() / 10 ** 18;
  }
  getStakerBalance() {
    const { stakerBalance } = this.props;
    if (!_.get(stakerBalance, "houseBalance")) return "0.00";
    if (!_.get(stakerBalance, "stakerPercent")) return "0.00";

    return (
      stakerBalance.houseBalance.mul(stakerBalance.stakerPercent).toString() /
      10 ** 18 /
      10 ** 18
    );
  }
  render() {
    const {
      handleInputChange,
      inputValue,
      busy,
      isWalletConnected,
      stakerBalance,
    } = this.props;
    if (busy || !isWalletConnected) {
      return null;
    }
    console.log(stakerBalance);

    return (
      <>
        <div className="mt-1">
          <span className="mr-5">
            <div>
              <strong>Staker percent: {this.getStakerPerecent()} %</strong>
            </div>
            <div>
              <strong>
                House balance: {this.getHouseBalance()} {nativeCoinName}
              </strong>
            </div>
            <div>
              <strong>
                Staker balance: {this.getStakerBalance()} {nativeCoinName}
              </strong>
            </div>
          </span>
        </div>
        <section>
          <div className="bg-white border rounded-5 p-2 mw-330">
            <MDBInputGroup className="mb-3 mw-300">
              <input
                type="text"
                className="form-control"
                onChange={handleInputChange}
                name="stake_deposit"
                placeholder={"0.0000 " + nativeCoinName}
                value={inputValue.stake_deposit}
              />
              <MDBBtn
                className="moveMoneyButton"
                outline
                onClick={(e) => {
                  this.StakeEthHandler(e);
                }}
              >
                Deposit Money In {nativeCoinName}
              </MDBBtn>
            </MDBInputGroup>
          </div>
          <div className="bg-white border rounded-5 p-2 mw-330">
            <MDBBtn
              className="moveMoneyButton"
              outline
              onClick={(e) => {
                this.withdrawAllStakerFunds(e);
              }}
            >
              Withdraw All
            </MDBBtn>
          </div>
        </section>
      </>
    );
  }

  async StakeEthHandler(event) {
    const { inputValue, getStakerBalanceHandler, setError, setBusy } =
      this.props;
    try {
      event.preventDefault();
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
        getStakerBalanceHandler();
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
  }
  async withdrawAllStakerFunds(event) {
    const { getStakerBalanceHandler, setError, setBusy } = this.props;
    try {
      event.preventDefault();
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

        const txn = await stakerContract.withdrawAllStakerDAI();
        console.log("Withdrawing money...");
        setBusy("Withdrawing money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);
        setBusy("Updating balance...");
        getStakerBalanceHandler();
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
  }
}
