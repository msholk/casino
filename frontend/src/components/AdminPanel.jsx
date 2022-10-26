import React from "react";
import { ethers } from "ethers";
import _ from "lodash";

import { MDBNavbarBrand, MDBBtn } from "mdb-react-ui-kit";
import { nativeCoinName } from "../constants";
import adminFacet from "../contracts/AdminFacet.json";
import { diamondAddress } from "../contracts/diamondAddress";

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
  getPlatformBalance() {
    const { platformBalance } = this.props;
    if (!_.get(platformBalance, "houseBalance")) return "0.00";

    return platformBalance.platformBalance.toString() / 10 ** 18;
  }
  componentDidMount() {
    const { platformBalance, getPlatformBalanceHandler } = this.props;
    if (!platformBalance) {
      getPlatformBalanceHandler();
    }
  }
  async withdrawAllPlatformFunds(event) {
    const { getPlatformBalanceHandler, setError, setBusy } = this.props;
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const stakerContract = new ethers.Contract(
          diamondAddress,
          adminFacet.abi,
          signer
        );

        let myAddress = await signer.getAddress();
        console.log("provider signer...", myAddress);

        const txn = await stakerContract.withdrawAllPlatformFunds();
        console.log("Withdrawing money...");
        setBusy("Withdrawing platform's funds...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);
        setBusy("Updating balance...");
        getPlatformBalanceHandler();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
      setError(error.reason);
      setTimeout(() => {
        setError("");
      }, 3000);
    } finally {
      setBusy("");
    }
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

        <div className="bg-white border rounded-5 p-2 mw-330">
          <MDBBtn
            className="moveMoneyButton"
            outline
            onClick={(e) => {
              this.withdrawAllPlatformFunds(e);
            }}
          >
            Withdraw All
          </MDBBtn>
        </div>
      </>
    );
  }
}
