import React from "react";
import { MDBInputGroup, MDBBtn } from "mdb-react-ui-kit";
import _ from "lodash";
import { placeBet } from "../libs/rouletteEvents";
import spinning from "../assets/roulette.gif";
import waiting from "../assets/waiting.gif";
/*
StakerFacet: {
         'checkStakerBalance()': null,
        'stakeETH()': null,
        'withdrawAllStakerDAI()': null
    },*/
export class RouletteBlock extends React.PureComponent {
  render() {
    const { rouletteStatus, busy, isWalletConnected } = this.props;
    if (busy || !isWalletConnected) {
      return null;
    }

    const status = _.get(rouletteStatus, "status");
    if (status == "LAUNCHED") {
      return (
        <div className="mt-1">
          <span className="mr-5">
            <div>
              <strong>Roulette is launched, waiting for result</strong>
            </div>
          </span>
          <div>
            <img src={spinning}></img>
          </div>
        </div>
      );
    }
    if (status == "LAUNCHING") {
      return (
        <div className="mt-1">
          <span className="mr-5">
            <div>
              <strong>Roulette is launching, please wait...</strong>
            </div>
          </span>
          <div>
            <img src={waiting}></img>
          </div>
        </div>
      );
    }
    let resultBlock;
    if (status == "STOPPED") {
      resultBlock = (
        <>
          <div className="mt-1">
            <span className="mr-5">
              <div>
                <strong>
                  Random number:{" "}
                  <span className="fs11">
                    {rouletteStatus.randomWord.toString()}
                  </span>
                </strong>
              </div>
            </span>
          </div>
          <div className="mt-1">
            <span className="mr-5">
              <div>
                <strong>
                  Win number: {rouletteStatus.resultNum.toString()}
                </strong>
              </div>
            </span>
          </div>
        </>
      );
    }

    return (
      <>
        {resultBlock}
        <section>
          <div className="bg-white border rounded-5 p-2 mw-330">
            <MDBInputGroup className="mb-3 mw-300">
              <MDBBtn
                className="moveMoneyButton"
                outline
                onClick={(e) => {
                  this.placeBetHandler(e);
                }}
              >
                Do your bet
              </MDBBtn>
            </MDBInputGroup>
          </div>
        </section>
      </>
    );
  }

  async placeBetHandler(event) {
    const {
      customerAddress,
      setError,
      clearErrorWithPause,
      setRouletteStatus,
      getBalanceHandler,
    } = this.props;
    try {
      event.preventDefault();
      placeBet(customerAddress, {
        setError,
        clearErrorWithPause,
        setRouletteStatus,
        getBalanceHandler,
      });
    } catch (e) {}
  }
}
