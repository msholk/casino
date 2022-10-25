import React from "react";
import { ethers } from "ethers";
import PlayersFacet from "contracts/PlayersFacet.json";
import { diamondAddress } from 'contracts/diamondAddress'
import {
    MDBInputGroup,
    MDBBtn
} from 'mdb-react-ui-kit';
import _ from 'lodash'
import { stableCoinName, nativeCoinName } from "../constants"
/*
PlayersFacet: {
        'checkPlayerBalance()': null,
        'depositETH()': null,
        'placeBet((uint256,uint8,uint8)[])': null,
        'rawFulfillRandomWords(uint256,uint256[])': null,
        'setVrfInfo((uint64,address,bytes32))': null,
        'withdrawDAI()': null
    },*/
export class PlayerBlock extends React.PureComponent {

    getStableCoinBalance() {
        const { playerBalance } = this.props
        if (!_.get(playerBalance, 'DAI')) return '0.00'
        return playerBalance.DAI.toNumber() * 1 / 100
    }
    getMaticVsUSD() {
        const { playerBalance } = this.props
        if (!_.get(playerBalance, 'DAI_ETH')) return '0.00'
        return playerBalance.DAI_ETH.toNumber() * 1 / 10 ** 8
    }
    render() {
        const { handleInputChange, inputValue, busy, isWalletConnected, playerBalance } = this.props
        if (busy || !isWalletConnected) {
            return null
        }
        console.log(playerBalance)

        return (
            <>
                <div className="mt-1">
                    <span className="mr-5">
                        <strong>Player balance: {this.getStableCoinBalance()} {stableCoinName}</strong>
                    </span>
                    <div className="fs11">1 MATIC={this.getMaticVsUSD()} {stableCoinName}</div>
                </div>
                <section>
                    <div className="bg-white border rounded-5 p-2 mw-330">
                        <MDBInputGroup className='mb-3 mw-300'>
                            <input
                                type="text"
                                className="form-control"
                                onChange={handleInputChange}
                                name="player_deposit"
                                placeholder={"0.0000 " + nativeCoinName}
                                value={inputValue.player_deposit}
                            />
                            <MDBBtn className="moveMoneyButton" outline onClick={(e) => { this.playerDepositsFunds(e) }}>Deposit funds In {nativeCoinName}</MDBBtn>
                        </MDBInputGroup>
                    </div>
                    <div className="bg-white border rounded-5 p-2 mw-330">
                        <MDBBtn className="moveMoneyButton" outline onClick={(e) => { this.withdrawAllPlayersFunds(e) }}>Withdraw All</MDBBtn>
                    </div>


                </section>

            </>
        );
    }

    async playerDepositsFunds(event) {
        const { inputValue, getPlayerBalanceHandler, setError, setBusy } = this.props
        try {
            event.preventDefault();
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const playerContract = new ethers.Contract(diamondAddress, PlayersFacet.abi, signer);

                const txn = await playerContract.depositETH({ value: ethers.utils.parseEther(inputValue.player_deposit), gasLimit: 5000000 });
                console.log("Deposting money...");
                setBusy("Deposting money...");
                await txn.wait();
                console.log("Deposited money...done", txn.hash);
                setBusy("Updating balance...");
                getPlayerBalanceHandler();

            } else {
                console.log("Ethereum object not found, install Metamask.");
                setError("Please install a MetaMask wallet to use our bank.");
            }
        } catch (error) {
            console.log(error)
            setError(error.message);
            setTimeout(() => {
                setError("");
            }, 3000)
        }
        finally {
            setBusy("")
        }
    }
    async withdrawAllPlayersFunds(event) {
        const { getPlayerBalanceHandler, setError, setBusy } = this.props
        try {
            event.preventDefault();
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const playerContract = new ethers.Contract(diamondAddress, PlayersFacet.abi, signer);

                let myAddress = await signer.getAddress()
                console.log("provider signer...", myAddress);

                const txn = await playerContract.withdrawDAI();
                console.log("Withdrawing money...");
                setBusy("Withdrawing money...");
                await txn.wait();
                console.log("Money with drew...done", txn.hash);
                setBusy("Updating balance...");
                getPlayerBalanceHandler();

            } else {
                console.log("Ethereum object not found, install Metamask.");
                setError("Please install a MetaMask wallet to use our bank.");
            }
        } catch (error) {
            console.log(error)
            setError(error.message);
            setTimeout(() => {
                setError("");
            }, 3000)
        }
        finally {
            setBusy("")
        }
    }
}