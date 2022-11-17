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

  getVaultBlock() {
    if (!_.get(this, "props.stakerBalance.vault")) return null;
    const { stakerBalance } = this.props;
    const { totalReclaimed, totalLeft2Redeem, totalReady2Redeem } =
      stakerBalance.vault;

    return (
      <table className="  border-1 border-gray-500 font-light w-1/2 m-2">
        <tr className="border-t border-gray-500 flex justify-between w-full  py-2 px-4">
          <div> Vault state</div>
        </tr>
        <tr className="border-t border-gray-500 flex justify-between w-full  py-2 px-4">
          <div> Total reclaimed: </div>
          <div className="text-gray-400">
            {totalReclaimed.toString() / 10 ** 18}
          </div>
        </tr>
        <tr className="border-t border-gray-500 flex justify-between w-full  py-2 px-4">
          <div> Delayed to redeem: </div>
          <div className="text-gray-400">
            {" "}
            {totalLeft2Redeem.toString() / 10 ** 18}{" "}
          </div>
        </tr>
        <tr className="border-t border-gray-500 flex justify-between w-full  py-2 px-4">
          <div> Ready to redeem: </div>
          <div className="text-gray-400">
            {" "}
            {totalReady2Redeem.toString() / 10 ** 18}{" "}
          </div>
        </tr>
        <tr className="border-t border-gray-500 flex justify-between w-full   py-2 px-4">
          <div>
            <input
              type="submit"
              disabled={totalReady2Redeem.toString() == "0"}
              className="moveMoneyButton bg-[#5EA0A0] mt-4 focus:outline-none px-4 py-2 ml-8 font-bold"
              autoComplete="off"
              value="Redeem funds"
              onClick={(e) => {
                this.redeemFundsHandler(e);
              }}
            />
          </div>
        </tr>
      </table>
    );
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

    document.getElementsByTagName("body")[0].style.backgroundColor = "#4C5265";

    return (
      <>
        <style>body {}</style>
        <div className="font-Inconsolata text-white w-full py-2 bg-[#4C5265]">
          <div className="w-full text-center text-4xl font-bold p-10">
            Provide us with liquidity and start earning!
          </div>

          <div className="w-full flex justify-center">
            <table className="border-1 border-gray-500 font-light w-1/4 mx-2">
              <tr className="flex justify-between w-full text-2xl py-2 px-4">
                <div> Wallet: </div>
                <div className="text-gray-400"> {customerAddress} </div>
              </tr>
            </table>
          </div>
          <div className="w-full flex justify-center">
            <table className="border-1 border-gray-500 font-light w-1/4 mx-2">
              <tr className="flex justify-between w-full  py-2 px-4">
                <div> House balance: </div>
                <div className="text-gray-400">
                  {" "}
                  {this.getHouseBalance()} MATIC{" "}
                </div>
              </tr>
              <tr className="border-t border-gray-500 flex justify-between w-full  py-2 px-4">
                <div> HLP supply: </div>
                <div className="text-gray-400"> {this.getSupply()} HLP </div>
              </tr>
              <tr className="border-t border-gray-500 flex justify-between w-full  py-2 px-4">
                <div> Estimaded APR: </div>
                <div className="text-gray-400"> 22 % </div>
              </tr>
            </table>

            <table className="border-1 border-gray-500 font-light w-1/4 mx-2">
              <tr className="border-t border-gray-500 flex justify-between w-full  py-2 px-4">
                <div> Staker percent: </div>
                <div className="text-gray-400">
                  {" "}
                  {this.getStakerPercent()} %
                </div>
              </tr>
              <tr className="border-t border-gray-500 flex justify-between w-full  py-2 px-4">
                <div> Staker balance: </div>
                <div className="text-gray-400"> {this.getStakerBalance()} </div>
              </tr>
            </table>
          </div>
          <div className="w-full flex justify-center">
            {this.getVaultBlock()}
          </div>

          <section className="font-Inconsolata text-white  flex justify-center items-center mt-8">
            <div>Amount in MATIC:</div>
            <input
              type="text"
              className="w-[10%] bg-transparent border-b ml-4 border-gray-500 focus:outline-none px-4"
              onChange={handleInputChange}
              name="stake_deposit"
              autoComplete="off"
              value={inputValue.stake_deposit}
            />
            <div className="flex flex-col">
              <input
                type="submit"
                className="bg-[#5EA0A0] focus:outline-none px-4 py-2 ml-8 font-bold"
                autoComplete="off"
                value="Deposit funds"
                onClick={(e) => {
                  this.StakeEthHandler(e);
                }}
              />
              <input
                type="submit"
                className="moveMoneyButton bg-[#5EA0A0] mt-4 focus:outline-none px-4 py-2 ml-8 font-bold"
                autoComplete="off"
                value="Reclaim funds"
                onClick={(e) => {
                  this.reclaimFundsHandler(e);
                }}
              />
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
  async reclaimFundsHandler(event) {
    event.preventDefault();

    const {
      inputValue,
      getBalanceHandler,
      setError,
      setBusy,
      clearErrorWithPause,
    } = this.props;
    if (!_.trim(inputValue.stake_deposit)) {
      alert("Amount is empty");
      return;
    }
    console.log(inputValue.stake_deposit);
    debugger;
    const st = {
      claimAmount: inputValue.stake_deposit,
      getBalanceHandler,
      setError,
      setBusy,
      clearErrorWithPause,
    };
    reclaimHLP(st);
  }
}
