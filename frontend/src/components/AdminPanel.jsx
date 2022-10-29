import React from "react";

import { MDBNavbarBrand, MDBBtn } from "mdb-react-ui-kit";
import { nativeCoinName } from "../constants";
import {
  withdrawAllPlatformFunds,
  withdrawAllContractFunds,
} from "../libs/adminLib";

/*
dminFacet: {
        'withdrawAllPlatformDAI()': null,
        'checkPlatformBalance()': null,
        'isContractOwner()': null
    }*/
export class AdminPanel extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      active: "home",
    };
  }
  getContractBalance() {
    const { platformBalance } = this.props;
    if (!platformBalance) return "0.00";

    return platformBalance.contractBalance.toString() / 10 ** 18;
  }
  getPlatformBalance() {
    const { platformBalance } = this.props;
    if (!platformBalance) return "0.00";

    return platformBalance.platformBalance.toString() / 10 ** 18;
  }
  componentDidMount() {
    const { platformBalance, getBalanceHandler } = this.props;
    if (!platformBalance) {
      getBalanceHandler();
    }
  }
  async withdrawAllPlatformFundsHandler(event) {
    const { getBalanceHandler, setError, setBusy } = this.props;
    event.preventDefault();
    withdrawAllPlatformFunds({ getBalanceHandler, setError, setBusy });
  }
  async withdrawAllContractFundsHandler(event) {
    const { getBalanceHandler, setError, setBusy } = this.props;
    event.preventDefault();
    withdrawAllContractFunds(getBalanceHandler, setError, setBusy);
  }
  render() {
    const { busy, isWalletConnected, isAdmin, platformBalance } = this.props;
    console.log("platformBalance", platformBalance);

    if (busy || !isWalletConnected || !isAdmin) {
      return null;
    }

    return (
      <>
        <MDBNavbarBrand href="#">Admin Panel</MDBNavbarBrand>
        <div className="mt-1">
          <span className="mr-5">
            <div>
              <strong>
                Platform balance: {this.getPlatformBalance()} {nativeCoinName}
              </strong>
            </div>
          </span>
        </div>
        <div className="mt-1">
          <span className="mr-5">
            <div>
              <strong>
                Contract balance: {this.getContractBalance()} {nativeCoinName}
              </strong>
            </div>
          </span>
        </div>

        <div className="bg-white border rounded-5 p-2 mw-330">
          <MDBBtn
            className="moveMoneyButton"
            outline
            onClick={(e) => {
              this.withdrawAllPlatformFundsHandler(e);
            }}
          >
            Withdraw All platform funds
          </MDBBtn>
        </div>

        <div className="bg-white border rounded-5 p-2 mw-330">
          <MDBBtn
            className="moveMoneyButton"
            outline
            onClick={(e) => {
              this.withdrawAllContractFundsHandler(e);
            }}
          >
            Withdraw All contract funds
          </MDBBtn>
        </div>
      </>
    );
  }
}
