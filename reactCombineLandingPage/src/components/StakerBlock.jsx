import React from "react";
import { MDBInputGroup, MDBBtn } from "mdb-react-ui-kit";
import _ from "lodash";
import { nativeCoinName } from "../constants";
import { reclaimHLP, stakeFunds } from "../libs/stakerLib";
/*
StakerFacet: {
         'checkStakerBalance()': null,
        'stakeETH()': null,
        'withdrawAllStakerDAI()': null
    },*/
export class StakerBlock extends React.PureComponent {
  getSupply() {
    const { stakerBalance } = this.props;
    if (!_.get(stakerBalance, "hlpSupply")) return "0.00";
    return stakerBalance.hlpSupply.toString() / 10 ** 18;
  }
  getHouseBalance() {
    const { stakerBalance } = this.props;
    if (!_.get(stakerBalance, "houseBalance")) return "0.00";
    return stakerBalance.houseBalance.toString() / 10 ** 18;
  }
  getAddress() {
    const { stakerBalance } = this.props;
    if (!_.get(stakerBalance, "houseBalance")) return "0.00";
    return stakerBalance.houseBalance.toString() / 10 ** 18;
  }
  getStakerPercent() {
    const { stakerBalance } = this.props;
    if (!_.get(stakerBalance, "stakerPercent")) return "0.00";
    return stakerBalance.stakerPercent.toString() / 10 ** 16;
  }
  getStakerBalance() {
    const { stakerBalance } = this.props;
    if (!_.get(stakerBalance, "userbalance")) return "0.00";
    return stakerBalance.userbalance.toString() / 10 ** 18;
  }
  render() {
    const {
      handleInputChange,
      inputValue,
      busy,
      isWalletConnected,
      stakerBalance,
      customerAddress,
    } = this.props;
    if (busy || !isWalletConnected) {
      return null;
    }
    // console.log(stakerBalance);

    return (
      <>
        <div>address: {customerAddress}!!!</div>
        <div className="font-Inconsolata text-white w-full h-screen bg-[#4C5265]">
          <div className="w-full text-center text-4xl font-bold p-10">
            Provide us with liquidity and start earning!
          </div>

          <div className="w-full flex justify-center">
            <table className="border-1 border-gray-500 font-light w-1/4 mx-2">
              <tr className="flex justify-between w-full text-2xl py-2 px-4">
                <div> House balance: </div>
                <div className="text-gray-400">
                  {" "}
                  {this.getHouseBalance()} MATIC{" "}
                </div>
              </tr>
              <tr className="border-t border-gray-500 flex justify-between w-full text-2xl py-2 px-4">
                <div> HLP supply: </div>
                <div className="text-gray-400"> {this.getSupply()} HLP </div>
              </tr>
              <tr className="border-t border-gray-500 flex justify-between w-full text-2xl py-2 px-4">
                <div> Estimaded APR: </div>
                <div className="text-gray-400"> 22 % </div>
              </tr>
            </table>

            <table className="border-1 border-gray-500 font-light w-1/4 mx-2">
              <tr className="flex justify-between w-full text-2xl py-2 px-4">
                <div> Wallet: </div>
                <div className="text-gray-400">
                  {" "}
                  {this.getHouseBalance()} MATIC{" "}
                </div>
              </tr>
              <tr className="border-t border-gray-500 flex justify-between w-full text-2xl py-2 px-4">
                <div> HLP supply: </div>
                <div className="text-gray-400"> {this.getSupply()} HLP </div>
              </tr>
              <tr className="border-t border-gray-500 flex justify-between w-full text-2xl py-2 px-4">
                <div> Estimaded APR: </div>
                <div className="text-gray-400"> 22 % </div>
              </tr>
            </table>
          </div>
          <div>
            <span className="">
              <div>
                <strong>House balance: {this.getHouseBalance()} MATIC</strong>
              </div>
              <div>
                <strong>Staker percent: {this.getStakerPercent()} %</strong>
              </div>
              <div>
                <strong>Supply: {this.getSupply()} HLP </strong>
              </div>
              <div>
                <strong>Staker balance: {this.getStakerBalance()} HLP</strong>
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
                  this.withdrawAllStakerFundsHandler(e);
                }}
              >
                Withdraw All
              </MDBBtn>
            </div>
          </section>
        </div>
      </>
    );
  }

  async StakeEthHandler(event) {
    const { inputValue, getBalanceHandler, setError, setBusy } = this.props;
    event.preventDefault();
    stakeFunds({ inputValue, getBalanceHandler, setError, setBusy });
  }
  async withdrawAllStakerFundsHandler(event) {
    event.preventDefault();

    const {
      inputValue,
      getBalanceHandler,
      setError,
      setBusy,
      clearErrorWithPause,
    } = this.props;
    const st = {
      cliamAmount: inputValue.stake_deposit,
      getBalanceHandler,
      setError,
      setBusy,
      clearErrorWithPause,
    };
    reclaimHLP(st);
  }
}
