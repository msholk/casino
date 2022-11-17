import React from "react";
import { MDBInputGroup, MDBBtn } from "mdb-react-ui-kit";
import _ from "lodash";
import { nativeCoinName } from "../constants";
import { reclaimHLP, stakeFunds, redeemHLP } from "../libs/stakerLib";
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
  getVault() {
    const { stakerBalance } = this.props;
    if (!_.get(stakerBalance, "vault")) return null;
    const { totalReclaimed, totalLeft2Redeem, totalReady2Redeem } =
      stakerBalance.vault;

    return (
      <span className="mr-5">
        <div>
          <strong>Vault Info</strong>
        </div>
        <div>
          <strong>
            Total reclaimed: {totalReclaimed.toString() / 10 ** 18}
          </strong>
        </div>
        <div>
          <strong>
            Left to redeem: {totalLeft2Redeem.toString() / 10 ** 18}{" "}
          </strong>
        </div>
        <div>
          <strong>
            Ready to redeem: {totalReady2Redeem.toString() / 10 ** 18}
          </strong>
        </div>
      </span>
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
    // console.log(stakerBalance);

    return (
      <>
        <div className="mt-1">
          <span className="mr-5">
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

          <div>{this.getVault()}</div>
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
                this.reclaimFundsHandler(e);
              }}
            >
              Reclaim:Move to Vault
            </MDBBtn>
            <MDBBtn
              className="moveMoneyButton"
              outline
              onClick={(e) => {
                this.redeemFundsHandler(e);
              }}
            >
              Redeem: transfer from Vault to Wallet
            </MDBBtn>
          </div>
        </section>
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
    const st = {
      cliamAmount: inputValue.stake_deposit,
      getBalanceHandler,
      setError,
      setBusy,
      clearErrorWithPause,
    };
    reclaimHLP(st);
  }
  async redeemFundsHandler(event) {
    event.preventDefault();

    const {
      inputValue,
      getBalanceHandler,
      setError,
      setBusy,
      clearErrorWithPause,
    } = this.props;
    const st = {
      getBalanceHandler,
      setError,
      setBusy,
      clearErrorWithPause,
    };
    redeemHLP(st);
  }
}
