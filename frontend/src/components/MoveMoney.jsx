import React from "react";
import { ethers } from "ethers";
import abi from "contracts/Bank.json";
import { diamondAddress } from 'contracts/diamondAddress'
import {
    MDBInputGroup,
    MDBBtn
} from 'mdb-react-ui-kit';
const contractABI = abi.abi;
export class MoveMoney extends React.PureComponent {

    render() {
        const { handleInputChange, inputValue, busy, isWalletConnected } = this.props
        if (busy || !isWalletConnected) {
            return null
        }

        return (
            <>
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
                        <MDBInputGroup className='mb-3 mw-300'>
                            <input
                                type="text"
                                className="form-control"
                                onChange={handleInputChange}
                                name="withdraw"
                                placeholder="0.0000 ETH"
                                value={inputValue.withdraw}
                            />
                            <MDBBtn className="moveMoneyButton" outline onClick={(e) => { this.withDrawMoneyHandler(e) }}>Withdraw Money In ETH</MDBBtn>
                        </MDBInputGroup>
                    </div>


                </section>

            </>
        );
    }

    async deposityMoneyHandler(event) {
        const { inputValue, customerBalanceHandler, setError, setBusy } = this.props
        try {
            event.preventDefault();
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const bankContract = new ethers.Contract(diamondAddress, contractABI, signer);

                const txn = await bankContract.depositMoney({ value: ethers.utils.parseEther(inputValue.deposit) });
                console.log("Deposting money...");
                setBusy("Deposting money...");
                await txn.wait();
                console.log("Deposited money...done", txn.hash);
                setBusy("Updating balance...");
                customerBalanceHandler();

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
    async withDrawMoneyHandler(event) {
        const { inputValue, customerBalanceHandler, setError, setBusy } = this.props
        try {
            event.preventDefault();
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const bankContract = new ethers.Contract(diamondAddress, contractABI, signer);

                let myAddress = await signer.getAddress()
                console.log("provider signer...", myAddress);

                const txn = await bankContract.withdrawMoney(myAddress, ethers.utils.parseEther(inputValue.withdraw));
                console.log("Withdrawing money...");
                setBusy("Withdrawing money...");
                await txn.wait();
                console.log("Money with drew...done", txn.hash);
                setBusy("Updating balance...");
                customerBalanceHandler();

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