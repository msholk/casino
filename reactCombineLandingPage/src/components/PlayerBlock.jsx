import React from "react";
import { MDBInputGroup, MDBBtn } from "mdb-react-ui-kit";
import _ from "lodash";
import { stableCoinName, nativeCoinName } from "../constants";
import {
  playerDepositsFunds,
  withdrawAllPlayersFunds,
} from "../libs/playerLibs";
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
    // console.log(playerBalance);

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
                  this.playerDepositsFundsHandler(e);
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
                this.withdrawAllPlayersFundsHandler(e);
              }}
            >
              Withdraw All
            </MDBBtn>
          </div>
        </section>
      </>
    );
  }

  async playerDepositsFundsHandler(event) {
    const {
      inputValue,
      getBalanceHandler,
      setError,
      setBusy,
      clearErrorWithPause,
    } = this.props;
    event.preventDefault();
    playerDepositsFunds({
      inputValue,
      getBalanceHandler,
      setError,
      setBusy,
      clearErrorWithPause,
    });
  }
  async withdrawAllPlayersFundsHandler(event) {
    const { getBalanceHandler, setError, setBusy, clearErrorWithPause } =
      this.props;
    event.preventDefault();
    withdrawAllPlayersFunds({
      getBalanceHandler,
      setError,
      setBusy,
      clearErrorWithPause,
    });
  }
}
