import React from "react";
import { ethers, utils } from "ethers";
import abi from "contracts/Bank.json";
import { diamondAddress } from 'contracts/diamondAddress'
import {
    MDBInputGroup,
    MDBBtn
} from 'mdb-react-ui-kit';
import _ from 'lodash'
const contractABI = abi.abi;
export class Accounts extends React.PureComponent {
    state = {
        editingAccountAlias: "",
        editingAccountAddress: ""
    };
    componentDidMount() {
        if (!this.state.accounts) {
            bankAccountsHandler()
                .then((accounts) => {
                    this.setState({ accounts })
                })
        }
    }

    render() {

        if (!_.get(this, 'state.accounts')) {
            return null
        }

        const [adresses, balances, aliases] = this.state.accounts
        return (
            <>
                <section>
                    <table>
                        <tbody>
                            {
                                _.map(adresses, (addr, i) => {
                                    let alias = ''
                                    try {
                                        if (aliases[i]) {
                                            alias = utils.parseBytes32String(aliases[i])
                                        }
                                    }
                                    catch (e) {
                                        alias = e.message
                                    }
                                    return (
                                        <tr key={addr}>
                                            <td className="addressLog">{addr}</td>
                                            <td>{utils.formatEther(balances[i])}</td>
                                            <td className="pl-5">{this.renderAlias(addr, alias)}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>



                </section>

            </>
        );
    }

    async updateAliasHandler(event) {
        event.preventDefault();
        const { setError, setBusy } = this.props
        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const bankContract = new ethers.Contract(diamondAddress, contractABI, signer);

                const _account = this.state.editingAccountAddress
                const _accountAlias = utils.formatBytes32String(this.state.editingAccountAlias)
                const txn = await bankContract.setCustomerAlias(_account, _accountAlias);
                console.log("Setting account alias...");
                setBusy("Setting account alias...");
                await txn.wait();
                console.log("Account alias has changed", txn.hash);
                bankAccountsHandler()
                    .then((accounts) => {
                        this.setState({ accounts, editingAccountAddress: '' })
                    })

            } else {
                console.log("Ethereum object not found, install Metamask.");
                setError("Please install a MetaMask wallet to use our bank.");
            }
        } catch (error) {
            console.log(error);
            setError(error.message);
            setTimeout(() => {
                setError("");
            }, 3000)
        }
        finally {
            setBusy("")
        }
    }


    renderAlias(address, alias) {
        if (_.get(this.state, 'editingAccountAddress') === address) {
            return (
                <MDBInputGroup className='mb-3 mw-300'>
                    <input
                        type="text"
                        className="form-control"
                        onChange={(event) => {
                            this.setState({
                                editingAccountAlias: event.target.value
                            })
                        }}
                        placeholder="Set account alias"
                        value={this.state.editingAccountAlias}
                    />
                    <MDBBtn className="" outline onClick={(e) => { this.updateAliasHandler(e) }}>Update</MDBBtn>
                    <MDBBtn className="" outline onClick={(e) => {
                        this.setState({
                            editingAccountAddress: "",
                            editingAccountAlias: ""
                        })

                    }}>Cancel</MDBBtn>
                </MDBInputGroup>
            )
        }
        return (
            <a href={"void (0)"} onClick={(e) => {
                e.preventDefault()


                this.setState({
                    editingAccountAddress: address,
                    editingAccountAlias: alias
                })

            }}>{alias || "Set alias"}</a>
        )
    }


}

const bankAccountsHandler = () => {
    return new Promise((resolve) => {
        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contractABI = abi.abi;
                const bankContract = new ethers.Contract(diamondAddress, contractABI, signer);

                bankContract.getAccounts()
                    .then((accounts => {
                        resolve(accounts)
                    }))


            } else {
                console.log("Ethereum object not found, install Metamask.");
                resolve([])
            }
        } catch (error) {
            console.log(error)
            resolve([])
        }

    })

}