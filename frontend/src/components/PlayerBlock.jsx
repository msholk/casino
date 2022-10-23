import React from "react";
import { ethers } from "ethers";
import PlayersFacet from "contracts/PlayersFacet.json";
import { diamondAddress } from 'contracts/diamondAddress'
import {
    MDBInputGroup,
    MDBBtn
} from 'mdb-react-ui-kit';

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

    getDAIBalance() {
        const { playerBalance } = this.props
        if (!playerBalance) return '0.00'
        return playerBalance.DAI.toNumber() * 1 / 100
    }
    getEthPricee() {
        const { playerBalance } = this.props
        if (!playerBalance) return '0.00'
        return playerBalance.DAI_ETH.toNumber() * 1 / 10 ** 18
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
                        <strong>Player balance: {this.getDAIBalance()} DAI</strong>
                    </span>
                    <div className="fs11">1 DAI={this.getEthPricee()} ETH</div>
                </div>
                <section>
                    <div className="bg-white border rounded-5 p-2 mw-330">
                        <MDBInputGroup className='mb-3 mw-300'>
                            <input
                                type="text"
                                className="form-control"
                                onChange={handleInputChange}
                                name="deposit"
                                placeholder="0.0000 ETH"
                                value={inputValue.deposit}
                            />
                            <MDBBtn className="moveMoneyButton" outline onClick={(e) => { this.deposityMoneyHandler(e) }}>Deposit Money In ETH</MDBBtn>
                        </MDBInputGroup>
                    </div>
                    <div className="bg-white border rounded-5 p-2 mw-330">
                        <MDBBtn className="moveMoneyButton" outline onClick={(e) => { this.withdrawAllPlayersFunds(e) }}>Withdraw All</MDBBtn>
                    </div>


                </section>

            </>
        );
    }

    async deposityMoneyHandler(event) {
        const { inputValue, getPlayerBalanceHandler, setError, setBusy } = this.props
        try {
            event.preventDefault();
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const playerContract = new ethers.Contract(diamondAddress, PlayersFacet.abi, signer);

                const txn = await playerContract.depositETH({ value: ethers.utils.parseEther(inputValue.deposit) });
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