import React from "react";

import { MDBInputGroup, MDBBtn } from "mdb-react-ui-kit";
import _ from "lodash";
import { nativeCoinName } from "../constants";
import { withdrawAllStakerFunds, stakeFunds } from "../libs/stakerLib";
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
                this.withdrawAllStakerFundsHandler(e);
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
    const { inputValue, getBalanceHandler, setError, setBusy } = this.props;
    event.preventDefault();
    stakeFunds({ inputValue, getBalanceHandler, setError, setBusy });
  }
  async withdrawAllStakerFundsHandler(event) {
    event.preventDefault();

    const { getBalanceHandler, setError, setBusy, clearErrorWithPause } =
      this.props;
    const st = { getBalanceHandler, setError, setBusy, clearErrorWithPause };
    withdrawAllStakerFunds(st);
  }
}
